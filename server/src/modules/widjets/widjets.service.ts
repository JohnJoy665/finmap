import { pool } from "../../db/pool";
import { AppError } from "../../utils/AppError";

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
  dateFrom: string;
  dateTo: string;
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
};

type CategoryStatisticsWidgetResponse = {
  title: string;
  subTitles: {
    subTitle: string;
    value: string | number;
  }[];
  categories: CategoryStatisticsItem[];
};

function formatDateForSubtitle(dateTime: string) {
  const datePart = dateTime.split(" ")[0];

  if (!datePart) return "";

  const [year, month, day] = datePart.split("-");

  if (!year || !month || !day) return datePart;

  return `${day}.${month}.${year}`;
}

function formatPeriodSubtitle(dateFrom: string, dateTo: string) {
  const from = formatDateForSubtitle(dateFrom);
  const to = formatDateForSubtitle(dateTo);

  if (!from || !to) return "";

  if (from === to) {
    return from;
  }

  return `${from} - ${to}`;
}

export async function getCategoryStatisticsWidget({
  userId,
  userSettings,
  dateFrom,
  dateTo,
}: GetCategoryStatisticsWidgetRequest): Promise<CategoryStatisticsWidgetResponse> {
  try {
    const langCode = userSettings.languageCode ?? "ru";
    const currencyCode = userSettings.currencyCode;
    const conversionFactor = userSettings.conversionFactor;
    const timeZone = userSettings.timezone;

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
          ($6::timestamp AT TIME ZONE $5::text) AS date_from,
          ($7::timestamp AT TIME ZONE $5::text) AS date_to,
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
      dateFrom,
      dateTo,
    ];

    const { rows } = await pool.query<CategoryStatisticsRow>(query, params);

    const categories: CategoryStatisticsItem[] = rows.map((row) => ({
      id: row.category_code,
      title: row.category_name,
      amount: row.amount_minor ?? "0",
      percent: row.percent === null ? 0 : Number(row.percent),
      currencyCode: row.currency_code,
      conversionFactor: Number(row.conversion_factor),
    }));

    return {
      title: "Расходы по категориям",
      subTitles: [
        {
          subTitle: "За период:",
          value: formatPeriodSubtitle(dateFrom, dateTo),
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
