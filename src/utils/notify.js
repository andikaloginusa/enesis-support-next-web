/**
 * useNotify — Centralized notification hook
 *
 * DRYs up the repetitive `notification.success/error` boilerplate
 * across all React Query mutation hooks.
 *
 * Usage:
 *   const { notifySuccess, notifyError } = useNotify();
 *   notifySuccess(title, description, duration);
 *   notifyError(title, description, duration);
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

  const notifySuccess = (title, description, duration = NOTIF_DURATION_SHORT) =>
    success({ title, description, duration });

  const notifyError = (title, description, duration = NOTIF_DURATION_MEDIUM) =>
    error({ title, description, duration });

  const notifyWarning = (title, description, duration = NOTIF_DURATION_MEDIUM) =>
    warning({ title, description, duration });

  const notifyInfo = (title, description, duration = NOTIF_DURATION_MEDIUM) =>
    info({ title, description, duration });

  return { notifySuccess, notifyError, notifyWarning, notifyInfo };
};

export { NOTIF_DURATION_SHORT, NOTIF_DURATION_MEDIUM, NOTIF_DURATION_LONG };
