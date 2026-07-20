import { pool } from "../../db/pool";
import type { CreateSpendingRequest } from "../../types/spendings/spendings.type";
import { AppError } from "../../utils/AppError";
import { changeAccountAmount } from "../accounts/accounts.service";
import {
  getBaseAmountMicro,
  getBaseAmountMicroBySpendingDate,
} from "../rates/rates.service";

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
  const name = null;

  const categoryId = await getCategoryIdForSpending(
    reqValues.groupId,
    reqValues.categoryId
  );

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const currencyCode = userSettings.currencyCode?.trim();
    const timezone = userSettings.timezone?.trim();

    if (!currencyCode) {
      throw new AppError(
        404,
        "CURRENCY_CODE_NOT_FOUND",
        "Currency code not found"
      );
    }

    if (!timezone) {
      throw new AppError(
        400,
        "TIMEZONE_REQUIRED",
        "User timezone is required to create a spending"
      );
    }

    const baseAmountMicro = await getBaseAmountMicro(client, reqValues.amount, {
      currencyCode,
      conversionFactor: userSettings.conversionFactor,
    });

    const newSpendingResult = await client.query<NewSpendingResult>(
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
          $11,
          $12
        )
        RETURNING id;
      `,
      [
        reqValues.amount.toString(),
        currencyCode,
        userId,
        reqValues.groupId,
        statistical,
        userSettings.accountId,
        name,
        categoryId,
        baseAmountMicro,
        userSettings.conversionFactor,
        userSettings.cityId,
        timezone,
      ]
    );

    const newSpending = newSpendingResult.rows[0];

    if (!newSpending) {
      throw new AppError(
        500,
        "SPENDING_CREATE_FAILED",
        "Spending was not created"
      );
    }

    const updatedAccount = await changeAccountAmount(client, {
      accountId: userSettings.accountId,
      userId,
      deltaAmount: -BigInt(reqValues.amount),
    });

    await client.query("COMMIT");

    return {
      spendingId: newSpending.id,
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
  timezone: string;
};

export type SpendingByGroupItem = {
  id: string;
  date: string;
  time: string;
  amount: string;
  conversion_factor: number;
  currencySymbol: string;
  currencyCode: string;
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
  timezone,
}: GetSpendingsByGroupParams): Promise<GetSpendingsByGroupResponse> {
  try {
    const query = `
      WITH params AS (
        SELECT
          $1::uuid AS user_id,
          $2::uuid AS group_id,
          $3::int AS limit_count,
          $4::int AS offset_count,
          COALESCE($5::text, 'UTC') AS timezone
      ),

      limited_spendings AS (
        SELECT
          s.id,
          s.spending_date,
          s.timezone,
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
                'date',
                  TO_CHAR(
                    i.spending_date AT TIME ZONE COALESCE(
                      NULLIF(BTRIM(i.timezone), ''),
                      p.timezone
                    ),
                    'DD.MM'
                  ),
                'time',
                  TO_CHAR(
                    i.spending_date AT TIME ZONE COALESCE(
                      NULLIF(BTRIM(i.timezone), ''),
                      p.timezone
                    ),
                    'HH24:MI'
                  ),
                'amount', i.amount::text,
                'conversionFactor', i.conversion_factor,
                'currencySymbol', i.currency_symbol,
                'currencyCode', i.currency_code,
                'title', i.name,
                'categoryCode', i.category_code
              )
              ORDER BY i.spending_date DESC, i.id DESC
            )
            FROM items i
            JOIN params p ON true
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
      timezone,
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

type RenameSpendingPayload = {
  userId: string;
  spendingId: string;
  currentName: string;
};

type RenameSpendingRow = {
  id: string;
  name: string;
};

