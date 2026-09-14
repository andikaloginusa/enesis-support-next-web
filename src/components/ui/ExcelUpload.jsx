/**
 * ExcelUpload — Shared Excel Upload Utilities
 *
 * Centralized file validation and reusable upload components for all
 * Excel-based bulk upload modals across the application.
 *
 * Usage:
 *   import { validateExcelFile, ExcelUploadField } from "@/components/ui/ExcelUpload";
 */

import React, {
  useCallback,
  useId,
} from "react";
import PropTypes from "prop-types";
import { Upload, App } from "antd";
import {
  InboxOutlined,
  FileExcelOutlined,
  CloseCircleFilled,
} from "@ant-design/icons";

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

export const EXCEL_ALLOWED_EXTS = [".xlsx", ".xls"];

export const EXCEL_ALLOWED_MIMES = [
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
];

export const EXCEL_MAX_SIZE_MB = 50;
export const EXCEL_MAX_SIZE_BYTES = EXCEL_MAX_SIZE_MB * 1024 * 1024;

// ─────────────────────────────────────────────────────────────────────────────
// Pure File Validation
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Validate an Excel file for bulk upload.
 *
 * Checks: presence, extension, MIME type, and file size.
 *
 * @param {File | null | undefined} file
 * @param {Object} [options]
 * @param {string[]} [options.allowedExts] - Override accepted extensions (default: .xlsx, .xls)
 * @param {number}  [options.maxSizeBytes] - Override max size in bytes (default: 50 MB)
 * @returns {{ ok: true } | { ok: false, message: string }}
 */
export function validateExcelFile(
  file,
  {
    allowedExts = EXCEL_ALLOWED_EXTS,
    maxSizeBytes = EXCEL_MAX_SIZE_BYTES,
  } = {},
) {
  if (!file) {
    return { ok: false, message: "File tidak ditemukan." };
  }

  const ext =
    file.name.lastIndexOf(".") < 0
      ? ""
      : file.name.slice(file.name.lastIndexOf(".")).toLowerCase();

  if (!allowedExts.includes(ext)) {
    return {
      ok: false,
      message: `Format file tidak didukung. Hanya ${allowedExts.join(", ")} yang diterima.`,
    };
  }

  if (
    !EXCEL_ALLOWED_MIMES.includes(file.type) &&
    file.type !== "application/octet-stream"
  ) {
    return { ok: false, message: "Format file tidak valid." };
  }

  if (file.size > maxSizeBytes) {
    return {
      ok: false,
      message: `Ukuran file melebihi batas maksimum (${EXCEL_MAX_SIZE_MB} MB).`,
    };
  }

  return { ok: true };
}

// ─────────────────────────────────────────────────────────────────────────────
// ExcelUploadField — Reusable Drag-and-Drop Component
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Standalone drag-and-drop Excel upload field.
 *
 * - Prevents auto-upload — file is held until the parent form submits
 * - Validates extension, MIME type, and size via `validateExcelFile`
 * - Shows an inline error message below the drop zone
 * - Reusable — import from this file for any Excel upload modal
 *
 * @param {Object}    [props]
 * @param {File|null} [props.value]            - Currently selected file
 * @param {Function}  [props.onChange]        - Called with `File | null` when file changes
 * @param {string}    [props.error]           - Error message to display below the zone
 * @param {string}    [props.placeholder]
 * @param {string}    [props.hint]
 * @param {string}    [props.accept]          - Override accepted extensions (default: .xlsx,.xls)
 * @param {Object}    [props.validateOptions] - Options forwarded to `validateExcelFile`
 * @param {string}    [props.className]
 */
export function ExcelUploadField({
  value = null,
  onChange,
  error,
  placeholder = "Klik atau tarik file Excel ke sini",
  hint = `Format: ${EXCEL_ALLOWED_EXTS.join(", ")} · Maks. ${EXCEL_MAX_SIZE_MB} MB`,
  accept = EXCEL_ALLOWED_EXTS.join(","),
  validateOptions,
  className,
}) {
  const { notification } = App.useApp();
  const fieldId = useId();
  const internalFile = value;

  const handleBeforeUpload = useCallback(
    (file) => {
      const result = validateExcelFile(file, validateOptions);
      if (!result.ok) {
        notification.error({
          title: "File tidak valid",
          description: result.message,
          key: fieldId,
        });
        return Upload.LIST_IGNORE;
      }
      onChange?.(file);
      return false; // hold — no auto-upload
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onChange, notification, fieldId],
  );

  const handleRemove = useCallback(() => {
    onChange?.(null);
    return false; // prevent Ant Upload's default removal
  }, [onChange]);

  return (
    <div className={className}>
      <Upload.Dragger
        accept={accept}
        maxCount={1}
        fileList={
          internalFile
            ? [{ uid: "-1", name: internalFile.name, status: "done" }]
            : []
        }
        beforeUpload={handleBeforeUpload}
        onRemove={handleRemove}
        showUploadList={{
          showRemoveIcon: true,
          removeIcon: (
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-red-50 hover:bg-red-100 transition-colors">
              <CloseCircleFilled className="text-red-400 text-xs" />
            </span>
          ),
        }}
        itemRender={(_origin, file) => (
          <div className="flex items-center gap-3 w-full px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl my-2">
            <FileExcelOutlined className="text-emerald-600 text-lg flex-shrink-0" />
            <span className="text-emerald-700 text-sm font-medium truncate flex-1">
              {file.name}
            </span>
            <span className="text-emerald-400 text-xs flex-shrink-0">
              {((internalFile?.size ?? 0) / 1024).toFixed(0)} KB
            </span>
          </div>
        )}
        className="[&_.ant-upload-drag]:border-dashed [&_.ant-upload-drag]:border-slate-200 [&_.ant-upload-drag:hover]:border-emerald-400 [&_.ant-upload-drag]:rounded-xl [&_.ant-upload-drag]:bg-slate-50/60 [&_.ant-upload-drag]:py-6 [&_.ant-upload-drag]:transition-colors [&_.ant-upload-drag:hover]:bg-emerald-50/30"
      >
        <p className="ant-upload-drag-icon mb-3">
          <InboxOutlined className="text-emerald-500 text-3xl" />
        </p>
        <p className="ant-upload-text font-medium text-slate-600 text-sm">
          {placeholder}
        </p>
        <p className="ant-upload-hint text-slate-400 text-xs mt-1">{hint}</p>
      </Upload.Dragger>

      {error && (
        <p className="text-red-500 text-xs mt-1.5 pl-1">{error}</p>
      )}
    </div>
  );
}

ExcelUploadField.propTypes = {
  value: PropTypes.instanceOf(File),
  onChange: PropTypes.func,
  error: PropTypes.string,
  placeholder: PropTypes.string,
  hint: PropTypes.string,
  accept: PropTypes.string,
  validateOptions: PropTypes.object,
  className: PropTypes.string,
};
