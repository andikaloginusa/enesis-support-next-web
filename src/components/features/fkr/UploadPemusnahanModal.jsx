"use client";

import React, { useCallback, useRef } from "react";
import { App, Form, Modal, Typography, Input, Button, Upload } from "antd";
import {
  DownloadOutlined,
  InboxOutlined,
  FileExcelOutlined,
  CloseCircleFilled,
} from "@ant-design/icons";
import { validateExcelFile } from "@/components/ui/ExcelUpload";
import { BRAND_FOCUS_COLOR } from "@/utils/constants";

const { Text } = Typography;

const TEMPLATE_URL = "/templates/Template Upload Open FKR Pemusnahan.xlsx";
const ALLOWED_EXTS = [".xlsx", ".xls"];

// ─────────────────────────────────────────────────────────────────────────────
// ExcelUploadFieldWrapper — bridges shared ExcelUploadField to Form.Item pattern
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Thin wrapper that bridges `validateExcelFile` to Ant's `Form.Item` pattern
 * used in UploadPemusnahanModal.
 *
 * Keeps the file in `selectedFileRef.current` (via `handleFileChange`)
 * and the form field synchronized.
 */
function ExcelUploadFieldWrapper({ field, form }) {
  const { notification } = App.useApp();

  const handleBeforeUpload = useCallback(
    (file) => {
      const result = validateExcelFile(file);
      if (!result.ok) {
        notification.error({
          title: "File tidak valid",
          description: result.message,
        });
        return Upload.LIST_IGNORE;
      }
      field.onFileChange?.(file);
      return false; // hold — no auto-upload
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [field, notification],
  );

  const fileList = form.getFieldValue(field.name) ?? [];

  const handleRemove = () => {
    field.onFileChange?.(null);
  };

  return (
    <Upload.Dragger
      accept={ALLOWED_EXTS.join(",")}
      maxCount={1}
      fileList={fileList}
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
        </div>
      )}
      className="[&_.ant-upload-drag]:border-dashed [&_.ant-upload-drag]:border-slate-200 [&_.ant-upload-drag:hover]:border-emerald-400 [&_.ant-upload-drag]:rounded-xl [&_.ant-upload-drag]:bg-slate-50/60 [&_.ant-upload-drag]:py-6"
    >
      <p className="ant-upload-drag-icon mb-3">
        <InboxOutlined className="text-emerald-600 text-3xl" />
      </p>
      <p className="ant-upload-text font-semibold text-slate-700">
        {field.placeholder || "Klik atau seret file Excel ke sini"}
      </p>
      <p className="ant-upload-hint text-slate-400 text-xs">{field.hint}</p>
    </Upload.Dragger>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Field Schema Builder
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Field schema builder for the Pemusnahan upload form.
 * Pure function — can be tested in isolation.
 *
 * @param {{ onFileChange: (file: File | null) => void }} handlers
 * @returns {Array<Object>}
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
        { required: true, whitespace: true, message: "Nomor WO wajib diisi." },
      ],
    },
  ];
}

// ─────────────────────────────────────────────────────────────────────────────
// TextField — plain input renderer
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Input renderer for plain text fields used inside the upload form.
 */
function TextField({ field }) {
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

// ─────────────────────────────────────────────────────────────────────────────
// UploadPemusnahanModal
// ─────────────────────────────────────────────────────────────────────────────

/**
 * UploadPemusnahanModal — Bulk upload FKR Pemusnahan via Excel.
 *
 * Collects an Excel file and a Work Order (WO) number from the user,
 * then calls `onSubmit({ file, reason })` so the parent can invoke the
 * mutation with the current user's m_user_id injected.
 *
 * The file is stored in a `useRef` to avoid stale closures between the
 * drag event and the submit button click.
 */
export function UploadPemusnahanModal({
  open,
  onCancel,
  onSubmit,
  confirmLoading = false,
}) {
  const [form] = Form.useForm();
  const selectedFileRef = useRef(null);

  // ── File change — store in ref to avoid stale closure ──────────────────────
  const handleFileChange = useCallback((file) => {
    selectedFileRef.current = file;
  }, []);

  // ── Cancel — reset form + clear file ref ──────────────────────────────────
  const handleCancel = () => {
    form.resetFields();
    selectedFileRef.current = null;
    onCancel();
  };

  // ── Submit ────────────────────────────────────────────────────────────────
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
        <div className="text-slate-800 font-bold text-base pb-3 border-b border-slate-100">
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
          "bg-emerald-600 hover:bg-emerald-700 border-emerald-600 rounded-lg font-medium",
      }}
      cancelButtonProps={{ size: "large", className: "rounded-lg" }}
      className="[&_.ant-modal-content]:rounded-xl"
      destroyOnHidden
    >
      <div className="py-4 space-y-4">
        {/* Template download card */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 flex items-center justify-between">
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
            />
          </a>
        </div>

        <Text className="text-slate-500 text-sm leading-relaxed block">
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
              rules={field.rules}
              extra={field.extra}
            >
              {field.type === "text" ? (
                <TextField field={field} />
              ) : (
                <Form.Item
                  noStyle
                  shouldUpdate={(prev, curr) =>
                    prev[field.name] !== curr[field.name]
                  }
                >
                  {() => (
                    <ExcelUploadFieldWrapper
                      field={field}
                      form={form}
                    />
                  )}
                </Form.Item>
              )}
            </Form.Item>
          ))}
        </Form>
      </div>
    </Modal>
  );
}
