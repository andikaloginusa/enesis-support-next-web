"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { App } from "antd";
import moment from "moment";
import { authService } from "@/services";
import {
  getUserId,
  setUserCredentials,
  clearUserCredentials,
  setChangeCredentials,
  hasRole,
} from "@/utils/storage";
import { USER_ROLES, ROUTES, SESSION_COOKIE_NAME, SESSION_COOKIE_MAX_AGE, HTTP_STATUS } from "@/utils/constants";
import {
  buildPasswordExpiredModal,
  buildTokenMissingModal,
  buildLockoutModal,
  buildLoginErrorModal,
  buildLogoutSuccessModal,
  buildLogoutErrorModal,
} from "@/utils/authModalConfigs";


/**
 * useAuth — Authentication Hook
 *
 * Manages login, logout, role-based redirection, and session persistence.
 * All JSX modal content is delegated to `authModalConfigs.js` keeping this
 * hook free of presentation markup (Single Responsibility Principle).
 *
 * Uses App.useApp() to safely consume the Antd theme context for modals.
 */
export function useAuth() {
  const router = useRouter();
  const { modal } = App.useApp();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // ─────────────────────────────────────────────
  // Login
  // ─────────────────────────────────────────────

  /**
   * Authenticate user with credentials, handle role-based routing,
   * session persistence, and error feedback via modal dialogs.
   *
   * @param {{ username: string, password: string }} credentials
   */
  const login = async (credentials) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.login(credentials);

      if (response?.ok) {
        const responseData = response.data || {};

        // Case 1: Password Expired (Status 302) — prompt user before proceeding
        if (
          responseData.status === "302" ||
          responseData.status === HTTP_STATUS.SESSION_EXPIRED
        ) {
          modal.error({
            ...buildPasswordExpiredModal(responseData.message),
            onOk() {
              const credent = {
                ...responseData.result,
                accessToken: response.headers?.["x-auth-token"] || "",
              };
              setChangeCredentials({
                ...credent,
                logintime: moment().format("YYYY-MM-DD HH:mm:ss"),
              });
              router.push(ROUTES.RESET_PASSWORD);
            },
          });
          setIsLoading(false);
          return;
        }

        // Case 2: Normal Success — extract token
        const result = responseData.result || responseData || {};
        const accessToken = result.data?.access_token || "";

        if (!accessToken) {
          modal.error(buildTokenMissingModal());
          setIsLoading(false);
          return;
        }

        // Case 3: IT SUPPORT role gate — reject non-IT SUPPORT users before storing session
        const userRoles = result.roles || result.data?.roles || [];
        const isItSupportUser = Array.isArray(userRoles)
          ? userRoles.some((r) => r.nama === USER_ROLES.IT_SUPPORT)
          : false;

        if (!isItSupportUser) {
          modal.error({
            ...buildLoginErrorModal(
              "Anda tidak memiliki akses ke portal ini. Fitur IT Support hanya dapat digunakan oleh user dengan role IT SUPPORT."
            ),
            onOk() {
              router.push(ROUTES.LOGIN);
            },
          });
          setIsLoading(false);
          return;
        }

        // Case 4: Persist session — localStorage + secure cookie
        setUserCredentials({
          ...result.data,
          logintime: moment().format("YYYY-MM-DD HH:mm:ss"),
        });
        document.cookie = `${SESSION_COOKIE_NAME}=${accessToken}; path=/; max-age=${SESSION_COOKIE_MAX_AGE}; SameSite=Lax`;

        // Case 5: Role-based redirection
        const roleName = result.roles?.[0]?.nama || result.roles?.[0]?.name || "";
        if (roleName === USER_ROLES.DISTRIBUTOR) {
          router.push(ROUTES.DISTRIBUTOR_HOME);
        } else if (roleName === USER_ROLES.TRANSPORTER) {
          router.push(ROUTES.TRANSPORTER_HOME);
        } else if (result.is_vendor || roleName === USER_ROLES.VENDOR) {
          router.push(ROUTES.VENDOR_HOME);
        } else {
          router.push(ROUTES.HOME);
        }
      } else {
        // Case 6: API-level failure — lockout or credential error
        const resData = response?.data || {};
        const remainingAttempt = resData.result?.remaining_attempt;
        const lockoutSeconds = resData.result?.lockout_seconds;

        if (lockoutSeconds) {
          modal.error(buildLockoutModal(lockoutSeconds));
        } else {
          const errMsg = resData.message || response?.problem || "Login failed";
          setError(errMsg);
          modal.error(buildLoginErrorModal(errMsg, remainingAttempt));
        }
      }
    } catch (err) {
      console.error("[useAuth] Login error:", err);
      const errMsg = err.message || "An unexpected error occurred during login.";
      setError(errMsg);
      modal.error(buildLoginErrorModal(errMsg));
    } finally {
      setIsLoading(false);
    }
  };

  // ─────────────────────────────────────────────
  // Logout
  // ─────────────────────────────────────────────

  /**
   * Sign out the current user, clear session data, and redirect to login.
   */
  const logout = async () => {
    setIsLoading(true);

    try {
      const m_user_id = getUserId();
      const response = await authService.logout({ m_user_id });

      if (response?.ok && !response.data?.error) {
        // Clear session immediately and redirect — no extra OK-click needed
        clearUserCredentials();
        document.cookie = `${SESSION_COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        router.push(ROUTES.LOGIN);
      } else {
        modal.error(buildLogoutErrorModal());
      }
    } catch (err) {
      console.error("[useAuth] Logout error:", err);
      modal.error(buildLogoutErrorModal(err.message));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    login,
    logout,
    isLoading,
    error,
  };
}

