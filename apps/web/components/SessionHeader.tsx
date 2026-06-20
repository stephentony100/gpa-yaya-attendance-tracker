import Image from "next/image";
import { EventTag } from "./EventTag";

export function formatSessionDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-NG", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

interface SessionHeaderProps {
  eventTypeName?: string;
  date?: string;
}

export function SessionHeader({ eventTypeName, date }: SessionHeaderProps) {
  return (
    <header
      className="flex flex-col gap-3 px-5 pb-6 pt-8"
      style={{ background: "var(--header-bg)" }}
    >
      <div className="flex flex-wrap items-center gap-2">
        <Image
          src="/logos/rccg-yaya-crest.png"
          alt="RCCG GPA YAYA crest"
          width={84}
          height={55}
        />
        {/* TODO: reinstate Nations Builders wordmark once a transparent-background version is available */}
        {/* <span aria-hidden style={{ width: 1, height: 36, background: "var(--header-border)" }} />
        <Image
          src="/logos/nations-builders-wordmark.jpeg"
          alt="Nations Builders"
          width={53}
          height={22}
        /> */}
        <span
          className="font-body text-base"
          style={{ color: "var(--header-text)", fontWeight: "var(--weight-medium)" }}
        >
          RCCG GPA YAYA
        </span>
      </div>
      {eventTypeName && date && (
        <div className="flex flex-wrap items-center gap-2">
          <EventTag label={eventTypeName} />
          <span className="font-body text-sm" style={{ color: "var(--header-text-muted)" }}>
            {formatSessionDate(date)}
          </span>
        </div>
      )}
    </header>
  );
}
