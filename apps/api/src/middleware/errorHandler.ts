import type { NextFunction, Request, Response } from "express";
import multer from "multer";
import { logger } from "../lib/logger";
import { HttpError } from "../lib/errors";

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof HttpError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.data !== undefined ? { data: err.data } : {}),
    });
    return;
  }

  if (err instanceof multer.MulterError) {
    const message =
      err.code === "LIMIT_FILE_SIZE"
        ? "Image must be 5MB or smaller."
        : "Could not process the uploaded file.";
    res.status(400).json({ success: false, message });
    return;
  }

  logger.error({ err, path: req.path }, "Unhandled request error");
  res.status(500).json({ success: false, message: "Internal server error" });
}
