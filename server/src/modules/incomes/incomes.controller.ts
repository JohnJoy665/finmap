import type { NextFunction, Request, Response } from "express";

import { AppError } from "../../utils/AppError";
import { sendSuccess } from "../../utils/apiResponse";
import {
  createAccountIncomeSchema,
  getAccountInitializationQuerySchema,
  initializeAccountSchema,
} from "./incomes.schemas";
import {
  createAccountIncome,
  getAccountInitialization,
  initializeAccount,
} from "./incomes.service";

export async function getAccountInitializationController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { error, value } = getAccountInitializationQuerySchema.validate(
      req.query,
      {
        abortEarly: false,
        stripUnknown: true,
      }
    );

    if (error) {
      throw new AppError(400, "VALIDATION_ERROR", error.message);
    }

    const userId = req.user?.userId;

    if (!userId) {
      throw new AppError(401, "UNAUTHORIZED", "Unauthorized");
    }

    const result = await getAccountInitialization({
      userId,
      accountId: value.accountId,
    });

    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

export async function initializeAccountController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { error, value } = initializeAccountSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      throw new AppError(400, "VALIDATION_ERROR", error.message);
    }

    const userId = req.user?.userId;
    const cityId = req.userSettings?.cityId;

    if (!userId || !cityId) {
      throw new AppError(401, "UNAUTHORIZED", "Unauthorized");
    }

    const data = await initializeAccount({
      userId,
      cityId,
      accountId: value.accountId,
      amount: value.amount,
    });

    sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
}

export async function createAccountIncomeController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { error, value } = createAccountIncomeSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      throw new AppError(400, "VALIDATION_ERROR", error.message);
    }

    const userId = req.user?.userId;
    const userSettings = req.userSettings;

    if (!userId || !userSettings) {
      throw new AppError(401, "UNAUTHORIZED", "Unauthorized");
    }

    if (!userSettings.cityId) {
      throw new AppError(400, "CITY_NOT_FOUND", "User city is not defined");
    }

    const data = await createAccountIncome({
      userId,
      cityId: userSettings.cityId,
      timezone: userSettings.timezone ?? "UTC",
      accountId: value.accountId,
      amount: value.amount,
      name: value.name,
      date: value.date,
    });

    sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
}
