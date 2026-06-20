"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clearAdminToken, getAdminInfo } from "@/lib/adminAuth";
import type { Admin } from "@/types/admin";

export function AdminTopbar() {
  const router = useRouter();
  const [admin, setAdmin] = useState<Admin | null>(null);

  useEffect(() => {
    setAdmin(getAdminInfo());
  }, []);

  function handleLogout() {
    clearAdminToken();
    router.replace("/admin/login");
  }

  return (
    <header
      className="sticky top-0 z-raised flex items-center justify-end gap-3 px-4 py-3 md:px-8"
      style={{ background: "var(--bg-surface)", borderBottom: "1px solid var(--table-border)" }}
    >
      {admin && (
        <span className="font-body text-sm" style={{ color: "var(--text-secondary)" }}>
          {admin.name}
        </span>
      )}
      <button
        type="button"
        onClick={handleLogout}
        className="h-9 rounded-md px-3 font-body text-sm"
        style={{
          background: "var(--btn-secondary-bg)",
          border: "1px solid var(--btn-secondary-border)",
          color: "var(--btn-secondary-text)",
        }}
      >
        Log out
      </button>
    </header>
  );
}
