export function Spinner({ label = "Loading" }: { label?: string }) {
  return (
    <div role="status" className="flex flex-col items-center gap-3">
      <div
        className="h-8 w-8 rounded-full border-[3px] motion-safe:animate-spin motion-reduce:animate-none"
        style={{
          borderColor: "var(--border-default)",
          borderTopColor: "var(--bg-accent)",
        }}
      />
      <span className="font-body text-sm" style={{ color: "var(--text-secondary)" }}>
        {label}
      </span>
    </div>
  );
}
