"use client";

import { useEffect, useState, type CSSProperties, type FormEvent, type ReactNode } from "react";
import { api, ApiError } from "@/lib/api";
import { clearDeviceToken, getDeviceToken, setDeviceToken } from "@/lib/deviceToken";
import type { Gender, MemberLookup, MemberPublic, SessionPublic } from "@/types/checkin";
import { SessionHeader } from "@/components/SessionHeader";
import { DepartmentPills } from "@/components/DepartmentPills";
import { StatusBadge } from "@/components/StatusBadge";
import { Spinner } from "@/components/Spinner";
import { ErrorScreen } from "@/components/ErrorScreen";

const GENDERS: { value: Gender; label: string }[] = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "OTHER", label: "Other" },
];

type Screen =
  | { kind: "loading" }
  | { kind: "session-error"; title: string; message: string }
  | { kind: "register" }
  | { kind: "confirmation"; member: MemberPublic; alreadyMarked: boolean };

interface RegisterForm {
  fullName: string;
  phoneNumber: string;
  gender: Gender | "";
  dateOfBirth: string;
  departments: string[];
}

const EMPTY_FORM: RegisterForm = {
  fullName: "",
  phoneNumber: "",
  gender: "",
  dateOfBirth: "",
  departments: [],
};

function isApiError(err: unknown): err is ApiError {
  return err instanceof ApiError;
}

