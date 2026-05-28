import { Router } from "express";
import { getCitiesController } from "./cities.controller";

export const citiesRouter = Router();

citiesRouter.get("/", getCitiesController);
