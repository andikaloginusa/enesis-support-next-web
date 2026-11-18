"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  AutoComplete,
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
  ClockCircleOutlined,
} from "@ant-design/icons";
import { useBundleReadyInvoice } from "@/hooks/queries/useBundleReadyInvoice";
import { useTransporterOptions } from "@/hooks/queries/useTransporterOptions";
import { DataTablePanel, renderCurrency, renderMono } from "@/components/ui";
import { renderDateTime } from "@/components/ui/ColumnRenderers";
import { BRAND_FOCUS_COLOR } from "@/utils/constants";
import {
  buildBundleReadyCacheKey,
  getLastTransporterCode,
  readBundleReadyCache,
  setLastTransporterCode,
  writeBundleReadyCache,
} from "@/utils/bundleReadyCache";

const { Text } = Typography;

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const CATEGORY_COLOR = {
  VALIDASI_LOKAL: "warning",
  SAP_BISNIS: "error",
  SAP_FAULT: "purple",
  SAP_HTTP: "volcano",
  SAP_PARSE: "magenta",
  SAP_FORMAT: "geekblue",
  JARINGAN: "cyan",
};

const formatTimestamp = (value) =>
  value
    ? new Date(value).toLocaleString("id-ID", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "-";

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

  // Kode transporter yang sedang aktif (dikirim ke server)
  const [submittedTransporter, setSubmittedTransporter] = useState("");
  // Teks yang diketik pada input transporter (mencari opsi)
  const [transporterInput, setTransporterInput] = useState("");
  const [selectedTransporter, setSelectedTransporter] = useState(null);

  // Pencarian server (nomor ID) — dikirim ke backend agar SAP tidak memeriksa semua baris
  const [serverSearchInput, setServerSearchInput] = useState("");
  const [serverSearch, setServerSearch] = useState("");
  // Pencarian lokal — instan, hanya menyaring baris yang sudah dimuat
  const [localSearch, setLocalSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { options: transporterOptions } = useTransporterOptions({
    searchText: transporterInput,
  });

  const {
    errorRows: liveRows,
    message: liveMessage,
    total: liveTotal,
    hasLiveData,
    dataUpdatedAt,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useBundleReadyInvoice({
    kodeTransporter: submittedTransporter,
    searchText: serverSearch,
    enabled: Boolean(submittedTransporter),
  });

  // ── Cache lokal: hasil terakhir disimpan agar halaman terisi instan ──
  const cacheKey = useMemo(
    () => buildBundleReadyCacheKey(submittedTransporter, serverSearch),
    [submittedTransporter, serverSearch]
  );
  const snapshot = useMemo(() => readBundleReadyCache(cacheKey), [cacheKey]);

  useEffect(() => {
    if (!hasLiveData) return;
    writeBundleReadyCache(cacheKey, {
      rows: liveRows,
      message: liveMessage,
      total: liveTotal,
    });
  }, [hasLiveData, cacheKey, liveRows, liveMessage, liveTotal]);

  // Kode transporter terakhir yang dipakai dipulihkan saat halaman dibuka
  useEffect(() => {
    const lastCode = getLastTransporterCode();
    if (!lastCode) return;
    form.setFieldsValue({ kode_transporter: lastCode });
    setTransporterInput(lastCode);
    setSubmittedTransporter(lastCode);
  }, [form]);

  const isSnapshotMode = !hasLiveData && Boolean(snapshot);
  const rows = useMemo(
    () => (hasLiveData ? liveRows : (snapshot?.rows ?? [])),
    [hasLiveData, liveRows, snapshot]
  );
  const total = hasLiveData ? liveTotal : (snapshot?.total ?? rows.length);
  const message = hasLiveData ? liveMessage : (snapshot?.message ?? "");
  const lastUpdatedAt = hasLiveData ? dataUpdatedAt : (snapshot?.savedAt ?? null);

  // ── Opsi transporter (memoized agar dropdown tidak berkedip) ──
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

  // ── Statistik per kategori (memoized) ──
  const categoryStats = useMemo(() => {
    const map = new Map();
    rows.forEach((row) => {
      const key = row.kategori || "LAINNYA";
      const current = map.get(key);
      if (current) {
        current.count += 1;
      } else {
        map.set(key, {
          kategori: key,
          label: row.kategori_label || key,
          count: 1,
        });
      }
    });
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [rows]);

  // ── Penyaringan lokal (memoized, instan tanpa memanggil server) ──
  const visibleRows = useMemo(() => {
    const keyword = localSearch.trim().toLowerCase();
    return rows.filter((row) => {
      if (activeCategory && row.kategori !== activeCategory) return false;
      if (!keyword) return true;
      return [
        row.nomor_id,
        row.console_number,
        row.nomor_po,
        row.nomor_gr,
        row.pesan,
        row.kategori_label,
        row.kategori,
        row.sumber,
      ].some((value) =>
        String(value ?? "").toLowerCase().includes(keyword)
      );
    });
  }, [rows, localSearch, activeCategory]);

  // ── Effect: reset pagination saat filter berubah ──
  useEffect(() => {
    setCurrentPage(1);
  }, [serverSearch, localSearch, activeCategory]);

  const handleSubmit = (values) => {
    const kode = String(values?.kode_transporter ?? "").trim();
    if (!kode) return;
    setLastTransporterCode(kode);
    setSubmittedTransporter(kode);
    setSelectedTransporter(null);
    setActiveCategory(null);
    setLocalSearch("");
    setCurrentPage(1);
  };

  const applyServerSearch = () => {
    setServerSearch(serverSearchInput.trim());
    setCurrentPage(1);
  };

  const clearServerSearch = () => {
    setServerSearchInput("");
    setServerSearch("");
    setCurrentPage(1);
  };

  const handlePaginationChange = (page, newPageSize) => {
    setCurrentPage(page);
    setPageSize(newPageSize);
  };

  const hasSubmitted = Boolean(submittedTransporter);

  const filterBar = (
    <div className="flex flex-col gap-3">
      <div className="flex items-end gap-3 flex-wrap">
        <div className="flex flex-col gap-1 max-w-md">
          <Text className="text-xs font-bold text-slate-600 uppercase tracking-wider">
            Persempit pemeriksaan di server
          </Text>
          <Text className="text-xs text-slate-400">
            Dikirim ke backend (mencocokkan nomor ID) supaya SAP hanya memeriksa
            baris yang relevan. Tekan Enter untuk menerapkan.
          </Text>
        </div>
        <Input
          allowClear
          value={serverSearchInput}
          onChange={(e) => setServerSearchInput(e.target.value)}
          onPressEnter={applyServerSearch}
          placeholder="Nomor ID, misal: 81789"
          prefix={<SearchOutlined className="text-slate-400" />}
          className="w-72 max-w-full rounded-xl border-slate-200"
          size="middle"
        />
        <Button onClick={applyServerSearch} disabled={!serverSearchInput.trim()}>
          Terapkan
        </Button>
        {serverSearch && (
          <Tag
            closable
            color="blue"
            onClose={clearServerSearch}
            className="mb-0"
          >
            Nomor ID: {serverSearch}
          </Tag>
        )}
      </div>

      {categoryStats.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <Text className="text-xs font-bold text-slate-600 uppercase tracking-wider mr-1">
            Filter kategori
          </Text>
          <Tag
            color={activeCategory === null ? "blue" : "default"}
            className="cursor-pointer"
            onClick={() => setActiveCategory(null)}
          >
            Semua ({rows.length})
          </Tag>
          {categoryStats.map((stat) => (
            <Tag
              key={stat.kategori}
              color={
                activeCategory === stat.kategori
                  ? CATEGORY_COLOR[stat.kategori] ?? "blue"
                  : "default"
              }
              className="cursor-pointer"
              onClick={() =>
                setActiveCategory((prev) =>
                  prev === stat.kategori ? null : stat.kategori
                )
              }
            >
              {stat.label} ({stat.count})
            </Tag>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-5">
      {/* ── Form Input Kode Transporter ── */}
      <Card
        variant="bordered"
        className="shadow-sm border-slate-200 rounded-2xl"
        styles={{ body: { padding: "18px 24px" } }}
      >
        <Form
          form={form}
          layout="inline"
          onFinish={handleSubmit}
          className="flex items-center gap-3 flex-wrap w-full"
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
            ]}
            className="flex-1 min-w-[320px] mb-0"
          >
            <AutoComplete
              allowClear
              options={transporterChoices}
              filterOption={false}
              onChange={(value) => {
                setTransporterInput(value);
                setSelectedTransporter(null);
              }}
              onSelect={(value) => {
                const found = transporterOptions.find(
                  (item) => String(item.kode) === String(value)
                );
                setSelectedTransporter(
                  found ? { kode: found.kode, nama: found.nama } : null
                );
              }}
              placeholder="Ketik kode atau nama transporter..."
              className="w-full rounded-xl border-slate-200"
              size="middle"
              notFoundContent={
                <span className="text-xs text-slate-400">
                  Transporter tidak ditemukan — kode tetap bisa diketik manual.
                </span>
              }
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

        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <Text className="text-xs text-slate-400">
            Kode user ber-role TRANSPORTER (contoh: 3000026). Bundle yang
            ditanyakan hanya milik transporter tersebut.
          </Text>
          {selectedTransporter?.nama && (
            <Tag color="blue" className="m-0">
              {selectedTransporter.nama}
            </Tag>
          )}
        </div>
      </Card>

      {/* ── Notification / Status Alert ── */}
      {error && (
        <Alert
          type="error"
          showIcon
          icon={<ExclamationCircleOutlined />}
          message="Gagal Mengambil Data Bundle Ready Invoice"
          description={
            error.message || "Terjadi kendala saat memuat data dari server."
          }
          className="rounded-xl"
        />
      )}

      {hasSubmitted && !error && isSnapshotMode && (
        <Alert
          type="info"
          showIcon
          icon={<ClockCircleOutlined />}
          message="Menampilkan data tersimpan"
          description={
            <>
              {message || "Data bundle ready invoice dari pemeriksaan sebelumnya."}
              <br />
              Diperiksa terakhir pada {formatTimestamp(lastUpdatedAt)}. Tekan
              &quot;Muat Ulang&quot; untuk memeriksa ulang ke SAP.
            </>
          }
          className="rounded-xl"
        />
      )}

      {hasSubmitted && !error && !isSnapshotMode && message && (
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
        dataSource={visibleRows}
        loading={isLoading || isFetching}
        rowKey={(record, index) =>
          record.nomor_id || record.console_number || `row-${index}`
        }
        scrollX={1700}
        filterBar={hasSubmitted ? filterBar : null}
        searchProps={{
          placeholder: "Cari di data yang dimuat (nomor ID, console number, PO, pesan)...",
          value: localSearch,
          onChange: setLocalSearch,
        }}
        pagination={
          hasSubmitted
            ? {
                total: visibleRows.length,
                current: currentPage,
                pageSize: pageSize,
                onChange: handlePaginationChange,
              }
            : false
        }
        extraHeaderActions={
          <Space size="middle">
            {lastUpdatedAt && (
              <Tooltip title="Waktu data terakhir diterima dari server">
                <Text className="text-xs text-slate-400">
                  Diperbarui: {formatTimestamp(lastUpdatedAt)}
                </Text>
              </Tooltip>
            )}
            <Tooltip title="Muat Ulang Data (memeriksa ulang ke SAP)">
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
            ? rows.length === 0
              ? "Tidak ada data error bundle ready invoice."
              : "Tidak ada baris yang cocok dengan filter kata kunci / kategori."
            : "Masukkan Kode Transporter di atas lalu klik \"Tampilkan Data\" untuk melihat daftar bundle."
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
