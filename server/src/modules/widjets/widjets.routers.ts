import { Router } from "express";
import {
  getCategoryStatisticsWidgetController,
  getGroupStatisticsWidgetController,
} from "./widjets.controller";

export const widjetsRouter = Router();

widjetsRouter.get(
  "/category-statistics",
  getCategoryStatisticsWidgetController
);
widjetsRouter.get("/group-statistics", getGroupStatisticsWidgetController);
