import { NextFunction, Request, Response } from "express";
import { AppError } from "../../utils/AppError";
import { sendSuccess } from "../../utils/apiResponse";
import { getGeoPositionQuerySchema } from "./geoPosition.schemas";
import { getGeoPosition } from "./geoPosition.service";

export async function getGeoPositionController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { error, value } = getGeoPositionQuerySchema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });

    if (error) {
      throw new AppError(400, "VALIDATION_ERROR", error.message);
    }

    const result = await getGeoPosition(value);

    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
}
