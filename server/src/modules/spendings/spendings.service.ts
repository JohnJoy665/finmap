import { pool } from "../../db/pool";
import type { CreateSpendingRequest } from "../../types/spendings/spendings.type";
import { AppError } from "../../utils/AppError";
import { changeAccountAmount } from "../accounts/accounts.service";

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

  const factoredAmount =
    BigInt(reqValues.amount) * BigInt(userSettings.conversionFactor);

  const categoryId = await getCategoryIdForSpending(
    reqValues.groupId,
    reqValues.categoryId
  );

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

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
        category_id
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8
      )
      RETURNING id;
      `,
      [
        factoredAmount.toString(),
        userSettings.currencyCode,
        userId,
        reqValues.groupId,
        statistical,
        userSettings.accountId,
        name,
        categoryId,
      ]
    );

    const updatedAccount = await changeAccountAmount(client, {
      accountId: userSettings.accountId,
      userId,
      deltaAmount: -factoredAmount,
    });

    await client.query("COMMIT");

    return {
      spendingId: newSpending.rows[0].id,
      accountAmount:
        Number(updatedAccount.amount) / Number(userSettings.conversionFactor),
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
