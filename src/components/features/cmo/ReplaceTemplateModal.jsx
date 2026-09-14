"use client";

import React, { useState, useCallback } from "react";
import { Form, Modal, Select, Input, Typography } from "antd";
import { BRAND_FOCUS_COLOR } from "@/utils/constants";
import { CMO_TIPE_TEMPLATE_OPTIONS } from "@/config/cmoConfig";
import { useConfirm } from "@/hooks/useConfirm";
import { validateExcelFile, EXCEL_ALLOWED_EXTS } from "@/components/ui/ExcelUpload";

const { Text } = Typography;

const ALLOWED_EXTS = [".xlsx"]; // Template only accepts .xlsx

/**
 * Validate an Excel .xlsx file for the template upload.
 * @param {File} file
 * @returns {{ ok: boolean, message?: string }}
 */
function validateTemplateFile(file) {
  return validateExcelFile(file, { allowedExts: ALLOWED_EXTS });
}

// ─── Modal Component ──────────────────────────────────────────────────────────

/**
 * ReplaceTemplateModal — Upload a new CMO or Add-PO Excel template.
 *
 * Collects:
 *   - tipe_template  (CMO | ADD_PO)
 *   - version         (string)
 *   - file            (File .xlsx)
 *
 * Calls onSubmit({ tipe_template, version, file }) so the parent
 * can invoke the mutation.
 *
 * Now uses the shared `validateTemplateFile` for file validation.
 *
 * @param {Object}   props
 * @param {boolean}  props.open
 * @param {Function} props.onCancel
 * @param {Function} props.onSubmit  - ({ tipe_template, version, file }) => Promise
 * @param {boolean}  props.confirmLoading
 */
export function ReplaceTemplateModal({
  open,
  onCancel,
  onSubmit,
  confirmLoading = false,
}) {
  const [form] = Form.useForm();
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const { confirmAction } = useConfirm();

  // Reset on close
  const handleCancel = () => {
    form.resetFields();
    setSelectedFile(null);
    setFileError("");
    onCancel();
  };

  // Update file — validate immediately so the error shows below the drop zone
  const handleFileChange = useCallback((file) => {
    if (!file) {
      setSelectedFile(null);
      setFileError("");
      return;
    }
    const result = validateTemplateFile(file);
    if (!result.ok) {
      setFileError(result.message);
      return;
    }
    setSelectedFile(file);
    setFileError("");
  }, []);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      if (!selectedFile) {
        setFileError("Unggah file Excel template terlebih dahulu.");
        return;
      }

      confirmAction({
        title: "Konfirmasi Ganti Template CMO",
        description:
          `Apakah Anda yakin ingin mengganti template ${values.tipe_template || ""} ` +
          `dengan versi ${values.version?.trim() || "-"}? ` +
          `File template lama akan digantikan dengan file baru yang Anda unggah.`,
        okText: "Ya, Simpan Template",
        onConfirm: async () => {
          await onSubmit({
            tipe_template: values.tipe_template,
            version: values.version?.trim() ?? "",
            file: selectedFile,
          });
        },
      });
    } catch {
      /* validation errors surfaced inline by Ant Design */
    }
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 text-slate-800 font-bold text-base pb-3 border-b border-slate-100">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="12" y1="18" x2="12" y2="12"/>
            <line x1="9" y1="15" x2="15" y2="15"/>
          </svg>
          Ganti Template CMO
        </div>
      }
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={confirmLoading}
      okText="Simpan Template"
      cancelText="Batal"
      okButtonProps={{
        size: "large",
        className: "bg-emerald-600 hover:bg-emerald-700 border-emerald-600 rounded-lg font-medium",
      }}
      cancelButtonProps={{ size: "large", className: "rounded-lg" }}
      className="[&_.ant-modal-content]:rounded-xl"
      destroyOnHidden
    >
      <div className="py-4 space-y-5">
        {/* Description */}
        <Text className="text-slate-500 text-sm leading-relaxed">
          Unggah file template Excel untuk module CMO. Pilih tipe template
          (CMO atau Add PO), masukkan nomor versi, lalu pilih file .xlsx
          yang baru.
        </Text>

        <Form
          form={form}
          layout="vertical"
          style={{ "--brand": BRAND_FOCUS_COLOR }}
        >
          {/* Tipe Template */}
          <Form.Item
            name="tipe_template"
            label={<Text className="font-semibold text-slate-700">Tipe Template</Text>}
            rules={[{ required: true, message: "Pilih tipe template terlebih dahulu." }]}
          >
            <Select
              placeholder="Pilih tipe template..."
              options={CMO_TIPE_TEMPLATE_OPTIONS}
              size="large"
              className="[&_.ant-select-selector]:rounded-lg"
              showSearch
              optionFilterProp="label"
            />
          </Form.Item>

          {/* Nomor Versi */}
          <Form.Item
            name="version"
            label={<Text className="font-semibold text-slate-700">Nomor Versi</Text>}
            rules={[
              { required: true, message: "Nomor versi wajib diisi." },
              { whitespace: true, message: "Nomor versi tidak boleh kosong." },
            ]}
          >
            <Input
              placeholder="Contoh: v1.0.0 atau 2025-Q1"
              size="large"
              className="rounded-lg hover:border-emerald-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
            />
          </Form.Item>

          {/* File Upload — delegated to shared component */}
          <Form.Item
            label={<Text className="font-semibold text-slate-700">File Template (.xlsx)</Text>}
            required
          >
            <ExcelUploadField
              value={selectedFile}
              onChange={handleFileChange}
              error={fileError}
              accept=".xlsx"
              placeholder="Klik atau tarik file Excel (.xlsx) ke sini"
              hint="Format wajib .xlsx · Maks. 50 MB"
            />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
}
