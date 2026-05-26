import type { NextFunction, Request, Response } from "express";
import { AppError } from "../../utils/AppError";
import { sendSuccess } from "../../utils/apiResponse";
import { getCountriesQuerySchema } from "./countries.schemas";
import { getCountries } from "./countries.service";

export async function getCountriesController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { error, value } = getCountriesQuerySchema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      throw new AppError(400, "VALIDATION_ERROR", error.message);
    }

    const countries = await getCountries(value);

    sendSuccess(res, countries);
  } catch (error) {
    next(error);
  }
}
