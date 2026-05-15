import { Router } from "express";
import { createSpendingController } from "./spendings.controller";

export const spendingsRouter = Router();

spendingsRouter.post("/", createSpendingController);
