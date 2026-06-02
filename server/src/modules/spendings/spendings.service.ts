import { pool } from "../../db/pool";
import type { CreateSpendingRequest } from "../../types/spendings/spendings.type";
import { AppError } from "../../utils/AppError";
import { changeAccountAmount } from "../accounts/accounts.service";
import { getBaseAmountMicro } from "../rates/rates.service";

type SpendingGroupResult = {
  category_id: number;
};

type NewSpendingResult = {
  id: string;
};

async function getCategoryIdForSpending(
  groupId: string,
  categoryId?: number
): Promise<number> {
  if (categoryId !== undefined) {
    return categoryId;
  }

  const spendingGroup = await pool.query<SpendingGroupResult>(
    `
    SELECT sg.category_id
    FROM spendings_group sg
    WHERE sg.id = $1
    LIMIT 1;
    `,
    [groupId]
  );

  if (spendingGroup.rowCount === 0) {
    throw new AppError(
      404,
      "SPENDING_GROUP_NOT_FOUND",
      "Spending group not found"
    );
  }

  return spendingGroup.rows[0].category_id;
}

export async function createSpending({
  userId,
  userSettings,
  reqValues,
}: CreateSpendingRequest) {
  const statistical = true;
  const name = "ПОКА БЕЗ НАЗВАНИЯ";

  const categoryId = await getCategoryIdForSpending(
    reqValues.groupId,
    reqValues.categoryId
  );

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    if (!userSettings.currencyCode) {
      throw new AppError(
        404,
        "CURRENCY_CODE_NOT_FOUND",
        "Currency code not found"
      );
    }

    const baseAmountMicro = await getBaseAmountMicro(client, reqValues.amount, {
      currencyCode: userSettings.currencyCode,
      conversionFactor: userSettings.conversionFactor,
    });

    const newSpending = await client.query<NewSpendingResult>(
      `
      INSERT INTO spendings (
        amount,
        currency_code,
        user_id,
        group_id,
        statistical,
        account_id,
        name,
        category_id,
        base_amount_micro,
        conversion_factor,
        city_id
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
        reqValues.amount.toString(),
        userSettings.currencyCode,
        userId,
        reqValues.groupId,
        statistical,
        userSettings.accountId,
        name,
        categoryId,
        baseAmountMicro,
        userSettings.conversionFactor,
        userSettings.cityId,
      ]
    );

    const updatedAccount = await changeAccountAmount(client, {
      accountId: userSettings.accountId,
      userId,
      deltaAmount: -BigInt(reqValues.amount),
    });

    await client.query("COMMIT");

    return {
      spendingId: newSpending.rows[0].id,
      accountAmount: updatedAccount.amount,
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

type GetSpendingsByGroupParams = {
  userId: string;
  groupId: string;
  limitCount: number;
  offsetCount: number;
};

export type SpendingByGroupItem = {
  id: string;
  date: string;
  time: string;
  amount: string;
  conversion_factor: number;
  currencySymbol: string;
  title?: string | null;
  category_code: string | null;
};

export type GetSpendingsByGroupResponse = {
  items: SpendingByGroupItem[];
  hasMore: boolean;
};

type GetSpendingsByGroupRow = {
  result: GetSpendingsByGroupResponse;
};

export async function getSpendingsByGroup({
  userId,
  groupId,
  limitCount,
  offsetCount,
}: GetSpendingsByGroupParams): Promise<GetSpendingsByGroupResponse> {
  try {
    const query = `
      WITH params AS (
        SELECT
          $1::uuid AS user_id,
          $2::uuid AS group_id,
          $3::int AS limit_count,
          $4::int AS offset_count
      ),

      limited_spendings AS (
        SELECT
          s.id,
          s.spending_date,
          s.amount,
          s.name,
          s.currency_code,
          c.currency_symbol,
          c.conversion_factor,
          cat.code AS category_code
        FROM public.spendings s
        JOIN params p ON true
        JOIN public.currencies c
          ON c.code = TRIM(s.currency_code)
        LEFT JOIN public.category cat
          ON cat.id = s.category_id
        WHERE s.user_id = p.user_id
          AND s.group_id = p.group_id
        ORDER BY s.spending_date DESC, s.id DESC
        LIMIT (SELECT limit_count + 1 FROM params)
        OFFSET (SELECT offset_count FROM params)
      ),

      items AS (
        SELECT *
        FROM limited_spendings
        ORDER BY spending_date DESC, id DESC
        LIMIT (SELECT limit_count FROM params)
      )

      SELECT jsonb_build_object(
        'items',
        COALESCE(
          (
            SELECT jsonb_agg(
              jsonb_build_object(
                'id', i.id::text,
                'date', TO_CHAR(i.spending_date, 'DD.MM'),
                'time', TO_CHAR(i.spending_date, 'HH24:MI'),
                'amount', REGEXP_REPLACE(
                  (i.amount::numeric / i.conversion_factor)::text,
                  '\\.?0+$',
                  ''
                ),
                'conversion_factor', i.conversion_factor,
                'currencySymbol', i.currency_symbol,
                'title', i.name,
                'category_code', i.category_code
              )
              ORDER BY i.spending_date DESC, i.id DESC
            )
            FROM items i
          ),
          '[]'::jsonb
        ),
        'hasMore',
        (
          SELECT COUNT(*) > (SELECT limit_count FROM params)
          FROM limited_spendings
        )
      ) AS result;
    `;

    const result = await pool.query<GetSpendingsByGroupRow>(query, [
      userId,
      groupId,
      limitCount,
      offsetCount,
    ]);

    return result.rows[0].result;
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
