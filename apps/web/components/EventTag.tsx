export function EventTag({ label }: { label: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-body text-sm"
      style={{
        background: "var(--tag-bg)",
        border: "1px solid var(--tag-border)",
        color: "var(--tag-text)",
        fontWeight: "var(--weight-medium)",
      }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--tag-dot)" }} />
      {label}
    </span>
  );
}
