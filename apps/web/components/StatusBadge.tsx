interface StatusBadgeProps {
  status: "present" | "absent";
  label: string;
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const isPresent = status === "present";
  return (
    <span
      className="inline-flex items-center rounded-sm px-2.5 py-1 font-body text-xs"
      style={{
        background: isPresent ? "var(--badge-present-bg)" : "var(--badge-absent-bg)",
        color: isPresent ? "var(--badge-present-text)" : "var(--badge-absent-text)",
        fontWeight: "var(--weight-semibold)",
        letterSpacing: "var(--tracking-wide)",
        textTransform: "uppercase",
      }}
    >
      {label}
    </span>
  );
}
