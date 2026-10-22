"use client";

import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import { Button, Space, Tooltip, Select, DatePicker } from "antd";
import { ReloadOutlined, EyeOutlined } from "@ant-design/icons";
import { useKlaimInternasional, useDebounce } from "@/hooks";
import {
  DataTablePanel,
  StatusBadge,
  renderCurrencyAmount,
  renderDate,
  renderDateTime,
  renderBold,
  renderTag,
} from "@/components/ui";
import { formatCurrencyAmount } from "@/utils/formatters";
import { KlaimDetailModal } from "@/components/features/klaim/KlaimDetailModal";

// ─────────────────────────────────────────────────────────────────────────────
//  Filter Options
// ─────────────────────────────────────────────

const STATUS_OPTIONS = [
  { label: "Pengajuan - DR", value: "DR" },
  { label: "ECC Verifikasi - ECC", value: "ECC" },
  { label: "RSM Approved - RSM", value: "RSM" },
  { label: "Sales Head Approved - SHA", value: "SHA" },
  { label: "Distributor Kirim Dokumen - SEND", value: "SEND" },
  { label: "ECC terima dok. - RECEIVE", value: "RECEIVE" },
  { label: "Plan Payment - PLAN", value: "PLAN" },
  { label: "Payment Completed - PAY", value: "PAY" },
  { label: "Submit to SAP - SKP", value: "SKP" },
  { label: "Reject - RJC", value: "RJC" },
  { label: "Pengajuan - DIRC1", value: "DIRC1" },
  { label: "KAM Approved - DIRC2", value: "DIRC2" },
  { label: "Sales Head Approved - DIRC3", value: "DIRC3" },
  { label: "Sales kirim dok. - DAD", value: "DAD" },
  { label: "ECC terima dok. - TDF", value: "TDF" },
  { label: "Plan Payment - APF", value: "APF" },
  { label: "Reject - RJF", value: "RJF" },
];

const JENIS_KLAIM_OPTIONS = [
  { value: "INFRA", label: "INFRA" },
  { value: "NON INFRA", label: "NON INFRA" },
];

const FISCAL_YEAR_OPTIONS = [
  { value: "2024", label: "2024" },
  { value: "2025", label: "2025" },
  { value: "2026", label: "2026" },
  { value: "2027", label: "2027" },
];

// ─────────────────────────────────────────────────────────────────────────────
//  Column Definitions
// ─────────────────────────────────────────────────────────────────────────────

const buildColumns = ({ onDetail }) => [
  {
    title: "Nomor Klaim",
    dataIndex: "nomor_klaim",
    key: "nomor_klaim",
    fixed: "left",
    width: 240,
    render: (text) => renderBold(text),
  },
  {
    title: "Tanggal Klaim",
    dataIndex: "created",
    key: "created",
    width: 150,
    render: (val) => renderDateTime(val),
  },
  {
    title: "Title",
    dataIndex: "title",
    key: "title",
    width: 200,
    ellipsis: true,
    render: (text) => text || "-",
  },
  {
    title: "Company",
    dataIndex: "company_list",
    key: "company_list",
    width: 180,
    render: (text) => (text ? renderBold(text) : "-"),
  },
  {
    title: "Region",
    dataIndex: "region",
    key: "region",
    width: 100,
    render: (text) =>
      text ? (
        <span className="text-xs font-medium capitalize text-slate-600">
          {text.toLowerCase()}
        </span>
      ) : (
        "-"
      ),
  },
  {
    title: "Divisi",
    dataIndex: "divisi",
    key: "divisi",
    width: 120,
    render: (text) => text || "-",
  },
  {
    title: "Jenis Klaim",
    dataIndex: "jenis_klaim",
    key: "jenis_klaim",
    width: 130,
    render: (text) => (text ? renderTag(text, "purple") : "-"),
  },
  {
    title: "Perihal Klaim",
    dataIndex: "perihal_klaim",
    key: "perihal_klaim",
    width: 260,
    ellipsis: true,
    render: (text) => (text ? renderTag(text, "amber") : "-"),
  },
  {
    title: "Periode Klaim",
    dataIndex: "periode_klaim",
    key: "periode_klaim",
    width: 200,
    render: (text) => text || "-",
  },
  {
    title: "Mata Uang",
    dataIndex: "currency",
    key: "currency",
    width: 100,
    align: "center",
    render: (text) => (text ? renderTag(text, "cyan") : "-"),
  },
  {
    title: "Total (Excl. PPN)",
    dataIndex: "total_klaim",
    key: "total_klaim",
    width: 160,
    align: "right",
    render: (val, row) => renderCurrencyAmount(val, row?.currency || "IDR"),
  },
  {
    title: "PPN",
    dataIndex: "nominal_pajak",
    key: "nominal_pajak",
    width: 130,
    align: "right",
    render: (val, row) => renderCurrencyAmount(val, row?.currency || "IDR"),
  },
  {
    title: "Klaim + PPN",
    key: "nominal_claimable",
    width: 165,
    align: "right",
    render: (row) => (
      <span className="font-bold text-[#1aac32]">
        {formatCurrencyAmount(row.nominal_claimable, row?.currency || "IDR")}
      </span>
    ),
  },
  {
    title: "Disetujui (Sales)",
    dataIndex: "sales_approve_amount",
    key: "sales_approve_amount",
    width: 170,
    align: "right",
    render: (val, row) => renderCurrencyAmount(val, row?.currency || "IDR"),
  },
  {
    title: "Tgl Posting",
    dataIndex: "tanggal_posting",
    key: "tanggal_posting",
    width: 130,
    render: (val) => renderDate(val),
  },
  {
    title: "Doc SAP",
    dataIndex: "accounting_document_number",
    key: "accounting_document_number",
    width: 160,
    render: (text) => (text ? renderTag(text, "blue") : "-"),
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    width: 220,
    align: "center",
    render: (row) => <StatusBadge status={row.status} />,
  },
  {
    title: "Aksi",
    key: "action",
    align: "center",
    fixed: "right",
    width: 90,
    render: (row) => (
      <Tooltip title="Lihat Detail Klaim">
        <Button
          type="default"
          shape="circle"
          icon={<EyeOutlined />}
          onClick={() => onDetail(row)}
          className="text-slate-600 border-slate-300 hover:!border-blue-400 hover:!text-blue-600 hover:!bg-blue-50"
        />
      </Tooltip>
    ),
  },
];

