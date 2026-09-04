"use client";

import React, { useCallback, useRef } from "react";
import { Form, Modal, Typography, App, Button } from "antd";
import { InboxOutlined, DownloadOutlined } from "@ant-design/icons";
import { BRAND_FOCUS_COLOR } from "@/utils/constants";

const { Text } = Typography;

// ─── Static asset URL ──────────────────────────────────────────────────────────

/** URL to the official Excel template for FKR Pemusnahan bulk upload. */
const TEMPLATE_URL = "/templates/Template Upload Open FKR Pemusnahan.xlsx";

// ─── Validation constants ─────────────────────────────────────────────────────

const ALLOWED_EXTS = [".xlsx", ".xls"];
const ALLOWED_MIMES = [
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];
const MAX_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB

/**
 * Validate an Excel file for the FKR Pemusnahan upload.
 *
 * Returns `{ ok: true }` when valid; `{ ok: false, message }` otherwise.
 *
 * @param {File} file
 * @returns {{ ok: boolean, message?: string }}
 */
function validateExcelFile(file) {
  if (!file) return { ok: false, message: "File tidak ditemukan." };

  const ext = (() => {
    const idx = file.name.lastIndexOf(".");
    return idx < 0 ? "" : file.name.slice(idx).toLowerCase();
  })();

  if (!ALLOWED_EXTS.includes(ext)) {
    return {
      ok: false,
      message: `Format file tidak didukung. Hanya file ${ALLOWED_EXTS.join(", ")} yang diterima.`,
    };
  }

  if (!ALLOWED_MIMES.includes(file.type) && file.type !== "application/octet-stream") {
    return { ok: false, message: "Format file tidak valid." };
  }

  if (file.size > MAX_SIZE_BYTES) {
    return { ok: false, message: `Ukuran file melebihi batas maksimum (50 MB).` };
  }

  return { ok: true };
}

// ─── Field definitions ────────────────────────────────────────────────────────

/**
 * Build the field schema for the Pemusnahan upload form.
 * Extracted as a pure function so the same schema can be tested in isolation.
 *
 * @param {Object} handlers - Live event handlers bound by the component
 * @returns {Array<Object>} Form field definitions
 */
export function buildPemusnahanFields({ onFileChange }) {
  return [
    {
      name: "excel",
      label: "File Excel",
      type: "excel-upload",
      placeholder: "Klik atau seret file Excel ke sini",
      hint: (
        <span className="text-slate-400 text-xs">
          Format: .xls, .xlsx &nbsp;&middot;&nbsp; Maks. 50 MB
        </span>
      ),
      onFileChange,
    },
    {
      name: "reason",
      label: "Nomor Work Order (WO)",
      type: "text",
      placeholder: "Masukkan nomor WO",
      rules: [
        { required: true, message: "Nomor WO wajib diisi." },
        {
          validator: (_, value) =>
            value && value.trim().length > 0
              ? Promise.resolve()
              : Promise.reject(new Error("Nomor WO tidak boleh kosong.")),
        },
      ],
    },
  ];
}

// ─── Excel Upload Renderer ────────────────────────────────────────────────────

/**
 * Renders the Excel drag-and-drop upload zone.
 * Extracted as a standalone renderer so it can be composed inside a Form.Item
 * without sharing state with the generic FieldRenderer.
 *
 * @param {Object}  props
 * @param {Array}   props.value         - Current file list (Ant Upload convention)
 * @param {Function} props.onChange      - Called with the new file list
 * @param {Function} props.onFileChange  - Called with the raw File object on valid selection
 * @param {string}   props.placeholder
 * @param {React.ReactNode} props.hint
 */
export function ExcelUploadField({ value = [], onChange, onFileChange, placeholder, hint }) {
  const { notification } = App.useApp();

  const handleBeforeUpload = useCallback(
    (file) => {
      const result = validateExcelFile(file);
      if (!result.ok) {
        notification.error({
          title: "File tidak valid",
          description: result.message,
        });
        return false; // Prevent add to list
      }
      onFileChange(file);
      return false; // Hold file in Ant Upload list (no auto-upload)
    },
    [onFileChange, notification],
  );

  return (
    <InboxDragger
      value={value}
      onChange={onChange}
      beforeUpload={handleBeforeUpload}
      placeholder={placeholder}
      hint={hint}
    />
  );
}

// Thin wrapper that bridges the generic `value`/`onChange` Form.Item convention
// to the specific props ExcelUploadField needs.
function InboxDragger({ value, onChange, beforeUpload, placeholder, hint }) {
  return (
    <InboxDraggerInner
      fileList={value}
      onFileListChange={onChange}
      beforeUpload={beforeUpload}
      placeholder={placeholder}
      hint={hint}
    />
  );
}

import { Upload } from "antd";
import { useState } from "react";

function InboxDraggerInner({ fileList, onFileListChange, beforeUpload, placeholder, hint }) {
  const [internalList, setInternalList] = useState(fileList);

  const handleChange = (info) => {
    const next = info.fileList.slice(-1); // keep only latest
    setInternalList(next);
    onFileListChange(next);
  };

  const handleRemove = () => {
    setInternalList([]);
    onFileListChange([]);
    return true;
  };

  return (
    <Upload.Dragger
      accept={ALLOWED_EXTS.join(",")}
      maxCount={1}
      fileList={internalList}
      beforeUpload={beforeUpload}
      onChange={handleChange}
      onRemove={handleRemove}
      showUploadList={{ showRemoveIcon: true }}
    >
      <p className="ant-upload-drag-icon">
        <InboxOutlined className="text-emerald-600" />
      </p>
      <p className="ant-upload-text font-semibold text-slate-700">
        {placeholder || "Klik atau seret file Excel ke sini"}
      </p>
      <p className="ant-upload-hint">{hint}</p>
    </Upload.Dragger>
  );
}

