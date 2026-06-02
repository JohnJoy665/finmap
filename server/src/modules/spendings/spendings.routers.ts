import { Router } from "express";
import {
  createSpendingController,
  getSpendingsByGroupController,
} from "./spendings.controller";

export const spendingsRouter = Router();

spendingsRouter.post("/", createSpendingController);
spendingsRouter.get("/group", getSpendingsByGroupController);
