import type { NextFunction, Request, Response } from "express";
import { registerSchema, loginSchema } from "./auth.schemas";
import { registerUser, loginUser } from "./auth.service";
import { AppError } from "../../utils/AppError";
import { sendSuccess } from "../../utils/apiResponse";

export async function registerController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { error, value } = registerSchema.validate(req.body);

  if (error) {
    throw new AppError(400, "VALIDATION_ERROR", error.message);
  }

  try {
    const user = await registerUser(value);
    return sendSuccess(res, user);
  } catch (error) {
    next(error);
  }
}

export async function loginController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { error, value } = loginSchema.validate(req.body);

  if (error) {
    throw new AppError(400, "VALIDATION_ERROR", error.message);
  }

  try {
    const user = await loginUser(value);
    return sendSuccess(res, user);
  } catch (error) {
    next(error);
  }
}
