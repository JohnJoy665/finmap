import { Router } from "express";
import {
  changeIncomeAmountController,
  createAccountIncomeController,
  deleteIncomeController,
  getAccountIncomesController,
  getAccountInitializationController,
  initializeAccountController,
  renameIncomeController,
} from "./incomes.controller";

export const incomesRouter = Router();

incomesRouter.get(
  "/account-initialization",
  getAccountInitializationController
);

incomesRouter.post("/account-initialization", initializeAccountController);
incomesRouter.post("/account-income", createAccountIncomeController);
incomesRouter.get("/", getAccountIncomesController);
incomesRouter.patch("/rename", renameIncomeController);
incomesRouter.patch("/amount", changeIncomeAmountController);
incomesRouter.delete("/:incomeId", deleteIncomeController);
