"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  Tag,
  Typography,
  Tooltip,
  Select,
  Modal,
  Table,
} from "antd";
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
import moment from "moment";
import { useRouter } from "next/navigation";
import { useProposal, useDebounce } from "@/hooks";
import { DataTablePanel } from "@/components/ui";

const { Text, Title } = Typography;



// ==========================================
// 1. Formatters & Utility Helpers
// ==========================================

const formatCurrency = (val) => {
  if (val === null || val === undefined) return "-";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(val);
};

const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  return moment(dateStr).format("DD MMM YYYY");
};

// ==========================================
// 2. Upload Modal Sub-component
// ==========================================

/**
 * Generic Excel upload modal used by both Send Email Ulang and Reversal Internasional.
 * Props:
 *   open, onClose, title, description, accentColor,
 *   icon, onUpload, isUploading, result
 */
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

  // Reset file state when modal closes
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

    if (!isExcel) {
      return false; // antd Upload will show error
    }
    setSelectedFile(file);
    return false; // prevent auto-upload by antd
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
    } catch (_) {
      // error handled by mutation onError
    }
  };

  const accentMap = {
    blue: {
      header: "from-blue-600 to-blue-700",
      btn: "bg-blue-600 hover:bg-blue-700 border-blue-600",
      border: "border-blue-200",
      bg: "bg-blue-50",
      text: "text-blue-600",
      dragger: "border-blue-300 hover:border-blue-500",
    },
    purple: {
      header: "from-purple-600 to-purple-700",
      btn: "bg-purple-600 hover:bg-purple-700 border-purple-600",
      border: "border-purple-200",
      bg: "bg-purple-50",
      text: "text-purple-600",
      dragger: "border-purple-300 hover:border-purple-500",
    },
  };
  const ac = accentMap[accentColor] || accentMap.blue;

  // Parse result — can be { detail: [], message: "" } or error array
  const successRows = result?.detail || [];
  const errorRows = Array.isArray(result?.data) ? result.data : [];

  const resultColumns = [
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
      render: (v) => <Text className="font-mono text-xs text-slate-700">{v || "-"}</Text>,
    },
    {
      title: "Keterangan",
      dataIndex: "message",
      key: "message",
      render: (v) => (
        <Text className={`text-xs ${v ? "text-rose-600" : "text-emerald-600"}`}>
          {v || "✓ Berhasil dikirim"}
        </Text>
      ),
    },
  ];

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
      <div
        className={`bg-gradient-to-r ${ac.header} px-6 py-5 flex items-center gap-3`}
      >
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
        {/* File Drop Zone */}
        {!hasResult && (
          <>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer
                ${dragOver ? `${ac.bg} ${ac.border} scale-[1.01]` : "border-slate-200 hover:border-slate-300 bg-slate-50/40"}
              `}
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
                  <FileExcelOutlined className="text-sm" />
                  Download Template Excel
                </a>
              </div>
            )}

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
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                  }`}
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
          <>
            {successRows.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircleOutlined className="text-emerald-500" />
                  <span className="font-semibold text-sm text-slate-700">
                    Berhasil ({successRows.length} proposal)
                  </span>
                </div>
                <Table
                  dataSource={successRows}
                  columns={resultColumns}
                  rowKey={(r, i) => r.doc_no || i}
                  pagination={false}
                  size="small"
                  className="rounded-xl overflow-hidden border border-emerald-100"
                />
              </div>
            )}

            {errorRows.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <CloseCircleOutlined className="text-rose-500" />
                  <span className="font-semibold text-sm text-slate-700">
                    Gagal / Error ({errorRows.length} baris)
                  </span>
                </div>
                <Table
                  dataSource={errorRows}
                  columns={resultColumns}
                  rowKey={(r, i) => r.doc_no || i}
                  pagination={false}
                  size="small"
                  className="rounded-xl overflow-hidden border border-rose-100"
                />
              </div>
            )}

            <button
              onClick={onClose}
              className={`w-full h-10 rounded-xl text-white text-sm font-bold ${ac.btn} transition-all shadow-sm`}
            >
              Tutup
            </button>
          </>
        )}
      </div>
    </Modal>
  );
}

// ==========================================
// 3. Main Page Component
// ==========================================

