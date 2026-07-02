import { Router } from "express";
import {
  getAccountsController,
  createAccountController,
  changeCurrentAccountController,
  updateAccountNameController,
} from "./accounts.controller";

export const accountsRouter = Router();

accountsRouter.get("/", getAccountsController);
accountsRouter.post("/", createAccountController);
accountsRouter.patch("/change-account", changeCurrentAccountController);
accountsRouter.patch("/name", updateAccountNameController);