// ─────────────────────────────────────────────────────────────────────────────
//  Main Page Component
// ─────────────────────────────────────────────────────────────────────────────

export default function KlaimInternasionalPage() {
  const {
    klaimList,
    totalCount,
    isListFetching,
    params,
    handlePaginationChange,
    handleSearchChange,
    handleFilterChange,
    resetParams,
    refetchList,
  } = useKlaimInternasional();

  // ── Search State ──
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearch = useDebounce(searchValue, 400);

  useEffect(() => {
    handleSearchChange(debouncedSearch);
  }, [debouncedSearch, handleSearchChange]);

  // ── Modal State: Detail Klaim ──
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [activeDetailKlaimId, setActiveDetailKlaimId] = useState(null);

  const openDetailModal = (claim) => {
    setActiveDetailKlaimId(claim.klaim_id);
    setIsDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setActiveDetailKlaimId(null);
    setIsDetailModalOpen(false);
  };

  // ── Column Definitions ──
  const columnsConfig = buildColumns({ onDetail: openDetailModal });

  // ── Render ──
  return (
    <>
      {/* Filter Toolbar */}
      <div className="p-4 mb-4 bg-white border shadow-sm rounded-xl border-slate-200">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-6">
          <div>
            <label className="block mb-1 text-xs font-semibold text-slate-600">
              Kode Status
            </label>
            <Select
              allowClear
              placeholder="Semua Status"
              className="w-full"
              value={params.kode_status || undefined}
              onChange={(v) => handleFilterChange("kode_status", v ?? "")}
              options={STATUS_OPTIONS.map((opt) => ({
                value: opt.value,
                label: opt.label,
              }))}
            />
          </div>
          <div>
            <label className="block mb-1 text-xs font-semibold text-slate-600">
              Jenis Klaim
            </label>
            <Select
              allowClear
              placeholder="Semua Jenis"
              className="w-full"
              value={params.jenis_klaim || undefined}
              onChange={(v) => handleFilterChange("jenis_klaim", v ?? "")}
              options={JENIS_KLAIM_OPTIONS}
            />
          </div>
          <div>
            <label className="block mb-1 text-xs font-semibold text-slate-600">
              Fiscal Year
            </label>
            <Select
              allowClear
              placeholder="Semua Tahun"
              className="w-full"
              value={params.fiscal_year || undefined}
              onChange={(v) => handleFilterChange("fiscal_year", v ?? "")}
              options={FISCAL_YEAR_OPTIONS}
            />
          </div>
          <div>
            <label className="block mb-1 text-xs font-semibold text-slate-600">
              Tanggal Klaim (Dari)
            </label>
            <DatePicker
              format="YYYY-MM-DD"
              placeholder="YYYY-MM-DD"
              className="w-full"
              value={params.dateFrom ? dayjs(params.dateFrom) : null}
              onChange={(d) =>
                handleFilterChange("dateFrom", d ? d.format("YYYY-MM-DD") : "")
              }
            />
          </div>
          <div>
            <label className="block mb-1 text-xs font-semibold text-slate-600">
              Tanggal Klaim (Sampai)
            </label>
            <DatePicker
              format="YYYY-MM-DD"
              placeholder="YYYY-MM-DD"
              className="w-full"
              value={params.dateTo ? dayjs(params.dateTo) : null}
              onChange={(d) =>
                handleFilterChange("dateTo", d ? d.format("YYYY-MM-DD") : "")
              }
            />
          </div>
          <div className="flex items-end">
            <Tooltip title="Reset semua filter">
              <Button
                block
                onClick={() => {
                  resetParams();
                  setSearchValue("");
                }}
              >
                Reset Filter
              </Button>
            </Tooltip>
          </div>
        </div>
      </div>

      <DataTablePanel
        title="Proposal Klaim Support Internasional"
        description="Kelola pengajuan proposal klaim internasional, persetujuan SAP, dan riwayat log submit."
        columns={columnsConfig}
        dataSource={klaimList}
        loading={isListFetching}
        rowKey="klaim_id"
        scrollX={2400}
        pagination={{
          total: totalCount,
          pageSize: params.pageSize,
          current: params.currentPage,
          onChange: handlePaginationChange,
        }}
        searchProps={{
          placeholder: "Cari nomor klaim atau vendor...",
          value: searchValue,
          onChange: setSearchValue,
        }}
        extraHeaderActions={
          <Tooltip title="Muat Ulang Data">
            <Button
              type="default"
              shape="circle"
              size="large"
              icon={
                <ReloadOutlined
                  className={isListFetching ? "animate-spin" : ""}
                />
              }
              onClick={refetchList}
            />
          </Tooltip>
        }
      />

      {/* Detail Klaim Modal */}
      <KlaimDetailModal
        open={isDetailModalOpen}
        klaimId={activeDetailKlaimId}
        onClose={closeDetailModal}
        variant="internasional"
      />
    </>
  );
}
