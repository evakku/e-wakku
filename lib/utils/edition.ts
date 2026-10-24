/**
 * @file Edition Date & Formatting Utilities
 *
 * Provides calendar arithmetic and formatting for E-Wakku magazine editions:
 * - Next-calendar-month calculation with year rollover (e.g. December -> January of next year).
 * - Human-readable month and edition display.
 * - Month normalization (two-digit zero-padded string '01'-'12').
 */

export const MONTH_NAMES = [
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
] as const;

export type MonthName = (typeof MONTH_NAMES)[number];

export interface NextEditionResult {
  /** Two-digit zero-padded month string ('01' to '12') */
  month: string;
  /** Calendar year */
  year: number;
  /** Full English month name (e.g. 'November') */
  monthName: MonthName;
}

/**
 * Calculates the default publication edition (month and year) for new issues.
 *
 * Business Rule:
 * When an administrator opens the Add New Issue page, the edition defaults
 * to the next calendar month relative to the reference date.
 *
 * Calendar Arithmetic Examples:
 * - October 24, 2026 -> November 2026
 * - December 15, 2026 -> January 2027 (handles year rollover)
 * - January 5, 2027 -> February 2027
 *
 * @param referenceDate - The date to calculate from (defaults to current date).
 * @returns Normalized next edition details.
 */
export function getNextEditionMonthAndYear(
  referenceDate: Date = new Date()
): NextEditionResult {
  // Use day 1 of the next month to avoid any end-of-month overflow issues (e.g. Oct 31 -> Dec 1)
  const nextDate = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth() + 1,
    1
  );

  const monthIndex = nextDate.getMonth(); // 0-indexed (0 to 11)
  const monthNum = monthIndex + 1; // 1 to 12
  const month = String(monthNum).padStart(2, "0");
  const year = nextDate.getFullYear();
  const monthName = MONTH_NAMES[monthIndex];

  return { month, year, monthName };
}

/**
 * Formats a month and year into a human-readable edition title.
 *
 * Examples:
 * - ('10', 2026) -> 'October 2026'
 * - ('01', 2027) -> 'January 2027'
 * - ('October', 2026) -> 'October 2026'
 */
export function formatEditionName(
  month: string | number,
  year: string | number
): string {
  const mStr = String(month).trim();
  const idx = parseInt(mStr, 10);
  const name =
    Number.isFinite(idx) && idx >= 1 && idx <= 12
      ? MONTH_NAMES[idx - 1]
      : mStr;
  return `${name} ${year}`;
}

/**
 * Normalizes a month input to a two-digit zero-padded string ('01' to '12').
 * If input is a month name, maps to its two-digit representation.
 */
export function normalizeMonth(month: string | number): string {
  const mStr = String(month).trim();
  const idx = parseInt(mStr, 10);
  if (Number.isFinite(idx) && idx >= 1 && idx <= 12) {
    return String(idx).padStart(2, "0");
  }
  const nameIdx = MONTH_NAMES.findIndex(
    (name) => name.toLowerCase() === mStr.toLowerCase()
  );
  if (nameIdx !== -1) {
    return String(nameIdx + 1).padStart(2, "0");
  }
  return mStr.padStart(2, "0");
}
