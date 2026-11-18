"use client";

import React, { useMemo, useState } from "react";
import {
  Alert,
  AutoComplete,
  Button,
  Descriptions,
  Form,
  Input,
  Modal,
  Spin,
  Table,
  Tag,
  Typography,
} from "antd";
import { SearchOutlined, FileExcelOutlined } from "@ant-design/icons";
import { useBundleReadyInvoice } from "@/hooks/queries/useBundleReadyInvoice";
import { useTransporterOptions } from "@/hooks/queries/useTransporterOptions";
import {
  renderCurrency,
  renderDateTime,
} from "@/components/ui/ColumnRenderers";
import { renderMono } from "@/components/ui";
import { BRAND_FOCUS_COLOR } from "@/utils/constants";

const { Text } = Typography;

/**
 * BundleReadyInvoiceModal — Modal daftar bundle ready invoice (error-only response).
 *
 * @param {Object}   props
 * @param {boolean}  props.open
 * @param {Function} props.onClose
 */
export function BundleReadyInvoiceModal({ open, onClose }) {
  const [form] = Form.useForm();
  const [submittedTransporter, setSubmittedTransporter] = useState("");
  const [transporterInput, setTransporterInput] = useState("");
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);

  const { options: transporterOptions } = useTransporterOptions({
    searchText: transporterInput,
  });

  const { errorRows, message, total, isLoading, isFetching, error } =
    useBundleReadyInvoice({
      kodeTransporter: submittedTransporter,
      enabled: open && Boolean(submittedTransporter),
    });

  const transporterChoices = useMemo(
    () =>
      transporterOptions.map((item) => ({
        value: String(item.kode ?? ""),
        label: (
          <div className="flex items-center justify-between gap-4">
            <span className="font-mono font-semibold text-slate-700">
              {item.kode}
            </span>
            <span className="text-xs text-slate-500 truncate">{item.nama}</span>
          </div>
        ),
      })),
    [transporterOptions]
  );

  // Penyaringan lokal — instan, tidak memanggil server (scan SAP terlalu mahal)
  const visibleRows = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();
    if (!keyword) return errorRows;
    return errorRows.filter((row) =>
      [row.nomor_id, row.console_number, row.nomor_po, row.pesan]
        .some((value) => String(value ?? "").toLowerCase().includes(keyword))
    );
  }, [errorRows, searchText]);

  const handleClose = () => {
    form.resetFields();
    setSubmittedTransporter("");
    setTransporterInput("");
    setSearchText("");
    setPage(1);
    onClose?.();
  };

  const handleSearch = async () => {
    try {
      const values = await form.validateFields();
      setSearchText("");
      setPage(1);
      setSubmittedTransporter(values.kode_transporter.trim());
    } catch {
      /* validation errors surfaced inline by Ant Design */
    }
  };

  const errorColumns = [
    {
      title: "Nomor ID",
      dataIndex: "nomor_id",
      key: "nomor_id",
      width: 140,
      fixed: "left",
      render: (text) => renderMono(text || "-"),
    },
    {
      title: "Console Number",
      dataIndex: "console_number",
      key: "console_number",
      width: 150,
      render: (text) => renderMono(text || "-"),
    },
    {
      title: "Sumber",
      dataIndex: "sumber",
      key: "sumber",
      width: 110,
      render: (text) => {
        const isSap = String(text).toUpperCase() === "SAP";
        return (
          <Tag color={isSap ? "blue" : "purple"} className="font-semibold">
            {text || "-"}
          </Tag>
        );
      },
    },
    {
      title: "Kategori Validasi",
      dataIndex: "kategori_label",
      key: "kategori_label",
      width: 200,
      render: (text, row) => (
        <Tag
          color={String(row.sumber).toUpperCase() === "SAP" ? "error" : "warning"}
          className="whitespace-normal"
        >
          {text || row.kategori || "-"}
        </Tag>
      ),
    },
    {
      title: "Pesan Kesalahan",
      dataIndex: "pesan",
      key: "pesan",
      width: 320,
      render: (text) => (
        <span className="text-xs text-rose-600 font-medium">{text || "-"}</span>
      ),
    },
    {
      title: "Nomor PO",
      dataIndex: "nomor_po",
      key: "nomor_po",
      width: 140,
      render: (text) => renderMono(text || "-"),
    },
    {
      title: "Nomor GR",
      dataIndex: "nomor_gr",
      key: "nomor_gr",
      width: 140,
      render: (text) => renderMono(text || "-"),
    },
    {
      title: "Kendaraan",
      key: "kendaraan",
      width: 140,
      render: (_, row) => {
        const parts = [
          row.jenis_kendaraan,
          row.kode_kendaraan ? `(${row.kode_kendaraan})` : null,
        ].filter(Boolean);
        return <span className="text-xs">{parts.join(" ") || "-"}</span>;
      },
    },
    {
      title: "Tgl POD Transporter",
      dataIndex: "tanggal_pod_transporter",
      key: "tanggal_pod_transporter",
      width: 170,
      render: (text) => renderDateTime(text),
    },
    {
      title: "Total",
      dataIndex: "total",
      key: "total",
      width: 140,
      align: "right",
      render: (text) => renderCurrency(text, "blue"),
    },
  ];

  const renderDetail = (record) => {
    const detail = record.detail;
    if (!detail || typeof detail !== "object" || Object.keys(detail).length === 0) {
      return (
        <Text className="text-slate-400 text-xs italic">
          Tidak ada detail tambahan.
        </Text>
      );
    }

    if (Array.isArray(detail.status_do) && detail.status_do.length > 0) {
      return (
        <div className="p-3 bg-slate-50 rounded-lg space-y-2">
          <Text className="block text-xs font-bold text-slate-700">
            Status DO:
          </Text>
          <div className="flex gap-2 flex-wrap">
            {detail.status_do.map((item, idx) => (
              <Tag key={idx} color="orange">
                {item.kode_status}: {item.total} DO
              </Tag>
            ))}
          </div>
        </div>
      );
    }

    if (detail.EBELN !== undefined || detail.MBLNR !== undefined) {
      return (
        <div className="p-3 bg-slate-50 rounded-lg space-y-2">
          <Text className="block text-xs font-bold text-slate-700">
            Detail SAP:
          </Text>
          <Descriptions
            size="small"
            bordered
            items={[
              { key: "ebeln", label: "Nomor PO", children: renderMono(detail.EBELN || "-") },
              { key: "itemr", label: "Item", children: renderMono(detail.ITEMR || "-") },
              { key: "gjahr", label: "Tahun", children: renderMono(detail.GJAHR || "-") },
              { key: "mblnr", label: "Doc GR", children: renderMono(detail.MBLNR || "-") },
              { key: "netwr", label: "Net Amount", children: renderCurrency(detail.NETWR) },
            ]}
          />
        </div>
      );
    }

    return (
      <pre className="text-xs bg-slate-50 p-2 rounded overflow-x-auto text-slate-600">
        {JSON.stringify(detail, null, 2)}
      </pre>
    );
  };

  const hasSubmitted = Boolean(submittedTransporter);

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
      width={1100}
      destroyOnHidden
      className="[&_.ant-modal-content]:rounded-xl"
    >
      <div className="py-4 space-y-4">
        <Form
          form={form}
          layout="inline"
          onFinish={handleSearch}
          className="w-full"
        >
          <Form.Item
            name="kode_transporter"
            label={
              <Text className="font-semibold text-slate-700">
                Kode Transporter
              </Text>
            }
            rules={[
              { required: true, message: "Kode Transporter wajib diisi." },
              {
                validator: (_, value) =>
                  value && !value.trim()
                    ? Promise.reject(new Error("Kode Transporter wajib diisi."))
                    : Promise.resolve(),
              },
            ]}
            className="flex-1 min-w-[280px]"
          >
            <AutoComplete
              size="large"
              allowClear
              options={transporterChoices}
              filterOption={false}
              onChange={setTransporterInput}
              placeholder="Ketik kode atau nama transporter..."
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

        {hasSubmitted && !error && message && (
          <Alert
            type={total > 0 ? "warning" : "success"}
            showIcon
            message={message}
            description={
              total > 0
                ? `Ditemukan ${total} data error pada bundle ready invoice.`
                : "Tidak ada data error ditemukan."
            }
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

        {!isLoading && hasSubmitted && (
          <>
            <Input
              allowClear
              size="large"
              prefix={<SearchOutlined className="text-slate-400" />}
              placeholder="Cari nomor ID, console number, atau nomor PO..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="rounded-lg"
            />

            <Table
              size="small"
              rowKey={(row, idx) => row.nomor_id ?? row.console_number ?? idx}
              dataSource={visibleRows}
              columns={errorColumns}
              pagination={{
                current: page,
                onChange: (p) => setPage(p),
                pageSize: 10,
                size: "small",
                total: visibleRows.length,
              }}
              scroll={{ x: 1300 }}
              expandable={{
                expandedRowRender: renderDetail,
                rowExpandable: (row) =>
                  Boolean(row.detail && Object.keys(row.detail).length > 0),
              }}
              locale={{
                emptyText: searchText.trim()
                  ? "Tidak ada data yang cocok dengan pencarian."
                  : "Tidak ada data error bundle ready invoice.",
              }}
            />
          </>
        )}

        {!isLoading && !hasSubmitted && !error && (
          <div className="rounded-xl border border-dashed border-slate-200 py-12 text-center">
            <Text className="block text-slate-400 text-sm">
              Masukkan Kode Transporter lalu klik &quot;Tampilkan&quot; untuk
              melihat daftar bundle ready invoice.
            </Text>
          </div>
        )}
      </div>
    </Modal>
  );
}
