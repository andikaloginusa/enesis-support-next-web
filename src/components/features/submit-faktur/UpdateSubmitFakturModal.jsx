"use client";

import React, { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { Alert, DatePicker, Form, Input, Modal, Select, Typography } from "antd";
import { EditOutlined } from "@ant-design/icons";
import { InfoField } from "@/components/ui";
import { formatDate } from "@/utils/formatters";
import {
  SUBMIT_FAKTUR_ALL_STATUS_OPTIONS,
  SUBMIT_FAKTUR_PAYMENT_TERM_OPTIONS,
  getSubmitFakturStatusLabel,
  isRejectStatus,
} from "@/config/submitFakturConfig";

const { Text } = Typography;

const DATE_FORMAT = "YYYY-MM-DD";

/**
 * Normalisasi nilai tanggal dari backend (ISO string / Date) menjadi
 * "YYYY-MM-DD" supaya bisa dibandingkan dengan hasil DatePicker.
 */
const toDateString = (value) => {
  if (!value) return "";
  if (dayjs.isDayjs(value)) return value.format(DATE_FORMAT);
  if (typeof value === "string") return value.slice(0, 10);
  if (value instanceof Date) return dayjs(value).format(DATE_FORMAT);
  return "";
};

/**
 * Ubah nilai tanggal backend menjadi objek dayjs untuk DatePicker.
 *
 * antd v6 sudah menghapus `valueFormat`, jadi DatePicker hanya menerima
 * objek dayjs — string akan membuat picker gagal saat memvalidasi tanggal.
 */
const toDayjs = (value) => {
  const text = toDateString(value);
  if (!text) return null;
  const parsed = dayjs(text);
  return parsed.isValid() ? parsed : null;
};

/**
 * UpdateSubmitFakturModal — Perbarui data invoice Submit Faktur.
 *
 * Backend (`SubmitFakturSupportController.updateInvoice`) hanya mengubah
 * field yang dikirim, minimal satu field wajib, dan `kode_status` hanya boleh
 * dikirim bersamaan dengan `status`.
 *
 * @param {Object}   props
 * @param {boolean}  props.open
 * @param {Object}   props.invoice - Baris tabel yang dipilih
 * @param {Function} props.onCancel
 * @param {Function} props.onSubmit - Callback dengan payload update
 * @param {boolean}  props.confirmLoading
 * @param {string}   props.errorDetails - Pesan error dari server (ditampilkan inline)
 */
export function UpdateSubmitFakturModal({
  open,
  invoice,
  onCancel,
  onSubmit,
  confirmLoading = false,
  errorDetails = "",
}) {
  const [form] = Form.useForm();
  const [selectedStatus, setSelectedStatus] = useState(null);
  const row = useMemo(() => invoice || {}, [invoice]);

  const isReject = isRejectStatus(selectedStatus);

  useEffect(() => {
    // Form hanya terhubung saat modal terbuka (`destroyOnHidden`), jadi form
    // tidak boleh disentuh saat modal tertutup.
    if (!open) {
      setSelectedStatus(null);
      return;
    }

    const currentStatus = row.kode_status || undefined;
    setSelectedStatus(currentStatus);
    form.resetFields();
    form.setFieldsValue({
      status: currentStatus,
      reason_reject: row.reason || undefined,
      tanggal_invoice: toDayjs(row.tanggal_invoice),
      tanggal_faktur: toDayjs(row.tanggal_faktur),
      payment_term: row.payment_term || undefined,
    });
  }, [open, form, row]);

  const statusOptions = useMemo(
    () =>
      SUBMIT_FAKTUR_ALL_STATUS_OPTIONS.map((item) => ({
        value: item.value,
        label: item.label,
      })),
    []
  );

  const paymentTermOptions = useMemo(
    () =>
      SUBMIT_FAKTUR_PAYMENT_TERM_OPTIONS.map((item) => ({
        value: item.value,
        label: item.label,
      })),
    []
  );

  // Nilai awal baris invoice — dipakai agar hanya field yang benar-benar
  // berubah yang dikirim ke backend.
  const initialValues = useMemo(
    () => ({
      kode_status: row.kode_status || "",
      tanggal_invoice: toDateString(row.tanggal_invoice),
      tanggal_faktur: toDateString(row.tanggal_faktur),
      payment_term: row.payment_term || "",
    }),
    [row]
  );

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const payload = {};

      // `kode_status` hanya boleh dikirim bersamaan dengan `status`.
      const statusChanged =
        Boolean(values.status) && values.status !== initialValues.kode_status;

      if (statusChanged) {
        const option = SUBMIT_FAKTUR_ALL_STATUS_OPTIONS.find(
          (item) => item.value === values.status,
        );
        payload.status = option?.label ?? values.status;
        payload.kode_status = values.status;

        // Alasan penolakan hanya disimpan backend bersamaan dengan perubahan
        // status (audit_submit_faktur).
        if (values.reason_reject) {
          payload.reason_reject = values.reason_reject;
        }
      }

      const invoiceDate = toDateString(values.tanggal_invoice);
      if (invoiceDate && invoiceDate !== initialValues.tanggal_invoice) {
        payload.tanggal_invoice = invoiceDate;
      }

      const fakturDate = toDateString(values.tanggal_faktur);
      if (fakturDate && fakturDate !== initialValues.tanggal_faktur) {
        payload.tanggal_faktur = fakturDate;
      }

      if (
        values.payment_term &&
        values.payment_term !== initialValues.payment_term
      ) {
        payload.payment_term = values.payment_term;
      }

      if (Object.keys(payload).length === 0) {
        onSubmit?.({});
        return;
      }

      onSubmit?.(payload);
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
          <span>Update Submit Faktur</span>
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
          <InfoField label="Nomor Invoice" value={row.nomor_invoice} mono />
          <InfoField label="Nomor PO" value={row.nomor_po} mono />
          <InfoField label="Nomor SAP" value={row.nomor_sap} mono />
          <InfoField
            label="Status Saat Ini"
            value={
              row.kode_status
                ? `${getSubmitFakturStatusLabel(row.kode_status)} (${row.kode_status})`
                : "-"
            }
            className="sm:col-span-2"
          />
          <InfoField
            label="Payment Term Saat Ini"
            value={
              row.payment_term
                ? `${row.payment_term}${
                    row.nama_payment_term ? ` - ${row.nama_payment_term}` : ""
                  }`
                : "-"
            }
            mono
          />
          <InfoField
            label="Est. Tanggal Bayar"
            value={row.estimated_date ? formatDate(row.estimated_date) : "-"}
          />
        </div>

        <Form form={form} layout="vertical" requiredMark={false}>
          <Form.Item
            name="status"
            label={
              <Text className="font-semibold text-slate-700">
                Status Invoice
              </Text>
            }
            extra={
              <Text className="text-xs text-slate-400">
                Pilih status baru untuk memperbarui proses. Kosongkan bila
                hanya ingin mengubah tanggal atau payment term.
              </Text>
            }
          >
            <Select
              size="large"
              allowClear
              showSearch
              placeholder="Pilih status..."
              className="rounded-lg"
              options={statusOptions}
              onChange={(value) => setSelectedStatus(value ?? null)}
              optionFilterProp="label"
            />
          </Form.Item>

          {isReject && (
            <Form.Item
              name="reason_reject"
              label={
                <Text className="font-semibold text-slate-700">
                  Alasan Penolakan
                </Text>
              }
              rules={[
                {
                  required: true,
                  message: "Alasan penolakan wajib diisi.",
                },
              ]}
            >
              <Input.TextArea
                rows={3}
                maxLength={255}
                showCount
                placeholder="Tuliskan alasan invoice ditolak..."
                className="rounded-lg"
              />
            </Form.Item>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
            <Form.Item
              name="tanggal_invoice"
              label={
                <Text className="font-semibold text-slate-700">
                  Tanggal Invoice
                </Text>
              }
            >
              <DatePicker
                size="large"
                format={DATE_FORMAT}
                placeholder="YYYY-MM-DD"
                className="w-full rounded-lg"
              />
            </Form.Item>

            <Form.Item
              name="tanggal_faktur"
              label={
                <Text className="font-semibold text-slate-700">
                  Tanggal Faktur Pajak
                </Text>
              }
            >
              <DatePicker
                size="large"
                format={DATE_FORMAT}
                placeholder="YYYY-MM-DD"
                className="w-full rounded-lg"
              />
            </Form.Item>
          </div>

          <Form.Item
            name="payment_term"
            label={
              <Text className="font-semibold text-slate-700">
                Payment Term
              </Text>
            }
            extra={
              <Text className="text-xs text-slate-400">
                Kode payment term harus valid pada master (Z000 = Cash sampai
                Z150 = 150 hari).
              </Text>
            }
          >
            <Select
              size="large"
              allowClear
              showSearch
              placeholder="Cari payment term..."
              className="rounded-lg"
              options={paymentTermOptions}
              optionFilterProp="label"
            />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
}
