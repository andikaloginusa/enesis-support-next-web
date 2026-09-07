"use client";

import React from "react";
import { Form, Modal, Select, Typography } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { CMO_ACTION_OPTIONS } from "@/config/cmoConfig";

const { Text } = Typography;

/**
 * RejectKillCmoModal — Reject or kill a single CMO record.
 *
 * Collects: action (reject | kill).
 * Calls onSubmit({ cmo_id, action, m_user_id }) so the parent
 * can inject the user ID.
 *
 * @param {Object}   props
 * @param {boolean}  props.open
 * @param {Function} props.onCancel
 * @param {Function} props.onSubmit  - ({ cmo_id, action }) => Promise
 * @param {boolean}  props.confirmLoading
 * @param {Object}   props.cmo  - { cmo_id, nomor_cmo, status }
 */
export function RejectKillCmoModal({
  open,
  onCancel,
  onSubmit,
  confirmLoading = false,
  cmo,
}) {
  const [form] = Form.useForm();

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      await onSubmit({
        cmo_id: cmo?.cmo_id,
        action: values.action,
      });
    } catch {
      /* validation errors surfaced inline by Ant Design */
    }
  };

  return (
    <Modal
      title={
        <div className="text-slate-800 font-bold text-lg border-b border-slate-100 pb-3">
          Reject / Kill CMO
        </div>
      }
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={confirmLoading}
      okText="Konfirmasi"
      cancelText="Batal"
      okButtonProps={{
        size: "large",
        className: "bg-rose-600 hover:bg-rose-700 border-rose-600 rounded-lg",
        danger: true,
      }}
      cancelButtonProps={{ size: "large", className: "rounded-lg" }}
      className="rounded-xl overflow-hidden"
      destroyOnHidden
    >
      <div className="py-4">
        {cmo?.nomor_cmo && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-4 flex items-start gap-3">
            <ExclamationCircleOutlined className="text-amber-500 text-lg flex-shrink-0 mt-0.5" />
            <div>
              <Text className="block font-semibold text-amber-800 text-sm">
                Anda akan melakukan aksi pada CMO:
              </Text>
              <Text className="block text-amber-700 font-bold text-base mt-0.5">
                {cmo.nomor_cmo}
              </Text>
              <Text className="block text-amber-600 text-xs mt-1">
                Status saat ini: {cmo.status || "—"}
              </Text>
            </div>
          </div>
        )}

        <Text className="block text-slate-500 text-sm mb-5 leading-relaxed">
          Pilih aksi yang ingin dilakukan. <strong>Reject</strong> akan
          mengubah status CMO menjadi &ldquo;Rejected by Support&rdquo;.{" "}
          <strong>Kill</strong> akan mematikan CMO (is_active = N).
        </Text>

        <Form
          form={form}
          layout="vertical"
          initialValues={{ action: "reject" }}
        >
          <Form.Item
            name="action"
            label={<Text className="font-semibold text-slate-700">Aksi</Text>}
            rules={[{ required: true, message: "Pilih aksi terlebih dahulu." }]}
          >
            <Select
              placeholder="Pilih aksi..."
              options={CMO_ACTION_OPTIONS}
              size="large"
              className="w-full rounded-lg [&_.ant-select-selector]:rounded-lg"
            />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
}
