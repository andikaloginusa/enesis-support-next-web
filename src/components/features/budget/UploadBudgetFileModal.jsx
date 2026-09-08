"use client";

import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Modal, Button, Typography, Upload, message, Space } from "antd";
import {
  DownloadOutlined,
  InboxOutlined,
  FileExcelOutlined,
} from "@ant-design/icons";
import { useConfirm } from "@/hooks/useConfirm";

const { Text, Title } = Typography;

/**
 * UploadBudgetFileModal
 *
 * Reusable modal for uploading Add Budget or Move Budget Excel spreadsheets.
 * Includes direct download link for the respective Excel template and useConfirm dialog.
 */
export function UploadBudgetFileModal({
  open,
  onClose,
  title = "Upload File Budget",
  description = "Pilih file Excel yang sesuai format template untuk diunggah.",
  templateUrl,
  templateFilename = "Template.xlsx",
  onUpload,
  isUploading = false,
  confirmDescription = "Apakah Anda yakin ingin memproses file ini?",
  actionLabel = "Upload Sekarang",
  accentColor = "emerald", // "emerald" | "blue"
}) {
  const { confirmAction } = useConfirm();
  const [fileList, setFileList] = useState([]);

  useEffect(() => {
    if (!open) {
      setFileList([]);
    }
  }, [open]);

  const handleSubmit = () => {
    if (fileList.length === 0) {
      message.warning("Silakan pilih file Excel (.xlsx) terlebih dahulu!");
      return;
    }

    const file = fileList[0];

    confirmAction({
      title: `Konfirmasi ${title}`,
      description: confirmDescription,
      okText: `Ya, ${actionLabel}`,
      onConfirm: async () => {
        await onUpload(file);
        onClose();
      },
    });
  };

  const uploadProps = {
    accept: ".xlsx",
    maxCount: 1,
    beforeUpload: (file) => {
      const isXlsx =
        file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        file.name.endsWith(".xlsx");
      if (!isXlsx) {
        message.error("Hanya file Excel .xlsx yang diperbolehkan!");
        return Upload.LIST_IGNORE;
      }
      setFileList([file]);
      return false;
    },
    onRemove: () => {
      setFileList([]);
    },
    fileList,
  };

  const btnBg = accentColor === "blue" ? "#2563eb" : "#1aac32";

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 text-slate-800 font-semibold text-base">
          <FileExcelOutlined style={{ color: btnBg }} />
          <span>{title}</span>
        </div>
      }
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      confirmLoading={isUploading}
      okText={actionLabel}
      cancelText="Batal"
      destroyOnHidden
      width={500}
      okButtonProps={{
        style: {
          backgroundColor: btnBg,
          borderColor: btnBg,
        },
      }}
    >
      <div className="py-2 space-y-4">
        <Text className="text-slate-500 text-sm block">
          {description}
        </Text>

        {/* Template download card */}
        {templateUrl && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <FileExcelOutlined className="text-emerald-600 text-lg" />
              <div>
                <Text className="text-xs text-slate-500 block">Belum punya template?</Text>
                <Text className="text-xs font-semibold text-slate-700">{templateFilename}</Text>
              </div>
            </div>
            <Button
              size="small"
              icon={<DownloadOutlined />}
              href={templateUrl}
              download={templateFilename}
              className="text-xs border-slate-300 text-slate-600 hover:text-emerald-600 hover:border-emerald-600"
            >
              Unduh Template
            </Button>
          </div>
        )}

        {/* Drop Zone */}
        <div>
          <Upload.Dragger {...uploadProps} className="p-4 bg-slate-50 border-dashed border-slate-300 rounded-xl">
            <p className="ant-upload-drag-icon">
              <InboxOutlined style={{ color: btnBg, fontSize: 32 }} />
            </p>
            <p className="ant-upload-text text-sm font-medium text-slate-700">
              Klik atau tarik file Excel ke sini
            </p>
            <p className="ant-upload-hint text-xs text-slate-400">
              Format wajib .xlsx sesuai panduan template
            </p>
          </Upload.Dragger>
        </div>
      </div>
    </Modal>
  );
}

UploadBudgetFileModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  description: PropTypes.string,
  templateUrl: PropTypes.string,
  templateFilename: PropTypes.string,
  onUpload: PropTypes.func.isRequired,
  isUploading: PropTypes.bool,
  confirmDescription: PropTypes.string,
  actionLabel: PropTypes.string,
  accentColor: PropTypes.string,
};
