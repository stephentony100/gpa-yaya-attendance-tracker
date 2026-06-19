import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import * as memberController from "../controllers/member.controller";

export const membersRouter = Router();

membersRouter.get("/members/lookup", asyncHandler(memberController.lookupByPhone));
membersRouter.post("/members/:id/link-device", asyncHandler(memberController.linkDevice));
