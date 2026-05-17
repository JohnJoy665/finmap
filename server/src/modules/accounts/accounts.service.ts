import type { PoolClient } from "pg";
import { AppError } from "../../utils/AppError";

type changedAccountRow = {
  id: string;
  amount: string;
};

export async function changeAccountAmount(
  client: PoolClient,
  {
    accountId,
    userId,
    deltaAmount,
  }: {
    accountId: string;
    userId: string;
    deltaAmount: bigint;
  }
) {
  const result = await client.query<changedAccountRow>(
    `
      UPDATE accounts
      SET amount = amount + $1
      WHERE id = $2
        AND user_id = $3
      RETURNING id, amount;
    `,
    [deltaAmount.toString(), accountId, userId]
  );

  if (result.rows.length === 0) {
    throw new AppError(404, "ACCOUNT_NOT_FOUND", "Account not found");
  }

  return result.rows[0];
}
