"use client";

import React, { useCallback, useMemo, useRef, useState } from "react";
import { App, Form, Input, Modal, Select, Typography, Upload } from "antd";
import {
  CloudUploadOutlined,
  FilePdfOutlined,
  CloseCircleFilled,
} from "@ant-design/icons";
import { BRAND_FOCUS_COLOR } from "@/utils/constants";

const { Text } = Typography;

// ─────────────────────────────────────────────────────────────────────────────
// Document Type Configuration
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Document type configuration for Klaim re-upload.
 *
 * Each entry controls:
 *   - key    : becomes the `document_type` payload sent to the backend
 *   - label  : text shown in the UI dropdown
 *   - ext    : expected file extension (for validation, optional)
 *
 * @type {Record<string, { label: string, ext?: string }>}
 */
export const KLAIM_DOC_CONFIG = {
  file_faktur_pajak: {
    label: "Faktur Pajak",
    ext: ".pdf",
  },
  file_eproposal: {
    label: "E-Proposal",
    ext: ".pdf",
  },
  file_rekap_klaim: {
    label: "Rekap Klaim",
    ext: ".pdf",
  },
  file_skp: {
    label: "Surat Keterangan Pajak (SKP)",
    ext: ".pdf",
  },
  file_invoice: {
    label: "Invoice",
    ext: ".pdf",
  },
  file_surat_klaim_sesuai_prinsiple: {
    label: "Surat Klaim Sesuai Prinsiple",
    ext: ".pdf",
  },
  file_ktp: {
    label: "KTP (Kartu Tanda Penduduk)",
    ext: ".pdf",
  },
  file_copy_faktur: {
    label: "Copy Faktur",
    ext: ".pdf",
  },
  file_program: {
    label: "Foto Sewa/Display",
    ext: ".pdf",
  },
};

/** Select options derived from KLAIM_DOC_CONFIG. */
export const KLAIM_DOC_OPTIONS = Object.entries(KLAIM_DOC_CONFIG).map(
  ([value, meta]) => ({
    value,
    label: meta.label,
  }),
);

// ─────────────────────────────────────────────────────────────────────────────
// File Validation
// ─────────────────────────────────────────────────────────────────────────────

const PDF_MAX_SIZE_MB = 20;
const PDF_MAX_SIZE_BYTES = PDF_MAX_SIZE_MB * 1024 * 1024;
const ALLOWED_PDF_TYPES = [
  "application/pdf",
  "application/x-google-chrome-pdf",
];
const ALLOWED_PDF_EXTS = [".pdf"];

/**
 * Validate a PDF file for klaim document reupload.
 *
 * @param {File | null | undefined} file
 * @returns {{ ok: true } | { ok: false, message: string }}
 */
export function validateKlaimPdf(file) {
  if (!file) {
    return { ok: false, message: "File tidak ditemukan." };
  }

  const ext =
    file.name.lastIndexOf(".") < 0
      ? ""
      : file.name.slice(file.name.lastIndexOf(".")).toLowerCase();

  if (!ALLOWED_PDF_EXTS.includes(ext)) {
    return {
      ok: false,
      message: `Format file tidak didukung. Hanya file PDF (.pdf) yang diterima.`,
    };
  }

  if (
    !ALLOWED_PDF_TYPES.includes(file.type) &&
    file.type !== "application/octet-stream"
  ) {
    return { ok: false, message: "File harus berupa dokumen PDF." };
  }

  if (file.size > PDF_MAX_SIZE_BYTES) {
    return {
      ok: false,
      message: `Ukuran file melebihi batas maksimum (${PDF_MAX_SIZE_MB} MB).`,
    };
  }

  return { ok: true };
}

// ─────────────────────────────────────────────────────────────────────────────
// ReuploadKlaimDokumenModal
// ─────────────────────────────────────────────────────────────────────────────

