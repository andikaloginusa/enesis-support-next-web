"use client";

import React, { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  Typography,
} from "antd";
import {
  ThunderboltOutlined,
  FileExcelOutlined,
} from "@ant-design/icons";
import { useConfirm } from "@/hooks/useConfirm";
import { getUserId } from "@/utils/storage";
import { ExcelUploadField } from "@/components/ui/ExcelUpload";

const { Text } = Typography;

const DIVISION_OPTIONS = [
  { value: "GT",       label: "GT"        },
  { value: "PR",       label: "PR"        },
  { value: "MM1",      label: "MM1"       },
  { value: "MT",       label: "MT"        },
  { value: "MM2",      label: "MM2"       },
  { value: "INFRA-GT", label: "INFRA-GT"  },
  { value: "INFRA-MT", label: "INFRA-MT"  },
  { value: "MM",       label: "MM"        },
  { value: "PHAR",     label: "PHAR"      },
  { value: "B2B",      label: "B2B"       },
  { value: "ECOM",     label: "ECOM"      },
  { value: "IM",       label: "IM"         },
];

const DEFAULT_DIVISION = "GT";

/**
 * UploadReversalModal
 *
 * Form modal to upload Reversal Budget Excel file with process code generation.
 * Uses `ExcelUploadField` for file selection and `App.useApp().notification`
 * for error feedback (consistent with the rest of the app).
 */
export function UploadReversalModal({
  open,
  onClose,
  onUpload,
  isUploading,
  generateProcessCode,
}) {
  const [form] = Form.useForm();
  const { confirmAction } = useConfirm();

  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedDivision, setSelectedDivision] = useState(DEFAULT_DIVISION);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState("");

  // Reset on close — always fresh state when reopened
  useEffect(() => {
    if (!open) return;
    form.resetFields();
    setSelectedDivision(DEFAULT_DIVISION);
    setSelectedFile(null);
    setFileError("");
    form.setFieldsValue({ divisi: DEFAULT_DIVISION });
  }, [open, form]);

  const handleGenerateCode = useCallback(async () => {
    setIsGenerating(true);
    try {
      const code = await generateProcessCode(selectedDivision);
      form.setFieldsValue({ tab: code });
    } catch {
      /* error surfaced via hook notify */
    } finally {
      setIsGenerating(false);
    }
  }, [selectedDivision, generateProcessCode, form]);

  const handleFileChange = useCallback((file) => {
    if (!file) {
      setSelectedFile(null);
      setFileError("File tidak valid.");
      return;
    }
    setSelectedFile(file);
    setFileError("");
  }, []);

  const handleSubmit = useCallback(async () => {
    const values = await form.validateFields();

    if (!selectedFile) {
      setFileError("Silakan pilih file Excel (.xlsx) terlebih dahulu!");
      return;
    }

    confirmAction({
      title: "Konfirmasi Upload Reversal",
      description:
        `Apakah Anda yakin ingin mengunggah file Reversal Budget untuk kode proses "${values.tab}"? ` +
        `Data akan langsung diproses ke sistem.`,
      okText: "Ya, Upload Sekarang",
      onConfirm: async () => {
        await onUpload({
          nama: values.nama,
          tab: values.tab,
          file: selectedFile,
        });
        onClose();
      },
    });
  }, [selectedFile, onUpload, onClose, confirmAction, form]);

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 text-slate-800 font-bold text-base pb-3 border-b border-slate-100">
          <FileExcelOutlined className="text-emerald-600" />
          <span>Upload Reversal Budget</span>
        </div>
      }
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      confirmLoading={isUploading}
      okText="Simpan Reversal"
      cancelText="Batal"
      destroyOnHidden
      width={540}
      okButtonProps={{
        size: "large",
        disabled: isUploading,
        style: { backgroundColor: "#1aac32", borderColor: "#1aac32" },
        className: "rounded-lg font-medium hover:opacity-90",
      }}
      cancelButtonProps={{ size: "large", className: "rounded-lg" }}
      className="[&_.ant-modal-content]:rounded-xl"
    >
      <div className="py-4 space-y-4">

        {/* Nama Pengirim */}
        <Form.Item
          label={<Text className="font-semibold text-slate-700">Nama Pengirim</Text>}
          name="nama"
          rules={[{ required: true, message: "Nama pengirim wajib diisi." }]}
        >
          <Input placeholder="Masukkan nama pengirim" size="large" className="rounded-lg" />
        </Form.Item>

        {/* Divisi & Kode Proses */}
        <div className="space-y-1">
          <Text className="font-semibold text-slate-700">Divisi &amp; Kode Proses</Text>
          <div className="flex gap-2">
            <Form.Item name="divisi" noStyle>
              <Select
                options={DIVISION_OPTIONS}
                value={selectedDivision}
                onChange={setSelectedDivision}
                size="large"
                className="w-36 [&_.ant-select-selector]:rounded-lg"
              />
            </Form.Item>

            <Form.Item
              name="tab"
              noStyle
              rules={[
                {
                  required: true,
                  message: "Kode proses belum dibuat! Klik Generate.",
                },
              ]}
            >
              <Input
                disabled
                placeholder="Kode Proses (Generate)"
                size="large"
                className="flex-1 bg-slate-100 font-mono font-medium text-slate-700 rounded-lg"
              />
            </Form.Item>

            <Button
              type="default"
              icon={<ThunderboltOutlined />}
              loading={isGenerating}
              onClick={handleGenerateCode}
              size="large"
              className="border-emerald-600 text-emerald-600 hover:!border-emerald-700 hover:!text-emerald-700 rounded-lg whitespace-nowrap"
            >
              Generate
            </Button>
          </div>
        </div>

        {/* File Upload */}
        <div>
          <Text className="font-semibold text-slate-700 block mb-1.5">
            File Excel Reversal (.xlsx)
          </Text>
          <ExcelUploadField
            value={selectedFile}
            onChange={handleFileChange}
            error={fileError}
            accept=".xlsx"
            placeholder="Klik atau tarik file Excel Reversal ke area ini"
            hint="Mendukung format .xlsx sesuai template sistem · Maks. 50 MB"
          />
        </div>
      </div>
    </Modal>
  );
}

UploadReversalModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onUpload: PropTypes.func.isRequired,
  isUploading: PropTypes.bool,
  generateProcessCode: PropTypes.func.isRequired,
};
