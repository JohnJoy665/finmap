import type { Request, Response } from "express";
import { meService } from "./user.service";

export async function meController(req:Request, res:Response) {
    try {
        const userId = (req as any).user.userId;
        const user = await meService(userId);
        res.json({user});

      } catch (err) {
        res.status(404).json({
          message: err instanceof Error ? err.message : "User not found",
        });
      }
}