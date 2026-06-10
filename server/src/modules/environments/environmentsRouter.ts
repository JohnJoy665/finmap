import { Router } from "express";
import {
  changeProfileLocationController,
  checkProfileEnvironmentController,
} from "./environmens.controller";

export const environmentsRouter = Router();

environmentsRouter.patch("/check", checkProfileEnvironmentController);
environmentsRouter.patch("/location", changeProfileLocationController);
