"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Descriptions,
  Form,
  Input,
  Space,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import {
  ReloadOutlined,
  SearchOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { useBundleReadyInvoice } from "@/hooks/queries/useBundleReadyInvoice";
import { useDebounce } from "@/hooks/useDebounce";
import { getUserId } from "@/utils/storage";
import {
  DataTablePanel,
  renderCurrency,
  renderMono,
} from "@/components/ui";
import { renderDateTime } from "@/components/ui/ColumnRenderers";
import { BRAND_FOCUS_COLOR } from "@/utils/constants";

const { Text } = Typography;

// ─────────────────────────────────────────────────────────────────────────────
// Column Definitions
// ─────────────────────────────────────────────────────────────────────────────

const columns = [
  {
    title: "Nomor ID",
    dataIndex: "nomor_id",
    key: "nomor_id",
    fixed: "left",
    width: 140,
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
    width: 220,
    render: (text, row) => {
      const isSap = String(row.sumber).toUpperCase() === "SAP";
      return (
        <Tag
          color={isSap ? "error" : "warning"}
          className="font-medium whitespace-normal"
        >
          {text || row.kategori || "-"}
        </Tag>
      );
    },
  },
  {
    title: "Pesan Kesalahan",
    dataIndex: "pesan",
    key: "pesan",
    width: 340,
    render: (text) => (
      <span className="text-xs text-rose-600 font-medium leading-relaxed block">
        {text || "-"}
      </span>
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
      return <span className="text-xs text-slate-700">{parts.join(" ") || "-"}</span>;
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
    title: "Total Biaya",
    dataIndex: "total",
    key: "total",
    width: 140,
    align: "right",
    render: (text) => renderCurrency(text, "blue"),
  },
  {
    title: "Rute",
    dataIndex: "rute",
    key: "rute",
    width: 130,
    render: (text) => <span className="text-xs text-slate-500">{text || "-"}</span>,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Expandable Detail Renderer
// ─────────────────────────────────────────────────────────────────────────────

const renderDetail = (record) => {
  const detail = record.detail;
  if (!detail || typeof detail !== "object" || Object.keys(detail).length === 0) {
    return (
      <Text className="text-slate-400 text-xs italic">
        Tidak ada detail tambahan untuk baris ini.
      </Text>
    );
  }

  // Jika terdapat detail list status_do (validasi lokal)
  if (Array.isArray(detail.status_do) && detail.status_do.length > 0) {
    return (
      <div className="p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-200">
        <Text className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
          Rincian Status DO:
        </Text>
        <div className="flex gap-2 flex-wrap">
          {detail.status_do.map((item, idx) => (
            <Tag key={idx} color="orange" className="px-2.5 py-1 text-xs">
              <span className="font-semibold">{item.kode_status || "UNKNOWN"}</span>:{" "}
              {item.total ?? 0} DO
            </Tag>
          ))}
        </div>
      </div>
    );
  }

  // Jika terdapat detail SAP (EBELN, GJAHR, MBLNR, ITEMR, NETWR)
  if (detail.EBELN !== undefined || detail.MBLNR !== undefined) {
    const sapItems = [
      { key: "ebeln", label: "Nomor PO (EBELN)", children: renderMono(detail.EBELN || "-") },
      { key: "itemr", label: "Item PO (ITEMR)", children: renderMono(detail.ITEMR || "-") },
      { key: "gjahr", label: "Tahun (GJAHR)", children: renderMono(detail.GJAHR || "-") },
      { key: "mblnr", label: "Doc GR (MBLNR)", children: renderMono(detail.MBLNR || "-") },
      { key: "netwr", label: "Nilai Netto (NETWR)", children: renderCurrency(detail.NETWR) },
    ];

    return (
      <div className="p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-200">
        <Text className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
          Detail Dokumen SAP:
        </Text>
        <Descriptions
          size="small"
          bordered
          column={{ xs: 1, sm: 2, md: 3 }}
          items={sapItems}
          className="bg-white rounded-lg overflow-hidden"
        />
      </div>
    );
  }

  // Fallback: render JSON
  return (
    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
      <Text className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
        Detail:
      </Text>
      <pre className="text-xs bg-white p-2.5 rounded-lg border border-slate-200 overflow-x-auto text-slate-600">
        {JSON.stringify(detail, null, 2)}
      </pre>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Page Component
// ─────────────────────────────────────────────────────────────────────────────

export default function BundleReadyInvoicePage() {
  const [form] = Form.useForm();
  const [submittedUserId, setSubmittedUserId] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Debounce kata kunci pencarian agar API tidak dipanggil setiap ketikan
  const debouncedSearch = useDebounce(searchValue, 400);

  // Inisialisasi User ID dari login storage saat render di client
  useEffect(() => {
    const defaultUserId = getUserId();
    if (defaultUserId) {
      form.setFieldsValue({ m_user_id: defaultUserId });
    }
  }, [form]);

  // Hook query dengan mUserId dan searchText
  const {
    errorRows,
    message,
    total,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useBundleReadyInvoice({
    mUserId: submittedUserId,
    searchText: debouncedSearch,
    enabled: Boolean(submittedUserId),
  });

  // Saat searchText berubah, kembali ke halaman pertama
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  const handleSubmitUserId = (values) => {
    const rawId = values?.m_user_id?.trim();
    if (rawId) {
      setSubmittedUserId(rawId);
      setCurrentPage(1);
    }
  };

  const handlePaginationChange = (page, newPageSize) => {
    setCurrentPage(page);
    setPageSize(newPageSize);
  };

  const hasSubmitted = Boolean(submittedUserId);

  return (
    <div className="space-y-5">
      {/* ── Form Input User ID ── */}
      <Card
        variant="bordered"
        className="shadow-sm border-slate-200 rounded-2xl"
        styles={{ body: { padding: "18px 24px" } }}
      >
        <Form
          form={form}
          layout="inline"
          onFinish={handleSubmitUserId}
          className="flex items-center gap-3 flex-wrap w-full"
        >
          <Form.Item
            name="m_user_id"
            label={
              <Text className="font-semibold text-slate-700">User ID</Text>
            }
            rules={[
              { required: true, message: "User ID wajib diisi." },
              {
                validator: (_, value) =>
                  value && !value.trim()
                    ? Promise.reject(new Error("User ID tidak boleh kosong."))
                    : Promise.resolve(),
              },
            ]}
            className="flex-1 min-w-[280px] mb-0"
          >
            <Input
              allowClear
              placeholder="Masukkan User ID (UUID transporter / user)..."
              className="rounded-xl border-slate-200"
              size="middle"
            />
          </Form.Item>

          <Form.Item className="mb-0">
            <Button
              type="primary"
              htmlType="submit"
              icon={<SearchOutlined />}
              loading={isLoading || isFetching}
              style={{
                backgroundColor: BRAND_FOCUS_COLOR,
                borderColor: BRAND_FOCUS_COLOR,
              }}
              className="rounded-xl font-medium"
              size="middle"
            >
              Tampilkan Data
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {/* ── Notification / Status Alert ── */}
      {error && (
        <Alert
          type="error"
          showIcon
          icon={<ExclamationCircleOutlined />}
          message="Gagal Mengambil Data Bundle Ready Invoice"
          description={error.message || "Terjadi kendala saat memuat data dari server."}
          className="rounded-xl"
        />
      )}

      {hasSubmitted && !error && message && (
        <Alert
          type={total > 0 ? "warning" : "success"}
          showIcon
          icon={total > 0 ? <ExclamationCircleOutlined /> : <CheckCircleOutlined />}
          message={message}
          description={
            total > 0
              ? `Terdapat ${total} bundle bermasalah yang belum siap di-invoice. Silakan periksa detail keterangan error di bawah.`
              : "Semua bundle sudah siap atau tidak ada data error ditemukan."
          }
          className="rounded-xl"
        />
      )}

      {/* ── Data Table Panel ── */}
      <DataTablePanel
        title="Bundle Ready Invoice"
        description="Pantau daftar bundle yang belum siap di-invoice karena ditolak SAP atau belum memenuhi validasi lokal."
        subtitle={hasSubmitted ? total : undefined}
        subtitleVariant="error"
        columns={columns}
        dataSource={hasSubmitted ? errorRows : []}
        loading={isLoading || isFetching}
        rowKey={(record, index) =>
          record.nomor_id || record.console_number || `row-${index}`
        }
        scrollX={1700}
        searchProps={{
          placeholder: "Cari nomor ID, console number, nomor PO...",
          value: searchValue,
          onChange: setSearchValue,
        }}
        pagination={
          hasSubmitted
            ? {
                total: errorRows.length,
                current: currentPage,
                pageSize: pageSize,
                onChange: handlePaginationChange,
              }
            : false
        }
        extraHeaderActions={
          <Space size="middle">
            <Tooltip title="Muat Ulang Data">
              <Button
                type="default"
                shape="circle"
                size="middle"
                disabled={!hasSubmitted}
                icon={
                  <ReloadOutlined
                    className={isFetching ? "animate-spin" : ""}
                  />
                }
                onClick={() => refetch()}
              />
            </Tooltip>
          </Space>
        }
        emptyText={
          hasSubmitted
            ? searchValue.trim()
              ? "Tidak ada data error yang cocok dengan kata kunci pencarian."
              : "Tidak ada data error bundle ready invoice."
            : "Masukkan User ID di atas lalu klik \"Tampilkan Data\" untuk melihat daftar bundle."
        }
        expandable={{
          expandedRowRender: renderDetail,
          rowExpandable: (record) =>
            Boolean(
              record.detail &&
                typeof record.detail === "object" &&
                Object.keys(record.detail).length > 0
            ),
        }}
      />
    </div>
  );
}
