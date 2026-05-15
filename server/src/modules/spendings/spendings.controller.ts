import { NextFunction, Request, Response } from "express";
import { createSpendingSchema } from "./spendings.schemas";
import { AppError } from "../../utils/AppError";
import { createSpending } from "./spendings.service";
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
