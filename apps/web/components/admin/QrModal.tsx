"use client";

import { Fragment, useEffect, useState } from "react";
import { adminApi, ApiError } from "@/lib/api";
import { Spinner } from "@/components/Spinner";
import { QrPrintView } from "@/components/admin/QrPrintView";

interface QrModalProps {
  sessionId: string;
  qrUrl: string;
  eventTypeName: string;
  date: string;
  onClose: () => void;
}

function formatModalDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-NG", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function QrModal({ sessionId, qrUrl, eventTypeName, date, onClose }: QrModalProps) {
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let objectUrl: string | null = null;
    let cancelled = false;

    setLoading(true);
    setError(null);
    adminApi
      .getSessionQr(sessionId)
      .then(({ blob }) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setImgSrc(objectUrl);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof ApiError ? err.message : "Could not load the QR code.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [sessionId]);

  function handleDownload() {
    if (!imgSrc) return;
    const link = document.createElement("a");
    link.href = imgSrc;
    link.download = `yaya-session-${sessionId}-qr.png`;
    link.click();
  }

  function handlePrint() {
    window.print();
  }

  return (
    <Fragment>
      <div
        className="fixed inset-0 z-modal flex items-center justify-center px-5 print:hidden"
        style={{ background: "var(--bg-overlay)" }}
      >
        <div
          className="w-full max-w-md px-6 py-6 text-center"
          style={{ background: "var(--bg-surface)", borderRadius: "var(--radius-xl)" }}
        >
          <h3
            className="font-body text-lg"
            style={{ color: "var(--text-primary)", fontWeight: "var(--weight-medium)" }}
          >
            {eventTypeName}
          </h3>
          <p className="font-body text-sm" style={{ color: "var(--text-secondary)" }}>
            {formatModalDate(date)}
          </p>

          <div className="mt-4 flex min-h-[18rem] items-center justify-center">
            {loading && <Spinner label="Generating QR code..." />}
            {error && (
              <p className="font-body text-sm" style={{ color: "var(--text-error)" }}>
                {error}
              </p>
            )}
            {imgSrc && !loading && (
              <img
                src={imgSrc}
                alt={`Check-in QR code for ${eventTypeName}`}
                className="h-72 w-72 rounded-md"
                style={{ border: "1px solid var(--card-border)" }}
              />
            )}
          </div>

          <p className="mt-4 break-all font-mono text-xs" style={{ color: "var(--text-secondary)" }}>
            {qrUrl}
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={onClose}
              className="h-11 w-full shrink-0 rounded-md font-body text-base sm:w-auto sm:flex-1"
              style={{
                background: "var(--btn-secondary-bg)",
                border: "1px solid var(--btn-secondary-border)",
                color: "var(--btn-secondary-text)",
              }}
            >
              Done
            </button>
            {imgSrc && (
              <>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="h-11 w-full shrink-0 rounded-md font-body text-base sm:w-auto sm:flex-1"
                  style={{
                    background: "var(--btn-secondary-bg)",
                    border: "1px solid var(--btn-secondary-border)",
                    color: "var(--btn-secondary-text)",
                  }}
                >
                  Print QR
                </button>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="h-11 w-full shrink-0 rounded-md font-body text-base sm:w-auto sm:flex-1"
                  style={{
                    background: "var(--btn-brand-bg)",
                    color: "var(--btn-brand-text)",
                    fontWeight: "var(--weight-semibold)",
                  }}
                >
                  Download QR
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {imgSrc && <QrPrintView imgSrc={imgSrc} eventTypeName={eventTypeName} date={date} />}
    </Fragment>
  );
}
