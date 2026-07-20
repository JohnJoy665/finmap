import { pool } from "../../db/pool";
import { AppError } from "../../utils/AppError";

function formatLocalDateRange(dateFrom: string, dateTo: string): string {
  const fromDate = dateFrom.slice(0, 10);
  const toDate = dateTo.slice(0, 10);

  function formatDate(date: string): string {
    const [year, month, day] = date.split("-");

    return `${day}.${month}.${year}`;
  }

  if (fromDate === toDate) {
    return formatDate(fromDate);
  }

  return `${formatDate(fromDate)} - ${formatDate(toDate)}`;
}

type UserSettings = {
  id: string;
  userId: string;
  accountId: string;

  languageCode: string | null;
  countryCode: string | null;
  cityId: number | null;
  timezone: string | null;

  visibleAccount: boolean;
  visibleUserName: boolean;
  visibleGroupSpendings: boolean;
  visibleAverageGroupBill: boolean;

  lastCheckPosition: string | null;

  currencyCode: string | null;
  countryName: string | null;
  cityName: string | null;
  conversionFactor: number;
  currencySymbol: string | null;
};

type GetCategoryStatisticsWidgetRequest = {
  userId: string;
  userSettings: UserSettings;
  dateFromUTC: string;
  dateToUTC: string;
  dateFromLocal: string;
  dateToLocal: string;
};

type CategoryStatisticsRow = {
  category_code: string;
  category_name: string;
  amount_minor: string | null;
  currency_code: string;
  conversion_factor: string | number;
  percent: string | null;
};

type CategoryStatisticsItem = {
  id: string;
  title: string;
  amount: string;
  percent: number;
  currencyCode: string;
  conversionFactor: number;
  type: "category";
};

type CategoryStatisticsWidgetResponse = {
  title: string;
  subTitles: {
    subTitle: string;
    value: string | number;
  }[];
  categories: CategoryStatisticsItem[];
};

