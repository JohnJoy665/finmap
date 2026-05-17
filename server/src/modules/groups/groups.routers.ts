import { Router } from "express";
import {
  createGroupController,
  deleteGroupController,
  getGroupsController,
} from "./groups.controller";

export const groupsRouter = Router();

groupsRouter.post("/", createGroupController);
groupsRouter.get("/", getGroupsController);
groupsRouter.delete("/:groupId", deleteGroupController);
