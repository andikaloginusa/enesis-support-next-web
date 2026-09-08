"use client";

import React from "react";
import { Form, Modal, Select, Typography } from "antd";
import {
  CMO_WEEK_OPTIONS,
  CMO_BULAN_OPTIONS,
  CMO_TAHUN_OPTIONS,
} from "@/config/cmoConfig";
import { useConfirm } from "@/hooks/useConfirm";

const { Text } = Typography;

/**
 * RegenerateCOrderModal — Generate C-Order records from CMO data for a week.
 *
 * Collects: tahun, bulan, week_number (1–5).
 * Calls onSubmit({ tahun, bulan, week_number }) so the parent
 * can invoke the mutation.
 *
 * @param {Object}   props
 * @param {boolean}  props.open
 * @param {Function} props.onCancel
 * @param {Function} props.onSubmit  - ({ tahun, bulan, week_number }) => Promise
 * @param {boolean}  props.confirmLoading
 */
export function RegenerateCOrderModal({
  open,
  onCancel,
  onSubmit,
  confirmLoading = false,
}) {
  const [form] = Form.useForm();
  const { confirmAction } = useConfirm();

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  /**
   * Validates form → shows contextual confirmation for C-Order regen →
   * calls onSubmit only after user explicitly approves.
   */
  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      confirmAction({
        title: "Konfirmasi Regenerasi C-Order",
        description:
          `Apakah Anda yakin ingin meregenerasi C-Order untuk periode ` +
          `Bulan ${values.bulan}, Tahun ${values.tahun}, Minggu ke-${values.week_number}? ` +
          `Proses ini akan membuat record C-Order baru berdasarkan data CMO yang ada.`,
        okText: "Ya, Proses Regenerasi",
        onConfirm: async () => {
          await onSubmit({
            tahun: values.tahun,
            bulan: values.bulan,
            week_number: values.week_number,
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
        <div className="text-slate-800 font-bold text-lg border-b border-slate-100 pb-3">
          Regenerasi C-Order
        </div>
      }
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={confirmLoading}
      okText="Proses Regenerasi"
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
          Membuat record C-Order beserta detailnya berdasarkan data CMO
          yang ada. Pilih periode tahun, bulan, dan minggu ke berapa
          yang ingin diproses.
        </Text>

        <Form
          form={form}
          layout="vertical"
          initialValues={{ week_number: "1" }}
        >
          <Form.Item
            name="tahun"
            label={<Text className="font-semibold text-slate-700">Tahun</Text>}
            rules={[{ required: true, message: "Tahun wajib dipilih." }]}
          >
            <Select
              placeholder="Pilih tahun..."
              options={CMO_TAHUN_OPTIONS}
              size="large"
              className="w-full rounded-lg [&_.ant-select-selector]:rounded-lg"
              showSearch
              optionFilterProp="label"
            />
          </Form.Item>

          <Form.Item
            name="bulan"
            label={<Text className="font-semibold text-slate-700">Bulan</Text>}
            rules={[{ required: true, message: "Bulan wajib dipilih." }]}
          >
            <Select
              placeholder="Pilih bulan..."
              options={CMO_BULAN_OPTIONS}
              size="large"
              className="w-full rounded-lg [&_.ant-select-selector]:rounded-lg"
              showSearch
              optionFilterProp="label"
            />
          </Form.Item>

          <Form.Item
            name="week_number"
            label={<Text className="font-semibold text-slate-700">Minggu Ke-</Text>}
            rules={[{ required: true, message: "Minggu ke- wajib dipilih." }]}
          >
            <Select
              placeholder="Pilih minggu ke..."
              options={CMO_WEEK_OPTIONS}
              size="large"
              className="w-full rounded-lg [&_.ant-select-selector]:rounded-lg"
            />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
}
