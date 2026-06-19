import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { authMiddleware } from "../middleware/auth";
import { rateLimit } from "../middleware/rateLimit";
import * as adminController from "../controllers/admin.controller";

export const adminRouter = Router();

const loginRateLimit = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });

adminRouter.post("/admin/login", loginRateLimit, asyncHandler(adminController.login));

adminRouter.use(authMiddleware);

adminRouter.get("/admin/event-types", asyncHandler(adminController.listEventTypes));
adminRouter.post("/admin/event-types", asyncHandler(adminController.createEventType));

adminRouter.get("/admin/sessions", asyncHandler(adminController.listSessions));
adminRouter.post("/admin/sessions", asyncHandler(adminController.createSession));
adminRouter.get("/admin/sessions/:id/qr", asyncHandler(adminController.getSessionQr));
adminRouter.put("/admin/sessions/:id/close", asyncHandler(adminController.closeSession));

adminRouter.get("/admin/attendance", asyncHandler(adminController.listAttendance));
adminRouter.get("/admin/attendance/export", asyncHandler(adminController.exportAttendance));

adminRouter.get("/admin/members", asyncHandler(adminController.listMembers));
