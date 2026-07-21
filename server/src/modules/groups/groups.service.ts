import { PoolClient } from "pg";
import { pool } from "../../db/pool";
import { UserSettings } from "../../types/middlewares/userSettings.types";
import { AppError } from "../../utils/AppError";
import { changeAccountAmount } from "../accounts/accounts.service";
import { getBaseAmountMicro } from "../rates/rates.service";
import { getPeriodRange } from "../../utils/getPeriodRange";

type CreateGroupValues = {
  groupName: string;
  amount: string;
  categoryId: number;
};

type CreateGroupRequest = {
  userId: string;
  userSettings: UserSettings;
  reqValues: CreateGroupValues;
};

type SpendingGroupRow = {
  id: string;
  name: string;
};

type SpendingRow = {
  id: string;
};

type GetGroupResponse = {
  id: string;
  title: string;
  category_icon: string;
  category_description: string;
  category_id: number;
  amount: number;
  is_converted: boolean;
};

export async function createGroup({
  userId,
  userSettings,
  reqValues,
}: CreateGroupRequest) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const currencyCode = userSettings.currencyCode?.trim();
    const timezone = userSettings.timezone?.trim();

    if (!currencyCode) {
      throw new AppError(401, "UNAUTHORIZED", "Unauthorized");
    }

    if (!timezone) {
      throw new AppError(
        400,
        "TIMEZONE_REQUIRED",
        "User timezone is required to create a spending"
      );
    }

    const normalisedGroupName = reqValues.groupName.trim().toLowerCase();

    const oldGroup = await client.query<SpendingGroupRow>(
      `
        SELECT
          sg.id,
          sg.name
        FROM spendings_group sg
        WHERE TRIM(LOWER(sg.name)) = $1
          AND sg.user_id = $2;
      `,
      [normalisedGroupName, userId]
    );

    let groupForSpending: SpendingGroupRow;

    if (oldGroup.rows.length > 0) {
      groupForSpending = oldGroup.rows[0];
    } else {
      const newGroupResult = await client.query<SpendingGroupRow>(
        `
          INSERT INTO spendings_group (
            name,
            category_id,
            user_id
          )
          VALUES ($1, $2, $3)
          RETURNING id, name;
        `,
        [reqValues.groupName.trim(), reqValues.categoryId, userId]
      );

      groupForSpending = newGroupResult.rows[0];
    }

    if (!groupForSpending) {
      throw new AppError(500, "GROUP_CREATE_FAILED", "Group was not created");
    }

    const productName = null;

    const baseAmountMicro = await getBaseAmountMicro(client, reqValues.amount, {
      currencyCode,
      conversionFactor: userSettings.conversionFactor,
    });

    const spendingResult = await client.query<SpendingRow>(
      `
        INSERT INTO spendings (
          amount,
          user_id,
          currency_code,
          group_id,
          name,
          account_id,
          category_id,
          base_amount_micro,
          conversion_factor,
          city_id,
          timezone
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7,
          $8,
          $9,
          $10,
          $11
        )
        RETURNING id;
      `,
      [
        reqValues.amount,
        userId,
        currencyCode,
        groupForSpending.id,
        productName,
        userSettings.accountId,
        reqValues.categoryId,
        baseAmountMicro,
        userSettings.conversionFactor,
        userSettings.cityId,
        timezone,
      ]
    );

    const spending = spendingResult.rows[0];

    if (!spending) {
      throw new AppError(
        500,
        "SPENDING_CREATE_FAILED",
        "Spending was not created"
      );
    }

    const changedAccount = await changeAccountAmount(client, {
      accountId: userSettings.accountId,
      userId,
      deltaAmount: -BigInt(reqValues.amount),
    });

    await client.query("COMMIT");

    return {
      groupId: groupForSpending.id,
      groupName: groupForSpending.name,
      spendingId: spending.id,
      accountAmount: changedAccount.amount,
    };
  } catch (error: any) {
    await client.query("ROLLBACK");

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
  } finally {
    client.release();
  }
}

type GetGroupsReq = {
  userId: string;
  userSettings: UserSettings;
  dateFromUTC: string;
  dateToUTC: string;
};

type GetGroupRow = {
  id: string;
  title: string;
  category_icon: string;
  category_description: string;
  category_id: string;
  amount: string | null;
  is_converted: boolean;
};

