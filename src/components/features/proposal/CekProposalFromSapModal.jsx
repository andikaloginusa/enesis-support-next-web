"use client";

import React, { useEffect, useState } from "react";
import {
  Modal,
  Button,
  Typography,
  Input,
  Space,
  Spin,
  Alert,
} from "antd";
import {
  SyncOutlined,
  DollarOutlined,
  WarningOutlined,
  FileTextOutlined,
  CalculatorOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { proposalService } from "@/services/proposal.service";

const { Text } = Typography;

/**
 * Format a number as Indonesian Rupiah currency string.
 * @param {number} value
 * @returns {string}
 */
function formatRupiah(value) {
  if (value == null) return "—";
  const abs = Math.abs(value);
  const str = abs.toLocaleString("id-ID");
  return value < 0 ? `- Rp ${str}` : `Rp ${str}`;
}

/**
 * Single KPI summary tile card.
 */
function KpiTile({ label, value, icon, variant = "neutral" }) {
  const isNegative = variant === "danger";
  const isWarning = variant === "warning";
  const isPositive = variant === "success";

  const tileClass = isNegative
    ? "bg-rose-50 border-rose-200"
    : isWarning
    ? "bg-amber-50 border-amber-200"
    : isPositive
    ? "bg-emerald-50 border-emerald-200"
    : "bg-slate-50 border-slate-200";

  const iconWrapClass = tileClass; // reuse same tint for icon wrap

  const iconClass = isNegative
    ? "text-rose-400"
    : isWarning
    ? "text-amber-400"
    : isPositive
    ? "text-emerald-400"
    : "text-slate-400";

  const valueClass = isNegative
    ? "text-rose-600"
    : isWarning
    ? "text-amber-600"
    : isPositive
    ? "text-emerald-600"
    : "text-slate-800";

  return (
    <div className={`flex items-start gap-4 p-5 rounded-2xl border ${tileClass} transition-all`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconWrapClass}`}>
        {React.cloneElement(icon, { className: `${icon.props.className || ""} ${iconClass} text-xl` })}
      </div>
      <div className="flex-1 min-w-0">
        <Text className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
          {label}
        </Text>
        <Text className={`block font-bold text-lg leading-tight ${valueClass}`}>
          {value}
        </Text>
      </div>
    </div>
  );
}

/**
 * CekProposalFromSapModal — Modal for viewing Proposal Budget summary from SAP.
 *
 * Flow:
 * 1. User enters kodeEpropSap (e.g. "L/007109/MT/11/26")
 * 2. Clicks "Cek" button
 * 3. API is called → KPI tiles shown
 *
 * @param {Object}   props
 * @param {boolean}  props.open
 * @param {Function} props.onClose
 */
export function CekProposalFromSapModal({ open, onClose }) {
  const [kodeEpropSap, setKodeEpropSap] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Reset on close
  useEffect(() => {
    if (!open) {
      setKodeEpropSap("");
      setData(null);
      setError(null);
      setHasSearched(false);
    }
  }, [open]);

  const handleCek = async () => {
    const kode = kodeEpropSap.trim();
    if (!kode) return;

    setLoading(true);
    setError(null);
    setData(null);
    setHasSearched(true);

    try {
      const response = await proposalService.getProposalFromSapBudget({
        kodeEpropSap: kode,
      });

      if (response.ok) {
        setData(response.data);
      } else {
        setError(response.data?.message || "Gagal mengambil data budget proposal.");
      }
    } catch {
      setError("Terjadi kesalahan koneksi saat mengambil data.");
    } finally {
      setLoading(false);
    }
  };

  const tiles = data
    ? [
        {
          label: "Total Nominal Budget",
          value: formatRupiah(data.total_nominal_budget),
          icon: <DollarOutlined />,
          variant: "neutral",
        },
        {
          label: "Total Tolerance",
          value: formatRupiah(data.total_tolerance),
          icon: <WarningOutlined />,
          variant: data.total_tolerance > 0 ? "warning" : "neutral",
        },
        {
          label: "Total Klaim E-Prop",
          value: formatRupiah(data.total_klaim_eprop),
          icon: <FileTextOutlined />,
          variant: "neutral",
        },
        {
          label: "Sisa Budget",
          value: formatRupiah(data.sisa_budget),
          icon: <CalculatorOutlined />,
          variant: data.sisa_budget < 0 ? "danger" : "success",
        },
      ]
    : [];

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={
        <div className="flex items-center gap-2 pb-3 text-base font-bold border-b border-slate-100 text-slate-800">
          <SyncOutlined className="text-blue-500" />
          <span>Cek Proposal From SAP</span>
        </div>
      }
      footer={
        <div className="flex justify-end">
          <Button size="large" onClick={onClose} className="rounded-lg">
            Tutup
          </Button>
        </div>
      }
      destroyOnHidden
      width={560}
      className="[&_.ant-modal-content]:rounded-xl"
    >
      <div className="py-4 space-y-4">

        {/* ── Search Input ── */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <SearchOutlined className="text-slate-400" />
            <Text className="text-slate-600 text-sm font-semibold">Kode E-Prop SAP</Text>
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Contoh: L/007109/MT/11/26"
              value={kodeEpropSap}
              onChange={(e) => setKodeEpropSap(e.target.value)}
              onPressEnter={handleCek}
              size="large"
              className="flex-1 rounded-lg [&_.ant-input]:font-mono"
              allowClear
            />
            <Button
              type="primary"
              icon={<SyncOutlined />}
              size="large"
              onClick={handleCek}
              loading={loading}
              disabled={!kodeEpropSap.trim()}
              style={{
                backgroundColor: "#1aac32",
                borderColor: "#1aac32",
                color: "#ffffff",
              }}
              className="rounded-lg shrink-0"
            >
              Cek
            </Button>
          </div>
          <Text className="text-slate-400 text-xs">
            Masukkan kode e-proposal SAP untuk melihat ringkasan budget.
          </Text>
        </div>

        {/* ── Loading ── */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-10 gap-3">
            <Spin size="large" />
            <Text className="text-slate-400 text-sm">Memuat data budget proposal...</Text>
          </div>
        )}

        {/* ── Error ── */}
        {error && !loading && (
          <Alert
            type="error"
            message="Gagal Memuat Data"
            description={error}
            showIcon
            className="rounded-xl"
          />
        )}

        {/* ── KPI Tiles ── */}
        {data && !loading && (
          <>
            {/* Header info */}
            <Alert
              type="info"
              message="Data Budget Proposal dari SAP"
              description={`Kode: ${kodeEpropSap}`}
              showIcon
              className="rounded-xl [&_.ant-alert-info]:bg-blue-50/70 [&_.ant-alert-info]:border-blue-100"
            />

            {/* 2x2 Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {tiles.map((tile) => (
                <KpiTile key={tile.label} {...tile} />
              ))}
            </div>

            {/* Sisa Budget Warning */}
            {data.sisa_budget < 0 && (
              <Alert
                type="warning"
                icon={<WarningOutlined />}
                message="Budget Minus"
                description={`Sisa budget menunjukkan nilai negatif sebesar ${formatRupiah(data.sisa_budget)}. Klaim e-proposal melebihi total nominal budget yang tersedia.`}
                showIcon
                className="rounded-xl [&_.ant-alert-warning]:bg-amber-50/80 [&_.ant-alert-warning]:border-amber-200"
              />
            )}
          </>
        )}

        {/* ── Empty state (before first search) ── */}
        {!hasSearched && !loading && (
          <div className="flex flex-col items-center justify-center py-10 gap-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
              <SearchOutlined className="text-slate-300 text-2xl" />
            </div>
            <Text className="text-slate-400 text-sm font-medium text-center">
              Masukkan kode e-proposal SAP lalu klik &quot;Cek&quot;
            </Text>
          </div>
        )}
      </div>
    </Modal>
  );
}
