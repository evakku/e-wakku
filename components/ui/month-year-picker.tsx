"use client";

import { ChevronDown } from "lucide-react";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

interface MonthYearPickerProps {
  month: string;
  year: string;
  onMonth: (v: string) => void;
  onYear: (v: string) => void;
}

export function MonthYearPicker({ month, year, onMonth, onYear }: MonthYearPickerProps) {
  return (
    <div>
      <label className="text-md font-bold">Month and Year <span className="text-red-500">*</span></label>
      <div className="grid grid-cols-2 gap-3">
        <div className="relative">
          <select
            name="month"
            className="tj-input cursor-pointer appearance-none border-2 border-gray-300 rounded-md p-2 text-sm w-full"
            value={month}
            onChange={(e) => onMonth(e.target.value)}
          >
            <option value="">Month</option>
            {MONTHS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
        </div>

        <input
          type="number"
          name="year"
          className="tj-input border-2 border-gray-300 rounded-md p-2 text-sm w-full"
          placeholder="Year"
          value={year}
          onChange={(e) => onYear(e.target.value)}
        />
      </div>
    </div>
  );
}