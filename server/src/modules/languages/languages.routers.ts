import { Router } from "express";
import { getLanguagesController } from "./languages.controller";

export const languagesRouter = Router();

languagesRouter.get("/", getLanguagesController);