export async function getGroups({
  userId,
  userSettings,
  dateFromUTC,
  dateToUTC,
}: GetGroupsReq) {
  try {
    const result = await pool.query<GetGroupRow>(
      `
 WITH params AS (
  SELECT
    $1::uuid AS user_id,
    $2::varchar(3)       AS currency_code,
    $3::numeric          AS conversion_factor,
    $4::varchar(10)      AS lang_code,
    $5::timestamptz      AS date_from_utc,
    $6::timestamptz      AS date_to_utc,
    $7::text             AS time_zone
), 
group_spendings AS (
  SELECT
    sg.id AS group_id,
    sg.name AS title,
    sg.category_id,
    sg.last_change_date,

    s.id AS spending_id,
    COALESCE(s.amount, 0) AS origin_amount,
    TRIM(s.currency_code) AS origin_code,
    s.base_amount_micro,
    s.spending_date,
    s.conversion_factor AS origin_conversion_factor
  FROM params p
  JOIN spendings_group sg
    ON sg.user_id = p.user_id
  LEFT JOIN spendings s
    ON s.group_id = sg.id
   AND s.user_id = p.user_id
   AND (
     s.spending_date AT TIME ZONE COALESCE(
       NULLIF(BTRIM(s.timezone), ''),
       p.time_zone
     )
   ) >= (
     p.date_from_utc AT TIME ZONE p.time_zone
   )
   AND (
     s.spending_date AT TIME ZONE COALESCE(
       NULLIF(BTRIM(s.timezone), ''),
       p.time_zone
     )
   ) < (
     p.date_to_utc AT TIME ZONE p.time_zone
   )
)
, spendings_with_base AS (
  SELECT
    gs.group_id,
    gs.title,
    gs.category_id,
    gs.last_change_date,

    gs.spending_id,
    gs.origin_amount,
    gs.origin_code,
    gs.spending_date,
    gs.origin_conversion_factor,

    CASE
      WHEN gs.spending_id IS NULL THEN NULL

      WHEN gs.base_amount_micro IS NOT NULL THEN gs.base_amount_micro::numeric

      WHEN gs.origin_code = 'USD'
        AND gs.origin_conversion_factor IS NOT NULL
        AND gs.origin_conversion_factor <> 0
      THEN
        ROUND(
          gs.origin_amount::numeric
          / gs.origin_conversion_factor
          * 1000000
        )

      WHEN origin_rate.exchange_rate IS NOT NULL
        AND gs.origin_conversion_factor IS NOT NULL
        AND gs.origin_conversion_factor <> 0
      THEN
        ROUND(
          (
            gs.origin_amount::numeric
            / gs.origin_conversion_factor
            / origin_rate.exchange_rate
          )
          * 1000000
        )

      ELSE NULL
    END AS effective_base_amount_micro
  FROM group_spendings gs
  LEFT JOIN LATERAL (
    SELECT er.exchange_rate
    FROM exchange_rates er
    WHERE er.base_currency = 'USD'
      AND er.target_currency = gs.origin_code
      AND er.date_rate <= gs.spending_date
    ORDER BY er.date_rate DESC
    LIMIT 1
  ) origin_rate ON
       gs.spending_id IS NOT NULL
   AND gs.base_amount_micro IS NULL
   AND gs.origin_code <> 'USD'
)
, converted_spendings AS (
  SELECT
    swb.group_id,
    swb.title,
    swb.category_id,
    swb.last_change_date,

    swb.spending_id,
    swb.spending_date,
    swb.origin_amount,
    swb.origin_code,
    swb.origin_conversion_factor,
    swb.effective_base_amount_micro,

    CASE
      WHEN swb.spending_id IS NULL THEN NULL

      WHEN swb.origin_code = p.currency_code THEN
        swb.origin_amount::numeric

      WHEN swb.effective_base_amount_micro IS NULL THEN
        NULL

      WHEN p.currency_code = 'USD' THEN
        swb.effective_base_amount_micro::numeric
        / 1000000
        * p.conversion_factor

      WHEN target_rate.exchange_rate IS NOT NULL THEN
        swb.effective_base_amount_micro::numeric
        / 1000000
        * target_rate.exchange_rate
        * p.conversion_factor

      ELSE NULL
    END AS view_amount_minor_raw,

    CASE
      WHEN swb.spending_id IS NULL THEN false
      WHEN swb.origin_code = p.currency_code THEN false
      WHEN swb.effective_base_amount_micro IS NULL THEN false
      WHEN p.currency_code = 'USD' THEN true
      WHEN target_rate.exchange_rate IS NOT NULL THEN true
      ELSE false
    END AS is_converted
  FROM spendings_with_base swb
  CROSS JOIN params p
  LEFT JOIN LATERAL (
    SELECT er.exchange_rate
    FROM exchange_rates er
    WHERE er.base_currency = 'USD'
      AND er.target_currency = p.currency_code
      AND er.date_rate <= swb.spending_date
    ORDER BY er.date_rate DESC
    LIMIT 1
  ) target_rate ON
       swb.spending_id IS NOT NULL
   AND swb.origin_code <> p.currency_code
   AND swb.effective_base_amount_micro IS NOT NULL
   AND p.currency_code <> 'USD'
),  
grouped_spendings AS (
  SELECT
    cnv.group_id,
    cnv.title,
    cnv.category_id,
    cnv.last_change_date,

    MAX(cnv.spending_date) AS last_spending_date,

    CASE
      WHEN COUNT(cnv.spending_id) = 0 THEN 0

      WHEN COUNT(*) FILTER (
        WHERE cnv.spending_id IS NOT NULL
          AND cnv.view_amount_minor_raw IS NULL
      ) > 0 THEN NULL

      ELSE ROUND(SUM(cnv.view_amount_minor_raw))
    END AS amount_minor,

    BOOL_OR(cnv.is_converted) AS is_converted
  FROM converted_spendings cnv
  GROUP BY
    cnv.group_id,
    cnv.title,
    cnv.category_id,
    cnv.last_change_date
)

SELECT
  gs.group_id AS id,
  gs.title,
  cat.code AS category_icon,
  COALESCE(clg.translation, cat.comments, cat.code) AS category_description,
  gs.category_id::text AS category_id,
  gs.amount_minor::text AS amount,
  gs.is_converted
FROM grouped_spendings gs
JOIN category cat
  ON cat.id = gs.category_id
JOIN params p
  ON true
LEFT JOIN category_lang clg
  ON clg.word_code = cat.code
 AND clg.lang_code = p.lang_code
ORDER BY
  gs.last_spending_date DESC NULLS LAST,
  gs.last_change_date DESC;
      `,
      [
        userId,
        userSettings.currencyCode,
        userSettings.conversionFactor,
        userSettings.languageCode,
        dateFromUTC,
        dateToUTC,
        userSettings.timezone?.trim() || "UTC",
      ]
    );

    return result.rows;
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

type DeleteGroupWithSpendingsReq = {
  userId: string;
  deleteGroupId: string;
};

type ChangedAccount = {
  accountId: string;
  amount: string;
};

type DeleteGroupWithSpendingsRow = {
  group_id: string;
  group_name: string;
  changed_accounts: ChangedAccount[];
};

export async function deleteGroupWithSpendings({
  userId,
  deleteGroupId,
}: DeleteGroupWithSpendingsReq) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const result = await client.query<DeleteGroupWithSpendingsRow>(
      `
        WITH deleted_spendings AS (
          DELETE FROM spendings
          WHERE user_id = $1
            AND group_id = $2
          RETURNING account_id, amount
        ),

        account_deltas AS (
          SELECT
            account_id,
            SUM(amount)::bigint AS delta_amount
          FROM deleted_spendings
          GROUP BY account_id
        ),

        changed_accounts AS (
          UPDATE accounts a
          SET amount = a.amount + ad.delta_amount,
              last_change_date = CURRENT_TIMESTAMP
          FROM account_deltas ad
          WHERE a.id = ad.account_id
            AND a.user_id = $1
          RETURNING
            a.id,
            a.amount
        ),

        deleted_group AS (
          DELETE FROM spendings_group
          WHERE id = $2
            AND user_id = $1
          RETURNING id, name
        )

        SELECT
          dg.id AS group_id,
          dg.name AS group_name,
          COALESCE(
            json_agg(
              json_build_object(
                'accountId', ca.id,
                'amount', ca.amount::text
              )
            ) FILTER (WHERE ca.id IS NOT NULL),
            '[]'::json
          ) AS changed_accounts
        FROM deleted_group dg
        LEFT JOIN changed_accounts ca ON true
        GROUP BY dg.id, dg.name;
      `,
      [userId, deleteGroupId]
    );

    if (result.rowCount === 0) {
      throw new AppError(404, "GROUP_NOT_FOUND", "Group not found");
    }

    await client.query("COMMIT");

    const deletedGroup = result.rows[0];

    return {
      groupId: deletedGroup.group_id,
      groupName: deletedGroup.group_name,
      accounts: deletedGroup.changed_accounts,
    };
  } catch (error: any) {
    await client.query("ROLLBACK");

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
  } finally {
    client.release();
  }
}

