import { pool } from "../../db/pool";
import { AppError } from "../../utils/AppError";
import {
  getBaseAmountMicro,
  getBaseAmountMicroByIncomeDate,
} from "../rates/rates.service";

type GetAccountInitializationRequest = {
  userId: string;
  accountId: string;
};

type AccountInitializationRow = {
  account_id: string;
  is_initialized: boolean;
};

export type AccountInitializationResponse = {
  accountId: string;
  isInitialized: boolean;
};

export async function getAccountInitialization({
  userId,
  accountId,
}: GetAccountInitializationRequest): Promise<AccountInitializationResponse> {
  try {
    const result = await pool.query<AccountInitializationRow>(
      `
        SELECT
          a.id AS account_id,
          EXISTS (
            SELECT 1
            FROM incomes i
            WHERE i.account_id = a.id
              AND i.user_id = $1
              AND i.is_initial = true
          ) AS is_initialized
        FROM accounts a
        WHERE a.id = $2
          AND a.user_id = $1
        LIMIT 1
      `,
      [userId, accountId]
    );

    const account = result.rows[0];

    if (!account) {
      throw new AppError(404, "ACCOUNT_NOT_FOUND", "Account not found");
    }

    return {
      accountId: account.account_id,
      isInitialized: account.is_initialized,
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

type AccountRow = {
  id: string;
  amount: string;
  currency_code: string;
  conversion_factor: number;
};

type InitializeAccountRequest = {
  userId: string;
  cityId: number;
  accountId: string;
  amount: string;
};

type InitializeAccountResponse = {
  accountId: string;
  amount: string;
  isInitialized: true;
};

export async function initializeAccount({
  userId,
  cityId,
  accountId,
  amount,
}: InitializeAccountRequest): Promise<InitializeAccountResponse> {
  const enteredAmount = BigInt(amount);

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const accountResult = await client.query<AccountRow>(
      `
      SELECT
        a.id,
        a.amount,
        a.currency_code,
        c.conversion_factor
      FROM accounts a
      JOIN currencies c
        ON c.code = a.currency_code
      WHERE a.id = $1
        AND a.user_id = $2
      FOR UPDATE OF a
      `,
      [accountId, userId]
    );

    const account = accountResult.rows[0];

    if (!account) {
      throw new AppError(404, "ACCOUNT_NOT_FOUND", "Account not found");
    }

    const initializationResult = await client.query<{ id: string }>(
      `
      SELECT id
      FROM incomes
      WHERE account_id = $1
        AND user_id = $2
        AND is_initial = true
      LIMIT 1
      `,
      [accountId, userId]
    );

    if (initializationResult.rows.length > 0) {
      throw new AppError(
        409,
        "ACCOUNT_ALREADY_INITIALIZED",
        "Account is already initialized"
      );
    }

    const currentAmount = BigInt(account.amount);
    const incomeAmount = enteredAmount - currentAmount;

    const currencyCode = account.currency_code.trim();

    const baseAmountMicro = await getBaseAmountMicro(
      client,
      incomeAmount.toString(),
      {
        currencyCode,
        conversionFactor: account.conversion_factor,
      }
    );

    await client.query(
      `
      INSERT INTO incomes (
        amount,
        user_id,
        account_id,
        statistical,
        currency_code,
        conversion_factor,
        city_id,
        base_amount_micro,
        is_initial,
        is_adjustment
      )
      VALUES ($1, $2, $3, false, $4, $5, $6, $7, true, false)
      `,
      [
        incomeAmount.toString(),
        userId,
        accountId,
        currencyCode,
        account.conversion_factor,
        cityId,
        baseAmountMicro,
      ]
    );

    await client.query(
      `
      UPDATE accounts
      SET 
        amount = $1,
        last_change_date = CURRENT_TIMESTAMP
      WHERE id = $2
        AND user_id = $3
      `,
      [enteredAmount.toString(), accountId, userId]
    );

    await client.query("COMMIT");

    return {
      accountId,
      amount: enteredAmount.toString(),
      isInitialized: true,
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

type CreateAccountIncomeRequest = {
  userId: string;
  cityId: number;
  timezone: string;
  accountId: string;
  amount: string;
  name: string | null;
  date: string;
};

type AccountForIncomeRow = {
  id: string;
  amount: string;
  currency_code: string;
  currency_symbol: string;
  conversion_factor: number;
};

type CreatedIncomeRow = {
  id: string;
  account_id: string;
  name: string | null;
  amount: string;
  date: string;
  time: string;
  currency_code: string;
  currency_symbol: string;
  conversion_factor: number;
};

type CreateAccountIncomeResponse = {
  account: {
    accountId: string;
    amount: string;
  };
  income: {
    id: string;
    accountId: string;
    name: string | null;
    amount: string;
    date: string;
    time: string;
    currencyCode: string;
    currencySymbol: string;
    conversionFactor: number;
  };
};

export async function createAccountIncome({
  userId,
  cityId,
  timezone,
  accountId,
  amount,
  name,
  date,
}: CreateAccountIncomeRequest): Promise<CreateAccountIncomeResponse> {
  const incomeAmount = BigInt(amount);

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const dateValidationResult = await client.query<{ is_valid: boolean }>(
      `
      SELECT
        (
          $1::timestamp >= date_trunc('day', CURRENT_TIMESTAMP AT TIME ZONE $2) - INTERVAL '7 days'
          AND $1::timestamp <= CURRENT_TIMESTAMP AT TIME ZONE $2
        ) AS is_valid
      `,
      [date, timezone]
    );

    const isDateValid = dateValidationResult.rows[0]?.is_valid;

    if (!isDateValid) {
      throw new AppError(
        400,
        "INVALID_INCOME_DATE",
        "Income date must be between now and 7 days ago"
      );
    }

    const accountResult = await client.query<AccountForIncomeRow>(
      `
      SELECT
        a.id,
        a.amount::text,
        TRIM(a.currency_code) AS currency_code,
        c.currency_symbol,
        c.conversion_factor
      FROM accounts a
      JOIN currencies c
        ON c.code = TRIM(a.currency_code)
      WHERE a.id = $1
        AND a.user_id = $2
      FOR UPDATE OF a
      `,
      [accountId, userId]
    );

    const account = accountResult.rows[0];

    if (!account) {
      throw new AppError(404, "ACCOUNT_NOT_FOUND", "Account not found");
    }

    const baseAmountMicro = await getBaseAmountMicro(
      client,
      incomeAmount.toString(),
      {
        currencyCode: account.currency_code,
        conversionFactor: account.conversion_factor,
      }
    );

    const updatedAccountAmount = BigInt(account.amount) + incomeAmount;

    const incomeResult = await client.query<CreatedIncomeRow>(
      `
      INSERT INTO incomes (
        amount,
        user_id,
        account_id,
        name,
        date,
        statistical,
        currency_code,
        conversion_factor,
        city_id,
        base_amount_micro,
        completed,
        confirmed,
        is_initial,
        is_adjustment
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5::timestamp,
        true,
        $6,
        $7,
        $8,
        $9,
        true,
        true,
        false,
        false
      )
      RETURNING
        id::text,
        account_id::text,
        name,
        amount::text,
        TO_CHAR(date AT TIME ZONE $10, 'DD.MM') AS date,
        TO_CHAR(date AT TIME ZONE $10, 'HH24:MI') AS time,
        TRIM(currency_code) AS currency_code,
        $11::text AS currency_symbol,
        conversion_factor
      `,
      [
        incomeAmount.toString(),
        userId,
        accountId,
        name,
        date,
        account.currency_code,
        account.conversion_factor,
        cityId,
        baseAmountMicro,
        timezone,
        account.currency_symbol,
      ]
    );

    const income = incomeResult.rows[0];

    await client.query(
      `
      UPDATE accounts
      SET
        amount = $1,
        last_change_date = CURRENT_TIMESTAMP
      WHERE id = $2
        AND user_id = $3
      `,
      [updatedAccountAmount.toString(), accountId, userId]
    );

    await client.query("COMMIT");

    return {
      account: {
        accountId,
        amount: updatedAccountAmount.toString(),
      },
      income: {
        id: income.id,
        accountId: income.account_id,
        name: income.name,
        amount: income.amount,
        date: income.date,
        time: income.time,
        currencyCode: income.currency_code,
        currencySymbol: income.currency_symbol,
        conversionFactor: income.conversion_factor,
      },
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

type GetAccountIncomesParams = {
  userId: string;
  accountId: string;
  limitCount: number;
  offsetCount: number;
  timezone: string | null;
};

export type IncomeItem = {
  id: string;
  date: string;
  time: string;
  amount: string;
  conversionFactor: number;
  currencySymbol: string;
  name: string | null;
  currencyCode: string;
};

export type GetAccountIncomesResponse = {
  items: IncomeItem[];
  hasMore: boolean;
};

type GetAccountIncomesRow = {
  result: GetAccountIncomesResponse;
};

export async function getAccountIncomes({
  userId,
  accountId,
  limitCount,
  offsetCount,
  timezone,
}: GetAccountIncomesParams): Promise<GetAccountIncomesResponse> {
  try {
    const query = `
      WITH params AS (
        SELECT
          $1::uuid AS user_id,
          $2::uuid AS account_id,
          $3::int AS limit_count,
          $4::int AS offset_count,
          COALESCE($5::text, 'UTC') AS timezone
      ),

      limited_incomes AS (
        SELECT
          i.id,
          i.date,
          i.amount,
          i.name,
          i.currency_code,
          c.currency_symbol,
          c.conversion_factor
        FROM public.incomes i
        JOIN params p ON true
        JOIN public.currencies c
          ON c.code = TRIM(i.currency_code)
        WHERE i.user_id = p.user_id
          AND i.account_id = p.account_id
          AND i.is_initial = false
          AND i.is_adjustment = false
          AND i.statistical = true
        ORDER BY i.date DESC, i.id DESC
        LIMIT (SELECT limit_count + 1 FROM params)
        OFFSET (SELECT offset_count FROM params)
      ),

      items AS (
        SELECT *
        FROM limited_incomes
        ORDER BY date DESC, id DESC
        LIMIT (SELECT limit_count FROM params)
      )

      SELECT jsonb_build_object(
        'items',
        COALESCE(
          (
            SELECT jsonb_agg(
              jsonb_build_object(
                'id', i.id::text,
                'date', TO_CHAR(i.date AT TIME ZONE p.timezone, 'DD.MM'),
                'time', TO_CHAR(i.date AT TIME ZONE p.timezone, 'HH24:MI'),
                'amount', i.amount::text,
                'conversionFactor', i.conversion_factor,
                'currencySymbol', i.currency_symbol,
                'name', i.name,
                'currencyCode', i.currency_code
              )
              ORDER BY i.date DESC, i.id DESC
            )
            FROM items i
            JOIN params p ON true
          ),
          '[]'::jsonb
        ),
        'hasMore',
        (
          SELECT COUNT(*) > (SELECT limit_count FROM params)
          FROM limited_incomes
        )
      ) AS result;
    `;

    const result = await pool.query<GetAccountIncomesRow>(query, [
      userId,
      accountId,
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

type RenameIncomePayload = {
  userId: string;
  incomeId: string;
  newName: string;
};

type RenameIncomeRow = {
  id: string;
  name: string | null;
};

export async function renameIncome({
  userId,
  incomeId,
  newName,
}: RenameIncomePayload) {
  try {
    const normalizedName = newName.trim() === "" ? null : newName.trim();

    const result = await pool.query<RenameIncomeRow>(
      `
      UPDATE incomes
      SET name = $1
      WHERE id = $2
        AND user_id = $3
      RETURNING
        id,
        name;
      `,
      [normalizedName, incomeId, userId]
    );

    const updatedIncome = result.rows[0];

    if (!updatedIncome) {
      throw new AppError(404, "INCOME_NOT_FOUND", "Income not found");
    }

    return {
      incomeId: updatedIncome.id,
      currentName: updatedIncome.name,
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

type ChangeIncomeAmountRequest = {
  userId: string;
  incomeId: string;
  incomeAmount: string;
};

type IncomeForChangeAmountRow = {
  id: string;
  amount: string;
  currency_code: string;
  account_id: string;
  date: Date;
  conversion_factor: number | null;
};

type UpdatedAccountRow = {
  id: string;
  amount: string;
};

type UpdatedIncomeRow = {
  id: string;
  amount: string;
};

export async function changeIncomeAmount({
  userId,
  incomeId,
  incomeAmount,
}: ChangeIncomeAmountRequest) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const incomeResult = await client.query<IncomeForChangeAmountRow>(
      `
      SELECT
        id,
        amount::text,
        currency_code::text,
        account_id,
        "date",
        conversion_factor
      FROM incomes
      WHERE id = $1
        AND user_id = $2
      FOR UPDATE;
      `,
      [incomeId, userId]
    );

    const income = incomeResult.rows[0];

    if (!income) {
      throw new AppError(404, "INCOME_NOT_FOUND", "Income not found");
    }

    if (!income.conversion_factor) {
      throw new AppError(
        400,
        "CONVERSION_FACTOR_NOT_FOUND",
        "Conversion factor not found"
      );
    }

    const oldAmount = BigInt(income.amount);
    const newAmount = BigInt(incomeAmount);

    const deltaAmount = newAmount - oldAmount;

    const baseAmountMicro = await getBaseAmountMicroByIncomeDate(client, {
      minorAmountOriginal: incomeAmount,
      currencyCode: income.currency_code.trim(),
      conversionFactor: income.conversion_factor,
      incomeDate: income.date,
    });

    const updatedIncomeResult = await client.query<UpdatedIncomeRow>(
      `
      UPDATE incomes
      SET
        amount = $1,
        base_amount_micro = $2
      WHERE id = $3
        AND user_id = $4
      RETURNING
        id,
        amount::text;
      `,
      [incomeAmount, baseAmountMicro?.toString() ?? null, incomeId, userId]
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
      [deltaAmount.toString(), income.account_id, userId]
    );

    const updatedAccount = updatedAccountResult.rows[0];

    if (!updatedAccount) {
      throw new AppError(404, "ACCOUNT_NOT_FOUND", "Account not found");
    }

    await client.query("COMMIT");

    const updatedIncome = updatedIncomeResult.rows[0];

    return {
      incomeId: updatedIncome.id,
      incomeAmount: updatedIncome.amount,
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
