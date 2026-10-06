"use client";

import React, { useCallback, useRef, useState } from "react";
import { App, Form, Input, Modal, Select, Typography, Upload } from "antd";
import {
  CloudUploadOutlined,
  FilePdfOutlined,
  FileExcelOutlined,
  InboxOutlined,
  CloseCircleFilled,
} from "@ant-design/icons";
import { BRAND_FOCUS_COLOR } from "@/utils/constants";
import { validateExcelFile } from "@/components/ui/ExcelUpload";

const { Text } = Typography;

const TEMPLATE_URL = "/templates/klaim/nomor_klaim_reupload.xlsx";

// Re-use document type config from sibling component
// KLAIM_DOC_CONFIG and KLAIM_DOC_OPTIONS are exported from ReuploadKlaimDokumenModal
import { KLAIM_DOC_OPTIONS } from "./ReuploadKlaimDokumenModal";

const PDF_MAX_SIZE_MB = 20;
const PDF_MAX_SIZE_BYTES = PDF_MAX_SIZE_MB * 1024 * 1024;

const ALLOWED_PDF_TYPES = [
  "application/pdf",
  "application/x-google-chrome-pdf",
];
const ALLOWED_PDF_EXTS = [".pdf"];
const ALLOWED_EXCEL_TYPES = [
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
];
const ALLOWED_EXCEL_EXTS = [".xlsx", ".xls"];

function validatePdf(file) {
  if (!file) return { ok: false, message: "File tidak ditemukan." };
  const ext = file.name.lastIndexOf(".") < 0 ? "" : file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
  if (!ALLOWED_PDF_EXTS.includes(ext)) {
    return { ok: false, message: `Format file tidak didukung. Hanya file PDF (.pdf) yang diterima.` };
  }
  if (!ALLOWED_PDF_TYPES.includes(file.type) && file.type !== "application/octet-stream") {
    return { ok: false, message: "File harus berupa dokumen PDF." };
  }
  if (file.size > PDF_MAX_SIZE_BYTES) {
    return { ok: false, message: `Ukuran file melebihi batas maksimum (${PDF_MAX_SIZE_MB} MB).` };
  }
  return { ok: true };
}

// ─────────────────────────────────────────────────────────────────────────────
// UploadKlaimExcelModal
// ─────────────────────────────────────────────────────────────────────────────

/**
 * UploadKlaimExcelModal — Bulk upload Klaim documents via Excel.
 *
 * Flow:
 * 1. User selects the document type to upload
 * 2. User enters the Work Order (WO) number / reason
 * 3. User uploads an Excel file containing nomor_klaim references
 * 4. User uploads a single PDF document to attach to all listed claims
 * 5. On submit, calls `onSubmit({ document_type, reason, excel, document })`
 *
 * @param {Object}   props
 * @param {boolean}  props.open
 * @param {Function} props.onCancel
 * @param {Function} props.onSubmit  - Called with { document_type, reason, excel, document }
 * @param {boolean}  [props.confirmLoading]
 */
