"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getAdminToken } from "@/lib/adminAuth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { Spinner } from "@/components/Spinner";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === "/admin/login";
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (isLoginPage) {
      setChecked(true);
      return;
    }
    if (!getAdminToken()) {
      router.replace("/admin/login");
      return;
    }
    setChecked(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoginPage, pathname]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (!checked) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: "var(--bg-page)" }}>
        <Spinner label="Loading..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-page)" }}>
      <AdminSidebar />
      <div className="md:pl-60">
        <AdminTopbar />
        <main className="px-4 pb-24 pt-5 md:px-8 md:pb-8">{children}</main>
      </div>
    </div>
  );
}
