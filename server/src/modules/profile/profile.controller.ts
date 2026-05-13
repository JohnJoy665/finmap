// src/modules/profile/profile.controller.ts

import { Request, Response, NextFunction } from "express";
import { getUserProfile } from "./profile.service";
import { sendSuccess } from "../../utils/apiResponse";

export async function getProfile(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = (req as any).user.userId;
    const profile = await getUserProfile(userId);
    return sendSuccess(res, profile);
  } catch (error) {
    next(error);
  }
}
