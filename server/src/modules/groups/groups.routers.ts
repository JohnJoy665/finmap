import { Router } from "express";
import { createGroupController } from "./groups.controller";

export const groupsRouter = Router();

groupsRouter.post("/", createGroupController);