export async function getCategoryStatisticsWidget({
  userId,
  userSettings,
  dateFromUTC,
  dateToUTC,
  dateFromLocal,
  dateToLocal,
}: GetCategoryStatisticsWidgetRequest): Promise<CategoryStatisticsWidgetResponse> {
  try {
    const langCode = userSettings.languageCode ?? "en";
    const currencyCode = userSettings.currencyCode;
    const conversionFactor = userSettings.conversionFactor;
    const timeZone = userSettings.timezone?.trim() || "UTC";

    if (!currencyCode) {
      throw new AppError(
        400,
        "USER_SETTINGS_ERROR",
        "User currencyCode is required"
      );
    }

    if (!conversionFactor) {
      throw new AppError(
        400,
        "USER_SETTINGS_ERROR",
        "User conversionFactor is required"
      );
    }

    if (!timeZone) {
      throw new AppError(
        400,
        "USER_SETTINGS_ERROR",
        "User timezone is required"
      );
    }

    const query = `
      WITH params AS (
        SELECT
          $1::varchar AS lang_code,
          $2::uuid AS user_id,
          $3::varchar AS currency_code,
          $4::numeric AS conversion_factor,
          $5::text AS time_zone,
          $6::timestamptz AS date_from,
          $7::timestamptz AS date_to,
          NOW() AS current_at
      ),

      selected_rate AS (
        SELECT
          CASE
            WHEN p.currency_code = 'USD' THEN 1::numeric
            ELSE (
              SELECT er.exchange_rate
              FROM exchange_rates er
              WHERE er.base_currency = 'USD'
                AND er.target_currency = p.currency_code
                AND er.date_rate <= p.current_at
              ORDER BY er.date_rate DESC
              LIMIT 1
            )
          END AS exchange_rate
        FROM params p
      ),

      filtered_spendings AS (
        SELECT 
          s.id,
          s.name,
          s.spending_date,
          s.base_amount_micro,
          s.currency_code AS original_currency_code,
          c.code AS category_code,
          COALESCE(cl.translation, c.comments)::varchar AS category_name
        FROM spendings s
        INNER JOIN params p
          ON s.user_id = p.user_id
         AND s.spending_date >= p.date_from
         AND s.spending_date < p.date_to
        INNER JOIN category c
          ON c.id = s.category_id
        LEFT JOIN category_lang cl
          ON cl.lang_code = p.lang_code
         AND cl.word_code = c.code
      ),

        converted_spendings AS (
        SELECT
          fs.category_code,
          fs.category_name,

          CASE
            WHEN fs.base_amount_micro IS NULL THEN NULL
            WHEN sr.exchange_rate IS NULL THEN NULL
            ELSE
              (fs.base_amount_micro::numeric / 1000000)
              * sr.exchange_rate
              * p.conversion_factor
          END AS amount_minor_raw
        FROM filtered_spendings fs
        CROSS JOIN params p
        CROSS JOIN selected_rate sr
      ),

      category_totals AS (
        SELECT
          category_code,
          category_name,
          ROUND(SUM(amount_minor_raw))::bigint AS amount_minor
        FROM converted_spendings
        GROUP BY category_code, category_name
      ),

      totals_with_percent AS (
        SELECT
          ct.category_code,
          ct.category_name,
          ct.amount_minor,
          ROUND(
            ct.amount_minor::numeric
            / NULLIF(SUM(ct.amount_minor) OVER (), 0)
            * 100,
            1
          ) AS percent
        FROM category_totals ct
        WHERE ct.amount_minor IS NOT NULL
          AND ct.amount_minor <> 0
      )

      SELECT
        twp.category_code,
        twp.category_name,
        twp.amount_minor,
        p.currency_code,
        p.conversion_factor,
        twp.percent
      FROM totals_with_percent twp
      CROSS JOIN params p
      ORDER BY twp.amount_minor DESC;
    `;

    const params = [
      langCode,
      userId,
      currencyCode,
      conversionFactor,
      timeZone,
      dateFromUTC,
      dateToUTC,
    ];

    const { rows } = await pool.query<CategoryStatisticsRow>(query, params);

    const categories: CategoryStatisticsItem[] = rows.map((row) => ({
      id: row.category_code,
      title: row.category_name,
      amount: row.amount_minor ?? "0",
      percent: row.percent === null ? 0 : Number(row.percent),
      currencyCode: row.currency_code,
      conversionFactor: Number(row.conversion_factor),
      type: "category",
    }));

    return {
      title: "Расходы по категориям",
      subTitles: [
        {
          subTitle: "За период:",
          value: formatLocalDateRange(dateFromLocal, dateToLocal),
        },
        {
          subTitle: "Всего категорий:",
          value: categories.length,
        },
      ],
      categories,
    };
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error;
    }

    if (error?.severity === "ERROR") {
      throw new AppError(
        400,
        error.code ?? "DATABASE_ERROR",
        error.detail ?? error.message ?? "Database error"
      );
    }

    throw error;
  }
}

type GetGroupStatisticsWidgetRequest = {
  userId: string;
  userSettings: UserSettings;
  dateFromUTC: string;
  dateToUTC: string;
  dateFromLocal: string;
  dateToLocal: string;
};

type GroupStatisticsWidgetRow = {
  group_id: string;
  group_name: string;
  amount_minor: string | null;
  currency_code: string;
  conversion_factor: string;
  percent: string | number;
};

export type GroupStatisticsWidgetItem = {
  id: string;
  title: string;
  amount: string | null;
  currencyCode: string;
  conversionFactor: number;
  percent: number;
  type: string;
};

export type GroupStatisticsWidgetSubTitle = {
  subTitle: string;
  value: string | number;
};

export type GroupStatisticsWidgetResponse = {
  title: string;
  subTitles: GroupStatisticsWidgetSubTitle[];
  groups: GroupStatisticsWidgetItem[];
};

