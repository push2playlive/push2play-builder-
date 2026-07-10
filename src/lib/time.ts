/**
 * Formats a given timestamp, date, or relative time string into a compact relative time format (e.g., '2m ago', '1h ago', 'just now').
 */
export function getRelativeTime(input: string | number | Date | undefined | null): string {
  if (!input) return 'just now';

  // Case 1: If it's a number (unix timestamp)
  if (typeof input === 'number') {
    return formatFromTimestamp(input);
  }

  // Case 2: If it's a Date object
  if (input instanceof Date) {
    return formatFromTimestamp(input.getTime());
  }

  // Case 3: If it's a string, check if it's an ISO date or a numeric timestamp string
  const str = String(input).trim();
  
  // Check if it represents a number
  if (/^\d+$/.test(str)) {
    return formatFromTimestamp(parseInt(str, 10));
  }

  // Check if it's a valid ISO / Date string
  const parsedDate = Date.parse(str);
  if (!isNaN(parsedDate) && str.includes('-') && (str.includes('T') || str.length >= 10)) {
    return formatFromTimestamp(parsedDate);
  }

  // Case 4: It's an existing mock string like "2 hours ago", "Yesterday", etc.
  // Normalize existing human relative phrases to the compact format requested (e.g. '2m ago', '1h ago')
  const lower = str.toLowerCase();
  if (lower === 'just now' || lower === 'now') {
    return 'just now';
  }
  if (lower === 'yesterday') {
    return '1d ago';
  }

  // Match pattern e.g., "3 days ago" or "2 hours" or "5m"
  const match = lower.match(/^(\d+)\s*(minute|min|m|hour|hr|h|day|d|week|wk|w|month|mo|year|y)s?(\s+ago)?$/);
  if (match) {
    const value = match[1];
    const unit = match[2];
    
    if (unit.startsWith('min') || unit === 'm') {
      return `${value}m ago`;
    }
    if (unit.startsWith('hour') || unit.startsWith('hr') || unit === 'h') {
      return `${value}h ago`;
    }
    if (unit.startsWith('day') || unit === 'd') {
      return `${value}d ago`;
    }
    if (unit.startsWith('week') || unit.startsWith('wk') || unit === 'w') {
      return `${value}w ago`;
    }
    if (unit.startsWith('month') || unit === 'mo') {
      return `${value}mo ago`;
    }
    if (unit.startsWith('year') || unit === 'y') {
      return `${value}y ago`;
    }
  }

  // Fallback
  return str;
}

function formatFromTimestamp(timestampMs: number): string {
  const diffInSeconds = Math.floor((Date.now() - timestampMs) / 1000);
  
  if (diffInSeconds < 30) {
    return 'just now';
  }
  if (diffInSeconds < 60) {
    return `${diffInSeconds}s ago`;
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  }
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks}w ago`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths}mo ago`;
  }
  
  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears}y ago`;
}
