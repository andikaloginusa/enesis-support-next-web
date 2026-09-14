"use client";

import React, { useEffect } from "react";
import PropTypes from "prop-types";
import {
  Modal,
  Button,
  Typography,
} from "antd";
import {
  DownloadOutlined,
  FileExcelOutlined,
  InboxOutlined,
} from "@ant-design/icons";
import { useConfirm } from "@/hooks/useConfirm";
import { ExcelUploadField } from "@/components/ui/ExcelUpload";

const { Text } = Typography;

const ACCENT_COLORS = {
  emerald: "#1aac32",
  blue: "#2563eb",
};

/**
 * UploadBudgetFileModal
 *
 * Reusable modal for uploading Add Budget or Move Budget Excel spreadsheets.
 * Includes a direct download link for the respective Excel template and
 * a `useConfirm` dialog before submitting.
 *
 * Now uses the shared `ExcelUploadField` component for clean, DRY upload UI.
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
  accentColor = "emerald",
}) {
  const { confirmAction } = useConfirm();
  const { notification } = App.useApp();
  const [selectedFile, setSelectedFile] = React.useState(null);
  const [fileError, setFileError] = React.useState("");

  // Reset on close — always fresh state when reopened
  useEffect(() => {
    if (!open) {
      setSelectedFile(null);
      setFileError("");
    }
  }, [open]);

  const handleSubmit = () => {
    if (!selectedFile) {
      setFileError("Silakan pilih file Excel (.xlsx) terlebih dahulu!");
      return;
    }

    confirmAction({
      title: `Konfirmasi ${title}`,
      description: confirmDescription,
      okText: `Ya, ${actionLabel}`,
      onConfirm: async () => {
        await onUpload(selectedFile);
        onClose();
      },
    });
  };

  const handleFileChange = (file) => {
    if (!file) {
      setSelectedFile(null);
      setFileError("File tidak valid.");
      return;
    }
    setSelectedFile(file);
    setFileError("");
  };

  const btnBg = ACCENT_COLORS[accentColor] ?? ACCENT_COLORS.emerald;

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 text-slate-800 font-bold text-base pb-3 border-b border-slate-100">
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
        size: "large",
        disabled: isUploading,
        style: {
          backgroundColor: btnBg,
          borderColor: btnBg,
        },
        className: "rounded-lg font-medium hover:opacity-90",
      }}
      cancelButtonProps={{ size: "large", className: "rounded-lg" }}
      className="[&_.ant-modal-content]:rounded-xl"
    >
      <div className="py-4 space-y-4">

        {/* Description */}
        <Text className="text-slate-500 text-sm block leading-relaxed">
          {description}
        </Text>

        {/* Template download card */}
        {templateUrl && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <FileExcelOutlined className="text-emerald-600 text-lg" />
              <div>
                <Text className="text-xs text-slate-500 block">
                  Belum punya template?
                </Text>
                <Text className="text-xs font-semibold text-slate-700">
                  {templateFilename}
                </Text>
              </div>
            </div>
            <a
              href={templateUrl}
              download={templateFilename}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                size="small"
                icon={<DownloadOutlined />}
                className="text-xs border-slate-300 text-slate-600 hover:border-emerald-600 hover:text-emerald-600"
              >
                Unduh Template
              </Button>
            </a>
          </div>
        )}

        {/* Upload Field */}
        <ExcelUploadField
          value={selectedFile}
          onChange={handleFileChange}
          error={fileError}
          placeholder="Klik atau tarik file Excel ke sini"
          hint="Format wajib .xlsx sesuai panduan template · Maks. 50 MB"
        />
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
  accentColor: PropTypes.oneOf(["emerald", "blue"]),
};