export async function getGroupStatisticsWidget({
  userId,
  userSettings,
  dateFromUTC,
  dateToUTC,
  dateFromLocal,
  dateToLocal,
}: GetGroupStatisticsWidgetRequest): Promise<GroupStatisticsWidgetResponse> {
  try {
    const langCode = userSettings.languageCode ?? "en";
    const currencyCode = userSettings.currencyCode;

    if (!currencyCode) {
      throw new AppError(
        400,
        "CURRENCY_NOT_FOUND",
        "User currency is not specified"
      );
    }

    const conversionFactor = userSettings.conversionFactor;
    const timeZone = userSettings.timezone?.trim() || "UTC";

    const query = `
      WITH params AS (
        SELECT
          $1::uuid        AS user_id,
          $2::varchar(3)  AS currency_code,
          $3::numeric     AS conversion_factor,
          $4::varchar(10) AS lang_code,
          $5::timestamptz AS date_from_utc,
          $6::timestamptz AS date_to_utc
      ),

      filtered_spendings AS (
        SELECT
          s.id,
          s.spending_date,
          s.base_amount_micro,
          sg.id AS group_id,
          sg.name AS group_name
        FROM spendings s
        INNER JOIN params p
          ON s.user_id = p.user_id
         AND s.spending_date >= p.date_from_utc
         AND s.spending_date < p.date_to_utc
        INNER JOIN spendings_group sg
          ON sg.id = s.group_id
      ),

      converted_spendings AS (
        SELECT
          fs.group_id,
          fs.group_name,

          CASE
            WHEN fs.base_amount_micro IS NULL THEN NULL

            WHEN p.currency_code = 'USD' THEN
              (fs.base_amount_micro::numeric / 1000000)
              * p.conversion_factor

            WHEN er.exchange_rate IS NULL THEN NULL

            ELSE
              (fs.base_amount_micro::numeric / 1000000)
              * er.exchange_rate
              * p.conversion_factor
          END AS amount_minor_raw

        FROM filtered_spendings fs
        CROSS JOIN params p

        LEFT JOIN LATERAL (
          SELECT er.exchange_rate
          FROM exchange_rates er
          WHERE er.base_currency = 'USD'
            AND er.target_currency = p.currency_code
            AND er.date_rate <= fs.spending_date
          ORDER BY er.date_rate DESC
          LIMIT 1
        ) er ON p.currency_code <> 'USD'
      ),

      group_totals AS (
        SELECT
          group_id,
          group_name,
          ROUND(SUM(amount_minor_raw))::bigint AS amount_minor
        FROM converted_spendings
        GROUP BY group_id, group_name
      ),

      totals_with_percent AS (
        SELECT
          gt.group_id,
          gt.group_name,
          gt.amount_minor,
          ROUND(
            gt.amount_minor::numeric
            / NULLIF(SUM(gt.amount_minor) OVER (), 0)
            * 100,
            1
          ) AS percent
        FROM group_totals gt
        WHERE gt.amount_minor IS NOT NULL
          AND gt.amount_minor <> 0
      )

      SELECT
        twp.group_id,
        twp.group_name,
        twp.amount_minor,
        p.currency_code,
        p.conversion_factor,
        twp.percent
      FROM totals_with_percent twp
      CROSS JOIN params p
      ORDER BY twp.amount_minor DESC;
    `;

    const { rows } = await pool.query<GroupStatisticsWidgetRow>(query, [
      userId,
      currencyCode,
      conversionFactor,
      langCode,
      dateFromUTC,
      dateToUTC,
    ]);

    const groups: GroupStatisticsWidgetItem[] = rows.map((row) => ({
      id: row.group_id,
      title: row.group_name,
      amount: row.amount_minor === null ? null : String(row.amount_minor),
      currencyCode: row.currency_code,
      conversionFactor: Number(row.conversion_factor),
      percent: Number(row.percent),
      type: "group",
    }));

    return {
      title: "Расходы по группам",
      subTitles: [
        {
          subTitle: "За период:",
          value: formatLocalDateRange(dateFromLocal, dateToLocal),
        },
        {
          subTitle: "Всего групп:",
          value: groups.length,
        },
      ],
      groups,
    };
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error;
    }

    if (error?.severity === "ERROR") {
      throw new AppError(
        400,
        error.code ?? "DATABASE_ERROR",
        error.detail ?? error.message ?? "Database error"
      );
    }

    throw error;
  }
}

