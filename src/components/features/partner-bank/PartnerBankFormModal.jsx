"use client";

import React, { useEffect } from "react";
import { Form, Input, Modal, Typography } from "antd";
import { BRAND_FOCUS_COLOR } from "@/utils/constants";

const { Text } = Typography;

/**
 * Empty shape of a partner bank record. Used to clear leftover values
 * when the modal is reopened in a different mode.
 */
const EMPTY_VALUES = {
  kode_cabang: "",
  bank_key: "",
  bank_account: "",
  part_bank_key: "",
  reference_details: "",
  account_holder: "",
};

/**
 * PartnerBankFormModal — Create / Edit form for a partner bank record.
 *
 * Collects the six fields the backend expects and hands them to `onSubmit`
 * so the parent can run the create/update mutation.
 *
 * @param {Object}   props
 * @param {boolean}  props.open
 * @param {"create"|"edit"} props.mode
 * @param {Object}   [props.initialValues] - Record to prefill (edit mode)
 * @param {Function} props.onCancel
 * @param {Function} props.onSubmit - (values) => Promise
 * @param {boolean}  [props.confirmLoading]
 */
export function PartnerBankFormModal({
  open,
  mode = "create",
  initialValues,
  onCancel,
  onSubmit,
  confirmLoading = false,
}) {
  const [form] = Form.useForm();
  const isEdit = mode === "edit";

  // Prefill the form each time the modal opens so create/edit never share state
  useEffect(() => {
    if (!open) return;

    form.resetFields();
    form.setFieldsValue({ ...EMPTY_VALUES, ...initialValues });
  }, [open, initialValues, form]);

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      await onSubmit({
        kode_cabang: values.kode_cabang?.trim() ?? "",
        bank_key: values.bank_key?.trim() ?? "",
        bank_account: values.bank_account?.trim() ?? "",
        part_bank_key: values.part_bank_key?.trim() ?? "",
        reference_details: values.reference_details?.trim() ?? "",
        account_holder: values.account_holder?.trim() ?? "",
      });
    } catch {
      /* validation errors surfaced inline by Ant Design */
    }
  };

  return (
    <Modal
      title={
        <div className="text-slate-800 font-bold text-base pb-3 border-b border-slate-100">
          {isEdit ? "Edit Partner Bank" : "Tambah Partner Bank"}
        </div>
      }
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={confirmLoading}
      okText={isEdit ? "Simpan Perubahan" : "Simpan"}
      cancelText="Batal"
      okButtonProps={{
        size: "large",
        className: "rounded-lg font-medium",
        style: { backgroundColor: BRAND_FOCUS_COLOR, borderColor: BRAND_FOCUS_COLOR },
      }}
      cancelButtonProps={{ size: "large", className: "rounded-lg" }}
      className="[&_.ant-modal-content]:rounded-xl"
      destroyOnHidden
    >
      <div className="py-4 space-y-4">
        <Text className="text-slate-500 text-sm leading-relaxed">
          {isEdit
            ? "Perbarui data partner bank. Data akan langsung tersimpan ke sistem."
            : "Isi data partner bank untuk mendaftarkan rekening bank baru."}
        </Text>

        <Form form={form} layout="vertical" style={{ "--brand": BRAND_FOCUS_COLOR }}>
          <Form.Item
            name="kode_cabang"
            label={<Text className="font-semibold text-slate-700">Kode Cabang</Text>}
            rules={[
              { required: true, message: "Kode cabang wajib diisi." },
              { whitespace: true, message: "Kode cabang tidak boleh kosong." },
            ]}
          >
            <Input
              placeholder="Contoh: 1000721"
              size="large"
              className="rounded-lg hover:border-emerald-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
            />
          </Form.Item>

          <Form.Item
            name="bank_key"
            label={<Text className="font-semibold text-slate-700">Bank Key</Text>}
            rules={[
              { required: true, message: "Bank key wajib diisi." },
              { whitespace: true, message: "Bank key tidak boleh kosong." },
            ]}
          >
            <Input
              placeholder="Contoh: 0090010"
              size="large"
              className="rounded-lg hover:border-emerald-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
            />
          </Form.Item>

          <Form.Item
            name="bank_account"
            label={<Text className="font-semibold text-slate-700">Nomor Rekening</Text>}
            rules={[
              { required: true, message: "Nomor rekening wajib diisi." },
              { whitespace: true, message: "Nomor rekening tidak boleh kosong." },
            ]}
          >
            <Input
              placeholder="Contoh: 2028058014"
              size="large"
              className="rounded-lg hover:border-emerald-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
            />
          </Form.Item>

          <Form.Item
            name="part_bank_key"
            label={<Text className="font-semibold text-slate-700">Part Bank Key</Text>}
            rules={[
              { required: true, message: "Part bank key wajib diisi." },
              { whitespace: true, message: "Part bank key tidak boleh kosong." },
            ]}
          >
            <Input
              placeholder="Contoh: 0004"
              size="large"
              className="rounded-lg hover:border-emerald-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
            />
          </Form.Item>

          <Form.Item
            name="reference_details"
            label={<Text className="font-semibold text-slate-700">Referensi</Text>}
            rules={[
              { required: true, message: "Referensi wajib diisi." },
              { whitespace: true, message: "Referensi tidak boleh kosong." },
            ]}
          >
            <Input
              placeholder="Contoh: BANK BNI"
              size="large"
              className="rounded-lg hover:border-emerald-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
            />
          </Form.Item>

          <Form.Item
            name="account_holder"
            label={<Text className="font-semibold text-slate-700">Nama Pemegang Rekening</Text>}
            rules={[
              { required: true, message: "Nama pemegang rekening wajib diisi." },
              { whitespace: true, message: "Nama pemegang rekening tidak boleh kosong." },
            ]}
          >
            <Input
              placeholder="Contoh: PT. SWIKIE INDAH PRATAMA"
              size="large"
              className="rounded-lg hover:border-emerald-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
            />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
}
