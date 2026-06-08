import type { Request, Response, NextFunction } from "express";
import { pool } from "../db/pool";
import { AppError } from "../utils/AppError";
import {
  UserSettings,
  UserSettingsRow,
} from "../types/middlewares/userSettings.types";

function mapUserSettingsRow(row: UserSettingsRow): UserSettings {
  return {
    id: row.id,
    userId: row.user_id,
    accountId: row.account_id,

    languageCode: row.language_code,
    countryCode: row.country_code,
    cityId: row.city_id,
    timezone: row.timezone,

    visibleAccount: row.visible_account,
    visibleUserName: row.visible_user_name,
    visibleGroupSpendings: row.visible_group_spendings,
    visibleAverageGroupBill: row.visible_average_group_bill,

    lastCheckPosition: row.last_check_position,

    currencyCode: row.currency_code,
    countryName: row.country_name,
    cityName: row.city_name,
    conversionFactor: row.conversion_factor,
    currencySymbol: row.currency_symbol,
  };
}

export async function userSettingsMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return next(new AppError(401, "UNAUTHORIZED", "Unauthorized"));
    }

    const result = await pool.query<UserSettingsRow>(
      `
      SELECT *
      FROM user_settings us
      WHERE us.user_id = $1
      LIMIT 1;
      `,
      [userId]
    );

    if (result.rows.length === 0) {
      throw new AppError(
        404,
        "USER_SETTINGS_NOT_FOUND",
        "User settings not found"
      );
    }

    const userSettings = mapUserSettingsRow(result.rows[0]);

    req.userSettings = userSettings;

    next();
  } catch (error) {
    next(error);
  }
}
