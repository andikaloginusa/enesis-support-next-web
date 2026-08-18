import { Row, Col } from "antd";
import { ExclamationCircleFilled, CheckCircleOutlined } from "@ant-design/icons";

/**
 * Auth Modal Configurations
 *
 * Contains all JSX modal content and Ant Design modal config objects
 * used by `useAuth.js`. Separating presentation markup from hook logic
 * follows the Single Responsibility Principle — the hook owns business
 * logic, this module owns the modal presentation.
 *
 * All functions return a plain config object compatible with
 * Ant Design's `modal.error()` / `modal.success()` API.
 */

// ─────────────────────────────────────────────
// Shared Modal Defaults
// ─────────────────────────────────────────────

const defaultErrorProps = {
  centered: true,
  icon: <ExclamationCircleFilled />,
  okType: "danger",
};

// ─────────────────────────────────────────────
// Login Modal Configs
// ─────────────────────────────────────────────

/**
 * Modal config for when the user's password has expired (HTTP 302).
 * @param {string} [message] - Custom message from API
 */
export const buildPasswordExpiredModal = (message) => ({
  ...defaultErrorProps,
  title: (
    <Row style={{ alignItems: "center" }}>
      <Col>
        <span>Warning !</span>
      </Col>
    </Row>
  ),
  content: (
    <div>
      <p>{message || "Your password has expired, you must change it."}</p>
    </div>
  ),
});

/**
 * Modal config for when login succeeds but no access token is returned.
 */
export const buildTokenMissingModal = () => ({
  ...defaultErrorProps,
  title: (
    <Row style={{ alignItems: "center" }}>
      <Col>
        <span>Warning !</span>
      </Col>
    </Row>
  ),
  content: (
    <div>
      <p>Login Failed, token not found !</p>
    </div>
  ),
});

/**
 * Modal config for when the user is temporarily locked out due to too many attempts.
 * @param {number} lockoutSeconds - Seconds remaining until lockout expires
 */
export const buildLockoutModal = (lockoutSeconds) => ({
  ...defaultErrorProps,
  title: (
    <Row style={{ alignItems: "center" }}>
      <Col>
        <span>Locked Out</span>
      </Col>
    </Row>
  ),
  content: (
    <div>
      <p>{`Too many attempts. Try again after ${lockoutSeconds} seconds.`}</p>
    </div>
  ),
});

/**
 * Modal config for a generic login credential error.
 * @param {string} errMsg - Error message from API or fallback
 * @param {number} [remainingAttempt] - Remaining login attempts, if provided by API
 */
export const buildLoginErrorModal = (errMsg, remainingAttempt) => ({
  ...defaultErrorProps,
  title: (
    <Row style={{ alignItems: "center" }}>
      <Col>
        <span>Warning !</span>
      </Col>
    </Row>
  ),
  content: (
    <div>
      <p>{errMsg}</p>
      {typeof remainingAttempt !== "undefined" && (
        <p className="mt-2 font-medium text-amber-600">
          Remaining attempts: {remainingAttempt}
        </p>
      )}
    </div>
  ),
});

// ─────────────────────────────────────────────
// Logout Modal Configs
// ─────────────────────────────────────────────

/**
 * Modal config for successful logout.
 */
export const buildLogoutSuccessModal = () => ({
  centered: true,
  icon: <CheckCircleOutlined />,
  okType: "primary",
  title: (
    <Row style={{ alignItems: "center" }} gutter={[5, 0]}>
      <Col>
        <span>Logout Berhasil</span>
      </Col>
    </Row>
  ),
  content: (
    <div>
      <p>Selamat Anda Sudah Berhasil Logout</p>
    </div>
  ),
});

/**
 * Modal config for failed logout.
 * @param {string} [message] - Optional specific error message
 */
export const buildLogoutErrorModal = (message) => ({
  ...defaultErrorProps,
  title: (
    <Row style={{ alignItems: "center" }} gutter={[5, 0]}>
      <Col>
        <span>Logout Gagal</span>
      </Col>
    </Row>
  ),
  content: (
    <div>
      <p>{message || "Maaf Anda Gagal Logout"}</p>
    </div>
  ),
});
