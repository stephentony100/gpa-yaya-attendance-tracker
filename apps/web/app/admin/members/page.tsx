"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { adminApi, ApiError } from "@/lib/api";
import { DEPARTMENTS } from "@/types/checkin";
import type { MemberDirectoryEntry } from "@/types/admin";
import { DataTable, type DataTableColumn } from "@/components/admin/DataTable";

const fieldStyle: CSSProperties = {
  background: "var(--input-bg)",
  border: "1px solid var(--input-border)",
  color: "var(--input-text)",
};

const AVATAR_VARIANTS = ["a", "b", "c"] as const;

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function avatarVariant(id: string): (typeof AVATAR_VARIANTS)[number] {
  const sum = id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_VARIANTS[sum % AVATAR_VARIANTS.length];
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
}

function Avatar({ id, name, photoUrl }: { id: string; name: string; photoUrl: string | null }) {
  const [imageFailed, setImageFailed] = useState(false);

  if (photoUrl && !imageFailed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photoUrl}
        alt={name}
        className="h-9 w-9 shrink-0 rounded-full object-cover"
        onError={() => setImageFailed(true)}
      />
    );
  }

  const variant = avatarVariant(id);
  return (
    <span
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-body text-sm"
      style={{
        background: `var(--avatar-bg-${variant})`,
        color: `var(--avatar-text-${variant})`,
        fontWeight: "var(--weight-semibold)",
      }}
    >
      {getInitials(name)}
    </span>
  );
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

function isApiError(err: unknown): err is ApiError {
  return err instanceof ApiError;
}

export default function AdminMembersPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [department, setDepartment] = useState("");

  const [members, setMembers] = useState<MemberDirectoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    adminApi
      .listMembers({ search: debouncedSearch || undefined, department: department || undefined })
      .then(({ data }) => setMembers(data))
      .catch((err) => setError(isApiError(err) ? err.message : "Could not load members."))
      .finally(() => setLoading(false));
  }, [debouncedSearch, department]);

  const columns: DataTableColumn<MemberDirectoryEntry>[] = [
    {
      key: "name",
      header: "Member",
      render: (m) => (
        <div className="flex items-center gap-3">
          <Avatar id={m.id} name={m.full_name} photoUrl={m.profile_photo_url} />
          <span className="font-body text-base" style={{ color: "var(--text-primary)" }}>
            {m.full_name}
          </span>
        </div>
      ),
    },
    { key: "phone", header: "Phone", render: (m) => m.phone_number },
    { key: "departments", header: "Department(s)", render: (m) => <DepartmentTags departments={m.departments} /> },
    { key: "dob", header: "Date of birth", render: (m) => formatDate(m.date_of_birth) },
    { key: "since", header: "Member since", render: (m) => formatDate(m.created_at) },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1
          className="font-body text-xl"
          style={{ color: "var(--text-primary)", fontWeight: "var(--weight-semibold)" }}
        >
          Members
        </h1>
        <p className="mt-1 font-body text-sm" style={{ color: "var(--text-secondary)" }}>
          Directory of all registered members.
        </p>
      </div>

      <div
        className="flex flex-wrap items-end gap-3 rounded-lg p-4"
        style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}
      >
        <label className="flex min-w-[220px] flex-1 flex-col gap-1.5">
          <span
            className="font-body text-xs"
            style={{ color: "var(--text-secondary)", fontWeight: "var(--weight-medium)" }}
          >
            Search by name or phone
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="e.g. Emeka or 0801..."
            className="h-10 w-full rounded-md px-3 font-body text-base"
            style={fieldStyle}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span
            className="font-body text-xs"
            style={{ color: "var(--text-secondary)", fontWeight: "var(--weight-medium)" }}
          >
            Department
          </span>
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
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
        </label>
      </div>

      <section
        className="rounded-lg"
        style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}
      >
        <DataTable
          columns={columns}
          rows={members}
          rowKey={(m) => m.id}
          loading={loading}
          error={error}
          emptyMessage="No members match this search."
        />
      </section>
    </div>
  );
}
