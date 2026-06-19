import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import * as checkinController from "../controllers/checkin.controller";

export const checkinRouter = Router();

checkinRouter.get("/checkin/:qr_token", asyncHandler(checkinController.getCheckin));
checkinRouter.post("/checkin/:qr_token/register", asyncHandler(checkinController.register));
checkinRouter.post("/checkin/:qr_token/mark", asyncHandler(checkinController.mark));
