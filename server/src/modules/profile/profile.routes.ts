import { Router } from "express";
import {
  createProfileController,
  getProfile,
  getUniqNameController,
} from "./profile.controller";

export const profileRouter = Router();

profileRouter.get("/", getProfile);
profileRouter.post("/", createProfileController);
profileRouter.get("/uniqname", getUniqNameController);
