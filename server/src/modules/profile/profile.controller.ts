// src/modules/profile/profile.controller.ts

import { Request, Response, NextFunction } from "express";
import { getUserProfile } from "./profile.service";

export async function getProfile(req: Request, res: Response) {
  try {
    const userId = (req as any).user.userId;

    const profile = await getUserProfile(userId);

    res.json(profile);
  } catch (error) {
    res.status(404).json({
      message: error instanceof Error ? error.message : "profile not found",
    });
  }
}
