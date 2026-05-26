import { Router } from "express";
import { getCountriesController } from "./countries.controller";

export const countriesRouter = Router();

countriesRouter.get("/", getCountriesController);
