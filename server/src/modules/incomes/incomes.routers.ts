import { Router } from "express";
import {
  createAccountIncomeController,
  getAccountInitializationController,
  initializeAccountController,
} from "./incomes.controller";

export const incomesRouter = Router();

incomesRouter.get(
  "/account-initialization",
  getAccountInitializationController
);

incomesRouter.post("/account-initialization", initializeAccountController);
incomesRouter.post("/account-income", createAccountIncomeController);