export default function CheckinPage({ params }: { params: { qr_token: string } }) {
  const qrToken = params.qr_token;

  const [screen, setScreen] = useState<Screen>({ kind: "loading" });
  const [session, setSession] = useState<SessionPublic | null>(null);

  const [form, setForm] = useState<RegisterForm>(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [recoveryPhone, setRecoveryPhone] = useState<string | null>(null);
  const [recoveryMember, setRecoveryMember] = useState<MemberLookup | null>(null);
  const [recoveryError, setRecoveryError] = useState<string | null>(null);
  const [recoveryBusy, setRecoveryBusy] = useState(false);

  async function init() {
    setScreen({ kind: "loading" });
    try {
      const { data: sessionData } = await api.getSession(qrToken);
      setSession(sessionData);

      const deviceToken = getDeviceToken();
      if (!deviceToken) {
        setScreen({ kind: "register" });
        return;
      }

      try {
        const { data } = await api.mark(qrToken, deviceToken);
        setScreen({ kind: "confirmation", member: data.member, alreadyMarked: data.already_marked });
      } catch (err) {
        if (isApiError(err) && err.statusCode === 404) {
          clearDeviceToken();
          setScreen({ kind: "register" });
          return;
        }
        if (isApiError(err) && err.statusCode === 410) {
          setScreen({ kind: "session-error", title: "Session ended", message: err.message });
          return;
        }
        setScreen({
          kind: "session-error",
          title: "Something went wrong",
          message: isApiError(err) ? err.message : "Please try again.",
        });
      }
    } catch (err) {
      if (isApiError(err) && err.statusCode === 404) {
        setScreen({ kind: "session-error", title: "Session not found", message: "This QR code isn't recognised." });
        return;
      }
      if (isApiError(err) && err.statusCode === 410) {
        setScreen({ kind: "session-error", title: "Session ended", message: err.message });
        return;
      }
      setScreen({
        kind: "session-error",
        title: "Something went wrong",
        message: isApiError(err) ? err.message : "Please try again.",
      });
    }
  }

  useEffect(() => {
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qrToken]);

  function toggleDepartment(department: string) {
    setForm((prev) => ({
      ...prev,
      departments: prev.departments.includes(department)
        ? prev.departments.filter((d) => d !== department)
        : [...prev.departments, department],
    }));
  }

  function validateForm(): Record<string, string> {
    const errors: Record<string, string> = {};
    if (!form.fullName.trim()) errors.full_name = "Enter your full name.";
    if (!form.phoneNumber.trim()) errors.phone_number = "Enter your phone number.";
    if (!form.gender) errors.gender = "Select a gender.";
    if (!form.dateOfBirth) errors.date_of_birth = "Enter your date of birth.";
    if (form.departments.length === 0) errors.departments = "Choose at least one department.";
    return errors;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setSubmitting(true);

    try {
      const { data } = await api.register(qrToken, {
        full_name: form.fullName.trim(),
        phone_number: form.phoneNumber.trim(),
        gender: form.gender as Gender,
        date_of_birth: form.dateOfBirth,
        departments: form.departments,
      });
      setDeviceToken(data.device_token);
      setScreen({ kind: "confirmation", member: data.member, alreadyMarked: false });
    } catch (err) {
      if (isApiError(err) && err.statusCode === 400 && err.data?.fieldErrors) {
        setFieldErrors(err.data.fieldErrors);
      } else if (isApiError(err) && err.statusCode === 409 && err.data?.recovery) {
        setRecoveryPhone(form.phoneNumber.trim());
        setRecoveryMember(null);
        setRecoveryError(null);
      } else if (isApiError(err) && err.statusCode === 410) {
        setScreen({ kind: "session-error", title: "Session ended", message: err.message });
      } else {
        setFormError(isApiError(err) ? err.message : "Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRecoveryLookup() {
    if (!recoveryPhone) return;
    setRecoveryBusy(true);
    setRecoveryError(null);
    try {
      const { data } = await api.lookupByPhone(recoveryPhone);
      setRecoveryMember(data);
    } catch (err) {
      setRecoveryError(isApiError(err) ? err.message : "We couldn't find an account with that number.");
    } finally {
      setRecoveryBusy(false);
    }
  }

  async function handleRecoveryConfirm() {
    if (!recoveryMember || !recoveryPhone) return;
    setRecoveryBusy(true);
    setRecoveryError(null);
    try {
      const { data: linkData } = await api.linkDevice(recoveryMember.id, recoveryPhone);
      setDeviceToken(linkData.device_token);
      const { data: markData } = await api.mark(qrToken, linkData.device_token);
      setRecoveryPhone(null);
      setScreen({ kind: "confirmation", member: markData.member, alreadyMarked: markData.already_marked });
    } catch (err) {
      if (isApiError(err) && err.statusCode === 410) {
        setScreen({ kind: "session-error", title: "Session ended", message: err.message });
        setRecoveryPhone(null);
        return;
      }
      setRecoveryError(isApiError(err) ? err.message : "Something went wrong. Please try again.");
    } finally {
      setRecoveryBusy(false);
    }
  }

  function handleNotYou() {
    clearDeviceToken();
    window.location.reload();
  }

  if (screen.kind === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner label="Loading session..." />
      </div>
    );
  }

  if (screen.kind === "session-error") {
    return <ErrorScreen title={screen.title} message={screen.message} onRetry={init} />;
  }

  if (screen.kind === "confirmation") {
    const { member, alreadyMarked } = screen;
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <div className="relative flex h-32 w-32 items-center justify-center motion-safe:animate-halo-in">
          <span
            className="absolute h-32 w-32 rounded-full"
            style={{ background: "var(--halo-ring-outer)" }}
          />
          <span
            className="absolute h-24 w-24 rounded-full"
            style={{ background: "var(--halo-ring-inner)" }}
          />
          <span
            className="relative flex h-16 w-16 items-center justify-center rounded-full"
            style={{ background: "var(--halo-check-bg)" }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M5 13l4 4L19 7"
                stroke="var(--halo-check-icon)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </div>

        <h1
          className="mt-6"
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: "var(--weight-regular)",
            fontSize: "var(--text-2xl)",
            color: "var(--text-primary)",
          }}
        >
          {alreadyMarked ? "Welcome back," : "Welcome,"} {member.full_name}
        </h1>

        <div className="mt-3">
          <StatusBadge status="present" label="Present" />
        </div>

        <p className="mt-3 max-w-xs font-body text-base" style={{ color: "var(--text-secondary)" }}>
          {alreadyMarked
            ? "You're already marked present for this session."
            : "You're marked present for this session."}
        </p>

        <button
          type="button"
          onClick={handleNotYou}
          className="mt-8 font-body text-sm underline"
          style={{ color: "var(--text-link)" }}
        >
          Not you? Tap here
        </button>
      </div>
    );
  }

  // screen.kind === "register"
  return (
    <div className="min-h-screen pb-12">
      {session && <SessionHeader eventTypeName={session.event_type_name} date={session.date} />}

      <form onSubmit={handleSubmit} className="mx-auto flex max-w-md flex-col gap-5 px-5 pt-6">
        <div>
          <h2 className="font-body text-lg" style={{ color: "var(--text-primary)", fontWeight: "var(--weight-medium)" }}>
            Mark your attendance
          </h2>
          <p className="mt-1 font-body text-sm" style={{ color: "var(--text-secondary)" }}>
            First time here? Fill in your details below.
          </p>
        </div>

        {formError && (
          <p className="font-body text-sm" style={{ color: "var(--text-error)" }}>
            {formError}
          </p>
        )}

        <Field label="Full name" error={fieldErrors.full_name}>
          <input
            type="text"
            value={form.fullName}
            onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))}
            className="h-12 w-full rounded-md px-3 font-body text-base"
            style={inputStyle(Boolean(fieldErrors.full_name))}
            placeholder="e.g. Emeka Okafor"
          />
        </Field>

        <Field label="Phone number" error={fieldErrors.phone_number}>
          <input
            type="tel"
            value={form.phoneNumber}
            onChange={(e) => setForm((prev) => ({ ...prev, phoneNumber: e.target.value }))}
            className="h-12 w-full rounded-md px-3 font-body text-base"
            style={inputStyle(Boolean(fieldErrors.phone_number))}
            placeholder="e.g. +2348012345678"
          />
        </Field>

        <Field label="Gender" error={fieldErrors.gender}>
          <div className="flex gap-2">
            {GENDERS.map((g) => {
              const isActive = form.gender === g.value;
              return (
                <button
                  key={g.value}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setForm((prev) => ({ ...prev, gender: g.value }))}
                  className="h-11 flex-1 rounded-md font-body text-base"
                  style={{
                    background: isActive ? "var(--pill-active-bg)" : "var(--pill-bg)",
                    borderWidth: 1,
                    borderColor: isActive ? "var(--pill-active-border)" : "var(--pill-border)",
                    color: isActive ? "var(--pill-active-text)" : "var(--pill-text)",
                  }}
                >
                  {g.label}
                </button>
              );
            })}
          </div>
        </Field>

        <Field label="Date of birth" error={fieldErrors.date_of_birth}>
          <input
            type="date"
            value={form.dateOfBirth}
            onChange={(e) => setForm((prev) => ({ ...prev, dateOfBirth: e.target.value }))}
            className="h-12 w-full rounded-md px-3 font-body text-base"
            style={inputStyle(Boolean(fieldErrors.date_of_birth))}
          />
        </Field>

        <Field label="Departments" error={fieldErrors.departments}>
          <DepartmentPills selected={form.departments} onToggle={toggleDepartment} />
        </Field>

        <div>
          <span className="font-body text-sm" style={{ color: "var(--text-secondary)", fontWeight: "var(--weight-medium)" }}>
            Profile photo (optional)
          </span>
          <button
            type="button"
            disabled
            className="mt-2 flex h-11 w-full items-center justify-center rounded-md font-body text-sm"
            style={{
              background: "var(--btn-secondary-bg)",
              border: "1px dashed var(--btn-secondary-border)",
              color: "var(--text-tertiary)",
            }}
          >
            Photo upload available soon
          </button>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 h-12 w-full rounded-md font-body text-base disabled:opacity-60"
          style={{
            background: "var(--btn-primary-bg)",
            color: "var(--btn-primary-text)",
            fontWeight: "var(--weight-semibold)",
          }}
        >
          {submitting ? "Marking attendance..." : "Mark my attendance"}
        </button>
      </form>

      {recoveryPhone && (
        <RecoverySheet
          member={recoveryMember}
          error={recoveryError}
          busy={recoveryBusy}
          onLookup={handleRecoveryLookup}
          onConfirm={handleRecoveryConfirm}
          onClose={() => {
            setRecoveryPhone(null);
            setRecoveryMember(null);
            setRecoveryError(null);
          }}
        />
      )}
    </div>
  );
}

