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
