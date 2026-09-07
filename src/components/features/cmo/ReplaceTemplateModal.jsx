"use client";

import React, { useCallback, useRef, useState } from "react";
import { Form, Modal, Select, Input, Typography, App } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import { BRAND_FOCUS_COLOR } from "@/utils/constants";
import { CMO_TIPE_TEMPLATE_OPTIONS } from "@/config/cmoConfig";

const { Text } = Typography;

// ─── Validation constants ──────────────────────────────────────────────────────

const ALLOWED_EXTS = [".xlsx"];
const MAX_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB

/**
 * Validate an Excel .xlsx file for the template upload.
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

  if (file.size > MAX_SIZE_BYTES) {
    return { ok: false, message: "Ukuran file melebihi batas maksimum (50 MB)." };
  }

  return { ok: true };
}

// ─── Excel Upload Field ───────────────────────────────────────────────────────

/**
 * Renders the Excel drag-and-drop upload zone using a hidden file input
 * triggered by a styled label. Mirrors the pattern established in
 * UploadPemusnahanModal for consistency.
 */
function ExcelUploadField({ value, onChange }) {
  const { notification } = App.useApp();
  const inputRef = useRef(null);

  const handleFile = useCallback(
    (file) => {
      const result = validateExcelFile(file);
      if (!result.ok) {
        notification.error({
          title: "File tidak valid",
          description: result.message,
        });
        return;
      }
      onChange(file);
    },
    [onChange, notification],
  );

  return (
    <div>
      {/* Hidden native file input — avoids Ant Upload's auto-managed fileList */}
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx"
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          // Reset so the same file can be re-selected
          e.target.value = "";
        }}
      />

      {/* Styled label acting as the upload zone */}
      <label
        onClick={() => inputRef.current?.click()}
        className={`block border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
          value
            ? "border-emerald-400 bg-emerald-50 hover:border-emerald-500"
            : "border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/40"
        }`}
      >
        <InboxOutlined className="text-emerald-600 text-3xl mb-2 block" />
        {value ? (
          <>
            <Text className="block font-semibold text-emerald-700">
              {value.name}
            </Text>
            <Text className="block text-slate-400 text-xs mt-1">
              Klik atau pilih file lain untuk mengganti
            </Text>
          </>
        ) : (
          <>
            <Text className="block font-semibold text-slate-700">
              Klik atau pilih file Excel (.xlsx)
            </Text>
            <Text className="block text-slate-400 text-xs mt-1">
              Format: .xlsx · Maks. 50 MB
            </Text>
          </>
        )}
      </label>
    </div>
  );
}

// ─── Modal Component ──────────────────────────────────────────────────────────

/**
 * ReplaceTemplateModal — Upload a new CMO or Add-PO Excel template.
 *
 * Collects:
 *   - tipe_template  (CMO | ADD_PO)
 *   - version         (string)
 *   - document        (File .xlsx)
 *
 * Calls onSubmit({ tipe_template, version, file }) so the parent
 * can invoke the mutation.
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

  const handleCancel = () => {
    form.resetFields();
    setSelectedFile(null);
    onCancel();
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      if (!selectedFile) {
        form.setFields([
          { name: "document", errors: ["Unggah file Excel template terlebih dahulu."] },
        ]);
        return;
      }

      await onSubmit({
        tipe_template: values.tipe_template,
        version: values.version?.trim() ?? "",
        file: selectedFile,
      });
    } catch {
      /* validation errors surfaced inline by Ant Design */
    }
  };

  return (
    <Modal
      title={
        <div className="text-slate-800 font-bold text-lg border-b border-slate-100 pb-3">
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
        className: "bg-emerald-600 hover:bg-emerald-700 border-emerald-600 rounded-lg",
      }}
      cancelButtonProps={{ size: "large", className: "rounded-lg" }}
      className="rounded-xl overflow-hidden"
      destroyOnHidden
    >
      <div className="py-4">
        <Text className="block text-slate-500 text-sm mb-5 leading-relaxed">
          Unggah file template Excel untuk module CMO. Pilih tipe template
          (CMO atau Add PO), masukkan nomor versi, lalu pilih file .xlsx
          yang baru.
        </Text>

        <Form
          form={form}
          layout="vertical"
          style={{ "--brand": BRAND_FOCUS_COLOR }}
        >
          <Form.Item
            name="tipe_template"
            label={<Text className="font-semibold text-slate-700">Tipe Template</Text>}
            rules={[
              { required: true, message: "Pilih tipe template terlebih dahulu." },
            ]}
          >
            <Select
              placeholder="Pilih tipe template..."
              options={CMO_TIPE_TEMPLATE_OPTIONS}
              size="large"
              className="w-full rounded-lg [&_.ant-select-selector]:rounded-lg"
              showSearch
              optionFilterProp="label"
            />
          </Form.Item>

          <Form.Item
            name="version"
            label={<Text className="font-semibold text-slate-700">Nomor Versi</Text>}
            rules={[
              { required: true, message: "Nomor versi wajib diisi." },
              {
                type: "string",
                min: 1,
                message: "Minimal 1 karakter.",
              },
            ]}
          >
            <Input
              placeholder="Contoh: v1.0.0 atau 2025-Q1"
              size="large"
              className="rounded-lg hover:border-emerald-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
            />
          </Form.Item>

          <Form.Item
            name="document"
            label={<Text className="font-semibold text-slate-700">File Template (.xlsx)</Text>}
            required
          >
            <ExcelUploadField
              value={selectedFile}
              onChange={setSelectedFile}
            />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
}