// ─── Modal Component ──────────────────────────────────────────────────────────

/**
 * UploadPemusnahanModal — Bulk upload FKR Pemusnahan via Excel.
 *
 * Collects an Excel file and a Work Order (WO) number from the user,
 * then calls `onSubmit({ file, reason })` so the parent can invoke the
 * mutation with the current user's m_user_id injected.
 *
 * Keeps the file object and the file-list UI state self-contained (mirrors
 * the pattern established in ReuploadDocumentModal) to avoid stale closures
 * between the <Upload.Dragger> and the submit handler.
 *
 * @param {Object}   props
 * @param {boolean}  props.open
 * @param {Function} props.onCancel    - Called on modal close/reset
 * @param {Function} props.onSubmit    - Called with { file: File, reason: string }
 * @param {boolean}  props.confirmLoading
 */
export function UploadPemusnahanModal({
  open,
  onCancel,
  onSubmit,
  confirmLoading = false,
}) {
  const [form] = Form.useForm();
  const selectedFileRef = useRef(null);

  // Keep the raw File object in a ref so the submit handler always has the
  // latest value — avoids the stale-closure issue between drag events and
  // the OK button click.
  const handleFileChange = useCallback((file) => {
    selectedFileRef.current = file;
  }, []);

  const handleCancel = () => {
    form.resetFields();
    selectedFileRef.current = null;
    onCancel();
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const file = selectedFileRef.current;

      if (!file) {
        form.setFields([
          { name: "excel", errors: ["Unggah file Excel terlebih dahulu."] },
        ]);
        return;
      }

      onSubmit({ file, reason: values.reason?.trim() ?? "" });
    } catch {
      /* validation errors surfaced inline by Ant Design */
    }
  };

  const fields = buildPemusnahanFields({ onFileChange: handleFileChange });

  return (
    <Modal
      title={
        <div className="text-slate-800 font-bold text-lg border-b border-slate-100 pb-3">
          Upload Pemusnahan FKR
        </div>
      }
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={confirmLoading}
      okText="Upload Sekarang"
      cancelText="Batal"
      okButtonProps={{
        size: "large",
        className:
          "bg-emerald-600 hover:bg-emerald-700 border-emerald-600 rounded-lg",
      }}
      cancelButtonProps={{ size: "large", className: "rounded-lg" }}
      className="rounded-xl overflow-hidden"
      destroyOnHidden
    >
      <div className="py-4">
        <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 mb-4">
          <div>
            <Text className="block font-semibold text-slate-700 text-sm">
              Template Upload Pemusnahan FKR
            </Text>
            <Text className="text-slate-400 text-xs">
              Gunakan template resmi untuk memastikan format kolom sesuai.
            </Text>
          </div>
          <a
            href={TEMPLATE_URL}
            download="Template Upload Open FKR Pemusnahan.xlsx"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              type="default"
              icon={<DownloadOutlined />}
              size="small"
              className="border-emerald-500 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-600"
            >
              Download Template
            </Button>
          </a>
        </div>

        <Text className="block text-slate-500 text-sm mb-4 leading-relaxed">
          Unggah file Excel berisi daftar kode distributor dan rentang tanggal
          pemusnahan. Reason/Nomor Work Order (WO) akan dicatat dalam log
          audit proses ini.
        </Text>

        <Form
          form={form}
          layout="vertical"
          style={{ "--brand": BRAND_FOCUS_COLOR }}
        >
          {fields.map((field) => (
            <Form.Item
              key={field.name}
              name={field.name}
              label={
                field.label && (
                  <Text className="font-semibold text-slate-700">
                    {field.label}
                  </Text>
                )
              }
              valuePropName={
                field.type === "excel-upload" ? "fileList" : "value"
              }
              getValueFromEvent={
                field.type === "excel-upload"
                  ? (fileList) => fileList
                  : undefined
              }
              rules={field.rules}
              extra={field.extra}
            >
              {field.type === "excel-upload" ? (
                <ExcelUploadField
                  value={form.getFieldValue("excel")}
                  onChange={(fileList) => form.setFieldsValue({ excel: fileList })}
                  onFileChange={field.onFileChange}
                  placeholder={field.placeholder}
                  hint={field.hint}
                />
              ) : (
                <InputFieldForForm field={field} />
              )}
            </Form.Item>
          ))}
        </Form>
      </div>
    </Modal>
  );
}

// ─── Input Field Renderer ─────────────────────────────────────────────────────

import { Input } from "antd";

function InputFieldForForm({ field }) {
  return (
    <Input
      placeholder={field.placeholder}
      size="large"
      className="rounded-lg hover:border-[var(--brand)] focus:border-[var(--brand)] focus:ring-1 focus:ring-[var(--brand)] transition-colors"
      maxLength={field.maxLength}
      readOnly={field.readOnly}
    />
  );
}
