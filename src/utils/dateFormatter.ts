/**
 * Date Formatter Utility
 *
 * A comprehensive utility for formatting dates in a consistent way throughout the application.
 * Provides both a flexible formatter function and predefined formatters for common use cases.
 *
 * @example
 * // Basic usage
 * import dateFormatter, { dateFormatters } from '@/utils/dateFormatter';
 *
 * // Using the main formatter
 * dateFormatter({ date: '2023-04-15', month: 'long', day: 'numeric', year: 'numeric' });
 * // Output: "April 15, 2023"
 *
 * // Using predefined formatters
 * dateFormatters.longDate('2023-04-15');
 * // Output: "April 15, 2023"
 */

/**
 * Props for the dateFormatter function
 * All formatting options are optional and match the Intl.DateTimeFormatOptions interface
 */
interface DateFormatterProps {
  date: string | Date;
  locale?: string | string[];
  weekday?: "long" | "short" | "narrow";
  era?: "long" | "short" | "narrow";
  year?: "numeric" | "2-digit";
  month?: "numeric" | "2-digit" | "long" | "short" | "narrow";
  day?: "numeric" | "2-digit";
  hour?: "numeric" | "2-digit";
  minute?: "numeric" | "2-digit";
  second?: "numeric" | "2-digit";
  timeZoneName?: "long" | "short";
  timeZone?: string;
  hour12?: boolean;
  /**
   * Predefined format style - a convenient shorthand for common date formats
   *
   * - 'full': Saturday, April 15, 2023
   * - 'long': April 15, 2023
   * - 'medium': Apr 15, 2023
   * - 'short': 4/15/23
   *
   * Using formatStyle overrides individual component settings
   */
  formatStyle?: "full" | "long" | "medium" | "short";
}

/**
 * Formats a date string or Date object using Intl.DateTimeFormat
 *
 * @param options - Configuration options for date formatting
 * @returns Formatted date string
 *
 * @example
 * // Basic usage with defaults (MM/DD/YYYY)
 * dateFormatter({ date: '2023-04-15' })
 *
 * @example
 * // Full date with weekday
 * dateFormatter({
 *   date: '2023-04-15',
 *   weekday: 'long',
 *   month: 'long',
 *   day: 'numeric',
 *   year: 'numeric'
 * })
 *
 * @example
 * // Using a predefined style
 * dateFormatter({ date: '2023-04-15', formatStyle: 'full' })
 * // Output: "Saturday, April 15, 2023"
 */
export default function dateFormatter({
  date,
  locale = "en-US",
  weekday,
  era,
  year,
  month,
  day,
  hour,
  minute,
  second,
  timeZoneName,
  timeZone = "UTC", // Default to UTC to avoid timezone issues
  hour12,
  formatStyle,
}: DateFormatterProps): string {
  // Convert string dates to Date objects
  const dateObj = date instanceof Date ? date : new Date(date);

  // Handle invalid dates
  if (isNaN(dateObj.getTime())) {
    console.warn("Invalid date provided to dateFormatter:", date);
    return "Invalid date";
  }

  // If a formatStyle is provided, use it as a shorthand
  if (formatStyle) {
    return new Intl.DateTimeFormat(locale, {
      dateStyle: formatStyle, // Type assertion needed for TypeScript
      timeZone, // Apply the timezone
    }).format(dateObj);
  }

  // Build options object, filtering out undefined values
  const options: Intl.DateTimeFormatOptions = {
    weekday,
    era,
    year: year || "numeric", // Default to numeric year if not specified
    month: month || "numeric", // Default to numeric month if not specified
    day: day || "numeric", // Default to numeric day if not specified
    hour,
    minute,
    second,
    timeZoneName,
    timeZone, // Apply the timezone
    hour12,
  };

  // Remove undefined properties to avoid issues with Intl.DateTimeFormat
  Object.keys(options).forEach((key) => {
    if (options[key as keyof Intl.DateTimeFormatOptions] === undefined) {
      delete options[key as keyof Intl.DateTimeFormatOptions];
    }
  });

  // Format the date using Intl.DateTimeFormat
  return new Intl.DateTimeFormat(locale, options).format(dateObj);
}

/**
 * Predefined date formatters for common use cases
 *
 * @example
 * // Using the predefined formatters
 * import { dateFormatters } from '@/utils/dateFormatter';
 *
 * // Long date format
 * dateFormatters.longDate('2023-04-15');
 * // Output: "April 15, 2023"
 *
 * // With timezone
 * dateFormatters.dateWithTimeZone('2023-04-15T14:30:00');
 * // Output: "April 15, 2023, 2:30 PM GMT+2"
 */
