"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { api, ApiError } from "@/lib/api";

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

interface PhotoPickerProps {
  qrToken: string;
  onPhotoUrlChange: (url: string | null) => void;
}

function CameraIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="13" r="3.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function PhotoPicker({ qrToken, onPhotoUrlChange }: PhotoPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setError(null);
    setUploading(false);
    onPhotoUrlChange(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function handleFile(file: File) {
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Please choose a JPEG, PNG, or WebP image.");
      return;
    }
    if (file.size > MAX_SIZE) {
      setError("Image must be 5MB or smaller.");
      return;
    }

    setError(null);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    onPhotoUrlChange(null);
    setUploading(true);

    try {
      const { data } = await api.uploadPhoto(qrToken, file);
      onPhotoUrlChange(data.photo_url);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? "Couldn't upload photo — you can still continue without one."
          : "Couldn't upload photo — you can still continue without one."
      );
    } finally {
      setUploading(false);
    }
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  return (
    <div className="flex flex-col gap-2">
      <span
        className="font-body text-sm"
        style={{ color: "var(--text-secondary)", fontWeight: "var(--weight-medium)" }}
      >
        Profile photo (optional)
      </span>

      <div className="relative h-24 w-24">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full"
          style={{ background: "var(--bg-surface-alt)", color: "var(--text-tertiary)" }}
          aria-label={previewUrl ? "Change profile photo" : "Add profile photo"}
        >
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewUrl} alt="Selected profile photo" className="h-full w-full object-cover" />
          ) : (
            <CameraIcon />
          )}

          {uploading && (
            <span
              className="absolute inset-0 flex items-center justify-center"
              style={{ background: "var(--bg-overlay)" }}
            >
              <span
                className="h-6 w-6 rounded-full border-2 motion-safe:animate-spin motion-reduce:animate-none"
                style={{
                  borderColor: "var(--header-text-muted)",
                  borderTopColor: "var(--color-white)",
                }}
              />
            </span>
          )}
        </button>

        {previewUrl && !uploading && (
          <button
            type="button"
            onClick={reset}
            aria-label="Remove photo"
            className="absolute -right-1 -top-1 flex h-8 w-8 items-center justify-center rounded-full font-body text-sm"
            style={{ background: "var(--bg-brand)", color: "var(--text-on-brand)" }}
          >
            ×
          </button>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleChange}
          className="hidden"
        />
      </div>

      {error && (
        <p className="max-w-xs font-body text-sm" style={{ color: "var(--text-error)" }}>
          {error}
        </p>
      )}
    </div>
  );
}
