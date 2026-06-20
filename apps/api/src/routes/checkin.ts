import { Router } from "express";
import multer from "multer";
import { asyncHandler } from "../middleware/asyncHandler";
import { HttpError } from "../lib/errors";
import * as checkinController from "../controllers/checkin.controller";

export const checkinRouter = Router();

const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_PHOTO_TYPES.includes(file.mimetype)) {
      cb(new HttpError(400, "Only JPEG, PNG, and WebP images are allowed."));
      return;
    }
    cb(null, true);
  },
});

checkinRouter.get("/checkin/:qr_token", asyncHandler(checkinController.getCheckin));
checkinRouter.post("/checkin/:qr_token/register", asyncHandler(checkinController.register));
checkinRouter.post(
  "/checkin/:qr_token/upload-photo",
  upload.single("photo"),
  asyncHandler(checkinController.uploadPhoto)
);
checkinRouter.post("/checkin/:qr_token/mark", asyncHandler(checkinController.mark));
