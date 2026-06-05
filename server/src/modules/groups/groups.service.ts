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

type GetGroupsreq = {
  userId: string;
  userSettings: UserSettings;
  periodType: "today" | "week" | "month" | "year";
};

export async function getGroups({
  userId,
  userSettings,
  periodType,
}: GetGroupsreq) {
  try {
    const { dateFrom, dateTo } = getPeriodRange(periodType);

    const result = await pool.query<GetGroupResponse>(
      `
      ;WITH all_spendings AS (
        SELECT
          s.id AS spending_id,
          sg.id AS group_id,
          sg.name AS title,
          COALESCE(s.amount, 0) AS origin_amount,
          TRIM(s.currency_code) AS origin_code,
          s.base_amount_micro,
          s.spending_date,
          sg.category_id,
          sg.last_change_date,
          s.conversion_factor
        FROM spendings_group sg
        LEFT JOIN spendings s 
          ON s.group_id = sg.id
          AND (
            $3::timestamptz IS NULL 
            OR s.spending_date >= $3::timestamptz
          )
          AND (
            $4::timestamptz IS NULL 
            OR s.spending_date < $4::timestamptz
          )
        WHERE sg.user_id = $1
      ),

      converted_spendings AS (
        SELECT
          a.spending_id,
          a.group_id,
          a.title,
          a.category_id,
          a.last_change_date,
            CASE
            WHEN a.origin_code = $2 THEN false
            WHEN $2 = 'USD' AND a.base_amount_micro IS NOT NULL THEN true
            WHEN rate.exchange_rate IS NOT NULL THEN true
            ELSE false
          END AS is_converted,
          CASE
            WHEN a.origin_code = $2 THEN a.origin_amount
            WHEN $2 = 'USD' THEN ROUND(a.base_amount_micro::numeric / 1000000 * a.conversion_factor) 
            WHEN rate.exchange_rate IS NOT NULL THEN ROUND((a.base_amount_micro::numeric / 1000000) * rate.exchange_rate * a.conversion_factor)
            ELSE NULL
          END AS view_amount
        FROM all_spendings a
        LEFT JOIN LATERAL (
          SELECT er.exchange_rate
          FROM exchange_rates er
          WHERE er.base_currency = 'USD'
            AND er.target_currency = $2
            AND er.date_rate <= a.spending_date
          ORDER BY er.date_rate DESC
          LIMIT 1
        ) rate ON
          a.origin_code <> $2
          AND $2 <> 'USD'
          AND a.base_amount_micro IS NOT NULL
      ), grouped_spendings AS (
        SELECT
          cnv.group_id,
          cnv.title,
          cnv.category_id,
          cnv.last_change_date,	
          CASE
            WHEN COUNT(cnv.spending_id) = 0 THEN 0
            WHEN COUNT(*) FILTER (WHERE cnv.spending_id IS NOT NULL AND cnv.view_amount IS NULL) > 0 THEN NULL
            ELSE SUM(cnv.view_amount)
          END AS amount,
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
        gs.amount,
        cat.code AS category_icon,
        clg.translation AS category_description,
        gs.category_id,
        gs.is_converted
      FROM grouped_spendings gs
      JOIN category cat ON cat.id = gs.category_id
      JOIN category_lang clg ON clg.word_code = cat.code AND clg.lang_code = 'ru'
      ORDER BY gs.last_change_date DESC;
      `,
      [userId, userSettings.currencyCode, dateFrom, dateTo]
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
  amount?: string;
  isActive: boolean;
};

type GetGroupsFiltersRequest = {
  userId: string;
  userSettings: UserSettings;
};

type GroupFilterRow = {
  value: GroupFilterValue;
  label: string;
  amount: string | null;
};

export async function getGroupsFilters({
  userId,
  userSettings,
}: GetGroupsFiltersRequest): Promise<FilterItem[]> {
  try {
    const currencyCode = userSettings.currencyCode;

    if (!currencyCode) {
      throw new AppError(401, "UNAUTHORIZED", "Unauthorized");
    }

    const result = await pool.query<GroupFilterRow>(
      `
      WITH selected_rate AS (
        SELECT
          CASE
            WHEN $2::varchar = 'USD' THEN 1::numeric
            ELSE (
              SELECT er.exchange_rate
              FROM exchange_rates er
              WHERE er.base_currency = 'USD'
                AND er.target_currency = $2
                AND er.date_rate <= NOW()
              ORDER BY er.date_rate DESC
              LIMIT 1
            )
          END AS exchange_rate
      ),
      periods AS (
        SELECT
          1 AS sort_order,
          'today'::text AS value,
          'Сегодня'::text AS label,
          date_trunc('day', NOW()) AS amount_from,
          date_trunc('day', NOW()) AS show_from,
          NOW() AS show_to
    
        UNION ALL
    
        SELECT
          2 AS sort_order,
          'week'::text AS value,
          'Неделя'::text AS label,
          NOW() - INTERVAL '7 days' AS amount_from,
          NOW() - INTERVAL '7 days' AS show_from,
          date_trunc('day', NOW()) AS show_to
    
        UNION ALL
    
        SELECT
          3 AS sort_order,
          'month'::text AS value,
          'Месяц'::text AS label,
          NOW() - INTERVAL '30 days' AS amount_from,
          NOW() - INTERVAL '30 days' AS show_from,
          NOW() - INTERVAL '7 days' AS show_to
    
        UNION ALL
    
        SELECT
          4 AS sort_order,
          'year'::text AS value,
          'Год'::text AS label,
          date_trunc('year', NOW()) AS amount_from,
          date_trunc('year', NOW()) AS show_from,
          NOW() - INTERVAL '30 days' AS show_to
      ),
      visible_periods AS (
        SELECT p.*
        FROM periods p
        WHERE EXISTS (
          SELECT 1
          FROM spendings s
          WHERE s.user_id = $1
            AND s.spending_date >= p.show_from
            AND s.spending_date < p.show_to
        )
      ),
      aggregated AS (
        SELECT
          p.sort_order,
          p.value,
          p.label,
          COALESCE(SUM(s.base_amount_micro), 0)::numeric AS total_base_micro,
          COUNT(s.id) FILTER (
            WHERE s.id IS NOT NULL
              AND s.base_amount_micro IS NULL
          ) AS missed_base_amount_count
        FROM visible_periods p
        LEFT JOIN spendings s
          ON s.user_id = $1
          AND s.spending_date >= p.amount_from
        GROUP BY p.sort_order, p.value, p.label
      )
      SELECT
        a.value,
        a.label,
        CASE
          WHEN a.missed_base_amount_count > 0 THEN NULL
          WHEN sr.exchange_rate IS NULL THEN NULL
          ELSE ROUND(
            (a.total_base_micro / 1000000::numeric)
            * sr.exchange_rate
            * $3::numeric
          )::bigint::text
        END AS amount
      FROM aggregated a
      CROSS JOIN selected_rate sr
      ORDER BY a.sort_order;
      `,
      [userId, currencyCode, userSettings.conversionFactor]
    );

    const filters = result.rows.map((row) => {
      const filter: FilterItem = {
        value: row.value,
        label: row.label,
        isActive: false,
      };

      if (row.amount !== null) {
        filter.amount = row.amount;
      }

      return filter;
    });

    const activeFilter =
      filters.find((filter) => filter.value === "week") ?? filters[0];

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
