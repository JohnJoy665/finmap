import type { NextFunction, Request, Response } from "express";
import { AppError } from "../../utils/AppError";
import { sendSuccess } from "../../utils/apiResponse";
import { getCitiesQuerySchema } from "./cities.schemas";
import { getCities } from "./cities.service";

export async function getCitiesController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { error, value } = getCitiesQuerySchema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      throw new AppError(400, "VALIDATION_ERROR", error.message);
    }

    const cities = await getCities({
      langCode: value.langCode,
      countryCode: value.countryCode,
      searchString: value.searchString,
    });

    sendSuccess(res, cities);
  } catch (error) {
    next(error);
  }
}
