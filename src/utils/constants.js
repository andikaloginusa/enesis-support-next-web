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
  PASSWORD_EXPIRED: 302,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
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
