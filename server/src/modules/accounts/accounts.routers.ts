import { Router } from "express";
import {
  getAccountsController,
  createAccountController,
  changeCurrentAccountController,
} from "./accounts.controller";

export const accountsRouter = Router();

accountsRouter.get("/", getAccountsController);
accountsRouter.post("/", createAccountController);
accountsRouter.patch("/change-account", changeCurrentAccountController); //
