"use client";

import { useEffect, useState, type CSSProperties, type FormEvent } from "react";
import { adminApi, ApiError } from "@/lib/api";
import type { EventType } from "@/types/admin";
import { Spinner } from "@/components/Spinner";

const fieldStyle: CSSProperties = {
  background: "var(--input-bg)",
  border: "1px solid var(--input-border)",
  color: "var(--input-text)",
};

function isApiError(err: unknown): err is ApiError {
  return err instanceof ApiError;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
}

export default function AdminEventTypesPage() {
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrencePattern, setRecurrencePattern] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setListError(null);
    try {
      const { data } = await adminApi.listEventTypes();
      setEventTypes(data);
    } catch (err) {
      setListError(isApiError(err) ? err.message : "Could not load event types.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    setCreateError(null);
    try {
      await adminApi.createEventType({
        name: name.trim(),
        is_recurring: isRecurring,
        recurrence_pattern: isRecurring ? recurrencePattern.trim() || null : null,
      });
      setName("");
      setIsRecurring(false);
      setRecurrencePattern("");
      load();
    } catch (err) {
      setCreateError(isApiError(err) ? err.message : "Could not create event type.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1
          className="font-body text-xl"
          style={{ color: "var(--text-primary)", fontWeight: "var(--weight-semibold)" }}
        >
          Event types
        </h1>
        <p className="mt-1 font-body text-sm" style={{ color: "var(--text-secondary)" }}>
          Event types are reused across sessions, e.g. &quot;Sunday Service&quot; or &quot;Midweek Bible Study&quot;.
        </p>
      </div>

      <section
        className="rounded-lg p-5"
        style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}
      >
        <h2
          className="font-body text-lg"
          style={{ color: "var(--text-primary)", fontWeight: "var(--weight-medium)" }}
        >
          Add event type
        </h2>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-wrap items-end gap-3">
          <label className="flex min-w-[200px] flex-col gap-1.5">
            <span
              className="font-body text-xs"
              style={{ color: "var(--text-secondary)", fontWeight: "var(--weight-medium)" }}
            >
              Name
            </span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sunday Service"
              className="h-10 w-full rounded-md px-3 font-body text-base"
              style={fieldStyle}
            />
          </label>

          <label className="flex items-center gap-2 pb-2">
            <input
              type="checkbox"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="h-4 w-4"
            />
            <span className="font-body text-sm" style={{ color: "var(--text-secondary)" }}>
              Is recurring
            </span>
          </label>

          <label className="flex min-w-[200px] flex-col gap-1.5">
            <span
              className="font-body text-xs"
              style={{ color: "var(--text-secondary)", fontWeight: "var(--weight-medium)" }}
            >
              Recurrence pattern
            </span>
            <input
              type="text"
              value={recurrencePattern}
              onChange={(e) => setRecurrencePattern(e.target.value)}
              disabled={!isRecurring}
              placeholder="e.g. weekly:sunday"
              className="h-10 w-full rounded-md px-3 font-body text-base disabled:opacity-50"
              style={fieldStyle}
            />
          </label>

          <button
            type="submit"
            disabled={creating || !name.trim()}
            className="h-10 rounded-md px-4 font-body text-base disabled:opacity-60"
            style={{
              background: "var(--btn-brand-bg)",
              color: "var(--btn-brand-text)",
              fontWeight: "var(--weight-semibold)",
            }}
          >
            {creating ? "Adding..." : "Add event type"}
          </button>
        </form>

        {createError && (
          <p className="mt-3 font-body text-sm" style={{ color: "var(--text-error)" }}>
            {createError}
          </p>
        )}
      </section>

      <section
        className="rounded-lg"
        style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}
      >
        {loading ? (
          <div className="flex justify-center py-10">
            <Spinner label="Loading event types..." />
          </div>
        ) : listError ? (
          <p className="px-5 py-8 text-center font-body text-sm" style={{ color: "var(--text-error)" }}>
            {listError}
          </p>
        ) : eventTypes.length === 0 ? (
          <p className="px-5 py-8 text-center font-body text-sm" style={{ color: "var(--text-secondary)" }}>
            No event types yet — add one above to get started.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--table-border)" }}>
                  {["Name", "Recurring", "Pattern", "Created"].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left font-body text-sm"
                      style={{ color: "var(--table-header-text)", fontWeight: "var(--weight-medium)" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {eventTypes.map((et) => (
                  <tr key={et.id} style={{ borderBottom: "1px solid var(--table-border)" }}>
                    <td className="px-4 py-3 font-body text-base" style={{ color: "var(--text-primary)" }}>
                      {et.name}
                    </td>
                    <td className="px-4 py-3 font-body text-base" style={{ color: "var(--text-secondary)" }}>
                      {et.is_recurring ? "Yes" : "No"}
                    </td>
                    <td className="px-4 py-3 font-body text-base" style={{ color: "var(--text-secondary)" }}>
                      {et.recurrence_pattern ?? "—"}
                    </td>
                    <td className="px-4 py-3 font-body text-base" style={{ color: "var(--text-secondary)" }}>
                      {formatDate(et.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
