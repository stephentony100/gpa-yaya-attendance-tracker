import { EventTag } from "./EventTag";

export function formatSessionDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-NG", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

interface SessionHeaderProps {
  eventTypeName: string;
  date: string;
}

export function SessionHeader({ eventTypeName, date }: SessionHeaderProps) {
  return (
    <header
      className="flex flex-col gap-3 px-5 pb-6 pt-8"
      style={{ background: "var(--header-bg)" }}
    >
      <div className="flex items-center gap-2">
        <span
          className="flex h-7 w-7 items-center justify-center rounded-full font-body text-sm"
          style={{
            background: "var(--header-logo-bg)",
            color: "var(--header-logo-text)",
            fontWeight: "var(--weight-semibold)",
          }}
        >
          Y
        </span>
        <span
          className="font-body text-base"
          style={{ color: "var(--header-text)", fontWeight: "var(--weight-medium)" }}
        >
          RCCG GPA YAYA
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <EventTag label={eventTypeName} />
        <span className="font-body text-sm" style={{ color: "var(--header-text-muted)" }}>
          {formatSessionDate(date)}
        </span>
      </div>
    </header>
  );
}
