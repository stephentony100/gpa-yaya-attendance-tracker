interface StatCardProps {
  label: string;
  value: string | number;
  delta?: string;
}

export function StatCard({ label, value, delta }: StatCardProps) {
  return (
    <div className="flex flex-col gap-1 rounded-lg p-4" style={{ background: "var(--stat-bg)" }}>
      <span
        className="font-body text-sm"
        style={{ color: "var(--text-secondary)", fontWeight: "var(--weight-medium)" }}
      >
        {label}
      </span>
      <span
        className="font-body text-xl"
        style={{ color: "var(--text-primary)", fontWeight: "var(--weight-semibold)" }}
      >
        {value}
      </span>
      {delta && (
        <span className="font-body text-xs" style={{ color: "var(--stat-delta)" }}>
          {delta}
        </span>
      )}
    </div>
  );
}
