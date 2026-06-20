"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { adminApi, ApiError } from "@/lib/api";
import { DEPARTMENTS } from "@/types/checkin";
import type { AdminSession, AttendanceRecord, EventType } from "@/types/admin";
import { StatCard } from "@/components/admin/StatCard";
import { FilterBar, FilterField } from "@/components/admin/FilterBar";
import { DataTable, type DataTableColumn } from "@/components/admin/DataTable";

const fieldStyle: CSSProperties = {
  background: "var(--input-bg)",
  border: "1px solid var(--input-border)",
  color: "var(--input-text)",
};

const LIMIT = 25;

function isApiError(err: unknown): err is ApiError {
  return err instanceof ApiError;
}

function startOfMonthIso(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function statCardValue(count: number | null, loading: boolean, error: boolean): string | number {
  if (loading) return "…";
  if (error || count === null) return "Unavailable";
  return count;
}

function DepartmentTags({ departments }: { departments: string[] }) {
  return (
    <div className="flex flex-wrap gap-1">
      {departments.map((d) => (
        <span
          key={d}
          className="inline-flex items-center rounded-full px-2 py-0.5 font-body text-xs"
          style={{ background: "var(--tag-bg)", border: "1px solid var(--tag-border)", color: "var(--tag-text)" }}
        >
          {d}
        </span>
      ))}
    </div>
  );
}

export default function AdminAttendancePage() {
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [sessions, setSessions] = useState<AdminSession[]>([]);

  const [filterEventTypeId, setFilterEventTypeId] = useState("");
  const [filterSessionId, setFilterSessionId] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [page, setPage] = useState(1);

  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const [todayCount, setTodayCount] = useState<number | null>(null);
  const [monthCount, setMonthCount] = useState<number | null>(null);
  const [memberCount, setMemberCount] = useState<number | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(false);

  useEffect(() => {
    adminApi.listEventTypes().then(({ data }) => setEventTypes(data)).catch(() => {});
  }, []);

  useEffect(() => {
    adminApi
      .listSessions(filterEventTypeId ? { event_type_id: filterEventTypeId } : {})
      .then(({ data }) => setSessions(data))
      .catch(() => {});
  }, [filterEventTypeId]);

  useEffect(() => {
    const today = todayIso();
    setStatsLoading(true);
    setStatsError(false);

    Promise.all([
      adminApi
        .listAttendance({ date_from: today, date_to: today, page: 1, limit: 1 })
        .then(({ data }) => setTodayCount(data.total)),
      adminApi
        .listAttendance({ date_from: startOfMonthIso(), date_to: today, page: 1, limit: 1 })
        .then(({ data }) => setMonthCount(data.total)),
      adminApi.listMembers().then(({ data }) => setMemberCount(data.length)),
    ])
      .catch(() => setStatsError(true))
      .finally(() => setStatsLoading(false));
  }, []);

  const filters = {
    event_type_id: filterEventTypeId || undefined,
    session_id: filterSessionId || undefined,
    department: filterDepartment || undefined,
    date_from: filterDateFrom || undefined,
    date_to: filterDateTo || undefined,
  };

  useEffect(() => {
    setLoading(true);
    setListError(null);
    adminApi
      .listAttendance({ ...filters, page, limit: LIMIT })
      .then(({ data }) => {
        setRecords(data.records);
        setTotal(data.total);
      })
      .catch((err) => {
        setListError(isApiError(err) ? err.message : "Could not load attendance records.");
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterEventTypeId, filterSessionId, filterDepartment, filterDateFrom, filterDateTo, page]);

  function updateFilter(setter: (value: string) => void) {
    return (value: string) => {
      setter(value);
      setPage(1);
    };
  }

  async function handleExport() {
    setExporting(true);
    setExportError(null);
    try {
      const { blob, filename } = await adminApi.exportAttendance(filters);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setExportError(isApiError(err) ? err.message : "Could not export CSV.");
    } finally {
      setExporting(false);
    }
  }

  const columns: DataTableColumn<AttendanceRecord>[] = [
    { key: "member_name", header: "Member name", render: (r) => r.member_name },
    { key: "departments", header: "Department(s)", render: (r) => <DepartmentTags departments={r.departments} /> },
    { key: "event", header: "Event", render: (r) => r.event },
    {
      key: "marked_at",
      header: "Time marked",
      render: (r) =>
        new Date(r.marked_at).toLocaleString("en-NG", {
          day: "numeric",
          month: "short",
          hour: "numeric",
          minute: "2-digit",
        }),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1
            className="font-body text-xl"
            style={{ color: "var(--text-primary)", fontWeight: "var(--weight-semibold)" }}
          >
            Attendance
          </h1>
          <p className="mt-1 font-body text-sm" style={{ color: "var(--text-secondary)" }}>
            Filter and review attendance across all sessions.
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <button
            type="button"
            onClick={handleExport}
            disabled={exporting}
            className="h-10 rounded-md px-4 font-body text-base disabled:opacity-60"
            style={{
              background: "var(--btn-brand-bg)",
              color: "var(--btn-brand-text)",
              fontWeight: "var(--weight-semibold)",
            }}
          >
            {exporting ? "Exporting..." : "Export CSV"}
          </button>
          {exportError && (
            <span className="font-body text-sm" style={{ color: "var(--text-error)" }}>
              {exportError}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard label="Today" value={statCardValue(todayCount, statsLoading, statsError)} />
        <StatCard label="This month" value={statCardValue(monthCount, statsLoading, statsError)} />
        <StatCard label="Total members" value={statCardValue(memberCount, statsLoading, statsError)} />
      </div>

      <FilterBar
        onClear={() => {
          setFilterEventTypeId("");
          setFilterSessionId("");
          setFilterDepartment("");
          setFilterDateFrom("");
          setFilterDateTo("");
          setPage(1);
        }}
      >
        <FilterField label="Event type">
          <select
            value={filterEventTypeId}
            onChange={(e) => {
              updateFilter(setFilterEventTypeId)(e.target.value);
              setFilterSessionId("");
            }}
            className="h-10 min-w-[160px] rounded-md px-3 font-body text-base"
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

        <FilterField label="Session">
          <select
            value={filterSessionId}
            onChange={(e) => updateFilter(setFilterSessionId)(e.target.value)}
            className="h-10 min-w-[160px] rounded-md px-3 font-body text-base"
            style={fieldStyle}
          >
            <option value="">All sessions</option>
            {sessions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.event_type_name} — {new Date(s.date).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}
              </option>
            ))}
          </select>
        </FilterField>

        <FilterField label="Department">
          <select
            value={filterDepartment}
            onChange={(e) => updateFilter(setFilterDepartment)(e.target.value)}
            className="h-10 min-w-[160px] rounded-md px-3 font-body text-base"
            style={fieldStyle}
          >
            <option value="">All departments</option>
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </FilterField>

        <FilterField label="From">
          <input
            type="date"
            value={filterDateFrom}
            onChange={(e) => updateFilter(setFilterDateFrom)(e.target.value)}
            className="h-10 rounded-md px-3 font-body text-base"
            style={fieldStyle}
          />
        </FilterField>

        <FilterField label="To">
          <input
            type="date"
            value={filterDateTo}
            onChange={(e) => updateFilter(setFilterDateTo)(e.target.value)}
            className="h-10 rounded-md px-3 font-body text-base"
            style={fieldStyle}
          />
        </FilterField>
      </FilterBar>

      <section
        className="rounded-lg"
        style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}
      >
        <DataTable
          columns={columns}
          rows={records}
          rowKey={(r) => r.id}
          loading={loading}
          error={listError}
          emptyMessage="No attendance records match these filters."
          pagination={{ page, limit: LIMIT, total, onPageChange: setPage }}
        />
      </section>
    </div>
  );
}
