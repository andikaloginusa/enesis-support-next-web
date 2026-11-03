"use client";

import React, { useEffect } from "react";
import { Alert, Form, Modal, Select, Typography } from "antd";
import { EditOutlined } from "@ant-design/icons";
import { InfoField } from "@/components/ui";
import {
  DELIVERY_ORDER_BUNDLE_FIELD,
  DELIVERY_ORDER_ID_FIELD,
  DELIVERY_ORDER_STATUS_OPTIONS,
  getDeliveryOrderStatusLabel,
} from "@/config/deliveryOrderConfig";

const { Text } = Typography;

/**
 * UpdateDeliveryOrderStatusModal — Ubah kode status satu Delivery Order.
 *
 * `delivery_order_id` diambil dari baris tabel yang dipilih (read-only),
 * sedangkan `m_user_id` disuntikkan parent dari user yang sedang login —
 * modal ini tidak pernah menerima user id dari luar.
 *
 * @param {Object}   props
 * @param {boolean}  props.open
 * @param {Object}   props.deliveryOrder - Baris tabel yang dipilih
 * @param {Function} props.onCancel
 * @param {Function} props.onSubmit - Callback dengan `{ delivery_order_id, kode_status }`
 * @param {boolean}  props.confirmLoading
 * @param {Object}   props.errorDetails - Detail kegagalan dari backend `{ bundle_id, reason }`
 */
export function UpdateDeliveryOrderStatusModal({
  open,
  deliveryOrder,
  onCancel,
  onSubmit,
  confirmLoading = false,
  errorDetails = null,
}) {
  const [form] = Form.useForm();
  const row = deliveryOrder || {};

  useEffect(() => {
    if (open) {
      form.setFieldsValue({ kode_status: row.kode_status || undefined });
    } else {
      form.resetFields();
    }
  }, [open, row.kode_status, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onSubmit?.({
        [DELIVERY_ORDER_ID_FIELD]: row[DELIVERY_ORDER_ID_FIELD],
        kode_status: values.kode_status,
      });
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
      okText="Perbarui Status"
      cancelText="Batal"
      title={
        <div className="flex items-center gap-2 pb-3 text-base font-bold border-b border-slate-100 text-slate-800">
          <EditOutlined className="text-blue-500" />
          <span>Update Status Delivery Order</span>
        </div>
      }
      okButtonProps={{
        size: "large",
        className:
          "bg-emerald-600 hover:bg-emerald-700 border-emerald-700 rounded-lg font-medium",
      }}
      cancelButtonProps={{ size: "large", className: "rounded-lg" }}
      width={560}
      destroyOnHidden
      className="[&_.ant-modal-content]:rounded-xl"
    >
      <div className="py-4 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 rounded-xl bg-slate-50 border border-slate-200 px-4 py-3">
          <InfoField
            label="Bundle ID"
            value={row[DELIVERY_ORDER_BUNDLE_FIELD]}
            mono
          />
          <InfoField label="Console Number" value={row.console_number} mono />
          <InfoField
            label="Delivery Order ID"
            value={row[DELIVERY_ORDER_ID_FIELD]}
            mono
            className="sm:col-span-2"
          />
        </div>

        <Form form={form} layout="vertical" requiredMark={false}>
          <Form.Item
            name="kode_status"
            label={
              <Text className="font-semibold text-slate-700">Status</Text>
            }
            rules={[
              { required: true, message: "Status wajib dipilih." },
            ]}
          >
            <Select
              size="large"
              showSearch
              placeholder="Pilih status baru..."
              className="rounded-lg"
              options={DELIVERY_ORDER_STATUS_OPTIONS.map((item) => ({
                value: item.value,
                label: item.label,
                code: item.value,
              }))}
              filterOption={(input, option) => {
                const keyword = input.toLowerCase();
                return (
                  String(option?.label || "")
                    .toLowerCase()
                    .includes(keyword) ||
                  String(option?.code || "")
                    .toLowerCase()
                    .includes(keyword)
                );
              }}
              optionRender={(option) => (
                <div className="flex flex-col">
                  <span className="font-semibold text-slate-700">
                    {option.data.label}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {option.data.value}
                  </span>
                </div>
              )}
            />
          </Form.Item>
        </Form>

        {row.kode_status && (
          <Text className="block text-xs text-slate-400">
            Status saat ini: {getDeliveryOrderStatusLabel(row.kode_status)}
          </Text>
        )}

        {errorDetails?.reason && (
          <Alert
            type="error"
            showIcon
            message="Status tidak dapat diperbarui"
            description={errorDetails.reason}
            className="rounded-xl"
          />
        )}
      </div>
    </Modal>
  );
}
