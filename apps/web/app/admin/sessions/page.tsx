"use client";

import { useEffect, useState, type CSSProperties, type FormEvent } from "react";
import { adminApi, ApiError } from "@/lib/api";
import type { AdminSession, EventType, SessionStatus } from "@/types/admin";
import { Spinner } from "@/components/Spinner";
import { FilterBar, FilterField } from "@/components/admin/FilterBar";
import { QrModal } from "@/components/admin/QrModal";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

const fieldStyle: CSSProperties = {
  background: "var(--input-bg)",
  border: "1px solid var(--input-border)",
  color: "var(--input-text)",
};

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function SessionStatusBadge({ status }: { status: SessionStatus }) {
  const config: Record<SessionStatus, { bg: string; text: string; label: string }> = {
    active: { bg: "var(--bg-success)", text: "var(--text-success)", label: "Active" },
    expired: { bg: "var(--bg-surface-alt)", text: "var(--text-tertiary)", label: "Expired" },
    closed: { bg: "var(--bg-error)", text: "var(--text-error)", label: "Closed" },
  };
  const c = config[status];
  return (
    <span
      className="inline-flex items-center rounded-sm px-2.5 py-1 font-body text-xs"
      style={{
        background: c.bg,
        color: c.text,
        fontWeight: "var(--weight-semibold)",
        letterSpacing: "var(--tracking-wide)",
        textTransform: "uppercase",
      }}
    >
      {c.label}
    </span>
  );
}

function isApiError(err: unknown): err is ApiError {
  return err instanceof ApiError;
}

