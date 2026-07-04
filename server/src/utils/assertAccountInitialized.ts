// server/src/modules/accounts/accounts.helpers.ts

import type { PoolClient } from "pg";
import { AppError } from "./AppError";

export async function assertAccountInitialized({
  client,
  accountId,
  userId,
}: {
  client: PoolClient;
  accountId: string;
  userId: string;
}) {
  const initializationResult = await client.query<{ is_initialized: boolean }>(
    `
    SELECT EXISTS (
      SELECT 1
      FROM incomes
      WHERE account_id = $1
        AND user_id = $2
        AND is_initial = true
    ) AS is_initialized
    `,
    [accountId, userId]
  );

  const isInitialized = initializationResult.rows[0]?.is_initialized;

  if (!isInitialized) {
    throw new AppError(
      400,
      "ACCOUNT_NOT_INITIALIZED",
      "Account is not initialized"
    );
  }
}
