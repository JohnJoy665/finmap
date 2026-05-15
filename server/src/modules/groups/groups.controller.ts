// src/modules/profile/profile.controller.ts

import { Request, Response, NextFunction } from "express";
import { createGroup, getGroups } from "./groups.service";
import { sendSuccess } from "../../utils/apiResponse";
import { createGroupSchema } from "./groups.schemas";
import { AppError } from "../../utils/AppError";

export async function createGroupController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { error, value } = createGroupSchema.validate(req.body);

    if (error) {
      throw new AppError(400, "VALIDATION_ERROR", error.message);
    }

    const userId = (req as any).user.userId;
    const createdGroup = await createGroup({ userId, ...value });
    return sendSuccess(res, createdGroup, "Группа создана");
  } catch (error) {
    next(error);
  }
}

export async function getGroupsController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = (req as any).user.userId;
    const groups = await getGroups(userId);
    return sendSuccess(res, groups);
  } catch (error) {
    next(error);
  }
}
