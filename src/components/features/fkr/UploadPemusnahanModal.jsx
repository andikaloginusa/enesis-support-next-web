"use client";

import React, { useCallback, useRef, useState } from "react";
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
// UploadPemusnahanModal
// ─────────────────────────────────────────────────────────────────────────────

/**
 * UploadPemusnahanModal — Bulk upload FKR Pemusnahan via Excel.
 *
 * Collects an Excel file and a Work Order (WO) number from the user,
 * then calls `onSubmit({ file, reason })` so the parent can invoke the
 * mutation with the current user's m_user_id injected.
 */
export function UploadPemusnahanModal({
  open,
  onCancel,
  onSubmit,
  confirmLoading = false,
}) {
  const [form] = Form.useForm();
  const selectedFileRef = useRef(null);
  // selectedFile state drives the Upload.Dragger fileList reactively
  const [selectedFile, setSelectedFile] = useState(null);
  const { notification } = App.useApp();

  // ── File change — store in ref AND state ──────────────────────────────────
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
      // Store in both ref (for submit) and state (for re-render)
      selectedFileRef.current = file;
      setSelectedFile(file);
      return false; // hold — no auto-upload
    },
    [notification],
  );

  // ── File remove ────────────────────────────────────────────────────────────
  const handleRemove = () => {
    selectedFileRef.current = null;
    setSelectedFile(null);
  };

  // ── Cancel — reset everything ─────────────────────────────────────────────
  const handleCancel = () => {
    form.resetFields();
    selectedFileRef.current = null;
    setSelectedFile(null);
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

  // Build fileList from state for Upload.Dragger
  const fileList = selectedFile ? [{ uid: "-1", name: selectedFile.name, status: "done", originFileObj: selectedFile }] : [];

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
          "bg-emerald-600 hover:bg-emerald-700 border-emerald-700 rounded-lg font-medium",
      }}
      cancelButtonProps={{ size: "large", className: "rounded-lg" }}
      className="[&_.ant-modal-content]:rounded-xl"
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
          {/* File Excel Field */}
          <Form.Item
            name="excel"
            label={
              <Text className="font-semibold text-slate-700">File Excel</Text>
            }
          >
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
                Klik atau seret file Excel ke sini
              </p>
              <p className="ant-upload-hint text-slate-400 text-xs">
                Format: .xls, .xlsx &nbsp;&middot;&nbsp; Maks. 50 MB
              </p>
            </Upload.Dragger>
          </Form.Item>

          {/* Work Order Field */}
          <Form.Item
            name="reason"
            label={
              <Text className="font-semibold text-slate-700">
                Nomor Work Order (WO)
              </Text>
            }
            rules={[
              { required: true, message: "Nomor WO wajib diisi." },
            ]}
          >
            <Input
              placeholder="Masukkan nomor WO"
              size="large"
              className="rounded-lg"
              onChange={(e) => form.setFieldValue("reason", e.target.value)}
            />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
}
