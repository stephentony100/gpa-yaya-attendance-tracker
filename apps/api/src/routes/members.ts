import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { rateLimit } from "../middleware/rateLimit";
import * as memberController from "../controllers/member.controller";

export const membersRouter = Router();

// These two endpoints recover an account from a phone number alone (per the
// recovery-flow spec) — rate limit aggressively since they're a brute-force
// and enumeration target.
const recoveryRateLimit = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });

membersRouter.get(
  "/members/lookup",
  recoveryRateLimit,
  asyncHandler(memberController.lookupByPhone)
);
membersRouter.post(
  "/members/:id/link-device",
  recoveryRateLimit,
  asyncHandler(memberController.linkDevice)
);
