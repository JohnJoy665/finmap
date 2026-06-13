import { Request, Response, NextFunction } from "express";
import {
  checkUniqName,
  createProfile,
  getUserProfile,
  updateProfileTimezone,
} from "./profile.service";
import { sendSuccess } from "../../utils/apiResponse";
import {
  createProfileSchema,
  getUniqNameQuerySchema,
  updateProfileTimezoneSchema,
} from "./profile.schemas";
import { AppError } from "../../utils/AppError";

export async function getProfile(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = (req as any).user.userId;
    const profile = await getUserProfile(userId);
    return sendSuccess(res, profile);
  } catch (error) {
    next(error);
  }
}

export async function createProfileController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { error, value } = createProfileSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      throw new AppError(400, "VALIDATION_ERROR", error.message);
    }

    const userId = req.user?.userId;

    if (!userId) {
      throw new AppError(401, "UNAUTHORIZED", "Unauthorized");
    }

    const result = await createProfile({
      userId,
      ...value,
    });

    sendSuccess(res, result, "Profile settings created");
  } catch (error) {
    next(error);
  }
}

export async function getUniqNameController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { error, value } = getUniqNameQuerySchema.validate(req.query);

    if (error) {
      throw new AppError(400, "VALIDATION_ERROR", error.message);
    }

    const userId = req.user?.userId;

    if (!userId) {
      throw new AppError(401, "UNAUTHORIZED", "Unauthorized");
    }

    const result = await checkUniqName({
      userId,
      uniqUserName: value.uniqUserName,
    });

    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}

export async function updateProfileTimezoneController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { error, value } = updateProfileTimezoneSchema.validate(req.body);

    if (error) {
      throw new AppError(400, "VALIDATION_ERROR", error.message);
    }

    const userId = req.user?.userId;

    if (!userId) {
      throw new AppError(401, "UNAUTHORIZED", "Unauthorized");
    }

    const result = await updateProfileTimezone({
      userId,
      timezone: value.timezone,
    });

    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}
