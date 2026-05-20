"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { App, Row, Col } from "antd";
import { ExclamationCircleFilled, CheckCircleOutlined } from "@ant-design/icons";
import moment from "moment";
import { authService } from "@/services";

/**
 * Modern Custom Hook for Authentication
 * Encapsulates login, logout, role redirection, password expiration, 
 * local storage synchronization, and premium Antd dialog notification feedback.
 * 
 * Uses App.useApp() to safely consume the theme context for modals.
 */
export function useAuth() {
  const router = useRouter();
  const { modal } = App.useApp();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Logs in a user using credentials.
   * Mirrors the signinUser logic but built with React state and Next.js router.
   * 
   * @param {Object} credentials - { username, password }
   */
  const login = async (credentials) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.login(credentials);

      if (response && response.ok) {
        const responseData = response.data || {};

        // 1. Password Expired / Warning case (Status 302)
        if (responseData.status === "302" || responseData.status === 302) {
          modal.error({
            centered: true,
            icon: <ExclamationCircleFilled />,
            okType: "danger",
            title: (
              <Row style={{ alignItems: "center" }}>
                <Col>
                  <span>Warning !</span>
                </Col>
              </Row>
            ),
            content: (
              <div>
                <p>
                  {responseData.message ||
                    "Your password has expired, you must change it."}
                </p>
              </div>
            ),
            onOk() {
              const credent = {
                ...responseData.result,
                accessToken: response.headers?.["x-auth-token"] || "",
              };
              const credentWithLoginTime = {
                ...credent,
                logintime: moment().format("YYYY-MM-DD HH:mm:ss"),
              };
              
              localStorage.setItem("change_credent", JSON.stringify(credentWithLoginTime));
              router.push("/reset-password");
            },
          });
          setIsLoading(false);
          return;
        }

        // 2. Normal Success: Find token defensively
        const result = responseData.result || responseData || {};
        const accessToken = result.data?.access_token || "";

        if (!accessToken) {
          modal.error({
            centered: true,
            icon: <ExclamationCircleFilled />,
            okType: "danger",
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
          setIsLoading(false);
          return;
        }

        // 3. Save user info to localStorage and set a secure cookie for server-side Middleware guarding
        const credentWithLoginTime = {
          ...result.data,
          logintime: moment().format("YYYY-MM-DD HH:mm:ss"),
        };
        
        localStorage.setItem("user_credent", JSON.stringify(credentWithLoginTime));
        document.cookie = `user_token=${accessToken}; path=/; max-age=86400; SameSite=Lax`;

        // 4. Role-based Redirection
        const roleName = result.roles?.[0]?.nama || result.roles?.[0]?.name || "";
        
        if (roleName === "DISTRIBUTOR") {
          router.push("/distributor/home");
        } else if (roleName === "TRANSPORTER") {
          router.push("/transporter/home");
        } else if (result.is_vendor || roleName === "VENDOR") {
          router.push("/vendor/home");
        } else {
          router.push("/");
        }

      } else {
        // 5. Handling failures: Locked Out / Attempts remaining
        const resData = response?.data || {};
        const remainingAttempt = resData.result?.remaining_attempt;
        const lockoutSeconds = resData.result?.lockout_seconds;

        if (lockoutSeconds) {
          modal.error({
            centered: true,
            icon: <ExclamationCircleFilled />,
            okType: "danger",
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
        } else {
          const errMsg = resData.message || response?.problem || "Login failed";
          setError(errMsg);
          
          modal.error({
            centered: true,
            icon: <ExclamationCircleFilled />,
            okType: "danger",
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
        }
      }
    } catch (err) {
      console.error("Login error:", err);
      const errMsg = err.message || "An unexpected error occurred during login.";
      setError(errMsg);
      
      modal.error({
        centered: true,
        icon: <ExclamationCircleFilled />,
        okType: "danger",
        title: "Login Failed",
        content: <p>{errMsg}</p>,
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logs out a user, deletes session credentials, and hits signout endpoint.
   */
  const logout = async () => {
    setIsLoading(true);
    
    try {
      let m_user_id = "";
      const credsStr = localStorage.getItem("user_credent");
      if (credsStr) {
        const creds = JSON.parse(credsStr);
        m_user_id = creds.m_user_id || creds.id || "";
      }

      const response = await authService.logout({ m_user_id });

      if (response && response.ok && !response.data?.error) {
        modal.success({
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

        localStorage.removeItem("user_credent");
        document.cookie = "user_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        router.push("/auth/login-1");
      } else {
        modal.error({
          centered: true,
          icon: <ExclamationCircleFilled />,
          okType: "danger",
          title: (
            <Row style={{ alignItems: "center" }} gutter={[5, 0]}>
              <Col>
                <span>Logout Gagal</span>
              </Col>
            </Row>
          ),
          content: (
            <div>
              <p>Maaf Anda Gagal Logout</p>
            </div>
          ),
        });
      }
    } catch (err) {
      console.error("Logout error:", err);
      modal.error({
        centered: true,
        icon: <ExclamationCircleFilled />,
        okType: "danger",
        title: "Logout Error",
        content: <p>{err.message || "An unexpected error occurred during logout."}</p>,
      });
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