export const dateFormatters = {
  /**
   * Format: Month Day, Year (e.g., "April 15, 2023")
   *
   * @param date - The date to format
   * @returns Formatted date string
   *
   * @example
   * // Long date format
   * dateFormatters.longDate('2023-04-15');
   * // Output: "April 15, 2023"
   */
  longDate: (date: string | Date) =>
    dateFormatter({
      date,
      month: "long",
      day: "numeric",
      year: "numeric",
    }),

  /**
   * Format: MM/DD/YYYY (e.g., "04/15/2023")
   *
   * @param date - The date to format
   * @returns Formatted date string
   *
   * @example
   * // Short date format
   * dateFormatters.shortDate('2023-04-15');
   * // Output: "4/15/2023"
   */
  shortDate: (date: string | Date) =>
    dateFormatter({
      date,
      month: "numeric",
      day: "numeric",
      year: "numeric",
    }),

  /**
   * Format: Weekday, Month Day, Year (e.g., "Saturday, April 15, 2023")
   *
   * @param date - The date to format
   * @returns Formatted date string
   *
   * @example
   * // Full date format with weekday
   * dateFormatters.fullDate('2023-04-15');
   * // Output: "Saturday, April 15, 2023"
   */
  fullDate: (date: string | Date) =>
    dateFormatter({
      date,
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }),

  /**
   * Format: Mon DD, YYYY (e.g., "Apr 15, 2023")
   *
   * @param date - The date to format
   * @returns Formatted date string
   *
   * @example
   * // Medium date format
   * dateFormatters.mediumDate('2023-04-15');
   * // Output: "Apr 15, 2023"
   */
  mediumDate: (date: string | Date) =>
    dateFormatter({
      date,
      month: "short",
      day: "numeric",
      year: "numeric",
    }),

  /**
   * Format: MM/YYYY (e.g., "04/2023")
   *
   * @param date - The date to format
   * @returns Formatted date string
   *
   * @example
   * // Month and year only
   * dateFormatters.monthYear('2023-04-15');
   * // Output: "4/2023"
   */
  monthYear: (date: string | Date) =>
    dateFormatter({
      date,
      month: "numeric",
      year: "numeric",
    }),

  /**
   * Format: Month YYYY (e.g., "April 2023")
   *
   * @param date - The date to format
   * @returns Formatted date string
   *
   * @example
   * // Long month and year
   * dateFormatters.longMonthYear('2023-04-15');
   * // Output: "April 2023"
   */
  longMonthYear: (date: string | Date) =>
    dateFormatter({
      date,
      month: "long",
      year: "numeric",
    }),

  /**
   * Format date in UTC to avoid timezone issues
   * Useful for displaying dates that should be the same regardless of user's timezone
   *
   * @param date - The date to format
   * @returns Formatted date string
   *
   * @example
   * // Date in UTC timezone
   * dateFormatters.utcDate('2023-04-15');
   * // Output: "April 15, 2023" (same for all users worldwide)
   */
  utcDate: (date: string | Date) =>
    dateFormatter({
      date,
      month: "long",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    }),

  /**
   * Format date with timezone information
   * Useful for showing when something happened in the user's local timezone
   *
   * @param date - The date to format
   * @returns Formatted date string
   *
   * @example
   * // Date with timezone information
   * dateFormatters.dateWithTimeZone('2023-04-15T14:30:00');
   * // Output: "April 15, 2023, 2:30 PM GMT+2"
   */
  dateWithTimeZone: (date: string | Date) =>
    dateFormatter({
      date,
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      timeZoneName: "short",
    }),

  /**
   * ISO date format (YYYY-MM-DD)
   * Useful for data exchange and sorting
   *
   * @param date - The date to format
   * @returns Formatted date string
   *
   * @example
   * // ISO date format
   * dateFormatters.isoDate('2023-04-15');
   * // Output: "2023-04-15"
   */
  isoDate: (date: string | Date) => {
    const d = date instanceof Date ? date : new Date(date);
    if (isNaN(d.getTime())) return "Invalid date";
    return d.toISOString().split("T")[0];
  },

  /**
   * Format date in a specific timezone
   *
   * @param date - The date to format
   * @param tz - The timezone to use (e.g., 'America/New_York', 'Europe/London')
   * @returns Formatted date string
   *
   * @example
   * // Date in a specific timezone
   * dateFormatters.inTimezone('2023-04-15', 'America/New_York');
   * // Output: "April 15, 2023" (as it would appear in New York)
   */
  inTimezone: (date: string | Date, tz: string) =>
    dateFormatter({
      date,
      month: "long",
      day: "numeric",
      year: "numeric",
      timeZone: tz,
    }),

  /**
   * Format the complete date with all options
   *
   * @param date - The date to format
   * @returns Formatted date string with all details
   *
   * @example
   * // Ultimate date with all details
   * dateFormatters.ultimateDate('2023-04-15T14:30:45');
   * // Output: "Saturday, April 15, 2023, 2:30:45 PM Coordinated Universal Time"
   */
  ultimateDate: (date: string | Date) =>
    dateFormatter({
      date,
      weekday: "long",
      era: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      timeZoneName: "long",
      timeZone: "UTC",
    }),

  /**
   * Format using the 'full' dateStyle (Saturday, April 15, 2023)
   *
   * @param date - The date to format
   * @returns Formatted date string using 'full' style
   *
   * @example
   * // Full style date
   * dateFormatters.fullStyle('2023-04-15');
   * // Output: "Saturday, April 15, 2023"
   */
  fullStyle: (date: string | Date) =>
    dateFormatter({
      date,
      formatStyle: "full",
    }),

  /**
   * Format using the 'long' dateStyle (April 15, 2023)
   *
   * @param date - The date to format
   * @returns Formatted date string using 'long' style
   *
   * @example
   * // Long style date
   * dateFormatters.longStyle('2023-04-15');
   * // Output: "April 15, 2023"
   */
  longStyle: (date: string | Date) =>
    dateFormatter({
      date,
      formatStyle: "long",
    }),

  /**
   * Format using the 'medium' dateStyle (Apr 15, 2023)
   *
   * @param date - The date to format
   * @returns Formatted date string using 'medium' style
   *
   * @example
   * // Medium style date
   * dateFormatters.mediumStyle('2023-04-15');
   * // Output: "Apr 15, 2023"
   */
  mediumStyle: (date: string | Date) =>
    dateFormatter({
      date,
      formatStyle: "medium",
    }),

  /**
   * Format using the 'short' dateStyle (4/15/23)
   *
   * @param date - The date to format
   * @returns Formatted date string using 'short' style
   *
   * @example
   * // Short style date
   * dateFormatters.shortStyle('2023-04-15');
   * // Output: "4/15/23"
   */
  shortStyle: (date: string | Date) =>
    dateFormatter({
      date,
      formatStyle: "short",
    }),
};
