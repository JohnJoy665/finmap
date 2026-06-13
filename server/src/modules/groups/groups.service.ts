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
    const normalisedGroupName = reqValues.groupName.trim().toLowerCase();
    const oldGroup = await client.query<SpendingGroupRow>(
      "select sg.id, sg.name from spendings_group sg where trim(lower(sg.name)) = $1 and sg.user_id = $2;",
      [normalisedGroupName, userId]
    );

    let groupForSpending: SpendingGroupRow;
    if (oldGroup.rows.length > 0) {
      groupForSpending = oldGroup.rows[0];
    } else {
      const newGroupId = await client.query<SpendingGroupRow>(
        "\
        insert into spendings_group (name, category_id, user_id)\
        values ( $1, $2, $3 ) RETURNING id, name;",
        [reqValues.groupName, reqValues.categoryId, userId]
      );
      groupForSpending = newGroupId.rows[0];
    }

    if (!groupForSpending) {
      throw new AppError(500, "GROUP_CREATE_FAILED", "Group was not created");
    }

    const product_name = null;

    const currencyCode = userSettings.currencyCode;

    if (!currencyCode) {
      throw new AppError(401, "UNAUTHORIZED", "Unauthorized");
    }

    const baseAmountMicro = await getBaseAmountMicro(client, reqValues.amount, {
      currencyCode,
      conversionFactor: userSettings.conversionFactor,
    });

    const spendingResult = await client.query<SpendingRow>(
      `insert into spendings (
          amount, 
          user_id, 
          currency_code, 
          group_id, 
          name,
          account_id,
          category_id,
          base_amount_micro,
          conversion_factor,
          city_id
        )
        values ( $1, $2, $3, $4, $5, $6, $7, $8, $9, $10 ) RETURNING id;`,
      [
        reqValues.amount,
        userId,
        userSettings.currencyCode,
        groupForSpending.id,
        product_name,
        userSettings.accountId,
        reqValues.categoryId,
        baseAmountMicro,
        userSettings.conversionFactor,
        userSettings.cityId,
      ]
    );

    const changedAccount = await changeAccountAmount(client, {
      accountId: userSettings.accountId,
      userId,
      deltaAmount: -BigInt(reqValues.amount),
    });

    await client.query("COMMIT");

    return {
      groupId: groupForSpending.id,
      groupName: groupForSpending.name,
      spendingId: spendingResult.rows[0].id,
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
    $6::timestamptz      AS date_to_utc
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
   AND s.spending_date >= p.date_from_utc
   AND s.spending_date < p.date_to_utc
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

export type GroupFilterValue = "today" | "week" | "month" | "year";

type FilterItem = {
  value: GroupFilterValue;
  label: string;
  amount: string | null;
  isActive: boolean;
  daysInPeriod: number;

  dateFromLocal: string;
  dateToLocal: string;

  dateFromUTC: string;
  dateToUTC: string;

  timezone: string;
};

type GetGroupsFiltersRequest = {
  userId: string;
  userSettings: UserSettings;
  groupFilterPeriod: GroupFilterValue | null;
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

export async function getGroupsFilters({
  userId,
  userSettings,
  groupFilterPeriod,
}: GetGroupsFiltersRequest): Promise<FilterItem[]> {
  try {
    const currencyCode = userSettings.currencyCode;
    const timeZone = userSettings.timezone?.trim() || "UTC";

    if (!currencyCode) {
      throw new AppError(401, "UNAUTHORIZED", "Unauthorized");
    }

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
      date_trunc('day', p.current_at AT TIME ZONE p.time_zone)
      AT TIME ZONE p.time_zone
    ) AS today_start_utc

  FROM params p
),

periods AS (
  SELECT
    p.user_id,
    p.currency_code,
    p.conversion_factor,
    p.time_zone,
    p.current_at,

    -- today теперь календарный: с 00:00 локального дня до now
    p.today_start_utc AS today_from,
    p.current_at AS today_to,

    p.current_at - INTERVAL '7 days' AS week_from,
    p.current_at AS week_to,

    p.current_at - INTERVAL '30 days' AS month_from,
    p.current_at AS month_to,

    p.current_at - INTERVAL '365 days' AS year_from,
    p.current_at AS year_to,

    -- today layer тоже календарный today
    p.today_start_utc AS today_layer_from,
    p.current_at AS today_layer_to,

    -- week layer теперь должен заканчиваться на начале today,
    -- чтобы не было пересечения с today и не было дырки
    p.current_at - INTERVAL '7 days' AS week_layer_from,
    p.today_start_utc AS week_layer_to,

    p.current_at - INTERVAL '30 days' AS month_layer_from,
    p.current_at - INTERVAL '7 days' AS month_layer_to,

    p.current_at - INTERVAL '365 days' AS year_layer_from,
    p.current_at - INTERVAL '30 days' AS year_layer_to

  FROM period_boundaries p
),
      period_rows AS (
        SELECT
          p.user_id,
          p.currency_code,
          p.conversion_factor,
          p.time_zone,
          p.current_at,
          'today'::text AS value,
          'Сегодня'::text AS label,
          1::int AS sort_order,
          1::int AS period_limit_days,
          p.today_from AS period_from_utc,
          p.today_to AS period_to_utc,
          p.today_layer_from AS layer_from_utc,
          p.today_layer_to AS layer_to_utc
        FROM periods p
        UNION ALL
        SELECT
          p.user_id,
          p.currency_code,
          p.conversion_factor,
          p.time_zone,
          p.current_at,
          'week'::text AS value,
          'Неделя'::text AS label,
          2::int AS sort_order,
          7::int AS period_limit_days,
          p.week_from AS period_from_utc,
          p.week_to AS period_to_utc,
          p.week_layer_from AS layer_from_utc,
          p.week_layer_to AS layer_to_utc
        FROM periods p
        UNION ALL
        SELECT
          p.user_id,
          p.currency_code,
          p.conversion_factor,
          p.time_zone,
          p.current_at,
          'month'::text AS value,
          'Месяц'::text AS label,
          3::int AS sort_order,
          30::int AS period_limit_days,
          p.month_from AS period_from_utc,
          p.month_to AS period_to_utc,
          p.month_layer_from AS layer_from_utc,
          p.month_layer_to AS layer_to_utc
        FROM periods p
        UNION ALL
        SELECT
          p.user_id,
          p.currency_code,
          p.conversion_factor,
          p.time_zone,
          p.current_at,
          'year'::text AS value,
          'Год'::text AS label,
          4::int AS sort_order,
          365::int AS period_limit_days,
          p.year_from AS period_from_utc,
          p.year_to AS period_to_utc,
          p.year_layer_from AS layer_from_utc,
          p.year_layer_to AS layer_to_utc
        FROM periods p
      ),
      visible_periods AS (
        SELECT
          pr.*,
          EXISTS (
            SELECT 1
            FROM spendings s
            WHERE s.user_id = pr.user_id
              AND s.spending_date >= pr.layer_from_utc
              AND s.spending_date < pr.layer_to_utc
          ) AS has_spendings_in_layer
        FROM period_rows pr
      ),
      oldest_spending AS (
        SELECT
          MIN(s.spending_date) AS oldest_spending_date
        FROM spendings s
        CROSS JOIN params p
        WHERE s.user_id = p.user_id
          AND s.spending_date >= p.current_at - INTERVAL '365 days'
          AND s.spending_date < p.current_at
      ),
      periods_with_days AS (
        SELECT
          vp.*,
          os.oldest_spending_date,

          CASE
            WHEN os.oldest_spending_date IS NULL THEN NULL

            WHEN vp.value = 'today' THEN 1

            ELSE LEAST(
              vp.period_limit_days,
              GREATEST(
                1,
                CEIL(
                  EXTRACT(EPOCH FROM (vp.current_at - os.oldest_spending_date))
                  / 86400
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

          pwd.value,
          pwd.label,
          pwd.sort_order,
          pwd.period_limit_days,
          pwd.days_in_period,

          pwd.period_from_utc AS date_from_utc,
          pwd.period_to_utc AS date_to_utc,

          pwd.period_from_utc AT TIME ZONE pwd.time_zone AS date_from_local,
          pwd.period_to_utc AT TIME ZONE pwd.time_zone AS date_to_local,

          pwd.layer_from_utc,
          pwd.layer_to_utc,
          pwd.oldest_spending_date

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
                (s.amount::numeric / s.conversion_factor::numeric) * 1000000
              )

            WHEN original_rate.exchange_rate IS NOT NULL THEN
              ROUND(
                (
                  (s.amount::numeric / s.conversion_factor::numeric)
                  / original_rate.exchange_rate
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
                        (s.amount::numeric / s.conversion_factor::numeric) * 1000000
                      )

                    WHEN original_rate.exchange_rate IS NOT NULL THEN
                      ROUND(
                        (
                          (s.amount::numeric / s.conversion_factor::numeric)
                          / original_rate.exchange_rate
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
                          (s.amount::numeric / s.conversion_factor::numeric) * 1000000
                        )

                      WHEN original_rate.exchange_rate IS NOT NULL THEN
                        ROUND(
                          (
                            (s.amount::numeric / s.conversion_factor::numeric)
                            / original_rate.exchange_rate
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
        AND s.spending_date >= rpb.date_from_utc
        AND s.spending_date < rpb.date_to_utc

      LEFT JOIN LATERAL (
        SELECT er.exchange_rate
        FROM exchange_rates er
        WHERE er.base_currency = 'USD'
          AND er.target_currency = s.currency_code
          AND er.date_rate <= s.spending_date
        ORDER BY er.date_rate DESC
        LIMIT 1
      ) original_rate ON s.base_amount_micro IS NULL
                      AND s.currency_code <> 'USD'

      LEFT JOIN LATERAL (
        SELECT er.exchange_rate
        FROM exchange_rates er
        WHERE er.base_currency = 'USD'
          AND er.target_currency = rpb.currency_code
          AND er.date_rate <= s.spending_date
        ORDER BY er.date_rate DESC
        LIMIT 1
      ) target_rate ON rpb.currency_code <> 'USD'
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

        date_from_local,
        date_to_local,

        date_from_utc,
        date_to_utc,

        time_zone,

        amount_minor::text AS amount

      FROM final_filters
      ORDER BY sort_order;
      `,
      [userId, currencyCode, userSettings.conversionFactor, timeZone]
    );

    const filters = result.rows.map((row) => {
      const filter: FilterItem = {
        value: row.value,
        label: row.label,
        isActive: false,
        daysInPeriod: row.days_in_period,

        dateFromLocal: row.date_from_local,
        dateToLocal: row.date_to_local,

        dateFromUTC: row.date_from_utc,
        dateToUTC: row.date_to_utc,

        timezone: row.timezone,

        amount: row.amount,
      };

      if (row.amount !== null) {
        filter.amount = row.amount;
      }

      return filter;
    });

    const activeFilter =
      filters.find((filter) => filter.value === groupFilterPeriod) ??
      filters.find((filter) => filter.value === "week") ??
      filters[0];

    if (activeFilter) {
      activeFilter.isActive = true;
    }

    return filters;
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
