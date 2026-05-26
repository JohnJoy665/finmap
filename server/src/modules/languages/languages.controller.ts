import { Request, Response, NextFunction } from "express";
import { sendSuccess } from "../../utils/apiResponse";
import { getLanguages } from "./languages.service";

export async function getLanguagesController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const languages = await getLanguages();
    return sendSuccess(res, languages);
  } catch (error) {
    next(error);
  }
}
