import { Router } from "express";
import {
  createGroupController,
  deleteGroupController,
  getGroupsController,
  getGroupsFiltersController,
  renameGroupController,
} from "./groups.controller";

export const groupsRouter = Router();

groupsRouter.post("/", createGroupController);
groupsRouter.get("/", getGroupsController);
groupsRouter.delete("/:groupId", deleteGroupController);
groupsRouter.get("/filters", getGroupsFiltersController);
groupsRouter.patch("/rename", renameGroupController);