export default function AdminSessionsPage() {
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [eventTypesLoading, setEventTypesLoading] = useState(true);
  const [eventTypesError, setEventTypesError] = useState<string | null>(null);
  const [sessions, setSessions] = useState<AdminSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const [filterEventTypeId, setFilterEventTypeId] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");

  const [formEventTypeId, setFormEventTypeId] = useState("");
  const [formDate, setFormDate] = useState(todayIso());
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [qrModal, setQrModal] = useState<{
    id: string;
    qrUrl: string;
    eventTypeName: string;
    date: string;
  } | null>(null);
  const [closeTarget, setCloseTarget] = useState<AdminSession | null>(null);
  const [closing, setClosing] = useState(false);
  const [closeError, setCloseError] = useState<string | null>(null);

  async function loadEventTypes() {
    setEventTypesLoading(true);
    setEventTypesError(null);
    try {
      const { data } = await adminApi.listEventTypes();
      setEventTypes(data);
      if (!formEventTypeId && data.length > 0) {
        setFormEventTypeId(data[0].id);
      }
    } catch (err) {
      setEventTypesError(isApiError(err) ? err.message : "Could not load event types.");
    } finally {
      setEventTypesLoading(false);
    }
  }

  async function loadSessions() {
    setLoading(true);
    setListError(null);
    try {
      const { data } = await adminApi.listSessions({
        event_type_id: filterEventTypeId || undefined,
        date_from: filterDateFrom || undefined,
        date_to: filterDateTo || undefined,
      });
      setSessions(data);
    } catch (err) {
      setListError(isApiError(err) ? err.message : "Could not load sessions.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEventTypes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterEventTypeId, filterDateFrom, filterDateTo]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!formEventTypeId || !formDate) return;
    setCreating(true);
    setCreateError(null);
    try {
      const { data } = await adminApi.createSession({
        event_type_id: formEventTypeId,
        date: formDate,
      });
      setQrModal({
        id: data.id,
        qrUrl: data.qr_url,
        eventTypeName: data.event_type_name,
        date: data.date,
      });
      setFormDate(todayIso());
      loadSessions();
    } catch (err) {
      setCreateError(isApiError(err) ? err.message : "Could not create session.");
    } finally {
      setCreating(false);
    }
  }

  function handleViewQr(session: AdminSession) {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    setQrModal({
      id: session.id,
      qrUrl: `${origin}/checkin/${session.qr_token}`,
      eventTypeName: session.event_type_name,
      date: session.date,
    });
  }

  async function handleConfirmClose() {
    if (!closeTarget) return;
    setClosing(true);
    setCloseError(null);
    try {
      await adminApi.closeSession(closeTarget.id);
      setCloseTarget(null);
      loadSessions();
    } catch (err) {
      setCloseError(isApiError(err) ? err.message : "Could not close session.");
    } finally {
      setClosing(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1
          className="font-body text-xl"
          style={{ color: "var(--text-primary)", fontWeight: "var(--weight-semibold)" }}
        >
          Sessions
        </h1>
        <p className="mt-1 font-body text-sm" style={{ color: "var(--text-secondary)" }}>
          Create a session, generate its QR code, and manage existing sessions.
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
          Create session
        </h2>

        {eventTypesLoading ? (
          <div className="mt-4 flex justify-center py-4">
            <Spinner label="Loading event types..." />
          </div>
        ) : eventTypesError ? (
          <p className="mt-3 font-body text-sm" style={{ color: "var(--text-error)" }}>
            {eventTypesError}
          </p>
        ) : eventTypes.length === 0 ? (
          <p className="mt-3 font-body text-sm" style={{ color: "var(--text-secondary)" }}>
            No event types yet — create one on the Event Types tab first.
          </p>
        ) : (
          <form onSubmit={handleCreate} className="mt-4 flex flex-wrap items-end gap-3">
            <FilterField label="Event type">
              <select
                value={formEventTypeId}
                onChange={(e) => setFormEventTypeId(e.target.value)}
                className="h-10 min-w-[180px] rounded-md px-3 font-body text-base"
                style={fieldStyle}
              >
                {eventTypes.map((et) => (
                  <option key={et.id} value={et.id}>
                    {et.name}
                  </option>
                ))}
              </select>
            </FilterField>

            <FilterField label="Date">
              <input
                type="date"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                className="h-10 rounded-md px-3 font-body text-base"
                style={fieldStyle}
              />
            </FilterField>

            <button
              type="submit"
              disabled={creating}
              className="h-10 rounded-md px-4 font-body text-base disabled:opacity-60"
              style={{
                background: "var(--btn-brand-bg)",
                color: "var(--btn-brand-text)",
                fontWeight: "var(--weight-semibold)",
              }}
            >
              {creating ? "Creating..." : "Create session"}
            </button>
          </form>
        )}

        {createError && (
          <p className="mt-3 font-body text-sm" style={{ color: "var(--text-error)" }}>
            {createError}
          </p>
        )}
      </section>

      <FilterBar
        onClear={() => {
          setFilterEventTypeId("");
          setFilterDateFrom("");
          setFilterDateTo("");
        }}
      >
        <FilterField label="Event type">
          <select
            value={filterEventTypeId}
            onChange={(e) => setFilterEventTypeId(e.target.value)}
            className="h-10 min-w-[180px] rounded-md px-3 font-body text-base"
            style={fieldStyle}
          >
            <option value="">All event types</option>
            {eventTypes.map((et) => (
              <option key={et.id} value={et.id}>
                {et.name}
              </option>
            ))}
          </select>
        </FilterField>

        <FilterField label="From">
          <input
            type="date"
            value={filterDateFrom}
            onChange={(e) => setFilterDateFrom(e.target.value)}
            className="h-10 rounded-md px-3 font-body text-base"
            style={fieldStyle}
          />
        </FilterField>

        <FilterField label="To">
          <input
            type="date"
            value={filterDateTo}
            onChange={(e) => setFilterDateTo(e.target.value)}
            className="h-10 rounded-md px-3 font-body text-base"
            style={fieldStyle}
          />
        </FilterField>
      </FilterBar>

      <section
        className="rounded-lg"
        style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}
      >
        {loading ? (
          <div className="flex justify-center py-10">
            <Spinner label="Loading sessions..." />
          </div>
        ) : listError ? (
          <p className="px-5 py-8 text-center font-body text-sm" style={{ color: "var(--text-error)" }}>
            {listError}
          </p>
        ) : sessions.length === 0 ? (
          <p className="px-5 py-8 text-center font-body text-sm" style={{ color: "var(--text-secondary)" }}>
            No sessions yet — create one above to get started.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--table-border)" }}>
                  {["Event", "Date", "Status", "Attendance", "Created by", ""].map((h) => (
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
                {sessions.map((session) => (
                  <tr
                    key={session.id}
                    className="transition-colors"
                    style={{ borderBottom: "1px solid var(--table-border)" }}
                  >
                    <td className="px-4 py-3 font-body text-base" style={{ color: "var(--text-primary)" }}>
                      {session.event_type_name}
                    </td>
                    <td className="px-4 py-3 font-body text-base" style={{ color: "var(--text-secondary)" }}>
                      {formatDate(session.date)}
                    </td>
                    <td className="px-4 py-3">
                      <SessionStatusBadge status={session.status} />
                    </td>
                    <td className="px-4 py-3 font-body text-base" style={{ color: "var(--text-secondary)" }}>
                      {session.attendance_count}
                    </td>
                    <td className="px-4 py-3 font-body text-base" style={{ color: "var(--text-secondary)" }}>
                      {session.created_by_name}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleViewQr(session)}
                          className="h-9 rounded-md px-3 font-body text-sm"
                          style={{
                            background: "var(--btn-secondary-bg)",
                            border: "1px solid var(--btn-secondary-border)",
                            color: "var(--btn-secondary-text)",
                          }}
                        >
                          View QR
                        </button>
                        {session.status === "active" && (
                          <button
                            type="button"
                            onClick={() => setCloseTarget(session)}
                            className="h-9 rounded-md px-3 font-body text-sm"
                            style={{
                              background: "var(--btn-secondary-bg)",
                              border: "1px solid var(--border-error)",
                              color: "var(--text-error)",
                            }}
                          >
                            Close session
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {qrModal && (
        <QrModal
          sessionId={qrModal.id}
          qrUrl={qrModal.qrUrl}
          eventTypeName={qrModal.eventTypeName}
          date={qrModal.date}
          onClose={() => setQrModal(null)}
        />
      )}

      {closeTarget && (
        <ConfirmDialog
          title="Close this session?"
          message={`This will immediately invalidate the QR code for "${closeTarget.event_type_name}" on ${formatDate(closeTarget.date)}. Members will no longer be able to mark attendance.`}
          confirmLabel="Close session"
          busy={closing}
          danger
          error={closeError}
          onConfirm={handleConfirmClose}
          onCancel={() => {
            setCloseTarget(null);
            setCloseError(null);
          }}
        />
      )}
    </div>
  );
}
