"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { SessionHeader } from "@/components/SessionHeader";

export default function ManualCheckinEntryPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = code.trim();
    if (!trimmed) {
      setError("Enter a code to continue.");
      return;
    }
    router.push(`/checkin/${encodeURIComponent(trimmed)}`);
  }

  return (
    <div className="min-h-screen pb-12">
      <SessionHeader />

      <div className="mx-auto flex max-w-md flex-col gap-5 px-5 pt-6">
        <div>
          <h1
            className="font-body text-lg"
            style={{ color: "var(--text-primary)", fontWeight: "var(--weight-medium)" }}
          >
            Enter your check-in code
          </h1>
          <p className="mt-1 font-body text-sm" style={{ color: "var(--text-secondary)" }}>
            Type the short code shown on the screen or flyer — you don&apos;t need the full link.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1.5">
            <span
              className="font-body text-sm"
              style={{ color: "var(--text-secondary)", fontWeight: "var(--weight-medium)" }}
            >
              Check-in code
            </span>
            <input
              type="text"
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setError(null);
              }}
              placeholder="e.g. c1PHsiUXz3H9"
              autoCapitalize="none"
              autoCorrect="off"
              autoComplete="off"
              className="h-14 w-full rounded-md px-4 text-center font-mono text-lg"
              style={{
                background: "var(--input-bg)",
                border: `1px solid ${error ? "var(--input-border-error)" : "var(--input-border)"}`,
                color: "var(--input-text)",
                letterSpacing: "var(--tracking-wide)",
              }}
            />
            {error && (
              <span className="font-body text-sm" style={{ color: "var(--text-error)" }}>
                {error}
              </span>
            )}
          </label>

          <button
            type="submit"
            className="mt-2 h-12 w-full rounded-md font-body text-base"
            style={{
              background: "var(--btn-primary-bg)",
              color: "var(--btn-primary-text)",
              fontWeight: "var(--weight-semibold)",
            }}
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
}
