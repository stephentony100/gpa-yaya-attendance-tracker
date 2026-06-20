"use client";

import { useState, type CSSProperties, type FormEvent, type ReactNode } from "react";
import { adminApi, ApiError } from "@/lib/api";

const fieldStyle: CSSProperties = {
  background: "var(--input-bg)",
  border: "1px solid var(--input-border)",
  color: "var(--input-text)",
};

function isApiError(err: unknown): err is ApiError {
  return err instanceof ApiError;
}

export default function AdminSettingsPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function validate(): Record<string, string> {
    const errors: Record<string, string> = {};
    if (!currentPassword) errors.current_password = "Enter your current password.";
    if (!newPassword) {
      errors.new_password = "Enter a new password.";
    } else if (newPassword.length < 8) {
      errors.new_password = "New password must be at least 8 characters.";
    }
    if (confirmPassword !== newPassword) {
      errors.confirm_password = "Passwords don't match.";
    }
    return errors;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setSuccess(false);

    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setSubmitting(true);

    try {
      await adminApi.changePassword(currentPassword, newPassword);
      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      if (isApiError(err) && err.statusCode === 400 && err.data?.fieldErrors) {
        setFieldErrors(err.data.fieldErrors);
      } else {
        setFormError(isApiError(err) ? err.message : "Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1
          className="font-body text-xl"
          style={{ color: "var(--text-primary)", fontWeight: "var(--weight-semibold)" }}
        >
          Settings
        </h1>
        <p className="mt-1 font-body text-sm" style={{ color: "var(--text-secondary)" }}>
          Manage your admin account.
        </p>
      </div>

      <section
        className="max-w-md rounded-lg p-5"
        style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}
      >
        <h2
          className="font-body text-lg"
          style={{ color: "var(--text-primary)", fontWeight: "var(--weight-medium)" }}
        >
          Change password
        </h2>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          <Field label="Current password" error={fieldErrors.current_password}>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="h-11 w-full rounded-md px-3 font-body text-base"
              style={fieldStyle}
            />
          </Field>

          <Field label="New password" error={fieldErrors.new_password}>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="h-11 w-full rounded-md px-3 font-body text-base"
              style={fieldStyle}
            />
          </Field>

          <Field label="Confirm new password" error={fieldErrors.confirm_password}>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="h-11 w-full rounded-md px-3 font-body text-base"
              style={fieldStyle}
            />
          </Field>

          {formError && (
            <p className="font-body text-sm" style={{ color: "var(--text-error)" }}>
              {formError}
            </p>
          )}

          {success && (
            <p className="font-body text-sm" style={{ color: "var(--text-success)" }}>
              Password updated.
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 h-11 w-full rounded-md font-body text-base disabled:opacity-60"
            style={{
              background: "var(--btn-brand-bg)",
              color: "var(--btn-brand-text)",
              fontWeight: "var(--weight-semibold)",
            }}
          >
            {submitting ? "Updating..." : "Update password"}
          </button>
        </form>
      </section>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span
        className="font-body text-sm"
        style={{ color: "var(--text-secondary)", fontWeight: "var(--weight-medium)" }}
      >
        {label}
      </span>
      {children}
      {error && (
        <span className="font-body text-sm" style={{ color: "var(--text-error)" }}>
          {error}
        </span>
      )}
    </label>
  );
}
