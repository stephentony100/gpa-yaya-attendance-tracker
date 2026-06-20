import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div
      className="flex min-h-screen flex-col items-center px-5 pb-10 pt-12"
      style={{ background: "var(--bg-page)" }}
    >
      <Image src="/logos/rccg-yaya-crest.png" alt="RCCG GPA YAYA crest" width={152} height={100} />

      <h1
        className="mt-6 text-center"
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: "var(--weight-regular)",
          fontSize: "var(--text-2xl)",
          color: "var(--text-primary)",
        }}
      >
        RCCG GPA YAYA
      </h1>
      <p className="mt-2 text-center font-body text-base" style={{ color: "var(--text-secondary)" }}>
        Attendance Check-In
      </p>

      <div className="mt-10 flex w-full max-w-sm flex-1 flex-col items-center justify-center">
        <Link
          href="/checkin"
          className="flex h-14 w-full items-center justify-center rounded-md font-body text-base"
          style={{
            background: "var(--btn-primary-bg)",
            color: "var(--btn-primary-text)",
            fontWeight: "var(--weight-semibold)",
          }}
        >
          Enter Check-In Code
        </Link>
      </div>

      <Link
        href="/admin/login"
        className="mt-10 font-body text-sm underline"
        style={{ color: "var(--text-tertiary)" }}
      >
        Admin login
      </Link>
    </div>
  );
}
