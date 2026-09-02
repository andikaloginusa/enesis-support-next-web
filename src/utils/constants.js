/**
 * App-wide Constants
 *
 * Centralized location for magic numbers, default values, and string
 * identifiers used across the application. Import from here rather than
 * defining inline values in multiple files.
 */

// ─────────────────────────────────────────────
// Pagination Defaults
// ─────────────────────────────────────────────
export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = ["10", "20", "50", "100"];

// ─────────────────────────────────────────────
// HTTP / API Status
// ─────────────────────────────────────────────
export const HTTP_STATUS = {
  OK: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
  SESSION_EXPIRED: 302,
};

// ─────────────────────────────────────────────
// User Roles
// ─────────────────────────────────────────────
export const USER_ROLES = {
  DISTRIBUTOR: "DISTRIBUTOR",
  TRANSPORTER: "TRANSPORTER",
  VENDOR: "VENDOR",
};

// ─────────────────────────────────────────────
// Route Paths
// ─────────────────────────────────────────────
export const ROUTES = {
  LOGIN: "/auth/login-1",
  HOME: "/",
  RESET_PASSWORD: "/reset-password",
  DISTRIBUTOR_HOME: "/distributor/home",
  TRANSPORTER_HOME: "/transporter/home",
  VENDOR_HOME: "/vendor/home",
};

// ─────────────────────────────────────────────
// Cookie / Session
// ─────────────────────────────────────────────
/** Cookie max-age in seconds: 24 hours */
export const SESSION_COOKIE_MAX_AGE = 86400;
export const SESSION_COOKIE_NAME = "user_token";

// ─────────────────────────────────────────────
// Notification Durations (seconds)
// ─────────────────────────────────────────────
/** Short — for quick, low-priority confirmations */
export const NOTIF_DURATION_SHORT = 2;
/** Medium — for standard success/error notifications */
export const NOTIF_DURATION_MEDIUM = 3;
/** Long — for batch operations (uploads, bulk processes) */
export const NOTIF_DURATION_LONG = 4;

// ─────────────────────────────────────────────
// Brand Colors
// ─────────────────────────────────────────────
/** Primary brand accent (emerald green) */
export const BRAND_COLOR = "#1aac32";
/** Focus ring color used on form inputs (matches brand accent) */
export const BRAND_FOCUS_COLOR = "#1aac32";

// ─────────────────────────────────────────────
// UI Notification Message Templates
// ─────────────────────────────────────────────
export const NOTIF_MESSAGES = {
  // Generic
  SUCCESS: "Sukses",
  ERROR: "Error",

  // Klaim
  DELETE_LOG_SUCCESS: "Log Submit Berhasil Dihapus",
  DELETE_LOG_ERROR: "Log Submit Gagal Dihapus",
  UPDATE_STATUS_SUCCESS: "Status Klaim Berhasil Diperbarui",
  UPDATE_STATUS_ERROR: "Gagal Memperbarui Status Klaim",
  FETCH_CLAIMS_ERROR: "Gagal mengambil daftar klaim",

  // FKR
  REJECT_SUCCESS: "Reject Berhasil",
  REJECT_ERROR: "Reject Gagal",
  APPROVAL_UPDATE_SUCCESS: "Approval Berhasil Diperbarui",
  APPROVAL_UPDATE_ERROR: "Gagal Memperbarui Approval",
  FETCH_FKR_ERROR: "Gagal mengambil daftar FKR",
  FETCH_FKR_DETAIL_ERROR: "Gagal mengambil detail FKR",
  REUPLOAD_DOCUMENT_SUCCESS: "Re-Upload Dokumen Berhasil",
  REUPLOAD_DOCUMENT_ERROR: "Gagal Re-Upload Dokumen",

  // Proposal
  UPDATE_PROPOSAL_SUCCESS: "Data Proposal Berhasil Diperbarui",
  UPDATE_PROPOSAL_ERROR: "Gagal Memperbarui Data Proposal",
  DELEGASI_SUCCESS: "Delegasi Berhasil",
  DELEGASI_ERROR: "Delegasi Gagal",
  EMAIL_RESEND_SUCCESS: (count) =>
    `Berhasil mengirim ulang email untuk ${count} proposal`,
  EMAIL_RESEND_ERROR: "Gagal Mengirim Ulang Email",
  UPLOAD_EMAIL_ERROR: "Upload Gagal",
  REVERSAL_SUCCESS: "Reversal Internasional Berhasil",
  REVERSAL_ERROR: "Gagal Memproses Reversal Internasional",
  FETCH_PROPOSAL_ERROR: "Gagal mengambil daftar proposal",
  FETCH_PROPOSAL_DETAIL_ERROR: "Gagal mengambil detail proposal",

  // Generic fallbacks
  GENERIC_SUCCESS: "Operasi berhasil",
  GENERIC_ERROR: "Terjadi kesalahan. Silakan coba lagi.",
  FETCH_ERROR: "Gagal mengambil data",
};

// ─────────────────────────────────────────────
// API Action Labels (for console tags)
// ─────────────────────────────────────────────
export const API_LABELS = {
  FKR: "[useFkr]",
  KLAIM: "[useKlaim]",
  PROPOSAL: "[useProposal]",
};
