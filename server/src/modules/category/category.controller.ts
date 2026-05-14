import { Request, Response, NextFunction } from "express";
import { sendSuccess } from "../../utils/apiResponse";
import { getCategory } from "./category.service";

export async function categoriesController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const categories = await getCategory();
    return sendSuccess(res, categories);
  } catch (error) {
    next(error);
  }
}
