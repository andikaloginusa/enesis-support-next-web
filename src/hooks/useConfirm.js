import { App } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import React from "react";

/**
 * useConfirm — Reusable hook for last-step confirmation dialogs.
 *
 * Wraps Ant Design's `modal.confirm` with a consistent, branded style.
 * Use this before *any* non-GET mutation (create, update, delete) to give
 * the user one final chance to review and cancel their action.
 *
 * Must be called inside a component wrapped by `<App>` (already provided
 * by the global AppProvider in this project).
 *
 * @returns {{ confirmAction: (options: ConfirmOptions) => void }}
 *
 * @example
 * const { confirmAction } = useConfirm();
 *
 * const handleSubmit = async () => {
 *   const values = await form.validateFields();
 *   confirmAction({
 *     title: "Konfirmasi Update Status Klaim",
 *     description: "Apakah Anda yakin ingin mengubah status klaim ini? Tindakan ini akan langsung tercatat ke sistem.",
 *     onConfirm: async () => {
 *       await updateStatusKlaim({ ...values });
 *       closeModal();
 *     },
 *     danger: true,
 *   });
 * };
 *
 * @typedef {Object} ConfirmOptions
 * @property {string}       title        - Short action title, e.g. "Konfirmasi Reject CMO"
 * @property {string}       description  - Context-specific warning describing what will happen
 * @property {() => Promise<void>} onConfirm - Async callback executed on user confirmation
 * @property {string}       [okText]     - Override OK button label (default: "Ya, Lanjutkan")
 * @property {string}       [cancelText] - Override Cancel label (default: "Batal")
 * @property {boolean}      [danger]     - If true, renders the OK button in red (default: false)
 */
export const useConfirm = () => {
  const { modal } = App.useApp();

  /**
   * Trigger a modal.confirm dialog with contextual title & description.
   * Execution of `onConfirm` only proceeds when the user explicitly clicks OK.
   *
   * @param {ConfirmOptions} options
   */
  const confirmAction = ({
    title,
    description,
    onConfirm,
    okText = "Ya, Lanjutkan",
    cancelText = "Batal",
    danger = false,
  }) => {
    modal.confirm({
      title,
      icon: React.createElement(ExclamationCircleOutlined, {
        style: { color: danger ? "#ef4444" : "#f59e0b" },
      }),
      content: description,
      okText,
      cancelText,
      okButtonProps: {
        danger,
        size: "middle",
      },
      cancelButtonProps: { size: "middle" },
      onOk: onConfirm,
      // Prevent accidental close by clicking outside
      maskClosable: false,
    });
  };

  return { confirmAction };
};
