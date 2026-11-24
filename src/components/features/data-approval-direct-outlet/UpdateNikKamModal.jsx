"use client";

import React, { useEffect, useMemo } from "react";
import { Alert, Form, Input, Modal, Typography } from "antd";
import { EditOutlined } from "@ant-design/icons";
import { InfoField } from "@/components/ui";
import {
  DIRECT_OUTLET_KODE_VENDOR_FIELD,
  DIRECT_OUTLET_NAMA_KAM_FIELD,
  DIRECT_OUTLET_NIK_KAM_FIELD,
} from "@/config/dataApprovalDirectOutletConfig";

const { Text } = Typography;

/**
 * UpdateNikKamModal — Perbarui NIK KAM pada data approval direct outlet.
 *
 * Backend (`.../update/nik-kam`) hanya menerima `data_approval_direct_outlet_id`
 * dan `nik_kam`, dan menolak NIK yang tidak terdaftar di `m_user`.
 *
 * @param {Object}   props
 * @param {boolean}  props.open
 * @param {Object}   props.record - Baris tabel yang dipilih
 * @param {Function} props.onCancel
 * @param {Function} props.onSubmit - Callback dengan payload { nik_kam }
 * @param {boolean}  props.confirmLoading
 * @param {string}   props.errorDetails - Pesan error dari server (inline)
 */
export function UpdateNikKamModal({
  open,
  record,
  onCancel,
  onSubmit,
  confirmLoading = false,
  errorDetails = "",
}) {
  const [form] = Form.useForm();
  const row = useMemo(() => record || {}, [record]);

  useEffect(() => {
    // Form hanya terhubung saat modal terbuka (`destroyOnHidden`), jadi form
    // tidak boleh disentuh saat modal tertutup.
    if (!open) return;

    form.resetFields();
    form.setFieldsValue({
      [DIRECT_OUTLET_NIK_KAM_FIELD]: row[DIRECT_OUTLET_NIK_KAM_FIELD] || "",
    });
  }, [open, form, row]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onSubmit?.({ [DIRECT_OUTLET_NIK_KAM_FIELD]: values[DIRECT_OUTLET_NIK_KAM_FIELD] });
    } catch {
      /* validation errors surfaced inline by Ant Design */
    }
  };

  return (
    <Modal
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      confirmLoading={confirmLoading}
      okText="Simpan Perubahan"
      cancelText="Batal"
      title={
        <div className="flex items-center gap-2 pb-3 text-base font-bold border-b border-slate-100 text-slate-800">
          <EditOutlined className="text-blue-500" />
          <span>Update NIK KAM</span>
        </div>
      }
      okButtonProps={{
        size: "large",
        className:
          "bg-emerald-600 hover:bg-emerald-700 border-emerald-700 rounded-lg font-medium",
      }}
      cancelButtonProps={{ size: "large", className: "rounded-lg" }}
      width={640}
      destroyOnHidden
      className="[&_.ant-modal-content]:rounded-xl"
    >
      <div className="py-4 space-y-5">
        {errorDetails ? (
          <Alert
            type="error"
            showIcon
            message={errorDetails}
            className="rounded-lg"
          />
        ) : null}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-4 rounded-xl bg-slate-50 border border-slate-200 px-4 py-3">
          <InfoField
            label="Kode Vendor"
            value={row[DIRECT_OUTLET_KODE_VENDOR_FIELD]}
            mono
          />
          <InfoField
            label="Nama KAM"
            value={row[DIRECT_OUTLET_NAMA_KAM_FIELD]}
            className="sm:col-span-2"
          />
          <InfoField
            label="NIK KAM Saat Ini"
            value={row[DIRECT_OUTLET_NIK_KAM_FIELD]}
            mono
          />
        </div>

        <Form form={form} layout="vertical" requiredMark={false}>
          <Form.Item
            name={DIRECT_OUTLET_NIK_KAM_FIELD}
            label={
              <Text className="font-semibold text-slate-700">NIK KAM</Text>
            }
            extra={
              <Text className="text-xs text-slate-400">
                NIK harus terdaftar pada master karyawan (m_user), jika tidak
                backend akan menolak perubahan.
              </Text>
            }
            rules={[
              { required: true, message: "NIK KAM wajib diisi." },
              { max: 32, message: "NIK KAM maksimal 32 karakter." },
            ]}
          >
            <Input
              size="large"
              placeholder="Masukkan NIK KAM..."
              className="rounded-lg font-mono"
            />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
}