export async function renameSpending({
  userId,
  spendingId,
  currentName,
}: RenameSpendingPayload) {
  try {
    const result = await pool.query<RenameSpendingRow>(
      `
      UPDATE spendings
      SET name = $1
      WHERE id = $2
        AND user_id = $3
      RETURNING
        id,
        name;
      `,
      [currentName, spendingId, userId]
    );

    const updatedSpending = result.rows[0];

    if (!updatedSpending) {
      throw new AppError(404, "SPENDING_NOT_FOUND", "Spending not found");
    }

    return {
      spendingId: updatedSpending.id,
      currentName: updatedSpending.name,
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

type ChangeSpendingAmountRequest = {
  userId: string;
  spendingId: string;
  spendingAmount: string;
};

type SpendingForChangeAmountRow = {
  id: string;
  amount: string;
  currency_code: string;
  account_id: string;
  spending_date: Date;
  conversion_factor: number | null;
};

type UpdatedAccountRow = {
  id: string;
  amount: string;
};

type UpdatedSpendingRow = {
  id: string;
  amount: string;
  base_amount_micro: string | null;
};

export async function changeSpendingAmount({
  userId,
  spendingId,
  spendingAmount,
}: ChangeSpendingAmountRequest) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const spendingResult = await client.query<SpendingForChangeAmountRow>(
      `
      SELECT
        id,
        amount::text,
        currency_code::text,
        account_id,
        spending_date,
        conversion_factor
      FROM spendings
      WHERE id = $1
        AND user_id = $2
      FOR UPDATE;
      `,
      [spendingId, userId]
    );

    const spending = spendingResult.rows[0];

    if (!spending) {
      throw new AppError(404, "SPENDING_NOT_FOUND", "Spending not found");
    }

    if (!spending.conversion_factor) {
      throw new AppError(
        400,
        "CONVERSION_FACTOR_NOT_FOUND",
        "Conversion factor not found"
      );
    }

    const oldAmount = BigInt(spending.amount);
    const newAmount = BigInt(spendingAmount);

    const deltaAmount = oldAmount - newAmount;

    const baseAmountMicro = await getBaseAmountMicroBySpendingDate(client, {
      minorAmountOriginal: spendingAmount,
      currencyCode: spending.currency_code.trim(),
      conversionFactor: spending.conversion_factor,
      spendingDate: spending.spending_date,
    });

    const updatedSpendingResult = await client.query<UpdatedSpendingRow>(
      `
      UPDATE spendings
      SET
        amount = $1,
        base_amount_micro = $2
      WHERE id = $3
        AND user_id = $4
      RETURNING
        id,
        amount::text,
        base_amount_micro::text;
      `,
      [spendingAmount, baseAmountMicro?.toString() ?? null, spendingId, userId]
    );

    const updatedAccountResult = await client.query<UpdatedAccountRow>(
      `
      UPDATE accounts
      SET
        amount = amount + $1,
        last_change_date = CURRENT_TIMESTAMP
      WHERE id = $2
        AND user_id = $3
      RETURNING
        id,
        amount::text;
      `,
      [deltaAmount.toString(), spending.account_id, userId]
    );

    const updatedAccount = updatedAccountResult.rows[0];

    if (!updatedAccount) {
      throw new AppError(404, "ACCOUNT_NOT_FOUND", "Account not found");
    }

    await client.query("COMMIT");

    const updatedSpending = updatedSpendingResult.rows[0];

    return {
      spendingId: updatedSpending.id,
      spendingAmount: updatedSpending.amount,
      baseAmountMicro: updatedSpending.base_amount_micro,
      accountId: updatedAccount.id,
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

type DeleteSpendingRequest = {
  userId: string;
  spendingId: string;
};

type SpendingForDeleteRow = {
  id: string;
  amount: string;
  account_id: string;
};

type DeleteSpendingResponse = {
  accountId: string;
  accountAmount: string;
  spendingId: string;
};

export async function deleteSpending({
  userId,
  spendingId,
}: DeleteSpendingRequest): Promise<DeleteSpendingResponse> {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const spendingResult = await client.query<SpendingForDeleteRow>(
      `
      SELECT
        id,
        amount,
        account_id
      FROM spendings
      WHERE id = $1
        AND user_id = $2
      FOR UPDATE;
      `,
      [spendingId, userId]
    );

    if (spendingResult.rows.length === 0) {
      throw new AppError(404, "SPENDING_NOT_FOUND", "Spending not found");
    }

    const spending = spendingResult.rows[0];

    const updatedAccount = await changeAccountAmount(client, {
      accountId: spending.account_id,
      userId,
      deltaAmount: BigInt(spending.amount),
    });

    const deletedSpending = await client.query<{ id: string }>(
      `
      DELETE FROM spendings
      WHERE id = $1
        AND user_id = $2
      RETURNING id;
      `,
      [spendingId, userId]
    );

    if (deletedSpending.rows.length === 0) {
      throw new AppError(404, "SPENDING_NOT_FOUND", "Spending not found");
    }

    const deletedSpendingId = deletedSpending.rows[0].id;

    await client.query("COMMIT");

    return {
      accountId: updatedAccount.id,
      accountAmount: updatedAccount.amount,
      spendingId: deletedSpendingId,
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
