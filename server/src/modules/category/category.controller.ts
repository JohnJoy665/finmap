import { Request, Response, NextFunction } from "express";
import { sendSuccess } from "../../utils/apiResponse";
import { getCategory } from "./category.service";
import { AppError } from "../../utils/AppError";

export async function categoriesController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userSettings = req.userSettings;

    if (!userSettings) {
      throw new AppError(
        404,
        "USER_SETTINGS_NOT_FOUND",
        "User settings not found"
      );
    }

    const categories = await getCategory(userSettings);
    return sendSuccess(res, categories);
  } catch (error) {
    next(error);
  }
}
