import { Router } from "express";
import {
  createProfileController,
  getProfile,
  getUniqNameController,
  updateProfileTimezoneController,
} from "./profile.controller";

export const profileRouter = Router();

profileRouter.get("/", getProfile);
profileRouter.post("/", createProfileController);
profileRouter.get("/uniqname", getUniqNameController);
profileRouter.patch("/timezone", updateProfileTimezoneController);
