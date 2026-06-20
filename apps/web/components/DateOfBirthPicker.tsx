"use client";

import { useMemo } from "react";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

interface DateOfBirthPickerProps {
  value: string;
  onChange: (value: string) => void;
  hasError?: boolean;
}

function parseIso(value: string): { day: string; month: string; year: string } {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return { day: "", month: "", year: "" };
  const [, year, month, day] = match;
  return { day: String(Number(day)), month: String(Number(month)), year };
}

function daysInMonth(month: number, year: number): number {
  return new Date(year, month, 0).getDate();
}

export function DateOfBirthPicker({ value, onChange, hasError }: DateOfBirthPickerProps) {
  const { day, month, year } = parseIso(value);
  const currentYear = new Date().getFullYear();

  const years = useMemo(() => {
    const list: number[] = [];
    for (let y = currentYear; y >= currentYear - 100; y--) list.push(y);
    return list;
  }, [currentYear]);

  const maxDay = month && year ? daysInMonth(Number(month), Number(year)) : 31;
  const days = useMemo(() => Array.from({ length: maxDay }, (_, i) => i + 1), [maxDay]);

  function update(next: { day?: string; month?: string; year?: string }) {
    const d = next.day ?? day;
    const m = next.month ?? month;
    const y = next.year ?? year;

    if (!d || !m || !y) {
      onChange("");
      return;
    }

    const clampedDay = Math.min(Number(d), daysInMonth(Number(m), Number(y)));
    onChange(`${y}-${String(m).padStart(2, "0")}-${String(clampedDay).padStart(2, "0")}`);
  }

  const selectStyle = {
    background: "var(--input-bg)",
    border: `1px solid ${hasError ? "var(--input-border-error)" : "var(--input-border)"}`,
    color: value ? "var(--input-text)" : "var(--input-placeholder)",
  };

  return (
    <div className="grid grid-cols-3 gap-2">
      <select
        value={day}
        onChange={(e) => update({ day: e.target.value })}
        aria-label="Day"
        className="h-12 w-full rounded-md px-2 font-body text-base"
        style={selectStyle}
      >
        <option value="">Day</option>
        {days.map((d) => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </select>

      <select
        value={month}
        onChange={(e) => update({ month: e.target.value })}
        aria-label="Month"
        className="h-12 w-full rounded-md px-2 font-body text-base"
        style={selectStyle}
      >
        <option value="">Month</option>
        {MONTHS.map((name, i) => (
          <option key={name} value={i + 1}>
            {name}
          </option>
        ))}
      </select>

      <select
        value={year}
        onChange={(e) => update({ year: e.target.value })}
        aria-label="Year"
        className="h-12 w-full rounded-md px-2 font-body text-base"
        style={selectStyle}
      >
        <option value="">Year</option>
        {years.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
    </div>
  );
}
