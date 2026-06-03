import { Router } from "express";
import {
  changeSpendingAmountController,
  createSpendingController,
  getSpendingsByGroupController,
  renameSpendingController,
} from "./spendings.controller";

export const spendingsRouter = Router();

spendingsRouter.post("/", createSpendingController);
spendingsRouter.get("/group", getSpendingsByGroupController);
spendingsRouter.patch("/rename", renameSpendingController);
spendingsRouter.patch("/amount", changeSpendingAmountController);
