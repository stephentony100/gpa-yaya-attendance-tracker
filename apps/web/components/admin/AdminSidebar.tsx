"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/admin/sessions", label: "Sessions" },
  { href: "/admin/attendance", label: "Attendance" },
  { href: "/admin/members", label: "Members" },
  { href: "/admin/event-types", label: "Event Types" },
  { href: "/admin/settings", label: "Settings" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <>
      <aside
        className="fixed inset-y-0 left-0 z-raised hidden w-60 flex-col gap-1 px-3 py-6 md:flex"
        style={{ background: "var(--sidebar-bg)" }}
      >
        <div className="mb-6 flex flex-wrap items-center gap-2 px-3">
          <Image
            src="/logos/rccg-yaya-crest.png"
            alt="RCCG GPA YAYA crest"
            width={61}
            height={40}
          />
          {/* TODO: reinstate Nations Builders wordmark once a transparent-background version is available */}
          {/* <span aria-hidden style={{ width: 1, height: 26, background: "var(--header-border)" }} />
          <Image
            src="/logos/nations-builders-wordmark.jpeg"
            alt="Nations Builders"
            width={38}
            height={16}
          /> */}
          <span
            className="font-body text-base"
            style={{ color: "var(--text-on-brand)", fontWeight: "var(--weight-semibold)" }}
          >
            GPA YAYA Admin
          </span>
        </div>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname?.startsWith(item.href) ?? false;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2.5 font-body text-base transition-colors"
              style={{
                background: isActive ? "var(--sidebar-item-active-bg)" : "transparent",
                color: isActive ? "var(--sidebar-item-active-text)" : "var(--sidebar-item-text)",
                fontWeight: "var(--weight-medium)",
                transitionDuration: "var(--transition-base)",
              }}
            >
              {item.label}
            </Link>
          );
        })}
      </aside>

      <nav
        className="fixed inset-x-0 bottom-0 z-raised flex items-stretch justify-around md:hidden"
        style={{ background: "var(--sidebar-bg)", borderTop: "1px solid var(--header-border)" }}
      >
        {NAV_ITEMS.map((item) => {
          const isActive = pathname?.startsWith(item.href) ?? false;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-1 flex-col items-center gap-0.5 px-2 py-2.5 font-body text-xs"
              style={{
                color: isActive ? "var(--sidebar-item-active-text)" : "var(--sidebar-item-text)",
                fontWeight: "var(--weight-medium)",
              }}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