export type GroupFilterValue = "today" | "week" | "month" | "year" | "custom";

export type FilterItem = {
  value: GroupFilterValue;
  label: string;
  amount: string | null;
  isActive: boolean;
  daysInPeriod: number | null;

  dateFromLocal: string | null;
  dateToLocal: string | null;

  dateFromUTC: string | null;
  dateToUTC: string | null;

  timezone: string;
};

type GetGroupsFiltersRequest = {
  userId: string;
  userSettings: UserSettings;
  groupFilterPeriod: GroupFilterValue | null;
  dateFromUTC?: string;
  dateToUTC?: string;
};

type GroupFilterRow = {
  value: GroupFilterValue;
  label: string;
  amount: string | null;
  is_active: boolean;
  days_in_period: number;

  date_from_local: string;
  date_to_local: string;

  date_from_utc: string;
  date_to_utc: string;

  timezone: string;
};

type CustomGroupFilterRow = {
  value: "custom";
  label: string;
  amount: string;
  days_in_period: number;

  date_from_local: string;
  date_to_local: string;

  date_from_utc: string;
  date_to_utc: string;

  timezone: string;
};

type GroupFiltersAvailableRange = {
  minDateLocal: string | null;
  maxDateLocal: string | null;
};

type GetGroupsFiltersResponse = {
  filters: FilterItem[];
  availableRange: GroupFiltersAvailableRange;
};

type SpendingDateRangeRow = {
  min_date_local: string | null;
  max_date_local: string | null;
};

