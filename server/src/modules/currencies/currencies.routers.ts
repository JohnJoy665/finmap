import { Router } from "express";
import { getCurrenciesController } from "./currencies.controller";

export const currenciesRouter = Router();

currenciesRouter.get("/", getCurrenciesController);
