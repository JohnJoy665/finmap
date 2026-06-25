import { Router } from "express";
import {
  getCategoryStatisticsWidgetController,
  getGroupStatisticsWidgetController,
  getCategoryAverageWidgetController,
} from "./widjets.controller";

export const widjetsRouter = Router();

widjetsRouter.get(
  "/category-statistics",
  getCategoryStatisticsWidgetController
);
widjetsRouter.get("/group-statistics", getGroupStatisticsWidgetController);

widjetsRouter.get("/category-average", getCategoryAverageWidgetController);
