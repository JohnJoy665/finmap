import type { NextFunction, Request, Response } from "express";

import { AppError } from "../../utils/AppError";
import { getStatisticsWidgetQuerySchema } from "./widjets.schemas";
import {
  getCategoryStatisticsWidget,
  getGroupStatisticsWidget,
} from "./widjets.service";
import { sendSuccess } from "../../utils/apiResponse";

export async function getCategoryStatisticsWidgetController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { error, value } = getStatisticsWidgetQuerySchema.validate(
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
    const userSettings = req.userSettings;

    if (!userId || !userSettings) {
      throw new AppError(401, "UNAUTHORIZED", "Unauthorized");
    }

    const data = await getCategoryStatisticsWidget({
      userId,
      userSettings,
      dateFromUTC: value.dateFromUTC,
      dateToUTC: value.dateToUTC,
    });

    sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
}

export async function getGroupStatisticsWidgetController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { error, value } = getStatisticsWidgetQuerySchema.validate(
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
    const userSettings = req.userSettings;

    if (!userId || !userSettings) {
      throw new AppError(401, "UNAUTHORIZED", "Unauthorized");
    }

    const data = await getGroupStatisticsWidget({
      userId,
      userSettings,
      dateFromUTC: value.dateFromUTC,
      dateToUTC: value.dateToUTC,
    });

    sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
}
