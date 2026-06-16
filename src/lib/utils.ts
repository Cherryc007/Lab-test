/**
 * GuardOn — Utility Helpers
 */

/**
 * Generates a random UUID (mock/fallback for environment support).
 */
export function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

/**
 * Formats a Date object or ISO string into a readable string.
 */
export function formatDate(dateInput: Date | string): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return 'Invalid Date';
  return date.toLocaleString();
}

/**
 * Utility for combining Tailwind classes (placeholder/stub).
 */
export function cn(...inputs: any[]): string {
  return inputs.filter(Boolean).join(' ');
}
