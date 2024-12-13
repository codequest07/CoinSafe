/**
 * Utility functions to convert Solidity timestamps to human-readable dates
 */

type FormatType = 'full' | 'date' | 'time' | 'iso';

interface FormatterOptions {
  format?: FormatType;
  timezone?: 'local' | 'UTC';
  locale?: string;
}

/**
 * Convert a Solidity timestamp to human readable date and time
 * @param {number} timestamp - Solidity timestamp in seconds
 * @param {FormatterOptions} options - Formatting options
 * @returns {string} Formatted date string
 */
export const formatTimestamp = (
  timestamp: number,
  {
    format = 'full',
    timezone = 'local',
    locale = 'en-US'
  }: FormatterOptions = {}
): string => {
  // Convert Solidity timestamp (seconds) to JS timestamp (milliseconds)
  const date = new Date(timestamp * 1000);
  
  // Default formatting options
  const defaultOptions = {
    full: {
      year: 'numeric' as const,
      month: 'long' as const,
      day: 'numeric' as const,
      hour: '2-digit' as const,
      minute: '2-digit' as const,
      second: '2-digit' as const,
      timeZoneName: 'short' as const
    },
    date: {
      year: 'numeric' as const,
      month: 'long' as const,
      day: 'numeric' as const
    },
    time: {
      hour: '2-digit' as const,
      minute: '2-digit' as const,
      second: '2-digit' as const,
      timeZoneName: 'short' as const
    }
  };

  // Handle different format types
  switch (format) {
    case 'iso':
      return date.toISOString();
    case 'date':
    case 'time':
    case 'full':
      return date.toLocaleString(locale, {
        ...defaultOptions[format],
        timeZone: timezone === 'UTC' ? 'UTC' : undefined
      });
    default:
      throw new Error('Invalid format specified');
  }
};

// Example usage:
/*
// Default full format in local timezone
formatSolidityTimestamp(1693526400);
// Output: "September 1, 2023, 12:00:00 AM EDT"

// Date only
formatSolidityTimestamp(1693526400, { format: 'date' });
// Output: "September 1, 2023"

// Time only in UTC
formatSolidityTimestamp(1693526400, { format: 'time', timezone: 'UTC' });
// Output: "12:00:00 AM UTC"

// ISO format
formatSolidityTimestamp(1693526400, { format: 'iso' });
// Output: "2023-09-01T00:00:00.000Z"

// Different locale
formatSolidityTimestamp(1693526400, { locale: 'fr-FR' });
// Output: "1 septembre 2023 à 00:00:00 UTC−4"
*/