import type { NextFunction, Request, Response } from "express";
import { meService } from "./user.service";
import { sendSuccess } from "../../utils/apiResponse";

export async function meController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = (req as any).user.userId;
    const user = await meService(userId);
    return sendSuccess(res, user);
  } catch (error) {
    next(error);
  }
}
