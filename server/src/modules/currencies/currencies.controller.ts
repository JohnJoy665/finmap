import { NextFunction, Request, Response } from "express";
import { AppError } from "../../utils/AppError";
import { sendSuccess } from "../../utils/apiResponse";
import { getCurrenciesQuerySchema } from "./currencies.schemas";
import { getCurrencies } from "./currencies.service";

export async function getCurrenciesController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { error, value } = getCurrenciesQuerySchema.validate(req.query);

    if (error) {
      throw new AppError(400, "VALIDATION_ERROR", error.message);
    }

    const currencies = await getCurrencies(value);

    sendSuccess(res, currencies);
  } catch (error) {
    next(error);
  }
}
