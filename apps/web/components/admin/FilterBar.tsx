import type { ReactNode } from "react";

interface FilterBarProps {
  children: ReactNode;
  onClear?: () => void;
}

export function FilterBar({ children, onClear }: FilterBarProps) {
  return (
    <div
      className="flex flex-wrap items-end gap-3 rounded-lg p-4"
      style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}
    >
      {children}
      {onClear && (
        <button
          type="button"
          onClick={onClear}
          className="h-10 rounded-md px-3 font-body text-sm"
          style={{
            background: "var(--btn-secondary-bg)",
            border: "1px solid var(--btn-secondary-border)",
            color: "var(--btn-secondary-text)",
          }}
        >
          Clear filters
        </button>
      )}
    </div>
  );
}

export function FilterField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span
        className="font-body text-xs"
        style={{ color: "var(--text-secondary)", fontWeight: "var(--weight-medium)" }}
      >
        {label}
      </span>
      {children}
    </label>
  );
}