export function UploadKlaimExcelModal({
  open,
  onCancel,
  onSubmit,
  confirmLoading = false,
}) {
  const [form] = Form.useForm();
  const selectedExcelRef = useRef(null);
  const selectedDocRef = useRef(null);
  const [selectedExcel, setSelectedExcel] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [excelError, setExcelError] = useState("");
  const [docError, setDocError] = useState("");
  const { notification } = App.useApp();

  const handleClose = useCallback(() => {
    form.resetFields();
    selectedExcelRef.current = null;
    selectedDocRef.current = null;
    setSelectedExcel(null);
    setSelectedDoc(null);
    setExcelError("");
    setDocError("");
    onCancel();
  }, [form, onCancel]);

  const handleExcelBeforeUpload = useCallback(
    (file) => {
      const result = validateExcelFile(file);
      if (!result.ok) {
        notification.error({ title: "File tidak valid", description: result.message });
        return Upload.LIST_IGNORE;
      }
      selectedExcelRef.current = file;
      setSelectedExcel(file);
      setExcelError("");
      return false;
    },
    [notification],
  );

  const handleDocBeforeUpload = useCallback(
    (file) => {
      const result = validatePdf(file);
      if (!result.ok) {
        notification.error({ title: "File tidak valid", description: result.message });
        return Upload.LIST_IGNORE;
      }
      selectedDocRef.current = file;
      setSelectedDoc(file);
      setDocError("");
      return false;
    },
    [notification],
  );

  const handleExcelRemove = () => {
    selectedExcelRef.current = null;
    setSelectedExcel(null);
    setExcelError("");
  };

  const handleDocRemove = () => {
    selectedDocRef.current = null;
    setSelectedDoc(null);
    setDocError("");
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const excel = selectedExcelRef.current;
      const document = selectedDocRef.current;

      if (!excel) {
        setExcelError("Unggah file Excel terlebih dahulu.");
        return;
      }
      if (!document) {
        setDocError("Unggah file PDF terlebih dahulu.");
        return;
      }

      onSubmit({
        document_type: values.document_type,
        reason: values.reason?.trim() ?? "",
        excel,
        document,
      });
    } catch {
      /* validation errors surfaced inline by Ant Design */
    }
  };

  const excelFileList = selectedExcel
    ? [{ uid: "-1", name: selectedExcel.name, status: "done", size: selectedExcel.size, originFileObj: selectedExcel }]
    : [];

  const docFileList = selectedDoc
    ? [{ uid: "-1", name: selectedDoc.name, status: "done", size: selectedDoc.size }]
    : [];

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 pb-3 text-base font-bold border-b text-slate-800 border-slate-100">
          <CloudUploadOutlined className="text-blue-500" />
          <span>Upload Excel Document Klaim</span>
        </div>
      }
      open={open}
      onOk={handleOk}
      onCancel={handleClose}
      confirmLoading={confirmLoading}
      okText="Upload Sekarang"
      cancelText="Batal"
      destroyOnHidden
      width={560}
      okButtonProps={{
        size: "large",
        style: { backgroundColor: BRAND_FOCUS_COLOR, borderColor: BRAND_FOCUS_COLOR },
        className: "rounded-lg font-medium",
      }}
      cancelButtonProps={{ size: "large", className: "rounded-lg" }}
      className="[&_.ant-modal-content]:rounded-xl"
    >
      <div className="py-4 space-y-4">
        {/* Template download card */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 flex items-center justify-between">
          <div>
            <Text className="block font-semibold text-slate-700 text-sm">
              Template Upload Klaim
            </Text>
            <Text className="text-slate-400 text-xs">
              Unduh template Excel berisi kolom nomor klaim.
            </Text>
          </div>
          <a
            href={TEMPLATE_URL}
            download="nomor_klaim_reupload.xlsx"
            target="_blank"
            rel="noopener noreferrer"
          >
            <button
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 border border-blue-500 text-blue-600 rounded-lg text-xs font-semibold hover:bg-blue-50 transition-colors"
            >
              <span>Download</span>
            </button>
          </a>
        </div>

        <Text className="text-slate-500 text-sm leading-relaxed block">
          Unggah file Excel berisi daftar nomor klaim, lalu lampirkan satu dokumen PDF
          yang akan di-attach ke setiap klaim yang terdaftar di dalam Excel.
        </Text>

        <Form form={form} layout="vertical" style={{ "--brand": BRAND_FOCUS_COLOR }}>
          {/* Document Type */}
          <Form.Item
            name="document_type"
            label={<Text className="font-semibold text-slate-700">Tipe Dokumen</Text>}
            rules={[{ required: true, message: "Pilih tipe dokumen." }]}
          >
            <Select
              placeholder="-- Pilih Tipe Dokumen --"
              options={KLAIM_DOC_OPTIONS}
              size="large"
              className="[&_.ant-select-selector]:rounded-lg"
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
            rules={[{ required: true, whitespace: true, message: "Nomor WO wajib diisi." }]}
          >
            <Input
              placeholder="Contoh: WO/IT BUSINESS APPLICATION/26/0056736"
              size="large"
              className="rounded-lg"
            />
          </Form.Item>

          {/* Excel File Upload */}
          <Form.Item
            label={<Text className="font-semibold text-slate-700">File Excel (Daftar Nomor Klaim)</Text>}
            required
          >
            <Upload.Dragger
              accept={ALLOWED_EXCEL_EXTS.join(",")}
              maxCount={1}
              fileList={excelFileList}
              beforeUpload={handleExcelBeforeUpload}
              onRemove={handleExcelRemove}
              showUploadList={{
                showRemoveIcon: true,
                removeIcon: (
                  <span className="flex items-center justify-center w-5 h-5 transition-colors rounded-full bg-red-50 hover:bg-red-100">
                    <CloseCircleFilled className="text-xs text-red-400" />
                  </span>
                ),
              }}
              itemRender={(_origin, file) => (
                <div className="flex items-center gap-3 w-full px-4 py-3 border border-emerald-200 bg-emerald-50 rounded-xl my-2">
                  <FileExcelOutlined className="text-emerald-600 text-lg flex-shrink-0" />
                  <span className="text-emerald-700 text-sm font-medium truncate flex-1">{file.name}</span>
                  <span className="text-emerald-400 text-xs flex-shrink-0">
                    {((file.size ?? 0) / 1024).toFixed(0)} KB
                  </span>
                </div>
              )}
              className="[&_.ant-upload-drag]:border-dashed [&_.ant-upload-drag]:border-slate-200 [&_.ant-upload-drag:hover]:border-emerald-400 [&_.ant-upload-drag]:rounded-xl [&_.ant-upload-drag]:bg-slate-50/60 [&_.ant-upload-drag]:py-5"
            >
              <p className="mb-2 ant-upload-drag-icon">
                <InboxOutlined className="text-emerald-500 text-3xl" />
              </p>
              <p className="text-sm font-medium ant-upload-text text-slate-600">
                Klik atau tarik file Excel ke sini
              </p>
              <p className="mt-1 text-xs ant-upload-hint text-slate-400">
                Format: .xls, .xlsx &nbsp;&middot;&nbsp; Maks. 50 MB
              </p>
            </Upload.Dragger>
            {excelError && <p className="text-red-500 text-xs mt-1.5 pl-1">{excelError}</p>}
          </Form.Item>

          {/* PDF Document Upload */}
          <Form.Item
            label={<Text className="font-semibold text-slate-700">File PDF (Dokumen)</Text>}
            required
          >
            <Upload.Dragger
              accept={ALLOWED_PDF_EXTS.join(",")}
              maxCount={1}
              fileList={docFileList}
              beforeUpload={handleDocBeforeUpload}
              onRemove={handleDocRemove}
              showUploadList={{
                showRemoveIcon: true,
                removeIcon: (
                  <span className="flex items-center justify-center w-5 h-5 transition-colors rounded-full bg-red-50 hover:bg-red-100">
                    <CloseCircleFilled className="text-xs text-red-400" />
                  </span>
                ),
              }}
              itemRender={(_origin, file) => (
                <div className="flex items-center gap-3 w-full px-4 py-3 border border-red-200 bg-red-50 rounded-xl my-2">
                  <FilePdfOutlined className="text-red-500 text-lg flex-shrink-0" />
                  <span className="text-red-700 text-sm font-medium truncate flex-1">{file.name}</span>
                  <span className="text-red-400 text-xs flex-shrink-0">
                    {((file.size ?? 0) / 1024).toFixed(0)} KB
                  </span>
                </div>
              )}
              className="[&_.ant-upload-drag]:border-dashed [&_.ant-upload-drag]:border-slate-200 [&_.ant-upload-drag:hover]:border-blue-400 [&_.ant-upload-drag]:rounded-xl [&_.ant-upload-drag]:bg-slate-50/60 [&_.ant-upload-drag]:py-5"
            >
              <p className="mb-2 ant-upload-drag-icon">
                <FilePdfOutlined className="text-blue-500 text-3xl" />
              </p>
              <p className="text-sm font-medium ant-upload-text text-slate-600">
                Klik atau tarik file PDF ke sini
              </p>
              <p className="mt-1 text-xs ant-upload-hint text-slate-400">
                Format: .pdf &nbsp;&middot;&nbsp; Maks. {PDF_MAX_SIZE_MB} MB
              </p>
            </Upload.Dragger>
            {docError && <p className="text-red-500 text-xs mt-1.5 pl-1">{docError}</p>}
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
}
