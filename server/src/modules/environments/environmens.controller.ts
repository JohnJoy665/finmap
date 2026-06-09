import { Request, Response, NextFunction } from "express";
import {
  changeProfileLocationSchema,
  checkProfileEnvironmentSchema,
} from "./environments.schemas";
import {
  changeProfileLocation,
  checkProfileEnvironment,
} from "./environments.service";
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

export async function changeProfileLocationController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { error, value } = changeProfileLocationSchema.validate(req.body);

    if (error) {
      throw new AppError(400, "VALIDATION_ERROR", error.message);
    }

    const userId = req.user?.userId;
    const languageCode = req.userSettings?.languageCode;

    if (!userId || !languageCode) {
      throw new AppError(401, "UNAUTHORIZED", "Unauthorized");
    }

    const result = await changeProfileLocation({
      userId,
      languageCode,
      locationValues: value,
    });

    return sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}
