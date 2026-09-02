/**
 * useNotify — Centralized notification hook
 *
 * DRYs up the repetitive `notification.success/error` boilerplate
 * across all React Query mutation hooks.
 *
 * Usage:
 *   const { notifySuccess, notifyError } = useNotify();
 *   notifySuccess(message, description, duration);
 *   notifyError(message, description, duration);
 */

import { App } from "antd";
import {
  NOTIF_DURATION_SHORT,
  NOTIF_DURATION_MEDIUM,
  NOTIF_DURATION_LONG,
} from "./constants";

const useNotification = () => App.useApp().notification;

export const useNotify = () => {
  const { success, error, warning, info } = useNotification();

  const notifySuccess = (message, description, duration = NOTIF_DURATION_SHORT) =>
    success({ message, description, duration });

  const notifyError = (message, description, duration = NOTIF_DURATION_MEDIUM) =>
    error({ message, description, duration });

  const notifyWarning = (message, description, duration = NOTIF_DURATION_MEDIUM) =>
    warning({ message, description, duration });

  const notifyInfo = (message, description, duration = NOTIF_DURATION_MEDIUM) =>
    info({ message, description, duration });

  return { notifySuccess, notifyError, notifyWarning, notifyInfo };
};

export { NOTIF_DURATION_SHORT, NOTIF_DURATION_MEDIUM, NOTIF_DURATION_LONG };
