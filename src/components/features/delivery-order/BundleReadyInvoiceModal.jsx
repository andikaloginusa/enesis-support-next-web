"use client";

import React, { useState } from "react";
import {
  Alert,
  Button,
  Form,
  Input,
  Modal,
  Spin,
  Table,
  Tabs,
  Typography,
} from "antd";
import { SearchOutlined, FileExcelOutlined } from "@ant-design/icons";
import { useBundleReadyInvoice } from "@/hooks/queries/useBundleReadyInvoice";
import { renderCurrency, renderDateTime } from "@/components/ui/ColumnRenderers";
import { BRAND_FOCUS_COLOR } from "@/utils/constants";

const { Text } = Typography;

/**
 * BundleReadyInvoiceModal — Daftar bundle yang siap di-invoice untuk sebuah user.
 *
 * Endpoint ini mewajibkan `m_user_id` sebagai input user (berbeda dengan
 * `m_user_id` logged-in pada endpoint update). Setelah user mengisi ID dan
 * menekan "Tampilkan", ringkasan serta tab Sukses/Error tampil di modal yang
 * sama.
 *
 * @param {Object}   props
 * @param {boolean}  props.open
 * @param {Function} props.onClose
 */
export function BundleReadyInvoiceModal({ open, onClose }) {
  const [form] = Form.useForm();
  const [submittedUserId, setSubmittedUserId] = useState("");

  const {
    summary,
    successRows,
    errorRows,
    isLoading,
    isFetching,
    error,
  } = useBundleReadyInvoice({
    mUserId: submittedUserId,
    enabled: open && Boolean(submittedUserId),
  });

  const handleSearch = async () => {
    try {
      const values = await form.validateFields();
      setSubmittedUserId(values.m_user_id.trim());
    } catch {
      /* validation errors surfaced inline by Ant Design */
    }
  };

  const handleClose = () => {
    form.resetFields();
    setSubmittedUserId("");
    onClose?.();
  };

  const successColumns = [
    {
      title: "Nomor ID",
      dataIndex: "nomor_id",
      key: "nomor_id",
      width: 140,
      render: (text) => <span className="font-mono text-xs">{text || "-"}</span>,
    },
    {
      title: "Bundle",
      dataIndex: "bundle_id",
      key: "bundle_id",
      width: 120,
      render: (text) => <span className="font-mono text-xs">{text || "-"}</span>,
    },
    {
      title: "Nomor PO",
      dataIndex: "nomor_po",
      key: "nomor_po",
      width: 140,
      render: (text) => <span className="font-mono text-xs">{text || "-"}</span>,
    },
    {
      title: "Nomor GR",
      dataIndex: "nomor_gr",
      key: "nomor_gr",
      width: 140,
      render: (text) => <span className="font-mono text-xs">{text || "-"}</span>,
    },
    {
      title: "Biaya Tambahan",
      dataIndex: "additional_cost",
      key: "additional_cost",
      align: "right",
      width: 150,
      render: (text) => renderCurrency(text),
    },
    {
      title: "Onkos Kirim",
      dataIndex: "cost_shipment",
      key: "cost_shipment",
      align: "right",
      width: 150,
      render: (text) => renderCurrency(text),
    },
    {
      title: "Total",
      dataIndex: "total",
      key: "total",
      align: "right",
      width: 150,
      render: (text) => renderCurrency(text, "blue"),
    },
    {
      title: "Tgl POD Transporter",
      dataIndex: "tanggal_pod_transporter",
      key: "tanggal_pod_transporter",
      width: 170,
      render: (text) => renderDateTime(text),
    },
    {
      title: "Pesan",
      dataIndex: "pesan",
      key: "pesan",
      width: 200,
      render: (text) => (text ? <span className="text-xs">{text}</span> : <span className="text-slate-400">—</span>),
    },
  ];

  const errorColumns = [
    {
      title: "Nomor ID",
      dataIndex: "nomor_id",
      key: "nomor_id",
      width: 140,
      render: (text) => <span className="font-mono text-xs">{text || "-"}</span>,
    },
    {
      title: "Bundle",
      dataIndex: "bundle_id",
      key: "bundle_id",
      width: 120,
      render: (text) => <span className="font-mono text-xs">{text || "-"}</span>,
    },
    {
      title: "Console Number",
      dataIndex: "console_number",
      key: "console_number",
      width: 150,
      render: (text) => <span className="font-mono text-xs">{text || "-"}</span>,
    },
    {
      title: "Pesan",
      dataIndex: "pesan",
      key: "pesan",
      render: (text) => (
        <span className="text-xs text-red-600">{text || "-"}</span>
      ),
    },
  ];

  const rincianBiayaColumns = [
    {
      title: "Keterangan",
      dataIndex: "keterangan",
      key: "keterangan",
      render: (text) => <span className="text-xs">{text || "-"}</span>,
    },
    {
      title: "Nominal",
      dataIndex: "nominal",
      key: "nominal",
      align: "right",
      width: 140,
      render: (text) => renderCurrency(text),
    },
    {
      title: "Nomor GR",
      dataIndex: "nomor_gr",
      key: "nomor_gr",
      width: 130,
      render: (text) => <span className="font-mono text-xs">{text || "-"}</span>,
    },
    {
      title: "Kode Item",
      dataIndex: "kode_item",
      key: "kode_item",
      width: 120,
      render: (text) => <span className="font-mono text-xs">{text || "-"}</span>,
    },
    {
      title: "Nomor PO",
      dataIndex: "nomor_po",
      key: "nomor_po",
      width: 140,
      render: (text) => <span className="font-mono text-xs">{text || "-"}</span>,
    },
  ];

  const summaryCards = [
    { label: "Total Data", value: summary?.total_data ?? 0, tone: "text-slate-800" },
    {
      label: "Sukses",
      value: summary?.total_success ?? 0,
      tone: "text-emerald-600",
    },
    { label: "Error", value: summary?.total_error ?? 0, tone: "text-red-500" },
  ];

  const hasResult = Boolean(summary);

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      title={
        <div className="flex items-center gap-2 pb-3 text-base font-bold border-b border-slate-100 text-slate-800">
          <FileExcelOutlined className="text-emerald-600" />
          <span>Get List Bundle Ready Invoice</span>
        </div>
      }
      footer={
        <div className="flex justify-end">
          <Button size="large" onClick={handleClose} className="rounded-lg">
            Tutup
          </Button>
        </div>
      }
      width={1080}
      destroyOnHidden
      className="[&_.ant-modal-content]:rounded-xl"
    >
      <div className="py-4 space-y-5">
        <Form
          form={form}
          layout="inline"
          onFinish={handleSearch}
          className="w-full"
        >
          <Form.Item
            name="m_user_id"
            label={<Text className="font-semibold text-slate-700">User Id</Text>}
            rules={[
              { required: true, message: "User Id wajib diisi." },
              {
                validator: (_, value) =>
                  value && !value.trim()
                    ? Promise.reject(new Error("User Id wajib diisi."))
                    : Promise.resolve(),
              },
            ]}
            className="flex-1 min-w-[280px]"
          >
            <Input
              size="large"
              placeholder="Masukkan User Id..."
              className="rounded-lg w-full"
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              icon={<SearchOutlined />}
              loading={isFetching}
              style={{
                backgroundColor: BRAND_FOCUS_COLOR,
                borderColor: BRAND_FOCUS_COLOR,
              }}
              className="rounded-lg"
            >
              Tampilkan
            </Button>
          </Form.Item>
        </Form>

        {error && (
          <Alert
            type="error"
            showIcon
            message="Gagal mengambil daftar Bundle Ready Invoice"
            description={error.message}
            className="rounded-xl"
          />
        )}

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Spin size="large" />
            <Text className="text-slate-400 text-sm">
              Mengambil data bundle ready invoice...
            </Text>
          </div>
        )}

        {!isLoading && hasResult && (
          <>
            <div className="grid grid-cols-3 gap-4">
              {summaryCards.map((card) => (
                <div
                  key={card.label}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                >
                  <Text className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    {card.label}
                  </Text>
                  <Text
                    className={`block text-2xl font-extrabold mt-1 ${card.tone}`}
                  >
                    {card.value}
                  </Text>
                </div>
              ))}
            </div>

            <Tabs
              defaultActiveKey="success"
              items={[
                {
                  key: "success",
                  label: `Sukses (${successRows.length})`,
                  children: (
                    <Table
                      size="small"
                      rowKey={(row) => row.nomor_id ?? row.bundle_id}
                      dataSource={successRows}
                      columns={successColumns}
                      pagination={{ pageSize: 10, size: "small" }}
                      scroll={{ x: 1400 }}
                      expandable={{
                        expandedRowRender: (row) =>
                          Array.isArray(row.rincian_biaya) &&
                          row.rincian_biaya.length > 0 ? (
                            <Table
                              size="small"
                              rowKey={(item, index) =>
                                `${item.nomor_gr ?? "row"}-${index}`
                              }
                              dataSource={row.rincian_biaya}
                              columns={rincianBiayaColumns}
                              pagination={false}
                            />
                          ) : (
                            <Text className="text-slate-400 text-xs">
                              Tidak ada rincian biaya untuk bundle ini.
                            </Text>
                          ),
                        rowExpandable: (row) =>
                          Array.isArray(row.rincian_biaya) &&
                          row.rincian_biaya.length > 0,
                      }}
                      locale={{ emptyText: "Tidak ada bundle yang siap di-invoice." }}
                    />
                  ),
                },
                {
                  key: "error",
                  label: `Error (${errorRows.length})`,
                  children: (
                    <Table
                      size="small"
                      rowKey={(row) => row.nomor_id ?? row.bundle_id}
                      dataSource={errorRows}
                      columns={errorColumns}
                      pagination={{ pageSize: 10, size: "small" }}
                      scroll={{ x: 800 }}
                      locale={{ emptyText: "Tidak ada bundle bermasalah." }}
                    />
                  ),
                },
              ]}
            />
          </>
        )}

        {!isLoading && !hasResult && !error && (
          <div className="rounded-xl border border-dashed border-slate-200 py-12 text-center">
            <Text className="block text-slate-400 text-sm">
              Masukkan User Id lalu klik &quot;Tampilkan&quot; untuk melihat
              daftar bundle ready invoice.
            </Text>
          </div>
        )}
      </div>
    </Modal>
  );
}
