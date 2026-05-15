import { Router } from "express";
import { meController } from "./user.controller";

export const userRouter = Router();

userRouter.get("/", meController);
