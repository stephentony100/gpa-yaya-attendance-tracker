import { DEPARTMENTS } from "@/types/checkin";

interface DepartmentPillsProps {
  selected: string[];
  onToggle: (department: string) => void;
}

export function DepartmentPills({ selected, onToggle }: DepartmentPillsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {DEPARTMENTS.map((department) => {
        const isActive = selected.includes(department);
        return (
          <button
            key={department}
            type="button"
            aria-pressed={isActive}
            onClick={() => onToggle(department)}
            className="min-h-[44px] rounded-full px-4 py-2 font-body text-sm transition-colors"
            style={{
              background: isActive ? "var(--pill-active-bg)" : "var(--pill-bg)",
              borderWidth: 1,
              borderColor: isActive ? "var(--pill-active-border)" : "var(--pill-border)",
              color: isActive ? "var(--pill-active-text)" : "var(--pill-text)",
              transitionDuration: "var(--transition-base)",
            }}
          >
            {department}
          </button>
        );
      })}
    </div>
  );
}
