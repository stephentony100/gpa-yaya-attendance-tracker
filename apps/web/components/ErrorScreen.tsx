interface ErrorScreenProps {
  title: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorScreen({ title, message, onRetry }: ErrorScreenProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <div
        className="mb-5 flex h-12 w-12 items-center justify-center rounded-full"
        style={{ background: "var(--bg-error)" }}
      >
        <span className="font-body text-xl" style={{ color: "var(--text-error)" }}>
          !
        </span>
      </div>
      <h1 className="font-body text-lg" style={{ color: "var(--text-primary)", fontWeight: "var(--weight-medium)" }}>
        {title}
      </h1>
      <p className="mt-2 max-w-xs font-body text-base" style={{ color: "var(--text-secondary)" }}>
        {message}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-6 h-11 min-w-[44px] rounded-md px-5 font-body text-base"
          style={{
            background: "var(--btn-secondary-bg)",
            border: "1px solid var(--btn-secondary-border)",
            color: "var(--btn-secondary-text)",
            fontWeight: "var(--weight-medium)",
          }}
        >
          Try again
        </button>
      )}
    </div>
  );
}
