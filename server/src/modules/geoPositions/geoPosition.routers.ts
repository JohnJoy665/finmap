import { Router } from "express";
import { getGeoPositionController } from "./geoPosition.controller";

export const geoPositionRouter = Router();

geoPositionRouter.get("/", getGeoPositionController);
