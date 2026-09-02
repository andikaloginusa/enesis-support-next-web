import moment from "moment";

/**
 * Format a numeric value into Indonesian Rupiah currency string.
 * Returns "-" for null or undefined values.
 */
export function formatCurrency(val) {
  if (val === null || val === undefined) return "-";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(val);
}

/**
 * Format a date string into a readable date.
 * Returns "-" for empty or falsy values.
 */
export function formatDate(dateStr) {
  if (!dateStr) return "-";
  return moment(dateStr).format("DD MMM YYYY");
}

/**
 * Format a date string with time into a readable datetime.
 * Returns "-" for empty or falsy values.
 */
export function formatDateTime(dateStr) {
  if (!dateStr) return "-";
  return moment(dateStr).format("DD MMM YYYY, HH:mm");
}

/**
 * Format file size into human-readable string.
 */
export function formatFileSize(bytes) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  let size = bytes;
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024;
    i++;
  }
  return `${size.toFixed(1)} ${units[i]}`;
}
