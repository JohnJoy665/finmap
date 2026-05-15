import { Router } from "express";
import {
  createGroupController,
  getGroupsController,
} from "./groups.controller";

export const groupsRouter = Router();

groupsRouter.post("/", createGroupController);
groupsRouter.get("/", getGroupsController);
