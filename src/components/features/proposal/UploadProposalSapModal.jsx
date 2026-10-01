"use client";

import React, { useEffect, useRef, useState } from "react";
import { Modal, Button, Input, Typography, Spin, Table } from "antd";
import {
  UploadOutlined,
  InboxOutlined,
  FileExcelOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
  ReloadOutlined,
} from "@ant-design/icons";
import { generateReasonCode } from "@/hooks/queries/useProposal";
import { useConfirm } from "@/hooks/useConfirm";

const { Text } = Typography;

// ─────────────────────────────────────────────────────────────────────────────
//  Variant Configuration
// ─────────────────────────────────────────────────────────────────────────────

const VARIANT_CONFIG = {
  klaim: {
    title: "Upload Update Proposal From SAP",
    subtitle: "Klaim Detail & Budget ID",
    description:
      "Upload file Excel untuk mengupdate klaim detail dan budget ID proposal dari data SAP.",
    reasonPrefix: "PROPSAPKLDT",
    headerBg: "from-orange-500 to-orange-600",
    btnType: "primary",
    btnColor: "#f97316",
    badgeBg: "bg-orange-50",
    badgeBorder: "border-orange-200",
    badgeText: "text-orange-600",
    fileBorder: "border-orange-200",
    fileHoverBorder: "hover:border-orange-400",
    fileBg: "bg-orange-50/40",
  },
  import: {
    title: "Upload Proposal From SAP",
    subtitle: "Import",
    description:
      "Upload file Excel untuk mengimpor data proposal dari sistem SAP secara batch.",
    reasonPrefix: "PROPSAPIMP",
    headerBg: "from-blue-600 to-blue-700",
    btnType: "primary",
    btnColor: "#2563eb",
    badgeBg: "bg-blue-50",
    badgeBorder: "border-blue-200",
    badgeText: "text-blue-600",
    fileBorder: "border-blue-200",
    fileHoverBorder: "hover:border-blue-400",
    fileBg: "bg-blue-50/40",
  },
  amount: {
    title: "Upload Proposal From SAP",
    subtitle: "Amount",
    description:
      "Upload file Excel untuk mengoreksi amount/nominal budget proposal dari data SAP.",
    reasonPrefix: "PROPSAPAMOUNT",
    headerBg: "from-emerald-600 to-emerald-700",
    btnType: "primary",
    btnColor: "#059669",
    badgeBg: "bg-emerald-50",
    badgeBorder: "border-emerald-200",
    badgeText: "text-emerald-600",
    fileBorder: "border-emerald-200",
    fileHoverBorder: "hover:border-emerald-400",
    fileBg: "bg-emerald-50/40",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
//  Result Panel Sub-component
// ─────────────────────────────────────────────────────────────────────────────

function UploadResultPanel({ result, variant }) {
  const cfg = VARIANT_CONFIG[variant] || VARIANT_CONFIG.klaim;
  const successRows = Array.isArray(result?.detail) ? result.detail : [];
  const errorRows = Array.isArray(result?.data) ? result.data : [];
  const hasSuccess = successRows.length > 0;
  const hasError = errorRows.length > 0;

  const successColumns = [
    {
      title: "No",
      key: "no",
      width: 48,
      align: "center",
      render: (_, __, idx) => (
        <span className="text-emerald-500 text-xs font-bold">{idx + 1}</span>
      ),
    },
    {
      title: "Nomor Dokumen",
      dataIndex: "doc_no",
      key: "doc_no",
      render: (v) => (
        <Text className="font-mono text-xs text-slate-700">{v || "-"}</Text>
      ),
    },
    {
      title: "Keterangan",
      dataIndex: "message",
      key: "message",
      render: (v) => (
        <Text className="text-xs text-emerald-600">{v || "✓ Berhasil diproses"}</Text>
      ),
    },
  ];

  const errorColumns = [
    {
      title: "No",
      key: "no",
      width: 48,
      align: "center",
      render: (_, __, idx) => (
        <span className="text-red-500 text-xs font-bold">{idx + 1}</span>
      ),
    },
    {
      title: "Nomor Dokumen",
      dataIndex: "doc_no",
      key: "doc_no",
      render: (v) => (
        <Text className="font-mono text-xs text-slate-700">{v || "-"}</Text>
      ),
    },
    {
      title: "Keterangan",
      dataIndex: "message",
      key: "message",
      render: (v) => (
        <Text className="text-xs text-red-600">{v || "✓ Berhasil diproses"}</Text>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {hasSuccess && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <CheckCircleFilled className="text-emerald-500" />
            <span className="font-semibold text-sm text-slate-700">
              Berhasil diproses ({successRows.length})
            </span>
          </div>
          <Table
            dataSource={successRows}
            columns={successColumns}
            rowKey={(_, idx) => idx}
            pagination={false}
            size="small"
            className="rounded-xl overflow-hidden [&_.ant-table]:border [&_.ant-table]:border-emerald-100"
          />
        </div>
      )}
      {hasError && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <CloseCircleFilled className="text-red-500" />
            <span className="font-semibold text-sm text-slate-700">
              Gagal ({errorRows.length})
            </span>
          </div>
          <Table
            dataSource={errorRows}
            columns={errorColumns}
            rowKey={(_, idx) => idx}
            pagination={false}
            size="small"
            className="rounded-xl overflow-hidden [&_.ant-table]:border [&_.ant-table]:border-red-100"
          />
        </div>
      )}
      {!hasSuccess && !hasError && (
        <div className="flex items-center gap-2 text-emerald-600 text-sm">
          <CheckCircleFilled />
          <span className="font-medium">{result?.message || "Proses selesai."}</span>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Main Modal Component
// ─────────────────────────────────────────────────────────────────────────────

/**
 * UploadProposalSapModal — Upload modal for Proposal SAP actions.
 *
 * Variants:
 * - "klaim"  : Upload Update Proposal From SAP — Klaim Detail & Budget ID
 * - "import" : Upload Proposal From SAP — Import
 * - "amount" : Upload Proposal From SAP — Amount
 *
 * @param {Object}   props
 * @param {boolean}  props.open
 * @param {Function} props.onClose
 * @param {"klaim"|"import"|"amount"} props.variant
 * @param {Function} props.onUpload   - Mutation: ({ excel, kode_proses }) => Promise
 * @param {boolean}  props.isUploading
 * @param {Object}   [props.result]    - Mutation result data
 */
export function UploadProposalSapModal({
  open,
  onClose,
  variant = "klaim",
  onUpload,
  isUploading = false,
  result,
}) {
  const fileInputRef = useRef(null);
  const { confirmAction } = useConfirm();
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [reason, setReason] = useState("");
  const [showResult, setShowResult] = useState(false);

  const cfg = VARIANT_CONFIG[variant] || VARIANT_CONFIG.klaim;

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!open) {
      setSelectedFile(null);
      setDragOver(false);
      setReason("");
      setShowResult(false);
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

  const handleGenerateReason = () => {
    const code = generateReasonCode(cfg.reasonPrefix);
    setReason(code);
  };

  const handleConfirm = async () => {
    if (!selectedFile || !reason.trim()) return;

    confirmAction({
      title: `Konfirmasi Upload ${cfg.subtitle}`,
      description: `Apakah Anda yakin ingin mengunggah file "${selectedFile.name}"? Aksi ini akan memperbarui data proposal dari SAP.`,
      okText: "Ya, Upload Sekarang",
      onConfirm: async () => {
        await onUpload({ excel: selectedFile, kode_proses: reason.trim() });
        setShowResult(true);
      },
    });
  };

  const handleClose = () => {
    setSelectedFile(null);
    setDragOver(false);
    setReason("");
    setShowResult(false);
    onClose();
  };

  const canSubmit = Boolean(selectedFile && reason.trim());

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      footer={null}
      width={560}
      centered
      styles={{ body: { padding: 0 } }}
      className="rounded-2xl overflow-hidden"
      closable={false}
      destroyOnHidden
    >
      {/* Gradient Header */}
      <div className={`bg-gradient-to-r ${cfg.headerBg} px-6 py-5 flex items-center gap-3`}>
        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
          <UploadOutlined className="text-white text-lg" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-white font-bold text-base leading-tight">{cfg.title}</h2>
          <p className="text-white/70 text-xs mt-0.5">{cfg.subtitle}</p>
        </div>
        <span className={`${cfg.badgeBg} ${cfg.badgeBorder} ${cfg.badgeText} text-xs font-bold px-2.5 py-1 rounded-lg border`}>
          SAP
        </span>
        <button
          onClick={handleClose}
          className="text-white/60 hover:text-white text-lg leading-none transition-colors ml-1"
        >
          ✕
        </button>
      </div>

      <div className="p-6 space-y-5">

        {/* Description */}
        <div className={`${cfg.fileBg} border ${cfg.fileBorder} rounded-xl px-4 py-3`}>
          <p className="text-slate-600 text-sm leading-relaxed m-0">{cfg.description}</p>
        </div>

        {!showResult && (
          <>
            {/* Kode Proses Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Text className="text-slate-700 text-sm font-semibold">
                  Kode Proses
                </Text>
                <Button
                  type="link"
                  size="small"
                  icon={<ReloadOutlined className="text-xs" />}
                  onClick={handleGenerateReason}
                  className="text-xs font-semibold h-auto p-0"
                >
                  Generate Kode
                </Button>
              </div>
              <Input
                placeholder={`Contoh: ${cfg.reasonPrefix}-${new Date().getFullYear()}01011230`}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                size="large"
                className="rounded-lg [&_.ant-input]:font-mono"
              />
              <Text className="text-slate-400 text-xs">
                Klik &quot;Generate Kode&quot; untuk membuat kode unik otomatis, atau isi manual.
              </Text>
            </div>

            {/* Drop Zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer
                ${dragOver ? `${cfg.fileBg} ${cfg.fileBorder} scale-[1.01]` : `${cfg.fileBorder} ${cfg.fileHoverBorder} bg-slate-50/40`}`}
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
                  <div className={`w-14 h-14 rounded-2xl ${cfg.fileBg} flex items-center justify-center`}>
                    <FileExcelOutlined className={`text-2xl ${cfg.badgeText}`} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{selectedFile.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <span className={`${cfg.badgeBg} ${cfg.badgeBorder} ${cfg.badgeText} text-xs font-semibold px-3 py-1 rounded-full border`}>
                    File siap diupload — klik untuk ganti
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                    <InboxOutlined className="text-2xl text-slate-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-700 text-sm">
                      Drag &amp; drop file Excel di sini
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      atau klik untuk memilih file &middot; Hanya{" "}
                      <strong>.xlsx</strong> / <strong>.xls</strong>
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                block
                size="large"
                onClick={handleClose}
                className="rounded-xl"
              >
                Batal
              </Button>
              <Button
                block
                type="primary"
                size="large"
                icon={<UploadOutlined />}
                onClick={handleConfirm}
                loading={isUploading}
                disabled={!canSubmit}
                style={{
                  backgroundColor: canSubmit ? cfg.btnColor : undefined,
                  borderColor: canSubmit ? cfg.btnColor : undefined,
                }}
                className="rounded-xl font-semibold"
              >
                Upload &amp; Proses
              </Button>
            </div>
          </>
        )}

        {/* Loading State */}
        {isUploading && !showResult && (
          <div className="flex flex-col items-center justify-center py-10 gap-4">
            <Spin size="large" />
            <div className="text-center">
              <p className="text-slate-700 font-semibold text-sm">Memproses Upload...</p>
              <p className="text-slate-400 text-xs mt-1">
                Mohon tunggu, data sedang diproses.
              </p>
            </div>
          </div>
        )}

        {/* Result Panel */}
        {showResult && result !== undefined && !isUploading && (
          <div className="space-y-4">
            <UploadResultPanel result={result} variant={variant} />
            <Button
              block
              type="primary"
              size="large"
              onClick={handleClose}
              style={{
                backgroundColor: cfg.btnColor,
                borderColor: cfg.btnColor,
              }}
              className="rounded-xl font-semibold"
            >
              Tutup
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}