export type CategoryAverageWidgetSubTitle = {
  subTitle: string;
  value: string | number;
};

export type CategoryAverageWidgetItem = {
  id: string;
  title: string;
  countPurchase: number;
  averageAmountMinor: string;
  medianAmountMinor: string;
  currencyCode: string;
  conversionFactor: number;
  type: string;
};

export type CategoryAverageWidgetResponse = {
  title: string;
  subTitles: CategoryAverageWidgetSubTitle[];
  categories: CategoryAverageWidgetItem[];
};

type CategoryAverageWidgetRow = {
  category_code: string;
  category_name: string;
  count_purchase: number | string;
  average_amount_minor: string | null;
  median_amount_minor: string | null;
  currency_code: string;
  conversion_factor: string;
};

export async function getCategoryAverageWidget({
  userId,
  userSettings,
  dateFromUTC,
  dateToUTC,
  dateFromLocal,
  dateToLocal,
}: GetCategoryStatisticsWidgetRequest): Promise<CategoryAverageWidgetResponse> {
  try {
    const langCode = userSettings.languageCode ?? "en";
    const currencyCode = userSettings.currencyCode;
    const conversionFactor = userSettings.conversionFactor;
    const timeZone = userSettings.timezone?.trim() || "UTC";

    if (!currencyCode) {
      throw new AppError(
        400,
        "USER_SETTINGS_ERROR",
        "User currencyCode is required"
      );
    }

    if (!conversionFactor) {
      throw new AppError(
        400,
        "USER_SETTINGS_ERROR",
        "User conversionFactor is required"
      );
    }

    if (!timeZone) {
      throw new AppError(
        400,
        "USER_SETTINGS_ERROR",
        "User timezone is required"
      );
    }

    const query = `
      WITH params AS (
        SELECT
          $1::varchar AS lang_code,
          $2::uuid AS user_id,
          $3::varchar AS currency_code,
          $4::numeric AS conversion_factor,
          $5::text AS time_zone,
          $6::timestamptz AS date_from,
          $7::timestamptz AS date_to,
          NOW() AS current_at
      ),

      selected_rate AS (
        SELECT
          CASE
            WHEN p.currency_code = 'USD' THEN 1::numeric
            ELSE (
              SELECT er.exchange_rate
              FROM exchange_rates er
              WHERE er.base_currency = 'USD'
                AND er.target_currency = p.currency_code
                AND er.date_rate <= p.current_at
              ORDER BY er.date_rate DESC
              LIMIT 1
            )
          END AS exchange_rate
        FROM params p
      ),

      filtered_spendings AS (
        SELECT 
          s.id,
          s.name,
          s.spending_date,
          s.base_amount_micro,
          s.currency_code AS original_currency_code,
          c.code AS category_code,
          COALESCE(cl.translation, c.comments)::varchar AS category_name
        FROM spendings s
        INNER JOIN params p
          ON s.user_id = p.user_id
         AND s.spending_date >= p.date_from
         AND s.spending_date < p.date_to
        INNER JOIN category c
          ON c.id = s.category_id
        LEFT JOIN category_lang cl
          ON cl.lang_code = p.lang_code
         AND cl.word_code = c.code
      ),

      converted_spendings AS (
        SELECT
          fs.category_code,
          fs.category_name,

          CASE
            WHEN fs.base_amount_micro IS NULL THEN NULL
            WHEN sr.exchange_rate IS NULL THEN NULL
            ELSE
              (fs.base_amount_micro::numeric / 1000000)
              * sr.exchange_rate
              * p.conversion_factor
          END AS amount_minor_raw
        FROM filtered_spendings fs
        CROSS JOIN params p
        CROSS JOIN selected_rate sr
      ),

      category_average AS (
        SELECT
          category_code,
          category_name,
          COUNT(amount_minor_raw)::int AS count_purchase,
          ROUND(AVG(amount_minor_raw))::bigint AS average_amount_minor,
          ROUND(
            percentile_cont(0.5) WITHIN GROUP (ORDER BY amount_minor_raw)
          )::bigint AS median_amount_minor
        FROM converted_spendings
        WHERE amount_minor_raw IS NOT NULL
        GROUP BY category_code, category_name
      )

      SELECT
        ca.category_code,
        ca.category_name,
        ca.count_purchase,
        ca.average_amount_minor,
        ca.median_amount_minor,
        p.currency_code,
        p.conversion_factor
      FROM category_average ca
      CROSS JOIN params p
      WHERE ca.count_purchase > 0
      ORDER BY ca.average_amount_minor DESC;
    `;

    const params = [
      langCode,
      userId,
      currencyCode,
      conversionFactor,
      timeZone,
      dateFromUTC,
      dateToUTC,
    ];

    const { rows } = await pool.query<CategoryAverageWidgetRow>(query, params);

    const categories: CategoryAverageWidgetItem[] = rows.map((row) => ({
      id: row.category_code,
      title: row.category_name,
      countPurchase: Number(row.count_purchase),
      averageAmountMinor: row.average_amount_minor ?? "0",
      medianAmountMinor: row.median_amount_minor ?? "0",
      currencyCode: row.currency_code,
      conversionFactor: Number(row.conversion_factor),
      type: "category",
    }));

    return {
      title: "Средний чек по категориям",
      subTitles: [
        {
          subTitle: "За период:",
          value: formatLocalDateRange(dateFromLocal, dateToLocal),
        },
        {
          subTitle: "Всего категорий:",
          value: categories.length,
        },
      ],
      categories,
    };
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error;
    }

    if (error?.severity === "ERROR") {
      throw new AppError(
        400,
        error.code ?? "DATABASE_ERROR",
        error.detail ?? error.message ?? "Database error"
      );
    }

    throw error;
  }
}

