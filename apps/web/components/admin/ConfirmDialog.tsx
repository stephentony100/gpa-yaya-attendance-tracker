interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  busy?: boolean;
  danger?: boolean;
  error?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  busy = false,
  danger = false,
  error = null,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <div
      className="fixed inset-0 z-modal flex items-center justify-center px-5"
      style={{ background: "var(--bg-overlay)" }}
    >
      <div
        className="w-full max-w-sm px-6 py-6"
        style={{ background: "var(--bg-surface)", borderRadius: "var(--radius-xl)" }}
      >
        <h3
          className="font-body text-lg"
          style={{ color: "var(--text-primary)", fontWeight: "var(--weight-medium)" }}
        >
          {title}
        </h3>
        <p className="mt-2 font-body text-base" style={{ color: "var(--text-secondary)" }}>
          {message}
        </p>
        {error && (
          <p className="mt-3 font-body text-sm" style={{ color: "var(--text-error)" }}>
            {error}
          </p>
        )}
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="h-11 flex-1 rounded-md font-body text-base disabled:opacity-60"
            style={{
              background: "var(--btn-secondary-bg)",
              border: "1px solid var(--btn-secondary-border)",
              color: "var(--btn-secondary-text)",
            }}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="h-11 flex-1 rounded-md font-body text-base disabled:opacity-60"
            style={{
              background: danger ? "var(--text-error)" : "var(--btn-brand-bg)",
              color: "var(--text-on-brand)",
              fontWeight: "var(--weight-semibold)",
            }}
          >
            {busy ? "Please wait..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
