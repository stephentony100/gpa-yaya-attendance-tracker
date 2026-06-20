import Image from "next/image";

interface QrPrintViewProps {
  imgSrc: string;
  eventTypeName: string;
  date: string;
}

function formatPrintDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-NG", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

// Rendered only under @media print (see globals.css .print-area) — this is
// what ends up on the projector screen or printed flyer, so it stays plain
// black-on-page with no decorative colour beyond the brand mark.
export function QrPrintView({ imgSrc, eventTypeName, date }: QrPrintViewProps) {
  return (
    <div className="print-area">
      <Image src="/logos/rccg-yaya-crest.png" alt="RCCG GPA YAYA crest" width={183} height={120} />

      <div className="text-center">
        <h2
          className="font-body text-2xl"
          style={{ color: "var(--text-primary)", fontWeight: "var(--weight-semibold)" }}
        >
          {eventTypeName}
        </h2>
        <p className="mt-1 font-body text-base" style={{ color: "var(--text-secondary)" }}>
          {formatPrintDate(date)}
        </p>
      </div>

      <img
        src={imgSrc}
        alt={`Check-in QR code for ${eventTypeName}`}
        className="h-[420px] w-[420px] max-w-none"
      />

      <p className="font-body text-base" style={{ color: "var(--text-secondary)" }}>
        Scan with your phone&apos;s camera to check in
      </p>
    </div>
  );
}
