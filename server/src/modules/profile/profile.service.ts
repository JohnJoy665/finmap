import { pool } from "../../db/pool";
import { AppError } from "../../utils/AppError";

type UserProfileRow = {
  id: string;
  name: string;
  email: string;
};

type AccountProfileRow = {
  id: string;
  currency_code: string;
  amount: string;
  currency_symbol: string;
  conversion_factor: string;
};

type SettingProfileRow = {
  id: string;
  account_id: string;
  language_code: string;
  country_code: string;
  country_name: string;
  city_id: number;
  city_name: string;
  visible_account: boolean;
  visible_user_name: boolean;
  visible_group_spendings: boolean;
};

export async function getUserProfile(userId: string) {
  try {
    const userResponse = await pool.query<UserProfileRow>(
      `
      SELECT 
        us.id,
        us."name",
        us.email
      FROM users us
      WHERE us.id = $1
      LIMIT 1;
      `,
      [userId]
    );

    if (userResponse.rows.length === 0) {
      throw new AppError(404, "USER_NOT_FOUND", "User not found");
    }

    const settingsResponse = await pool.query<SettingProfileRow>(
      `
      SELECT 
        uss.id,
        uss.account_id,
        uss.language_code,
        uss.country_code,
        uss.country_name,
        uss.city_id,
        uss.city_name,
        uss.visible_account,
        uss.visible_user_name,
        uss.visible_group_spendings
      FROM user_settings uss
      WHERE uss.user_id = $1
      LIMIT 1
      `,
      [userId]
    );

    const currentAccountId = settingsResponse.rows[0]?.account_id || null;
    const settings = settingsResponse.rows[0] || null;

    let accountResponse;

    if (settings && currentAccountId) {
      accountResponse = await pool.query<AccountProfileRow>(
        `
        SELECT 
          acs.id,
          acs.currency_code,
          acs.amount,
          cs.currency_symbol,
          cs.conversion_factor
        FROM accounts acs
        INNER JOIN currencies cs ON TRIM(cs.code) = TRIM(acs.currency_code)
        WHERE acs.id = $1
        AND acs.user_id = $2
        LIMIT 1
        `,
        [currentAccountId, userId]
      );
    }

    const user = userResponse?.rows[0] || null;
    const account = accountResponse?.rows[0] || null;

    const setupRequired = !settings || !settings.account_id || !account;

    return {
      user: user
        ? {
            id: user.id,
            name: user.name,
            email: user.email,
          }
        : null,

      account: account
        ? {
            id: account.id,
            currencyCode: account.currency_code.trim(),
            amount: account.amount,
            currencySymbol: account.currency_symbol,
            conversionFactor: Number(account.conversion_factor),
          }
        : null,

      settings: settings
        ? {
            id: settings.id,
            accountId: settings.account_id,
            languageCode: settings.language_code?.trim() ?? null,
            countryCode: settings.country_code?.trim() ?? null,
            countryName: settings.country_name,
            cityId: settings.city_id,
            cityName: settings.city_name,
            visibleAccount: settings.visible_account,
            visibleUserName: settings.visible_user_name,
            visibleGroupSpendings: settings.visible_group_spendings,
          }
        : null,

      setupRequired,
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

type CreateProfileRequest = {
  userId: string;
  languageCode: string;
  countryCode: string;
  countryName: string;
  cityId: number;
  cityName: string;
  currencyCode: string;
  uniqUserName: string;
};

type ExistingUserSettingsRow = {
  id: string;
};

type LanguageRow = {
  code: string;
};

type CountryRow = {
  code: string;
};

type CityRow = {
  id: number;
};

type CurrencyRow = {
  code: string;
  conversion_factor: number;
  currency_symbol: string;
};

type AccountRow = {
  id: string;
};

type UserSettingsRow = {
  id: string;
};

export type CreateProfileResponse = {
  userSettingsId: string;
};

export async function createProfile({
  userId,
  languageCode,
  countryCode,
  countryName,
  cityId,
  cityName,
  currencyCode,
  uniqUserName,
}: CreateProfileRequest): Promise<CreateProfileResponse> {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const usetResult = await client.query(
      `
        UPDATE users
        SET name = $1
        WHERE id = $2
        RETURNING id, name, email
      `,
      [uniqUserName, userId]
    );

    if (usetResult.rows.length === 0) {
      throw new AppError(404, "USER_NOT_FOUND", "User not found");
    }

    const existingSettingsResult = await client.query<ExistingUserSettingsRow>(
      `
        SELECT id
        FROM user_settings
        WHERE user_id = $1
        LIMIT 1
      `,
      [userId]
    );

    if (existingSettingsResult.rows.length > 0) {
      throw new AppError(
        409,
        "USER_SETTINGS_ALREADY_EXISTS",
        "User settings already exist"
      );
    }

    const languageResult = await client.query<LanguageRow>(
      `
        SELECT code
        FROM languages
        WHERE code = $1
        LIMIT 1
      `,
      [languageCode]
    );

    if (languageResult.rows.length === 0) {
      throw new AppError(404, "LANGUAGE_NOT_FOUND", "Language not found");
    }

    const countryResult = await client.query<CountryRow>(
      `
        SELECT code
        FROM countries
        WHERE code = $1
        LIMIT 1
      `,
      [countryCode]
    );

    if (countryResult.rows.length === 0) {
      throw new AppError(404, "COUNTRY_NOT_FOUND", "Country not found");
    }

    const cityResult = await client.query<CityRow>(
      `
        SELECT id
        FROM cities
        WHERE id = $1
          AND country_code = $2
        LIMIT 1
      `,
      [cityId, countryCode]
    );

    if (cityResult.rows.length === 0) {
      throw new AppError(
        404,
        "CITY_NOT_FOUND",
        "City not found for selected country"
      );
    }

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

    const userSettingsResult = await client.query<UserSettingsRow>(
      `
        INSERT INTO user_settings (
          user_id,
          account_id,
          language_code,
          country_code,
          city_id,
          currency_code,
          country_name,
          city_name,
          conversion_factor,
          currency_symbol,
          last_check_position
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
          NOW()
        )
        RETURNING id
      `,
      [
        userId,
        accountId,
        languageCode,
        countryCode,
        cityId,
        currencyCode,
        countryName,
        cityName,
        currency.conversion_factor,
        currency.currency_symbol,
      ]
    );

    await client.query("COMMIT");

    return {
      userSettingsId: userSettingsResult.rows[0].id,
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

type CheckUniqNameRequest = {
  userId: string;
  uniqUserName: string;
};

type CheckUniqNameRow = {
  exists: boolean;
};

type CheckUniqNameResponse = {
  uniqUserName: string;
  isAvailable: boolean;
};

export async function checkUniqName({
  userId,
  uniqUserName,
}: CheckUniqNameRequest): Promise<CheckUniqNameResponse> {
  try {
    const normalizedName = uniqUserName.trim();

    const query = `
      SELECT EXISTS (
        SELECT 1
        FROM users
        WHERE LOWER(name) = LOWER($1)
          AND id <> $2
      ) AS "exists";
    `;

    const { rows } = await pool.query<CheckUniqNameRow>(query, [
      normalizedName,
      userId,
    ]);

    const isTaken = rows[0]?.exists ?? false;

    return {
      uniqUserName: normalizedName,
      isAvailable: !isTaken,
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