type GetGroupAverageWidgetRequest = {
  userId: string;
  userSettings: UserSettings;
  dateFromUTC: string;
  dateToUTC: string;
  dateFromLocal: string;
  dateToLocal: string;
};

type GroupAverageWidgetRow = {
  group_id: string;
  group_name: string;
  count_purchase: string | number;
  average_amount_minor: string | null;
  median_amount_minor: string | null;
  currency_code: string;
  conversion_factor: string;
};

export type GroupAverageWidgetItem = {
  id: string;
  title: string;
  countPurchase: number;
  averageAmountMinor: string;
  medianAmountMinor: string;
  currencyCode: string;
  conversionFactor: number;
  type: string;
};

export type GroupAverageWidgetSubTitle = {
  subTitle: string;
  value: string | number;
};

export type GroupAverageWidgetResponse = {
  title: string;
  subTitles: GroupAverageWidgetSubTitle[];
  categories: GroupAverageWidgetItem[];
};

export async function getGroupAverageWidget({
  userId,
  userSettings,
  dateFromUTC,
  dateToUTC,
  dateFromLocal,
  dateToLocal,
}: GetGroupAverageWidgetRequest): Promise<GroupAverageWidgetResponse> {
  try {
    const currencyCode = userSettings.currencyCode;

    if (!currencyCode) {
      throw new AppError(
        400,
        "CURRENCY_NOT_FOUND",
        "User currency is not specified"
      );
    }

    const conversionFactor = userSettings.conversionFactor;
    const timeZone = userSettings.timezone?.trim() || "UTC";

    const query = `
      WITH params AS (
        SELECT
          $1::uuid        AS user_id,
          $2::varchar(3)  AS currency_code,
          $3::numeric     AS conversion_factor,
          $4::timestamptz AS date_from_utc,
          $5::timestamptz AS date_to_utc
      ),

      filtered_spendings AS (
        SELECT
          s.id,
          s.spending_date,
          s.base_amount_micro,
          sg.id AS group_id,
          sg.name AS group_name
        FROM spendings s
        INNER JOIN params p
          ON s.user_id = p.user_id
         AND s.spending_date >= p.date_from_utc
         AND s.spending_date < p.date_to_utc
        INNER JOIN spendings_group sg
          ON sg.id = s.group_id
      ),

      converted_spendings AS (
        SELECT
          fs.group_id,
          fs.group_name,

          CASE
            WHEN fs.base_amount_micro IS NULL THEN NULL

            WHEN p.currency_code = 'USD' THEN
              (fs.base_amount_micro::numeric / 1000000)
              * p.conversion_factor

            WHEN er.exchange_rate IS NULL THEN NULL

            ELSE
              (fs.base_amount_micro::numeric / 1000000)
              * er.exchange_rate
              * p.conversion_factor
          END AS amount_minor_raw

        FROM filtered_spendings fs
        CROSS JOIN params p

        LEFT JOIN LATERAL (
          SELECT er.exchange_rate
          FROM exchange_rates er
          WHERE er.base_currency = 'USD'
            AND er.target_currency = p.currency_code
            AND er.date_rate <= fs.spending_date
          ORDER BY er.date_rate DESC
          LIMIT 1
        ) er ON p.currency_code <> 'USD'
      ),

      group_average AS (
        SELECT
          group_id,
          group_name,
          COUNT(*) AS count_purchase,
          ROUND(AVG(amount_minor_raw))::bigint AS average_amount_minor,
          ROUND(
            PERCENTILE_CONT(0.5)
            WITHIN GROUP (ORDER BY amount_minor_raw)::numeric
          )::bigint AS median_amount_minor
        FROM converted_spendings
        WHERE amount_minor_raw IS NOT NULL
        GROUP BY group_id, group_name
      )

      SELECT
        ga.group_id,
        ga.group_name,
        ga.count_purchase,
        ga.average_amount_minor,
        ga.median_amount_minor,
        p.currency_code,
        p.conversion_factor
      FROM group_average ga
      CROSS JOIN params p
      ORDER BY ga.count_purchase DESC, ga.average_amount_minor DESC;
    `;

    const { rows } = await pool.query<GroupAverageWidgetRow>(query, [
      userId,
      currencyCode,
      conversionFactor,
      dateFromUTC,
      dateToUTC,
    ]);

    const categories: GroupAverageWidgetItem[] = rows.map((row) => ({
      id: row.group_id,
      title: row.group_name,
      countPurchase: Number(row.count_purchase),
      averageAmountMinor: String(row.average_amount_minor ?? "0"),
      medianAmountMinor: String(row.median_amount_minor ?? "0"),
      currencyCode: row.currency_code,
      conversionFactor: Number(row.conversion_factor),
      type: "group",
    }));

    return {
      title: "Средний чек по группам",
      subTitles: [
        {
          subTitle: "За период:",
          value: formatLocalDateRange(dateFromLocal, dateToLocal),
        },
        {
          subTitle: "Всего групп:",
          value: categories.length,
        },
      ],
      categories,
    };
  } catch (error: any) {
    if (error instanceof AppError) {
      throw error;
    }

    if (error?.severity === "ERROR") {
      throw new AppError(
        400,
        error.code ?? "DATABASE_ERROR",
        error.detail ?? error.message ?? "Database error"
      );
    }

    throw error;
  }
}
