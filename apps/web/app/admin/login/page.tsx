"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { adminApi, ApiError } from "@/lib/api";
import { setAdminInfo, setAdminToken } from "@/lib/adminAuth";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const { data } = await adminApi.login(email.trim(), password);
      setAdminToken(data.token);
      setAdminInfo(data.admin);
      router.replace("/admin/sessions");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-5"
      style={{ background: "var(--bg-page)" }}
    >
      <Image
        src="/logos/rccg-yaya-crest.png"
        alt="RCCG GPA YAYA crest"
        width={152}
        height={100}
        className="mb-6"
      />
      <div
        className="w-full max-w-sm rounded-lg px-6 py-8"
        style={{
          background: "var(--card-bg)",
          border: "1px solid var(--card-border)",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <h1
          className="font-body text-xl"
          style={{ color: "var(--text-primary)", fontWeight: "var(--weight-semibold)" }}
        >
          GPA YAYA Admin
        </h1>
        <p className="mt-1 font-body text-sm" style={{ color: "var(--text-secondary)" }}>
          Sign in to manage sessions and attendance.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span
              className="font-body text-sm"
              style={{ color: "var(--text-secondary)", fontWeight: "var(--weight-medium)" }}
            >
              Email
            </span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 w-full rounded-md px-3 font-body text-base"
              style={{
                background: "var(--input-bg)",
                border: "1px solid var(--input-border)",
                color: "var(--input-text)",
              }}
              placeholder="admin@gpa-yaya.com"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span
              className="font-body text-sm"
              style={{ color: "var(--text-secondary)", fontWeight: "var(--weight-medium)" }}
            >
              Password
            </span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 w-full rounded-md px-3 font-body text-base"
              style={{
                background: "var(--input-bg)",
                border: "1px solid var(--input-border)",
                color: "var(--input-text)",
              }}
            />
          </label>

          {error && (
            <p className="font-body text-sm" style={{ color: "var(--text-error)" }}>
              {error}
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
            {submitting ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
