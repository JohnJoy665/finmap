import type { PoolClient } from "pg";
import { AppError } from "../../utils/AppError";
import { pool } from "../../db/pool";
import { getBaseAmountMicro } from "../rates/rates.service";
import { assertAccountInitialized } from "../../utils/assertAccountInitialized";

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

type GetAccountsRequest = {
  userId: string;
};

export type Account = {
  id: string;
  currencyCode: string;
  amount: string;
  currencySymbol: string;
  conversionFactor: number;
  name: string;
};

type AccountRow = {
  id: string;
  currency_code: string;
  amount: string;
  currency_symbol: string;
  conversion_factor: number;
  name: string;
};

export async function getAccounts({
  userId,
}: GetAccountsRequest): Promise<Account[]> {
  try {
    const result = await pool.query<AccountRow>(
      `
      SELECT
        a.id AS id,
        a.currency_code,
        a.amount AS amount,
        c.currency_symbol,
        c.conversion_factor,
        a.name
      FROM accounts a
      INNER JOIN currencies c
        ON c.code = a.currency_code
      WHERE a.user_id = $1
      ORDER BY a.create_date ASC;
      `,
      [userId]
    );

    return result.rows.map((row) => ({
      id: row.id,
      currencyCode: row.currency_code,
      amount: row.amount,
      currencySymbol: row.currency_symbol,
      conversionFactor: row.conversion_factor,
      name: row.name,
    }));
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

type CreateAccountRequest = {
  userId: string;
  currencyCode: string;
  accountAmount: string;
  cityId: number;
};

type CurrencyRow = {
  code: string;
  conversion_factor: number;
  currency_symbol: string;
};

type CreateAccountResponse = {
  id: string;
  currencyCode: string;
  amount: string;
  currencySymbol: string;
  conversionFactor: number;
};

export async function createAccount({
  userId,
  currencyCode,
  accountAmount,
  cityId,
}: CreateAccountRequest): Promise<CreateAccountResponse> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const currencyResult = await client.query<CurrencyRow>(
      `
        SELECT 
          code,
          conversion_factor,
          currency_symbol
        FROM currencies
        WHERE code = $1
        LIMIT 1
      `,
      [currencyCode]
    );

    if (currencyResult.rows.length === 0) {
      throw new AppError(404, "CURRENCY_NOT_FOUND", "Currency not found");
    }

    const currency = currencyResult.rows[0];

    type IncomeAmountRow = {
      amount: string;
    };

    let initialAccountAmount = 0;

    const accountResult = await client.query<AccountRow>(
      `
        INSERT INTO accounts (
          currency_code,
          user_id,
          amount
        )
        VALUES ($1, $2, 0)
        RETURNING id
      `,
      [currencyCode, userId]
    );

    const accountId = accountResult.rows[0].id;

    const normalizedAccountAmount = accountAmount.trim();

    if (normalizedAccountAmount !== "" && normalizedAccountAmount !== "0") {
      const incomeAmount = Math.round(
        Number(normalizedAccountAmount) * currency.conversion_factor
      );

      const baseAmountMicro = await getBaseAmountMicro(
        client,
        String(incomeAmount),
        {
          currencyCode,
          conversionFactor: currency.conversion_factor,
        }
      );

      const incomeResult = await client.query<IncomeAmountRow>(
        `
          INSERT INTO incomes (
            amount,
            user_id,
            account_id,
            currency_code,
            conversion_factor,
            city_id,
            base_amount_micro,
            is_initial
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, true)
          RETURNING amount
        `,
        [
          incomeAmount,
          userId,
          accountId,
          currencyCode,
          currency.conversion_factor,
          cityId,
          baseAmountMicro,
        ]
      );

      initialAccountAmount = Number(incomeResult.rows[0].amount);

      await client.query(
        `
          UPDATE accounts
          SET amount = $1
          WHERE id = $2
        `,
        [initialAccountAmount, accountId]
      );
    }
    await client.query("COMMIT");

    return {
      id: accountId,
      currencyCode: currencyCode,
      amount: String(initialAccountAmount),
      currencySymbol: currency.currency_symbol,
      conversionFactor: currency.conversion_factor,
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

type ChangeCurrentAccountParams = {
  userId: string;
  accountId: string;
};

type AccountRowResult = {
  id: string;
  currency_code: string;
  amount: string;
  currency_symbol: string;
  conversion_factor: number;
  name: string | null;
};

type AccountResponse = {
  id: string;
  currencyCode: string;
  amount: string;
  currencySymbol: string;
  conversionFactor: number;
  name: string | null;
};

export async function changeCurrentAccount({
  //
  userId,
  accountId,
}: ChangeCurrentAccountParams): Promise<AccountResponse> {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const accountResult = await client.query<AccountRowResult>(
      `
      SELECT 
        a.id,
        a.currency_code,
        a.amount::text AS amount,
        c.currency_symbol,
        c.conversion_factor,
        a.name
      FROM public.accounts a
      JOIN public.currencies c
        ON c.code = a.currency_code
      WHERE a.id = $1
        AND a.user_id = $2
      LIMIT 1;
      `,
      [accountId, userId]
    );

    const account = accountResult.rows[0];

    if (!account) {
      throw new AppError(404, "ACCOUNT_NOT_FOUND", "Account not found");
    }

    const updateResult = await client.query(
      `
      UPDATE public.user_settings
      SET 
        account_id = $1,
        currency_code = $2,
        currency_symbol = $3,
        conversion_factor = $4
      WHERE user_id = $5
      RETURNING id;
      `,
      [
        account.id,
        account.currency_code,
        account.currency_symbol,
        account.conversion_factor,
        userId,
      ]
    );

    if (updateResult.rowCount === 0) {
      throw new AppError(
        404,
        "USER_SETTINGS_NOT_FOUND",
        "User settings not found"
      );
    }

    await client.query("COMMIT");

    return {
      id: account.id,
      currencyCode: account.currency_code.trim(),
      amount: account.amount,
      currencySymbol: account.currency_symbol,
      conversionFactor: account.conversion_factor,
      name: account.name,
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

type UpdateAccountNameRequest = {
  userId: string;
  accountId: string;
  name: string;
};

type UpdateAccountNameRow = {
  account_id: string;
  name: string;
};

type UpdateAccountNameResponse = {
  accountId: string;
  name: string;
};

export async function updateAccountName({
  userId,
  accountId,
  name,
}: UpdateAccountNameRequest): Promise<UpdateAccountNameResponse> {
  try {
    const result = await pool.query<UpdateAccountNameRow>(
      `
      UPDATE accounts
      SET
        name = $1,
        last_change_date = CURRENT_TIMESTAMP
      WHERE id = $2
        AND user_id = $3
      RETURNING
        id AS account_id,
        name
      `,
      [name, accountId, userId]
    );

    const account = result.rows[0];

    if (!account) {
      throw new AppError(404, "ACCOUNT_NOT_FOUND", "Account not found");
    }

    return {
      accountId: account.account_id,
      name: account.name,
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

type CorrectAccountAmountRequest = {
  userId: string;
  accountId: string;
  amount: string;
};

type AccountForCorrectionRow = {
  id: string;
  amount: string;
  currency_code: string;
};

type CorrectAccountAmountResponse = {
  accountId: string;
  accountAmount: string;
};

export async function correctAccountAmount({
  userId,
  accountId,
  amount,
}: CorrectAccountAmountRequest): Promise<CorrectAccountAmountResponse> {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const accountResult = await client.query<AccountForCorrectionRow>(
      `
        SELECT
          id,
          amount::text,
          currency_code::text
        FROM accounts
        WHERE id = $1
          AND user_id = $2
        FOR UPDATE
      `,
      [accountId, userId]
    );

    const account = accountResult.rows[0];

    if (!account) {
      throw new AppError(404, "ACCOUNT_NOT_FOUND", "Account not found");
    }

    await assertAccountInitialized({ client, accountId, userId });

    const oldAmount = BigInt(account.amount);
    const newAmount = BigInt(amount);
    const correctionAmount = newAmount - oldAmount;

    if (correctionAmount === 0n) {
      throw new AppError(
        400,
        "ACCOUNT_AMOUNT_NOT_CHANGED",
        "Account amount was not changed"
      );
    }

    await client.query(
      `
        UPDATE accounts
        SET
          amount = $1,
          last_change_date = NOW()
        WHERE id = $2
          AND user_id = $3
      `,
      [amount, accountId, userId]
    );

    await client.query(
      `
        INSERT INTO incomes (
          amount,
          user_id,
          account_id,
          statistical,
          date,
          currency_code,
          completed,
          confirmed,
          base_amount_micro,
          conversion_factor,
          city_id,
          is_initial,
          is_adjustment,
          name
        )
        VALUES (
          $1,
          $2,
          $3,
          false,
          NOW(),
          $4,
          true,
          true,
          null,
          null,
          null,
          false,
          true,
          $5
        )
      `,
      [
        correctionAmount.toString(),
        userId,
        accountId,
        account.currency_code,
        "Correct account",
      ]
    );

    await client.query("COMMIT");

    return {
      accountId,
      accountAmount: amount,
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
