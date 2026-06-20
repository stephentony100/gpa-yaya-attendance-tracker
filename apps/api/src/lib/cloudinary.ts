import { v2 as cloudinary } from "cloudinary";
import { env } from "./env";

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Profile photos are only ever shown as small avatars (circle, tens-to-low-
// hundreds of px), so cap the stored original at 800x800 — crop:'limit' only
// downsizes oversized photos and never crops/distorts, since there's no
// cropping UI. quality/fetch_format 'auto' let Cloudinary pick the smallest
// acceptable encoding per requesting browser.
export function uploadImageBuffer(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "yaya-attendance/members",
        resource_type: "image",
        transformation: [
          { width: 800, height: 800, crop: "limit", quality: "auto", fetch_format: "auto" },
        ],
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Cloudinary upload returned no result."));
          return;
        }
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
}
