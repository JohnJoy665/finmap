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

    const baseAmountMicro = await getBaseAmountMicro(
      client,
      reqValues.amount,
      userSettings
    );

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
