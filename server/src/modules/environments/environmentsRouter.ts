import { Router } from "express";
import { checkProfileEnvironmentController } from "./environmens.controller";

export const environmentsRouter = Router();

environmentsRouter.patch("/check", checkProfileEnvironmentController);
