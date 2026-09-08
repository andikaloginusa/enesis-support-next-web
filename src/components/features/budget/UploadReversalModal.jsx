"use client";

import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Modal, Form, Input, Select, Button, Space, Typography, Upload, message } from "antd";
import {
  UploadOutlined,
  ThunderboltOutlined,
  FileExcelOutlined,
  InboxOutlined,
} from "@ant-design/icons";
import { useConfirm } from "@/hooks/useConfirm";
import { getUserId } from "@/utils/storage";

const { Text } = Typography;

const DIVISION_OPTIONS = [
  { value: "GT", label: "GT" },
  { value: "PR", label: "PR" },
  { value: "MM1", label: "MM1" },
  { value: "MT", label: "MT" },
  { value: "MM2", label: "MM2" },
  { value: "INFRA-GT", label: "INFRA-GT" },
  { value: "INFRA-MT", label: "INFRA-MT" },
  { value: "MM", label: "MM" },
  { value: "PHAR", label: "PHAR" },
  { value: "B2B", label: "B2B" },
  { value: "ECOM", label: "ECOM" },
  { value: "IM", label: "IM" },
];

/**
 * UploadReversalModal
 *
 * Form modal to upload Reversal Budget Excel file with process code generation.
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
  const [selectedDivision, setSelectedDivision] = useState("GT");
  const [fileList, setFileList] = useState([]);

  useEffect(() => {
    if (open) {
      const currentUserId = getUserId();
      form.setFieldsValue({
        m_user_id: currentUserId,
        divisi: "GT",
        nama: "",
        tab: "",
      });
      setSelectedDivision("GT");
      setFileList([]);
    }
  }, [open, form]);

  const handleGenerateCode = async () => {
    setIsGenerating(true);
    try {
      const code = await generateProcessCode(selectedDivision);
      form.setFieldsValue({ tab: code });
    } catch {
      message.error("Gagal menghasilkan kode proses");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (fileList.length === 0) {
        message.warning("Silakan pilih file Excel (.xlsx) terlebih dahulu!");
        return;
      }

      const file = fileList[0];

      confirmAction({
        title: "Konfirmasi Upload Reversal",
        description: `Apakah Anda yakin ingin mengunggah file Reversal Budget untuk kode proses "${values.tab}"? Data akan langsung diproses ke sistem.`,
        okText: "Ya, Upload Sekarang",
        onConfirm: async () => {
          await onUpload({
            nama: values.nama,
            tab: values.tab,
            file,
          });
          onClose();
        },
      });
    } catch {
      // Form validation failure
    }
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
      return false; // Prevent automatic upload
    },
    onRemove: () => {
      setFileList([]);
    },
    fileList,
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 text-slate-800 font-semibold text-base">
          <UploadOutlined className="text-emerald-600" />
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
        style: {
          backgroundColor: "#1aac32",
          borderColor: "#1aac32",
        },
      }}
    >
      <div className="py-2">
        <Form form={form} layout="vertical" className="space-y-3">
          {/* Nama Pengirim */}
          <Form.Item
            label={<Text className="font-semibold text-slate-700">Nama Pengirim</Text>}
            name="nama"
            rules={[{ required: true, message: "Nama pengirim wajib diisi!" }]}
          >
            <Input placeholder="Masukkan nama pengirim" size="large" />
          </Form.Item>

          {/* User ID */}
          <Form.Item
            label={<Text className="font-semibold text-slate-700">M User ID</Text>}
            name="m_user_id"
          >
            <Input disabled size="large" className="bg-slate-100 text-slate-500" />
          </Form.Item>

          {/* Divisi & Kode Proses (Tab) */}
          <div className="space-y-1">
            <Text className="font-semibold text-slate-700">Divisi & Kode Proses</Text>
            <div className="flex gap-2">
              <Form.Item name="divisi" noStyle>
                <Select
                  options={DIVISION_OPTIONS}
                  value={selectedDivision}
                  onChange={(val) => setSelectedDivision(val)}
                  size="large"
                  className="w-36"
                />
              </Form.Item>

              <Form.Item
                name="tab"
                noStyle
                rules={[{ required: true, message: "Kode proses belum dibuat! Klik Generate." }]}
              >
                <Input
                  disabled
                  placeholder="Kode Proses (Generate)"
                  size="large"
                  className="flex-1 bg-slate-100 font-mono font-medium text-slate-700"
                />
              </Form.Item>

              <Button
                type="default"
                icon={<ThunderboltOutlined />}
                loading={isGenerating}
                onClick={handleGenerateCode}
                size="large"
                className="border-emerald-600 text-emerald-600 hover:text-emerald-700 hover:border-emerald-700"
              >
                Generate
              </Button>
            </div>
          </div>

          {/* Upload File */}
          <div className="pt-2">
            <Text className="font-semibold text-slate-700 block mb-1.5">
              File Excel Reversal (.xlsx)
            </Text>
            <Upload.Dragger {...uploadProps} className="p-4 bg-slate-50 border-dashed border-slate-300 rounded-xl">
              <p className="ant-upload-drag-icon">
                <InboxOutlined className="text-emerald-600 text-3xl" />
              </p>
              <p className="ant-upload-text text-sm font-medium text-slate-700">
                Klik atau tarik file Excel Reversal ke area ini
              </p>
              <p className="ant-upload-hint text-xs text-slate-400">
                Mendukung format .xlsx sesuai template sistem
              </p>
            </Upload.Dragger>
          </div>
        </Form>
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
