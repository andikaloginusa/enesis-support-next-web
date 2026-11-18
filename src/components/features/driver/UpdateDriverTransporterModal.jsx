"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Form, Modal, Select, Typography } from "antd";
import { EditOutlined } from "@ant-design/icons";
import { InfoField } from "@/components/ui";
import { useTransporterOptions } from "@/hooks/queries/useTransporterOptions";

const { Text } = Typography;

/** Jumlah opsi transporter yang diambil per pencarian. */
const TRANSPORTER_OPTION_LIMIT = 50;

/**
 * UpdateDriverTransporterModal — Ubah transporter milik seorang driver.
 *
 * Backend tidak mengembalikan `m_transporter_id` pada daftar driver (hanya
 * `kode_transporter` + `nama_transporter`), sehingga pilihan transporter
 * diambil dari master transporter dan nilainya adalah `m_transporter_id`.
 *
 * Select memakai `labelInValue` supaya nama transporter terpilih tetap tampil
 * walau daftar opsi berubah karena pengguna mengetik pencarian baru.
 *
 * @param {Object}   props
 * @param {boolean}  props.open
 * @param {Object}   props.driver - Baris tabel yang dipilih
 * @param {Function} props.onCancel
 * @param {Function} props.onSubmit - Callback dengan `{ m_driver_id, m_transporter_id }`
 * @param {boolean}  props.confirmLoading
 */
export function UpdateDriverTransporterModal({
  open,
  driver,
  onCancel,
  onSubmit,
  confirmLoading = false,
}) {
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");
  const [selected, setSelected] = useState(null);
  const row = driver || {};

  // Master transporter diambil server-side saat pengguna mengetik, agar
  // daftar yang panjang tidak perlu dimuat sekaligus.
  const { options: transporterOptions, isFetching } = useTransporterOptions({
    searchText,
    pageSize: TRANSPORTER_OPTION_LIMIT,
    enabled: open,
  });

  useEffect(() => {
    if (open) {
      // Cari transporter saat ini lebih dulu agar bisa terpilih otomatis.
      setSearchText(row.kode_transporter || "");
      setSelected(null);
      form.setFieldsValue({ m_transporter_id: undefined });
    } else {
      form.resetFields();
    }
  }, [open, form, row.kode_transporter]);

  // Preselect transporter saat ini begitu master transporter termuat.
  useEffect(() => {
    if (!open || selected || !row.kode_transporter) return;
    const match = transporterOptions.find(
      (item) => item.kode === row.kode_transporter
    );
    if (!match) return;

    const next = {
      value: match.m_transporter_id,
      label: match.nama,
      kode: match.kode,
    };
    setSelected(next);
    form.setFieldsValue({ m_transporter_id: next });
  }, [open, transporterOptions, row.kode_transporter, selected, form]);

  const transporterChoices = useMemo(
    () =>
      transporterOptions.map((item) => ({
        value: item.m_transporter_id,
        label: item.nama,
        kode: item.kode,
      })),
    [transporterOptions]
  );

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const picked = values.m_transporter_id;
      const mTransporterId = picked?.value ?? picked;

      onSubmit?.({
        m_driver_id: row.m_driver_id,
        m_transporter_id: mTransporterId,
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
      okText="Simpan Transporter"
      cancelText="Batal"
      title={
        <div className="flex items-center gap-2 pb-3 text-base font-bold border-b border-slate-100 text-slate-800">
          <EditOutlined className="text-blue-500" />
          <span>Update Transporter Driver</span>
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
          <InfoField label="Kode Driver" value={row.kode} mono />
          <InfoField label="Nama Driver" value={row.nama} />
          <InfoField
            label="Transporter Saat Ini"
            value={
              row.nama_transporter
                ? `${row.nama_transporter} (${row.kode_transporter ?? "-"})`
                : "-"
            }
            className="sm:col-span-2"
          />
        </div>

        <Form form={form} layout="vertical" requiredMark={false}>
          <Form.Item
            name="m_transporter_id"
            label={
              <Text className="font-semibold text-slate-700">
                Transporter Baru
              </Text>
            }
            extra={
              <Text className="text-xs text-slate-400">
                Ketik nama atau kode transporter untuk mencari, lalu pilih salah
                satu. Driver akan dipindahkan ke transporter terpilih.
              </Text>
            }
            rules={[
              { required: true, message: "Transporter wajib dipilih." },
            ]}
          >
            <Select
              size="large"
              showSearch
              allowClear
              labelInValue
              filterOption={false}
              onSearch={setSearchText}
              onChange={(value) => setSelected(value ?? null)}
              loading={isFetching}
              placeholder="Cari transporter..."
              className="rounded-lg"
              options={transporterChoices}
              optionRender={(option) => (
                <div className="flex items-center justify-between gap-4">
                  <span className="font-semibold text-slate-700">
                    {option.data.label}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {option.data.kode}
                  </span>
                </div>
              )}
            />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
}
