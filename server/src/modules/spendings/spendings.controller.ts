import { NextFunction, Request, Response } from "express";
import {
  changeSpendingAmountSchema,
  createSpendingSchema,
  getSpendingsByGroupQuerySchema,
  renameSpendingSchema,
} from "./spendings.schemas";
import { AppError } from "../../utils/AppError";
import {
  changeSpendingAmount,
  createSpending,
  getSpendingsByGroup,
  renameSpending,
} from "./spendings.service";
import { sendSuccess } from "../../utils/apiResponse";

export async function createSpendingController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { error, value } = createSpendingSchema.validate(req.body);

    if (error) {
      throw new AppError(400, "VALIDATION_ERROR", error.message);
    }

    const userId = req.user?.userId;
    const userSettings = req.userSettings;

    if (!userId || !userSettings) {
      throw new AppError(401, "UNAUTHORIZED", "Unauthorized");
    }

    const newSpending = await createSpending({
      userId,
      userSettings,
      reqValues: value,
    });

    return sendSuccess(res, newSpending, "Трата создана успешно");
  } catch (error) {
    next(error);
  }
}

export async function getSpendingsByGroupController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { error, value } = getSpendingsByGroupQuerySchema.validate(req.query);

    if (error) {
      throw new AppError(400, "VALIDATION_ERROR", error.message);
    }

    const userId = req.user?.userId;

    if (!userId) {
      throw new AppError(401, "UNAUTHORIZED", "Unauthorized");
    }

    const result = await getSpendingsByGroup({
      userId,
      groupId: value.groupId,
      limitCount: value.limitCount,
      offsetCount: value.offsetCount,
    });

    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

export async function renameSpendingController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { error, value } = renameSpendingSchema.validate(req.body);

    if (error) {
      throw new AppError(400, "VALIDATION_ERROR", error.message);
    }

    const userId = req.user?.userId;

    if (!userId) {
      throw new AppError(401, "UNAUTHORIZED", "Unauthorized");
    }

    const updatedSpending = await renameSpending({
      userId,
      spendingId: value.spendingId,
      currentName: value.currentName,
    });

    sendSuccess(res, updatedSpending, "Spending renamed successfully");
  } catch (error) {
    next(error);
  }
}

export async function changeSpendingAmountController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { error, value } = changeSpendingAmountSchema.validate(req.body);

    if (error) {
      throw new AppError(400, "VALIDATION_ERROR", error.message);
    }

    const userId = req.user?.userId;

    if (!userId) {
      throw new AppError(401, "UNAUTHORIZED", "Unauthorized");
    }

    const result = await changeSpendingAmount({
      userId,
      spendingId: value.spendingId,
      spendingAmount: value.spendingAmount,
    });

    sendSuccess(res, result, "Spending amount changed successfully");
  } catch (error) {
    next(error);
  }
}
