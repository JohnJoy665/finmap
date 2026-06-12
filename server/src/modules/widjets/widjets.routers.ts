import { Router } from "express";
import { getCategoryStatisticsWidgetController } from "./widjets.controller";

export const widjetsRouter = Router();

widjetsRouter.get("/category-statistics", getCategoryStatisticsWidgetController);