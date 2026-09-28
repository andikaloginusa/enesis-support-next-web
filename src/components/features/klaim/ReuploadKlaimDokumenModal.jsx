"use client";

import React, { useCallback, useMemo, useRef, useState } from "react";
import { App, Form, Modal, Select, Typography, Upload } from "antd";
import { CloudUploadOutlined, FilePdfOutlined, CloseCircleFilled } from "@ant-design/icons";
import { BRAND_FOCUS_COLOR } from "@/utils/constants";

const { Text } = Typography;

// ─────────────────────────────────────────────────────────────────────────────
// Document Type Configuration
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Document type configuration for Klaim re-upload.
 *
 * Maps a document type key to its backend upload metadata:
 *   - dbField  : database column name on the server
 *   - folder   : storage folder path
 *   - prefix   : filename prefix used by the backend
 *   - ext      : expected file extension
 *
 * @type {Record<string, { dbField: string, folder: string, prefix: string, ext: string }>}
 */
export const KLAIM_DOC_CONFIG = {
  faktur_pajak: {
    label: "Faktur Pajak",
    dbField: "file_faktur_pajak",
    folder: "klaimproposal",
    prefix: "file_faktur_pajak_reupload",
    ext: ".pdf",
  },
  e_proposal: {
    label: "E-Proposal",
    dbField: "file_eproposal",
    folder: "klaimproposal",
    prefix: "file_eproposal_reupload",
    ext: ".pdf",
  },
  rekap_klaim: {
    label: "Rekap Klaim",
    dbField: "file_rekap_klaim",
    folder: "klaimproposal",
    prefix: "file_rekap_klaim_reupload",
    ext: ".pdf",
  },
  skp: {
    label: "Surat Keterangan Pajak (SKP)",
    dbField: "file_skp",
    folder: "klaimproposal",
    prefix: "file_skp_reupload",
    ext: ".pdf",
  },
  invoice: {
    label: "Invoice",
    dbField: "file_invoice",
    folder: "klaimproposal",
    prefix: "file_invoice_reupload",
    ext: ".pdf",
  },
  surat_klaim_sesuai_prinsiple: {
    label: "Surat Klaim Sesuai Prinsiple",
    dbField: "file_surat_klaim_sesuai_prinsiple",
    folder: "klaimproposal",
    prefix: "file_prinsiple_reupload",
    ext: ".pdf",
  },
  ktp: {
    label: "KTP (Kartu Tanda Penduduk)",
    dbField: "file_ktp",
    folder: "klaimproposal",
    prefix: "file_ktp_reupload",
    ext: ".pdf",
  },
  copy_faktur: {
    label: "Copy Faktur",
    dbField: "file_copy_faktur",
    folder: "klaimproposal",
    prefix: "file_copy_faktur_reupload",
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

  const ext = file.name.lastIndexOf(".") < 0
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
  const selectedFileRef = useRef(null);
  const { notification } = App.useApp();
  const [fileError, setFileError] = useState("");

  // ── Reset on close — always fresh state when reopened ─────────────────────────
  const handleClose = useCallback(() => {
    form.resetFields();
    selectedFileRef.current = null;
    setFileError("");
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
      selectedFileRef.current = file;
      setFileError("");
      return false; // hold — actual upload happens on submit
    },
    [notification],
  );

  const handleRemove = () => {
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
        file,
      });
    } catch {
      /* validation errors surfaced inline by Ant Design */
    }
  };

  const fileList = selectedFileRef.current
    ? [{ uid: "-1", name: selectedFileRef.current.name, status: "done" }]
    : [];

  const docMeta = selectedFileRef.current
    ? KLAIM_DOC_CONFIG[form.getFieldValue("document_type")]
    : null;

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 text-slate-800 font-bold text-base pb-3 border-b border-slate-100">
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
          <div className="bg-blue-50/70 border border-blue-100 rounded-xl px-4 py-3">
            <p className="text-slate-600 text-sm leading-relaxed m-0">
              Mengunggah ulang dokumen untuk klaim nomor{" "}
              <Text strong className="text-slate-800">{klaimNo}</Text>.
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
            label={<Text className="font-semibold text-slate-700">Tipe Dokumen</Text>}
            rules={[
              { required: true, message: "Pilih tipe dokumen yang akan diunggah ulang." },
            ]}
          >
            <Select
              placeholder="-- Pilih Tipe Dokumen --"
              options={KLAIM_DOC_OPTIONS}
              size="large"
              className="[&_.ant-select-selector]:rounded-lg"
              onChange={() => {
                // Clear file when doc type changes
                selectedFileRef.current = null;
                setFileError("");
              }}
            />
          </Form.Item>

          {/* File Upload */}
          <Form.Item
            label={<Text className="font-semibold text-slate-700">File PDF</Text>}
            required
          >
            <Upload.Dragger
              accept=".pdf"
              maxCount={1}
              fileList={fileList}
              beforeUpload={handleBeforeUpload}
              onRemove={handleRemove}
              disabled={!form.getFieldValue("document_type")}
              showUploadList={{
                showRemoveIcon: true,
                removeIcon: (
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-red-50 hover:bg-red-100 transition-colors">
                    <CloseCircleFilled className="text-red-400 text-xs" />
                  </span>
                ),
              }}
              itemRender={(_origin, file) => (
                <div className="flex items-center gap-3 w-full px-4 py-3 bg-red-50 border border-red-200 rounded-xl my-2">
                  <FilePdfOutlined className="text-red-500 text-lg flex-shrink-0" />
                  <span className="text-red-700 text-sm font-medium truncate flex-1">
                    {file.name}
                  </span>
                  <span className="text-red-400 text-xs flex-shrink-0">
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
              <p className="ant-upload-drag-icon mb-3">
                <FilePdfOutlined className="text-blue-400 text-3xl" />
              </p>
              <p className="ant-upload-text font-medium text-slate-600 text-sm">
                {form.getFieldValue("document_type")
                  ? "Klik atau tarik file PDF ke sini"
                  : "Pilih tipe dokumen terlebih dahulu"}
              </p>
              <p className="ant-upload-hint text-slate-400 text-xs mt-1">
                Format wajib .pdf &nbsp;&middot;&nbsp; Maks. {PDF_MAX_SIZE_MB} MB
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