/**
 * ReuploadKlaimDokumenModal — Re-upload a single document for an existing klaim record.
 *
 * Flow:
 * 1. User selects the document type to replace
 * 2. User uploads the replacement PDF file
 * 3. On submit, calls `onSubmit({ klaim_id, document_type, file })`
 *    — the mutation hook injects m_user_id from storage
 *
 * File is held in a `useRef` to avoid stale closures between the drag event
 * and the submit button click.
 *
 * @param {Object}   props
 * @param {boolean}  props.open
 * @param {Function} props.onCancel
 * @param {Function} props.onSubmit  - Called with { klaim_id, document_type, file }
 * @param {boolean}  [props.confirmLoading]
 * @param {string}   props.klaimId
 * @param {string}   [props.klaimNo]
 */
export function ReuploadKlaimDokumenModal({
  open,
  onCancel,
  onSubmit,
  confirmLoading = false,
  klaimId,
  klaimNo,
}) {
  const [form] = Form.useForm();
  const [selectedFile, setSelectedFile] = useState(null);
  const selectedFileRef = useRef(null);
  const { notification } = App.useApp();
  const [fileError, setFileError] = useState("");
  const [docTypeSelected, setDocTypeSelected] = useState(false);

  // ── Reset on close — always fresh state when reopened ─────────────────────────
  const handleClose = useCallback(() => {
    form.resetFields();
    setSelectedFile(null);
    selectedFileRef.current = null;
    setFileError("");
    setDocTypeSelected(false);
    onCancel();
  }, [form, onCancel]);

  // ── File selection (stored in ref to avoid stale closure) ────────────────────
  const handleBeforeUpload = useCallback(
    (file) => {
      const result = validateKlaimPdf(file);
      if (!result.ok) {
        notification.error({
          title: "File tidak valid",
          description: result.message,
        });
        return Upload.LIST_IGNORE;
      }
      setSelectedFile(file);
      selectedFileRef.current = file;
      setFileError("");
      return false; // hold — actual upload happens on submit
    },
    [notification],
  );

  const handleRemove = () => {
    setSelectedFile(null);
    selectedFileRef.current = null;
    setFileError("");
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const file = selectedFileRef.current;

      if (!file) {
        setFileError("Unggah file PDF terlebih dahulu.");
        return;
      }

      onSubmit({
        klaim_id: klaimId,
        document_type: values.document_type,
        reason: values.reason?.trim() ?? "",
        file,
      });
    } catch {
      /* validation errors surfaced inline by Ant Design */
    }
  };

  const fileList = selectedFile
    ? [{ uid: "-1", name: selectedFile.name, status: "done", size: selectedFile.size }]
    : [];

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 pb-3 text-base font-bold border-b text-slate-800 border-slate-100">
          <CloudUploadOutlined className="text-blue-500" />
          <span>Re-upload Dokumen Klaim</span>
        </div>
      }
      open={open}
      onOk={handleOk}
      onCancel={handleClose}
      confirmLoading={confirmLoading}
      okText="Upload Sekarang"
      cancelText="Batal"
      destroyOnHidden
      width={520}
      okButtonProps={{
        size: "large",
        style: {
          backgroundColor: BRAND_FOCUS_COLOR,
          borderColor: BRAND_FOCUS_COLOR,
        },
        className: "rounded-lg font-medium",
      }}
      cancelButtonProps={{ size: "large", className: "rounded-lg" }}
      className="[&_.ant-modal-content]:rounded-xl"
    >
      <div className="py-4 space-y-4">
        {/* Klaim info banner */}
        {klaimNo && (
          <div className="px-4 py-3 border border-blue-100 bg-blue-50/70 rounded-xl">
            <p className="m-0 text-sm leading-relaxed text-slate-600">
              Mengunggah ulang dokumen untuk klaim nomor{" "}
              <Text strong className="text-slate-800">
                {klaimNo}
              </Text>
              .
            </p>
          </div>
        )}

        <Form
          form={form}
          layout="vertical"
          style={{ "--brand": BRAND_FOCUS_COLOR }}
          destroyOnHidden
        >
          {/* Document Type */}
          <Form.Item
            name="document_type"
            label={
              <Text className="font-semibold text-slate-700">Tipe Dokumen</Text>
            }
            rules={[
              {
                required: true,
                message: "Pilih tipe dokumen yang akan diunggah ulang.",
              },
            ]}
          >
            <Select
              placeholder="-- Pilih Tipe Dokumen --"
              options={KLAIM_DOC_OPTIONS}
              size="large"
              className="[&_.ant-select-selector]:rounded-lg"
              onChange={() => {
                // Clear file when doc type changes
                setSelectedFile(null);
                selectedFileRef.current = null;
                setFileError("");
                setDocTypeSelected(true);
              }}
            />
          </Form.Item>

          {/* Reason / Nomor WO */}
          <Form.Item
            name="reason"
            label={
              <Text className="font-semibold text-slate-700">
                Nomor Work Order (WO)
              </Text>
            }
            rules={[
              {
                required: true,
                whitespace: true,
                message: "Nomor WO wajib diisi.",
              },
            ]}
          >
            <Input
              placeholder="Contoh: WO/IT BUSINESS APPLICATION/26/0056736"
              size="large"
              className="rounded-lg hover:border-[var(--brand)] focus:border-[var(--brand)] focus:ring-1 focus:ring-[var(--brand)] transition-colors"
              maxLength={100}
            />
          </Form.Item>

          {/* File Upload */}
          <Form.Item
            label={
              <Text className="font-semibold text-slate-700">File PDF</Text>
            }
            required
          >
            <Upload.Dragger
              accept=".pdf"
              maxCount={1}
              fileList={fileList}
              beforeUpload={handleBeforeUpload}
              onRemove={handleRemove}
              disabled={!docTypeSelected}
              showUploadList={{
                showRemoveIcon: true,
                removeIcon: (
                  <span className="flex items-center justify-center w-5 h-5 transition-colors rounded-full bg-red-50 hover:bg-red-100">
                    <CloseCircleFilled className="text-xs text-red-400" />
                  </span>
                ),
              }}
              itemRender={(_origin, file) => (
                <div className="flex items-center w-full gap-3 px-4 py-3 my-2 border border-red-200 bg-red-50 rounded-xl">
                  <FilePdfOutlined className="flex-shrink-0 text-lg text-red-500" />
                  <span className="flex-1 text-sm font-medium text-red-700 truncate">
                    {file.name}
                  </span>
                  <span className="flex-shrink-0 text-xs text-red-400">
                    {((file.size ?? 0) / 1024).toFixed(0)} KB
                  </span>
                </div>
              )}
              className={[
                "[&_.ant-upload-drag]:border-dashed",
                "[&_.ant-upload-drag]:border-slate-200",
                "[&_.ant-upload-drag:hover]:border-blue-400",
                "[&_.ant-upload-drag]:rounded-xl",
                "[&_.ant-upload-drag]:bg-slate-50/60",
                "[&_.ant-upload-drag]:py-6",
                "[&_.ant-upload-drag]:transition-colors",
                "[&_.ant-upload-drag:hover]:bg-blue-50/50",
                "[&_.ant-upload-disabled]:opacity-50",
              ].join(" ")}
            >
              <p className="mb-3 ant-upload-drag-icon">
                <FilePdfOutlined className="text-3xl text-blue-400" />
              </p>
              <p className="text-sm font-medium ant-upload-text text-slate-600">
                {docTypeSelected
                  ? "Klik atau tarik file PDF ke sini"
                  : "Pilih tipe dokumen terlebih dahulu"}
              </p>
              <p className="mt-1 text-xs ant-upload-hint text-slate-400">
                Format wajib .pdf &nbsp;&middot;&nbsp; Maks. {PDF_MAX_SIZE_MB}{" "}
                MB
              </p>
            </Upload.Dragger>

            {fileError && (
              <p className="text-red-500 text-xs mt-1.5 pl-1">{fileError}</p>
            )}
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
}