function inputStyle(hasError: boolean): CSSProperties {
  return {
    background: "var(--input-bg)",
    border: `1px solid ${hasError ? "var(--input-border-error)" : "var(--input-border)"}`,
    color: "var(--input-text)",
  };
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-body text-sm" style={{ color: "var(--text-secondary)", fontWeight: "var(--weight-medium)" }}>
        {label}
      </span>
      {children}
      {error && (
        <span className="font-body text-sm" style={{ color: "var(--text-error)" }}>
          {error}
        </span>
      )}
    </label>
  );
}

function RecoverySheet({
  member,
  error,
  busy,
  onLookup,
  onConfirm,
  onClose,
}: {
  member: MemberLookup | null;
  error: string | null;
  busy: boolean;
  onLookup: () => void;
  onConfirm: () => void;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!member && !error) {
      onLookup();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 z-modal flex items-end justify-center" style={{ background: "var(--bg-overlay)" }}>
      <div
        className="w-full max-w-md rounded-t-xl px-5 pb-8 pt-6"
        style={{ background: "var(--bg-surface)" }}
      >
        <h3 className="font-body text-lg" style={{ color: "var(--text-primary)", fontWeight: "var(--weight-medium)" }}>
          That phone number is already registered
        </h3>

        {busy && !member && !error && (
          <div className="mt-4">
            <Spinner label="Looking up your account..." />
          </div>
        )}

        {error && (
          <p className="mt-3 font-body text-sm" style={{ color: "var(--text-error)" }}>
            {error}
          </p>
        )}

        {member && (
          <p className="mt-3 font-body text-base" style={{ color: "var(--text-secondary)" }}>
            We found an account for <strong>{member.full_name}</strong> ({member.phone}). Is this you?
          </p>
        )}

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="h-12 flex-1 rounded-md font-body text-base"
            style={{
              background: "var(--btn-secondary-bg)",
              border: "1px solid var(--btn-secondary-border)",
              color: "var(--btn-secondary-text)",
            }}
          >
            Cancel
          </button>
          {member && (
            <button
              type="button"
              onClick={onConfirm}
              disabled={busy}
              className="h-12 flex-1 rounded-md font-body text-base disabled:opacity-60"
              style={{
                background: "var(--btn-primary-bg)",
                color: "var(--btn-primary-text)",
                fontWeight: "var(--weight-semibold)",
              }}
            >
              {busy ? "Confirming..." : "Yes, this is me"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
