import { Request, Response, NextFunction } from "express";
import { checkProfileEnvironmentSchema } from "./environments.schemas";
import { checkProfileEnvironment } from "./environments.service";
import { AppError } from "../../utils/AppError";
import { sendSuccess } from "../../utils/apiResponse";

export async function checkProfileEnvironmentController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { error, value } = checkProfileEnvironmentSchema.validate(req.body);

    if (error) {
      throw new AppError(400, "VALIDATION_ERROR", error.message);
    }

    const userId = req.user?.userId;
    const userSettings = req.userSettings;

    if (!userId || !userSettings) {
      throw new AppError(401, "UNAUTHORIZED", "Unauthorized");
    }

    const result = await checkProfileEnvironment({
      userId,
      userSettings,
      reqValues: value,
    });

    return sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}
