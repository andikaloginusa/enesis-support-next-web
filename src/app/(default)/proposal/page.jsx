"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button, Tag, Typography, Select, Modal, Table } from "antd";
import {
  EyeOutlined,
  ReloadOutlined,
  MailOutlined,
  SwapOutlined,
  UploadOutlined,
  InboxOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  FileExcelOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useProposal, useDebounce } from "@/hooks";
import {
  DataTablePanel,
  StatusBadge,
  renderCurrency,
  renderDate,
  renderBold,
  renderMedium,
  renderTruncated,
} from "@/components/ui";

// ─────────────────────────────────────────────────────────────────────────────
//  Upload Result Display Sub-component
// ─────────────────────────────────────────────────────────────────────────────

function ResultPanel({ rows, type }) {
  const columns = [
    {
      title: "No",
      key: "no",
      width: 48,
      align: "center",
      render: (_, __, idx) => (
        <span className="text-slate-400 text-xs font-bold">{idx + 1}</span>
      ),
    },
    {
      title: "Nomor Dokumen",
      dataIndex: "doc_no",
      key: "doc_no",
      render: (v) => (
        <Typography.Text className="font-mono text-xs text-slate-700">
          {v || "-"}
        </Typography.Text>
      ),
    },
    {
      title: "Keterangan",
      dataIndex: "message",
      key: "message",
      render: (v) => (
        <Typography.Text className={`text-xs ${v ? "text-rose-600" : "text-emerald-600"}`}>
          {v || "✓ Berhasil dikirim"}
        </Typography.Text>
      ),
    },
  ];

  const borderColor = type === "success" ? "border-emerald-100" : "border-rose-100";
  const iconColor = type === "success" ? "text-emerald-500" : "text-rose-500";
  const label =
    type === "success"
      ? `Berhasil (${rows.length} proposal)`
      : `Gagal / Error (${rows.length} baris)`;

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <CheckCircleOutlined className={iconColor} />
        <span className="font-semibold text-sm text-slate-700">{label}</span>
      </div>
      <Table
        dataSource={rows}
        columns={columns}
        rowKey={(r, i) => r.doc_no || i}
        pagination={false}
        size="small"
        className={`rounded-xl overflow-hidden border ${borderColor}`}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Upload Modal Sub-component
// ─────────────────────────────────────────────────────────────────────────────

const ACCENT_THEMES = {
  blue: {
    header: "from-blue-600 to-blue-700",
    btn: "bg-blue-600 hover:bg-blue-700 border-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-600",
    dragger: "border-blue-300 hover:border-blue-500",
  },
  purple: {
    header: "from-purple-600 to-purple-700",
    btn: "bg-purple-600 hover:bg-purple-700 border-purple-600",
    bg: "bg-purple-50",
    border: "border-purple-200",
    text: "text-purple-600",
    dragger: "border-purple-300 hover:border-purple-500",
  },
};

function UploadModal({
  open,
  onClose,
  title,
  description,
  accentColor = "blue",
  icon,
  onUpload,
  isUploading,
  result,
  templateUrl,
}) {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    if (!open) {
      setSelectedFile(null);
      setDragOver(false);
    }
  }, [open]);

  const handleFileSelect = (file) => {
    const isExcel =
      file.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      file.type === "application/vnd.ms-excel" ||
      file.name.endsWith(".xlsx") ||
      file.name.endsWith(".xls");
    if (!isExcel) return false;
    setSelectedFile(file);
    return false;
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    try {
      await onUpload(selectedFile);
    } catch {
      // Handled by mutation onError
    }
  };

  const ac = ACCENT_THEMES[accentColor] || ACCENT_THEMES.blue;
  const successRows = result?.detail || [];
  const errorRows = Array.isArray(result?.data) ? result.data : [];
  const hasResult = successRows.length > 0 || errorRows.length > 0;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={520}
      centered
      styles={{ body: { padding: 0 } }}
      className="rounded-2xl overflow-hidden"
      closable={false}
    >
      {/* Gradient Header */}
      <div className={`bg-gradient-to-r ${ac.header} px-6 py-5 flex items-center gap-3`}>
        <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-white font-bold text-base leading-tight">{title}</h2>
          <p className="text-white/70 text-xs mt-0.5 line-clamp-1">{description}</p>
        </div>
        <button
          onClick={onClose}
          className="text-white/60 hover:text-white text-lg leading-none transition-colors"
        >
          ✕
        </button>
      </div>

      <div className="p-6 space-y-5">
        {!hasResult && (
          <>
            {/* Drop Zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer
                ${dragOver ? `${ac.bg} ${ac.border} scale-[1.01]` : "border-slate-200 hover:border-slate-300 bg-slate-50/40"}`}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(file);
                  e.target.value = "";
                }}
              />
              {selectedFile ? (
                <div className="flex flex-col items-center gap-3">
                  <div className={`w-14 h-14 rounded-2xl ${ac.bg} flex items-center justify-center`}>
                    <FileExcelOutlined className={`text-2xl ${ac.text}`} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{selectedFile.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {(selectedFile.size / 1024).toFixed(1)} KB · Klik untuk ganti file
                    </p>
                  </div>
                  <span className={`text-xs font-semibold ${ac.text} ${ac.bg} px-3 py-1 rounded-full`}>
                    File siap diupload
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                    <InboxOutlined className="text-2xl text-slate-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-700 text-sm">
                      Drag & drop file Excel di sini
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      atau klik untuk memilih file · Hanya file{" "}
                      <strong>.xlsx</strong> / <strong>.xls</strong>
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Download Template */}
            {templateUrl && (
              <div className="flex items-center justify-center">
                <a
                  href={templateUrl}
                  download
                  onClick={(e) => e.stopPropagation()}
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold ${ac.text} hover:underline`}
                >
                  <FileExcelOutlined />
                  Download Template Excel
                </a>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="flex-1 h-10 rounded-xl border border-slate-200 text-slate-500 text-sm font-semibold hover:bg-slate-50 transition-all"
              >
                Batal
              </button>
              <button
                onClick={handleUpload}
                disabled={!selectedFile || isUploading}
                className={`flex-1 h-10 rounded-xl text-white text-sm font-bold transition-all
                  ${selectedFile && !isUploading
                    ? `${ac.btn} shadow-sm`
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"}`}
              >
                {isUploading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin inline-block" />
                    Memproses...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <UploadOutlined />
                    Upload & Proses
                  </span>
                )}
              </button>
            </div>
          </>
        )}

        {/* Result Panel */}
        {hasResult && (
          <div className="space-y-4">
            {successRows.length > 0 && <ResultPanel rows={successRows} type="success" />}
            {errorRows.length > 0 && <ResultPanel rows={errorRows} type="error" />}
            <button
              onClick={onClose}
              className={`w-full h-10 rounded-xl text-white text-sm font-bold ${ac.btn} transition-all shadow-sm`}
            >
              Tutup
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Column Definitions
// ─────────────────────────────────────────────────────────────────────────────

function ProposalStatusCell({ status, fcstatus }) {
  return <StatusBadge status={status || fcstatus} />;
}

const buildColumns = ({ onView }) => [
  {
    title: "Nomor Proposal",
    dataIndex: "documentno",
    key: "documentno",
    fixed: "left",
    width: 220,
    render: (text, row) =>
      renderBold(text || row.nomor_proposal || row.nomor || row.reference_no || "-"),
  },
  {
    title: "Tanggal Pengajuan",
    dataIndex: "documentdate",
    key: "documentdate",
    width: 160,
    render: (val, row) =>
      renderDate(val || row.created || row.tanggal_pengajuan),
  },
  {
    title: "Divisi",
    dataIndex: "division_code",
    key: "division_code",
    width: 120,
    render: (text, row) => renderMedium(text || row.division),
  },
  {
    title: "Nama Proposal",
    dataIndex: "name",
    key: "name",
    width: 280,
    render: (text, row) =>
      renderTruncated(
        text || row.nama_vendor || row.nama_requester || "-",
        270
      ),
  },
  {
    title: "Nominal",
    dataIndex: "budget",
    key: "budget",
    width: 180,
    align: "right",
    render: (val, row) =>
      renderCurrency(val ?? row.amount ?? row.nominal ?? row.nominal_proposal ?? 0),
  },
  {
    title: "Status",
    key: "status",
    width: 160,
    align: "center",
    render: (row) => <ProposalStatusCell status={row.status} fcstatus={row.fcstatus} />,
  },
  {
    title: "Aksi",
    key: "action",
    align: "center",
    fixed: "right",
    width: 120,
    render: (row) => (
      <Typography.Text
        className="text-blue-600 hover:text-blue-700 font-semibold text-xs cursor-pointer"
        onClick={() =>
          onView(row.proposal_id || row.id || row.fkr_id)
        }
      >
        Lihat Detail →
      </Typography.Text>
    ),
  },
];

// ─────────────────────────────────────────────────────────────────────────────
//  Main Page Component
// ─────────────────────────────────────────────────────────────────────────────

const DIVISION_OPTIONS = [
  { value: "MM", label: "MM" },
  { value: "MT", label: "MT" },
  { value: "GT", label: "GT" },
  { value: "ECOM", label: "ECOM" },
  { value: "PHAR", label: "PHAR" },
];

const STATUS_OPTIONS = [
  { value: "Draft", label: "Draft" },
  { value: "Pending", label: "Pending" },
  { value: "Approved", label: "Approved" },
  { value: "Rejected", label: "Rejected" },
];

export default function ProposalSupportPage() {
  const router = useRouter();

  const {
    proposalList,
    totalCount,
    isListFetching,
    params,
    handlePaginationChange,
    handleSearchChange,
    handleFilterChange,
    refetchList,
    uploadSendEmailUlang,
    isUploadingEmail,
    uploadEmailResult,
    uploadReversalInternasional,
    isUploadingReversal,
    uploadReversalResult,
  } = useProposal();

  // ── Search State ──
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearch = useDebounce(searchValue, 400);

  useEffect(() => {
    handleSearchChange(debouncedSearch);
  }, [debouncedSearch, handleSearchChange]);

  // ── Upload Modal State ──
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [reversalModalOpen, setReversalModalOpen] = useState(false);

  // ── Column Definitions ──
  const columnsConfig = buildColumns({
    onView: (id) => router.push(`/proposal/${id}`),
  });

  return (
    <>
      <DataTablePanel
        title="Proposal Support"
        description="Kelola pengajuan, detail proposal divisi, status verifikasi, dan pantau persetujuan workflow."
        columns={columnsConfig}
        dataSource={proposalList}
        loading={isListFetching}
        rowKey={(row) => row.proposal_id || row.id || row.fkr_id}
        pagination={{
          total: totalCount,
          pageSize: params.pageSize,
          current: params.currentPage,
          onChange: handlePaginationChange,
        }}
        searchProps={{
          placeholder: "Cari nomor proposal, divisi, atau pemohon...",
          value: searchValue,
          onChange: setSearchValue,
        }}
        extraHeaderActions={
          <div className="flex items-center gap-2 flex-wrap">
            {/* Filters */}
            <Select
              placeholder="Semua Divisi"
              allowClear
              style={{ width: 140 }}
              onChange={(val) => handleFilterChange("division", val)}
              options={DIVISION_OPTIONS}
              className="font-medium"
            />
            <Select
              placeholder="Semua Status"
              allowClear
              style={{ width: 148 }}
              onChange={(val) => handleFilterChange("fcstatus", val)}
              options={STATUS_OPTIONS}
              className="font-medium"
            />

            <span className="w-px h-5 bg-slate-200 self-center mx-1" />

            {/* Upload Actions */}
            <Button
              icon={<MailOutlined />}
              onClick={() => setEmailModalOpen(true)}
              loading={isUploadingEmail}
              className="h-9 px-4 rounded-lg border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50 font-medium text-sm flex items-center gap-1.5 transition-all"
            >
              Send Email Ulang
            </Button>

            <Button
              icon={<SwapOutlined />}
              onClick={() => setReversalModalOpen(true)}
              loading={isUploadingReversal}
              className="h-9 px-4 rounded-lg border-slate-200 text-slate-600 hover:text-purple-600 hover:border-purple-400 hover:bg-purple-50 font-medium text-sm flex items-center gap-1.5 transition-all"
            >
              Reversal Internasional
            </Button>

            {/* Reload */}
            <Button
              shape="circle"
              icon={<ReloadOutlined className={isListFetching ? "animate-spin" : ""} />}
              onClick={refetchList}
              className="h-9 w-9 border-slate-200 text-slate-500 hover:text-slate-700 hover:border-slate-300"
            />
          </div>
        }
      />

      {/* Send Email Ulang Modal */}
      <UploadModal
        open={emailModalOpen}
        onClose={() => setEmailModalOpen(false)}
        title="Upload Send Email Ulang"
        description="Upload file Excel berisi daftar nomor proposal untuk kirim ulang email."
        accentColor="blue"
        icon={<MailOutlined className="text-white text-lg" />}
        onUpload={uploadSendEmailUlang}
        isUploading={isUploadingEmail}
        result={uploadEmailResult}
        templateUrl="/templates/proposal/Template Proposal Send Email.xlsx"
      />

      {/* Reversal Internasional Modal */}
      <UploadModal
        open={reversalModalOpen}
        onClose={() => setReversalModalOpen(false)}
        title="Upload Reversal Internasional"
        description="Upload file Excel untuk pemrosesan reversal internasional secara batch."
        accentColor="purple"
        icon={<SwapOutlined className="text-white text-lg" />}
        onUpload={uploadReversalInternasional}
        isUploading={isUploadingReversal}
        result={uploadReversalResult}
        templateUrl="/templates/proposal/Template Reverse Internasional.xlsx"
      />
    </>
  );
}
