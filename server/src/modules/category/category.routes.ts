import { Router } from "express";
import { categoriesController } from "./category.controller";

export const categoriesRouter = Router();

categoriesRouter.get("/", categoriesController);