export default function ProposalSupportPage() {
  const router = useRouter();

  // Upload modal visibility
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [reversalModalOpen, setReversalModalOpen] = useState(false);

  // ==========================================
  // React Query Hook State & Actions
  // ==========================================
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

  // Local debounced search binding
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearch = useDebounce(searchValue, 400);

  useEffect(() => {
    handleSearchChange(debouncedSearch);
  }, [debouncedSearch, handleSearchChange]);

  // ==========================================
  // Columns Configuration
  // ==========================================

  const columnsConfig = [
    {
      title: "Nomor Proposal",
      dataIndex: "documentno",
      key: "documentno",
      fixed: "left",
      width: 220,
      render: (text, row) => (
        <Text className="font-semibold text-slate-800">
          {text || row.nomor_proposal || row.nomor || row.reference_no || "-"}
        </Text>
      ),
    },
    {
      title: "Tanggal Pengajuan",
      dataIndex: "documentdate",
      key: "documentdate",
      width: 160,
      render: (val, row) => formatDate(val || row.created || row.tanggal_pengajuan),
    },
    {
      title: "Divisi",
      dataIndex: "division_code",
      key: "division_code",
      width: 120,
      render: (text, row) => (
        <Text className="font-medium text-slate-700">{text || row.division || "-"}</Text>
      ),
    },
    {
      title: "Nama Proposal",
      dataIndex: "name",
      key: "name",
      width: 280,
      render: (text, row) => (
        <Tooltip title={text || row.nama_vendor || row.nama_requester || "-"}>
          <Text className="block truncate max-w-[270px] font-medium text-slate-600">
            {text || row.nama_vendor || row.nama_requester || "-"}
          </Text>
        </Tooltip>
      ),
    },
    {
      title: "Nominal",
      dataIndex: "budget",
      key: "budget",
      width: 180,
      align: "right",
      render: (val, row) => (
        <Text className="font-semibold text-slate-700">
          {formatCurrency(val ?? row.amount ?? row.nominal ?? row.nominal_proposal ?? 0)}
        </Text>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 160,
      align: "center",
      render: (val, row) => {
        const rawStatus = (val || row.fcstatus || "PENDING").toLowerCase();
        let color = "processing";
        if (
          rawStatus === "approved" ||
          rawStatus === "apr" ||
          rawStatus === "y" ||
          rawStatus === "success"
        )
          color = "success";
        if (
          rawStatus === "rejected" ||
          rawStatus === "failed" ||
          rawStatus === "reject" ||
          rawStatus === "n"
        )
          color = "error";
        if (
          rawStatus === "waiting approval" ||
          rawStatus === "draft" ||
          rawStatus === "pending" ||
          rawStatus === "on progress"
        )
          color = "warning";

        return (
          <Tag
            color={color}
            className="font-semibold uppercase px-2 py-0.5 rounded border-none"
          >
            {val || row.fcstatus || "PENDING"}
          </Tag>
        );
      },
    },
    {
      title: "Aksi",
      key: "action",
      align: "center",
      fixed: "right",
      width: 120,
      render: (row) => (
        <Tooltip title="Lihat Detail Proposal">
          <Button
            type="primary"
            shape="circle"
            icon={<EyeOutlined />}
            onClick={() =>
              router.push(
                `/proposal/${row.proposal_id || row.id || row.fkr_id}`
              )
            }
            className="bg-blue-600 hover:bg-blue-700 border-blue-600"
          />
        </Tooltip>
      ),
    },
  ];

  // ==========================================
  // Render
  // ==========================================
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
            {/* ── Filters ── */}
            <Select
              placeholder="Semua Divisi"
              allowClear
              style={{ width: 140 }}
              onChange={(val) => handleFilterChange("division", val)}
              options={[
                { value: "MM", label: "MM" },
                { value: "MT", label: "MT" },
                { value: "GT", label: "GT" },
                { value: "ECOM", label: "ECOM" },
                { value: "PHAR", label: "PHAR" },
              ]}
              className="font-medium"
            />
            <Select
              placeholder="Semua Status"
              allowClear
              style={{ width: 148 }}
              onChange={(val) => handleFilterChange("fcstatus", val)}
              options={[
                { value: "Draft", label: "Draft" },
                { value: "Pending", label: "Pending" },
                { value: "Approved", label: "Approved" },
                { value: "Rejected", label: "Rejected" },
              ]}
              className="font-medium"
            />

            {/* Separator */}
            <span className="w-px h-5 bg-slate-200 self-center mx-1" />

            {/* ── Upload Actions ── */}
            <Tooltip title="Upload file Excel berisi daftar nomor proposal untuk kirim ulang email notifikasi">
              <Button
                icon={<MailOutlined />}
                onClick={() => setEmailModalOpen(true)}
                loading={isUploadingEmail}
                className="h-9 px-4 rounded-lg border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50 font-medium text-sm flex items-center gap-1.5 transition-all"
              >
                Send Email Ulang
              </Button>
            </Tooltip>

            <Tooltip title="Upload file Excel untuk memproses reversal internasional secara batch">
              <Button
                icon={<SwapOutlined />}
                onClick={() => setReversalModalOpen(true)}
                loading={isUploadingReversal}
                className="h-9 px-4 rounded-lg border-slate-200 text-slate-600 hover:text-purple-600 hover:border-purple-400 hover:bg-purple-50 font-medium text-sm flex items-center gap-1.5 transition-all"
              >
                Reversal Internasional
              </Button>
            </Tooltip>

            {/* ── Reload ── */}
            <Tooltip title="Muat Ulang Data">
              <Button
                shape="circle"
                icon={<ReloadOutlined className={isListFetching ? "animate-spin" : ""} />}
                onClick={() => refetchList()}
                className="h-9 w-9 border-slate-200 text-slate-500 hover:text-slate-700 hover:border-slate-300"
              />
            </Tooltip>
          </div>
        }
      />


      {/* ── Upload Send Email Ulang Modal ── */}
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

      {/* ── Upload Reversal Internasional Modal ── */}
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