export async function getGroupsFilters({
  userId,
  userSettings,
  groupFilterPeriod,
  dateFromUTC,
  dateToUTC,
}: GetGroupsFiltersRequest): Promise<GetGroupsFiltersResponse> {
  try {
    const currencyCode = userSettings.currencyCode;
    const timeZone = userSettings.timezone?.trim() || "UTC";

    if (!currencyCode) {
      throw new AppError(401, "UNAUTHORIZED", "Unauthorized");
    }

    if (groupFilterPeriod === "custom") {
      if (!dateFromUTC || !dateToUTC) {
        throw new AppError(
          400,
          "CUSTOM_PERIOD_REQUIRED",
          "Custom period dates are required"
        );
      }

      const dateFrom = new Date(dateFromUTC);
      const dateTo = new Date(dateToUTC);

      if (Number.isNaN(dateFrom.getTime()) || Number.isNaN(dateTo.getTime())) {
        throw new AppError(
          400,
          "INVALID_CUSTOM_PERIOD",
          "Invalid custom period dates"
        );
      }

      if (dateFrom >= dateTo) {
        throw new AppError(
          400,
          "INVALID_CUSTOM_PERIOD",
          "The period start must be earlier than the period end"
        );
      }
    }

    /*
     * Запрос стандартных фильтров.
     * Периоды today/week/month/year считаются по локальным календарным дням.
     */
    const result = await pool.query<GroupFilterRow>(
      `
      WITH params AS (
        SELECT
          $1::uuid AS user_id,
          $2::varchar AS currency_code,
          $3::numeric AS conversion_factor,
          $4::text AS time_zone,
          NOW() AS current_at
      ),
      period_boundaries AS (
        SELECT
          p.*,

          (
            date_trunc(
              'day',
              p.current_at AT TIME ZONE p.time_zone
            )
            AT TIME ZONE p.time_zone
          ) AS today_start_utc,

          (
            (
              date_trunc(
                'day',
                p.current_at AT TIME ZONE p.time_zone
              ) - INTERVAL '6 days'
            )
            AT TIME ZONE p.time_zone
          ) AS week_start_utc,

          (
            (
              date_trunc(
                'day',
                p.current_at AT TIME ZONE p.time_zone
              ) - INTERVAL '29 days'
            )
            AT TIME ZONE p.time_zone
          ) AS month_start_utc,

          (
            (
              date_trunc(
                'day',
                p.current_at AT TIME ZONE p.time_zone
              ) - INTERVAL '364 days'
            )
            AT TIME ZONE p.time_zone
          ) AS year_start_utc,

          (
            p.current_at AT TIME ZONE p.time_zone
          )::date AS current_local_date

        FROM params p
      ),
      periods AS (
        SELECT
          p.user_id,
          p.currency_code,
          p.conversion_factor,
          p.time_zone,
          p.current_at,
          p.current_local_date,

          -- today: с 00:00 локального дня до now
          p.today_start_utc AS today_from,
          p.current_at AS today_to,

          p.week_start_utc AS week_from,
          p.current_at AS week_to,

          p.month_start_utc AS month_from,
          p.current_at AS month_to,

          p.year_start_utc AS year_from,
          p.current_at AS year_to,

          p.current_local_date AS today_layer_from,
          p.current_local_date + 1 AS today_layer_to,

          p.current_local_date - 6 AS week_layer_from,
          p.current_local_date AS week_layer_to,

          p.current_local_date - 29 AS month_layer_from,
          p.current_local_date - 6 AS month_layer_to,

          p.current_local_date - 364 AS year_layer_from,
          p.current_local_date - 29 AS year_layer_to

        FROM period_boundaries p
      ),
      period_rows AS (
        SELECT
          p.user_id,
          p.currency_code,
          p.conversion_factor,
          p.time_zone,
          p.current_at,
          p.current_local_date,

          'today'::text AS value,
          'Сегодня'::text AS label,

          1::int AS sort_order,
          1::int AS period_limit_days,

          p.today_from AS period_from_utc,
          p.today_to AS period_to_utc,

          p.current_local_date AS period_from_local_date,

          p.today_layer_from AS layer_from_local_date,
          p.today_layer_to AS layer_to_local_date

        FROM periods p

        UNION ALL

        SELECT
          p.user_id,
          p.currency_code,
          p.conversion_factor,
          p.time_zone,
          p.current_at,
          p.current_local_date,

          'week'::text AS value,
          'Неделя'::text AS label,

          2::int AS sort_order,
          7::int AS period_limit_days,

          p.week_from AS period_from_utc,
          p.week_to AS period_to_utc,

          p.current_local_date - 6 AS period_from_local_date,

          p.week_layer_from AS layer_from_local_date,
          p.week_layer_to AS layer_to_local_date

        FROM periods p

        UNION ALL

        SELECT
          p.user_id,
          p.currency_code,
          p.conversion_factor,
          p.time_zone,
          p.current_at,
          p.current_local_date,

          'month'::text AS value,
          'Месяц'::text AS label,

          3::int AS sort_order,
          30::int AS period_limit_days,

          p.month_from AS period_from_utc,
          p.month_to AS period_to_utc,

          p.current_local_date - 29 AS period_from_local_date,

          p.month_layer_from AS layer_from_local_date,
          p.month_layer_to AS layer_to_local_date

        FROM periods p

        UNION ALL

        SELECT
          p.user_id,
          p.currency_code,
          p.conversion_factor,
          p.time_zone,
          p.current_at,
          p.current_local_date,

          'year'::text AS value,
          'Год'::text AS label,

          4::int AS sort_order,
          365::int AS period_limit_days,

          p.year_from AS period_from_utc,
          p.year_to AS period_to_utc,

          p.current_local_date - 364 AS period_from_local_date,

          p.year_layer_from AS layer_from_local_date,
          p.year_layer_to AS layer_to_local_date

        FROM periods p
      ),
      visible_periods AS (
        SELECT
          pr.*,

          EXISTS (
            SELECT 1
            FROM spendings s
            LEFT JOIN cities c
              ON c.id = s.city_id
            WHERE s.user_id = pr.user_id
              AND (
                s.spending_date AT TIME ZONE COALESCE(
                  NULLIF(BTRIM(s.timezone), ''),
                  c.timezone,
                  pr.time_zone
                )
              )::date >= pr.layer_from_local_date
              AND (
                s.spending_date AT TIME ZONE COALESCE(
                  NULLIF(BTRIM(s.timezone), ''),
                  c.timezone,
                  pr.time_zone
                )
              )::date < pr.layer_to_local_date
              AND s.spending_date < pr.current_at
          ) AS has_spendings_in_layer

        FROM period_rows pr
      ),
      oldest_spending AS (
        SELECT
          MIN(
            (
              s.spending_date AT TIME ZONE COALESCE(
                NULLIF(BTRIM(s.timezone), ''),
                c.timezone,
                p.time_zone
              )
            )::date
          ) FILTER (
            WHERE (
              s.spending_date AT TIME ZONE COALESCE(
                NULLIF(BTRIM(s.timezone), ''),
                c.timezone,
                p.time_zone
              )
            )::date >= (
              p.current_at AT TIME ZONE p.time_zone
            )::date - 364
          ) AS oldest_spending_local_date,

          BOOL_OR(
            (
              s.spending_date AT TIME ZONE COALESCE(
                NULLIF(BTRIM(s.timezone), ''),
                c.timezone,
                p.time_zone
              )
            )::date < (
              p.current_at AT TIME ZONE p.time_zone
            )::date - 364
          ) AS has_spending_before_year

        FROM spendings s
        CROSS JOIN params p

        LEFT JOIN cities c
          ON c.id = s.city_id

        WHERE s.user_id = p.user_id
          AND (
            s.spending_date AT TIME ZONE COALESCE(
              NULLIF(BTRIM(s.timezone), ''),
              c.timezone,
              p.time_zone
            )
          )::date <= (
            p.current_at AT TIME ZONE p.time_zone
          )::date
          AND s.spending_date < p.current_at
      ),
      periods_with_days AS (
        SELECT
          vp.*,
          os.oldest_spending_local_date,
          os.has_spending_before_year,

          CASE
            WHEN os.oldest_spending_local_date IS NULL
              AND COALESCE(os.has_spending_before_year, false) = false
            THEN NULL

            WHEN vp.value = 'today' THEN 1

            WHEN vp.value = 'year'
              AND COALESCE(os.has_spending_before_year, false) = true
            THEN 365

            ELSE LEAST(
              vp.period_limit_days,
              GREATEST(
                1,
                (
                  vp.current_local_date
                  -
                  os.oldest_spending_local_date
                  +
                  1
                )::int
              )
            )
          END AS days_in_period

        FROM visible_periods vp
        CROSS JOIN oldest_spending os
      ),
      response_periods_base AS (
        SELECT
          pwd.user_id,
          pwd.currency_code,
          pwd.conversion_factor,
          pwd.time_zone,
          pwd.current_at,
          pwd.current_local_date,

          pwd.value,
          pwd.label,
          pwd.sort_order,
          pwd.period_limit_days,
          pwd.days_in_period,

          (
            GREATEST(
              CASE
                WHEN pwd.value = 'year'
                  AND COALESCE(pwd.has_spending_before_year, false) = true
                THEN pwd.period_from_local_date

                ELSE GREATEST(
                  pwd.period_from_local_date,
                  pwd.oldest_spending_local_date
                )
              END
            )::timestamp
            AT TIME ZONE pwd.time_zone
          ) AS date_from_utc,

          pwd.period_to_utc AS date_to_utc,

          GREATEST(
            CASE
              WHEN pwd.value = 'year'
                AND COALESCE(pwd.has_spending_before_year, false) = true
              THEN pwd.period_from_local_date

              ELSE GREATEST(
                pwd.period_from_local_date,
                pwd.oldest_spending_local_date
              )
            END
          )::timestamp AS date_from_local,

          pwd.period_to_utc
            AT TIME ZONE pwd.time_zone AS date_to_local,

          GREATEST(
            CASE
              WHEN pwd.value = 'year'
                AND COALESCE(pwd.has_spending_before_year, false) = true
              THEN pwd.period_from_local_date

              ELSE GREATEST(
                pwd.period_from_local_date,
                pwd.oldest_spending_local_date
              )
            END
          ) AS period_from_local_date,

          pwd.layer_from_local_date,
          pwd.layer_to_local_date,
          pwd.oldest_spending_local_date

        FROM periods_with_days pwd
        WHERE pwd.has_spendings_in_layer = true
      ),
      period_spendings_raw AS (
        SELECT
          rpb.value,
          rpb.label,
          rpb.sort_order,
          rpb.days_in_period,

          rpb.currency_code AS target_currency_code,
          rpb.conversion_factor AS target_conversion_factor,

          rpb.date_from_utc,
          rpb.date_to_utc,

          s.id AS spending_id,
          s.spending_date,

          s.amount AS original_amount_minor,
          s.currency_code AS original_currency_code,
          s.conversion_factor AS original_conversion_factor,
          s.base_amount_micro AS stored_base_amount_micro,

          original_rate.exchange_rate AS original_currency_rate,
          target_rate.exchange_rate AS target_currency_rate,

          CASE
            WHEN s.base_amount_micro IS NOT NULL THEN
              s.base_amount_micro::numeric

            WHEN s.currency_code = 'USD' THEN
              ROUND(
                (
                  s.amount::numeric /
                  s.conversion_factor::numeric
                ) * 1000000
              )

            WHEN original_rate.exchange_rate IS NOT NULL THEN
              ROUND(
                (
                  (
                    s.amount::numeric /
                    s.conversion_factor::numeric
                  ) / original_rate.exchange_rate
                ) * 1000000
              )

            ELSE NULL
          END AS calculated_base_amount_micro,

          CASE
            WHEN rpb.currency_code = 'USD' THEN
              ROUND(
                (
                  CASE
                    WHEN s.base_amount_micro IS NOT NULL THEN
                      s.base_amount_micro::numeric

                    WHEN s.currency_code = 'USD' THEN
                      ROUND(
                        (
                          s.amount::numeric /
                          s.conversion_factor::numeric
                        ) * 1000000
                      )

                    WHEN original_rate.exchange_rate IS NOT NULL THEN
                      ROUND(
                        (
                          (
                            s.amount::numeric /
                            s.conversion_factor::numeric
                          ) / original_rate.exchange_rate
                        ) * 1000000
                      )

                    ELSE NULL
                  END
                  / 1000000
                ) * rpb.conversion_factor
              )::bigint

            WHEN target_rate.exchange_rate IS NOT NULL THEN
              ROUND(
                (
                  (
                    CASE
                      WHEN s.base_amount_micro IS NOT NULL THEN
                        s.base_amount_micro::numeric

                      WHEN s.currency_code = 'USD' THEN
                        ROUND(
                          (
                            s.amount::numeric /
                            s.conversion_factor::numeric
                          ) * 1000000
                        )

                      WHEN original_rate.exchange_rate IS NOT NULL THEN
                        ROUND(
                          (
                            (
                              s.amount::numeric /
                              s.conversion_factor::numeric
                            ) / original_rate.exchange_rate
                          ) * 1000000
                        )

                      ELSE NULL
                    END
                    / 1000000
                  )
                  * target_rate.exchange_rate
                  * rpb.conversion_factor
                )
              )::bigint

            ELSE NULL
          END AS target_amount_minor

        FROM response_periods_base rpb

        JOIN spendings s
          ON s.user_id = rpb.user_id

        LEFT JOIN cities c
          ON c.id = s.city_id

        LEFT JOIN LATERAL (
          SELECT er.exchange_rate

          FROM exchange_rates er

          WHERE er.base_currency = 'USD'
            AND er.target_currency = s.currency_code
            AND er.date_rate <= s.spending_date

          ORDER BY er.date_rate DESC
          LIMIT 1
        ) original_rate
          ON s.base_amount_micro IS NULL
         AND s.currency_code <> 'USD'

        LEFT JOIN LATERAL (
          SELECT er.exchange_rate

          FROM exchange_rates er

          WHERE er.base_currency = 'USD'
            AND er.target_currency = rpb.currency_code
            AND er.date_rate <= s.spending_date

          ORDER BY er.date_rate DESC
          LIMIT 1
        ) target_rate
          ON rpb.currency_code <> 'USD'

        WHERE (
          s.spending_date AT TIME ZONE COALESCE(
            NULLIF(BTRIM(s.timezone), ''),
            c.timezone,
            rpb.time_zone
          )
        )::date >= rpb.period_from_local_date
          AND (
            s.spending_date AT TIME ZONE COALESCE(
              NULLIF(BTRIM(s.timezone), ''),
              c.timezone,
              rpb.time_zone
            )
          )::date <= rpb.current_local_date
          AND s.spending_date < rpb.date_to_utc
      ),
      period_amounts AS (
        SELECT
          psr.value,
          psr.label,
          psr.sort_order,
          psr.days_in_period,

          psr.date_from_utc,
          psr.date_to_utc,

          MIN(rpb.date_from_local) AS date_from_local,
          MIN(rpb.date_to_local) AS date_to_local,
          MIN(rpb.time_zone) AS time_zone,

          COUNT(*) AS spendings_count,
          COUNT(psr.target_amount_minor) AS converted_spendings_count,

          COALESCE(
            SUM(psr.target_amount_minor),
            0
          )::bigint AS amount_minor

        FROM period_spendings_raw psr

        JOIN response_periods_base rpb
          ON rpb.value = psr.value

        GROUP BY
          psr.value,
          psr.label,
          psr.sort_order,
          psr.days_in_period,
          psr.date_from_utc,
          psr.date_to_utc
      ),
      final_filters AS (
        SELECT
          pa.*,

          CASE
            WHEN EXISTS (
              SELECT 1
              FROM period_amounts x
              WHERE x.value = 'week'
                AND x.amount_minor <> 0
            )
            THEN pa.value = 'week'

            ELSE pa.sort_order = (
              SELECT MIN(x.sort_order)
              FROM period_amounts x
              WHERE x.amount_minor <> 0
            )
          END AS is_active

        FROM period_amounts pa
        WHERE pa.amount_minor <> 0
      )
      SELECT
        value,
        label,
        is_active,
        days_in_period,

        TO_CHAR(
          date_from_local,
          'YYYY-MM-DD"T"HH24:MI:SS'
        ) AS date_from_local,

        TO_CHAR(
          date_to_local,
          'YYYY-MM-DD"T"HH24:MI:SS'
        ) AS date_to_local,

        date_from_utc,
        date_to_utc,

        time_zone AS timezone,

        amount_minor::text AS amount

      FROM final_filters
      ORDER BY sort_order;
      `,
      [userId, currencyCode, userSettings.conversionFactor, timeZone]
    );

    const filters: FilterItem[] = result.rows.map((row) => ({
      value: row.value,
      label: row.label,
      amount: row.amount,
      isActive: false,
      daysInPeriod: row.days_in_period,

      dateFromLocal: row.date_from_local,
      dateToLocal: row.date_to_local,

      dateFromUTC: row.date_from_utc,
      dateToUTC: row.date_to_utc,

      timezone: row.timezone,
    }));

    let customFilter: FilterItem = {
      value: "custom",
      label: "Произвольный",
      amount: null,
      isActive: false,
      daysInPeriod: null,

      dateFromLocal: null,
      dateToLocal: null,

      dateFromUTC: null,
      dateToUTC: null,

      timezone: timeZone,
    };

    /*
     * Для custom используем отдельный запрос.
     * Существующий запрос стандартных фильтров не меняется.
     */
    if (groupFilterPeriod === "custom" && dateFromUTC && dateToUTC) {
      const customResult = await pool.query<CustomGroupFilterRow>(
        `
        WITH params AS (
          SELECT
            $1::uuid AS user_id,
            $2::varchar AS currency_code,
            $3::numeric AS conversion_factor,
            $4::text AS time_zone,
            $5::timestamptz AS date_from_utc,
            $6::timestamptz AS date_to_utc
        ),
        custom_spendings_raw AS (
          SELECT
            s.id AS spending_id,
            s.spending_date,

            s.amount AS original_amount_minor,
            s.currency_code AS original_currency_code,
            s.conversion_factor AS original_conversion_factor,
            s.base_amount_micro AS stored_base_amount_micro,

            original_rate.exchange_rate AS original_currency_rate,
            target_rate.exchange_rate AS target_currency_rate,

            CASE
              WHEN p.currency_code = 'USD' THEN
                ROUND(
                  (
                    CASE
                      WHEN s.base_amount_micro IS NOT NULL THEN
                        s.base_amount_micro::numeric

                      WHEN s.currency_code = 'USD' THEN
                        ROUND(
                          (
                            s.amount::numeric /
                            s.conversion_factor::numeric
                          ) * 1000000
                        )

                      WHEN original_rate.exchange_rate IS NOT NULL THEN
                        ROUND(
                          (
                            (
                              s.amount::numeric /
                              s.conversion_factor::numeric
                            ) / original_rate.exchange_rate
                          ) * 1000000
                        )

                      ELSE NULL
                    END
                    / 1000000
                  ) * p.conversion_factor
                )::bigint

              WHEN target_rate.exchange_rate IS NOT NULL THEN
                ROUND(
                  (
                    (
                      CASE
                        WHEN s.base_amount_micro IS NOT NULL THEN
                          s.base_amount_micro::numeric

                        WHEN s.currency_code = 'USD' THEN
                          ROUND(
                            (
                              s.amount::numeric /
                              s.conversion_factor::numeric
                            ) * 1000000
                          )

                        WHEN original_rate.exchange_rate IS NOT NULL THEN
                          ROUND(
                            (
                              (
                                s.amount::numeric /
                                s.conversion_factor::numeric
                              ) / original_rate.exchange_rate
                            ) * 1000000
                          )

                        ELSE NULL
                      END
                      / 1000000
                    )
                    * target_rate.exchange_rate
                    * p.conversion_factor
                  )
                )::bigint

              ELSE NULL
            END AS target_amount_minor

          FROM params p

          JOIN spendings s
            ON s.user_id = p.user_id

          LEFT JOIN cities c
            ON c.id = s.city_id

          LEFT JOIN LATERAL (
            SELECT er.exchange_rate

            FROM exchange_rates er

            WHERE er.base_currency = 'USD'
              AND er.target_currency = s.currency_code
              AND er.date_rate <= s.spending_date

            ORDER BY er.date_rate DESC
            LIMIT 1
          ) original_rate
            ON s.base_amount_micro IS NULL
           AND s.currency_code <> 'USD'

          LEFT JOIN LATERAL (
            SELECT er.exchange_rate

            FROM exchange_rates er

            WHERE er.base_currency = 'USD'
              AND er.target_currency = p.currency_code
              AND er.date_rate <= s.spending_date

            ORDER BY er.date_rate DESC
            LIMIT 1
          ) target_rate
            ON p.currency_code <> 'USD'

          WHERE (
            s.spending_date AT TIME ZONE COALESCE(
              NULLIF(BTRIM(s.timezone), ''),
              c.timezone,
              p.time_zone
            )
          )::date >= (
            p.date_from_utc AT TIME ZONE p.time_zone
          )::date
            AND (
              s.spending_date AT TIME ZONE COALESCE(
                NULLIF(BTRIM(s.timezone), ''),
                c.timezone,
                p.time_zone
              )
            )::date < (
              p.date_to_utc AT TIME ZONE p.time_zone
            )::date
        )
        SELECT
          'custom'::text AS value,
          'Произвольный'::text AS label,

          COALESCE(
            SUM(csr.target_amount_minor),
            0
          )::bigint::text AS amount,

          GREATEST(
            1,
            (
              (
                p.date_to_utc
                AT TIME ZONE p.time_zone
              )::date
              -
              (
                p.date_from_utc
                AT TIME ZONE p.time_zone
              )::date
            )::int
          ) AS days_in_period,

          TO_CHAR(
            p.date_from_utc AT TIME ZONE p.time_zone,
            'YYYY-MM-DD"T"HH24:MI:SS'
          ) AS date_from_local,

          TO_CHAR(
            (p.date_to_utc AT TIME ZONE p.time_zone) - INTERVAL '1 second',
            'YYYY-MM-DD"T"HH24:MI:SS'
          ) AS date_to_local,

          p.date_from_utc AS date_from_utc,
          p.date_to_utc AS date_to_utc,

          p.time_zone AS timezone

        FROM params p
        LEFT JOIN custom_spendings_raw csr
          ON true

        GROUP BY
          p.date_from_utc,
          p.date_to_utc,
          p.time_zone;
        `,
        [
          userId,
          currencyCode,
          userSettings.conversionFactor,
          timeZone,
          dateFromUTC,
          dateToUTC,
        ]
      );

      const customRow = customResult.rows[0];

      if (customRow) {
        customFilter = {
          value: customRow.value,
          label: customRow.label,
          amount: customRow.amount,
          isActive: false,
          daysInPeriod: customRow.days_in_period,

          dateFromLocal: customRow.date_from_local,
          dateToLocal: customRow.date_to_local,

          dateFromUTC: customRow.date_from_utc,
          dateToUTC: customRow.date_to_utc,

          timezone: customRow.timezone,
        };
      }
    }

    const availableRangeResult = await pool.query<SpendingDateRangeRow>(
      `
        SELECT
          TO_CHAR(
            MIN(s.spending_date) AT TIME ZONE $2::text,
            'YYYY-MM-DD'
          ) AS min_date_local,

          TO_CHAR(
            MAX(s.spending_date) AT TIME ZONE $2::text,
            'YYYY-MM-DD'
          ) AS max_date_local

        FROM spendings s
        WHERE s.user_id = $1::uuid;
        `,
      [userId, timeZone]
    );

    const availableRangeRow = availableRangeResult.rows[0];

    if (
      availableRangeRow?.min_date_local &&
      (groupFilterPeriod !== "custom" || customFilter.amount !== null)
    ) {
      filters.push(customFilter);
    }

    const activeFilter =
      filters.find((filter) => filter.value === groupFilterPeriod) ??
      filters.find((filter) => filter.value === "week") ??
      filters[0];

    if (activeFilter) {
      activeFilter.isActive = true;
    }

    return {
      filters,

      availableRange: {
        minDateLocal: availableRangeRow?.min_date_local ?? null,

        maxDateLocal: availableRangeRow?.max_date_local ?? null,
      },
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

type RenameGroupRequest = {
  userId: string;
  groupId: string;
  groupName: string;
};

type RenameGroupResponse = {
  groupId: string;
  groupName: string;
};

type ExistingGroupRow = {
  id: string;
};

type RenameGroupRow = {
  group_id: string;
  group_name: string;
};

export async function renameGroup({
  userId,
  groupId,
  groupName,
}: RenameGroupRequest): Promise<RenameGroupResponse> {
  const normalizedGroupName = groupName.trim();

  try {
    const existingGroupResult = await pool.query<ExistingGroupRow>(
      `
        SELECT id
        FROM spendings_group
        WHERE user_id = $1
          AND id <> $2
          AND LOWER(TRIM(name)) = LOWER($3)
        LIMIT 1
      `,
      [userId, groupId, normalizedGroupName]
    );

    if (existingGroupResult.rows.length > 0) {
      throw new AppError(
        409,
        "GROUP_NAME_ALREADY_EXISTS",
        "Group with this name already exists"
      );
    }

    const result = await pool.query<RenameGroupRow>(
      `
        UPDATE spendings_group
        SET name = $1
        WHERE id = $2
          AND user_id = $3
        RETURNING
          id AS group_id,
          name AS group_name
      `,
      [normalizedGroupName, groupId, userId]
    );

    const renamedGroup = result.rows[0];

    if (!renamedGroup) {
      throw new AppError(404, "GROUP_NOT_FOUND", "Group not found");
    }

    return {
      groupId: renamedGroup.group_id,
      groupName: renamedGroup.group_name,
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
