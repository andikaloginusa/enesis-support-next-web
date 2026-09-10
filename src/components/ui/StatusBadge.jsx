"use client";

import React from "react";
import { Tag } from "antd";

/**
 * Shared status configuration for consistent badge styling across all pages.
 */
const STATUS_CONFIG = {
  // ── Success / Completed / Approval ──
  approved: {
    color: "success",
    label: "APPROVED",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
  },
  success: {
    color: "success",
    label: "SUCCESS",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
  },
  apr: {
    color: "success",
    label: "APPROVED",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
  },
  pay: {
    color: "success",
    label: "PAYMENT COMPLETED",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
  },
  "payment completed": {
    color: "success",
    label: "PAYMENT COMPLETED",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
  },
  y: {
    color: "success",
    label: "APPROVED",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
  },

  // ── Error / Reject ──
  rejected: {
    color: "error",
    label: "REJECTED",
    className: "bg-rose-50 text-rose-700 border-rose-200",
    dot: "bg-rose-500",
  },
  reject: {
    color: "error",
    label: "REJECTED",
    className: "bg-rose-50 text-rose-700 border-rose-200",
    dot: "bg-rose-500",
  },
  failed: {
    color: "error",
    label: "FAILED",
    className: "bg-rose-50 text-rose-700 border-rose-200",
    dot: "bg-rose-500",
  },
  rjc: {
    color: "error",
    label: "REJECTED",
    className: "bg-rose-50 text-rose-700 border-rose-200",
    dot: "bg-rose-500",
  },
  n: {
    color: "error",
    label: "REJECTED",
    className: "bg-rose-50 text-rose-700 border-rose-200",
    dot: "bg-rose-500",
  },

  // ── Klaim Specific Statuses (Distinct Color Palette) ──
  // 1. Pengajuan - DR (Slate Gray)
  dr: {
    color: "default",
    label: "PENGAJUAN",
    className: "bg-slate-100 text-slate-700 border-slate-300",
    dot: "bg-slate-500",
  },
  pengajuan: {
    color: "default",
    label: "PENGAJUAN",
    className: "bg-slate-100 text-slate-700 border-slate-300",
    dot: "bg-slate-500",
  },

  // 2. ECC Verifikasi - ECC (Sky Blue)
  ecc: {
    color: "processing",
    label: "ECC VERIFIKASI",
    className: "bg-sky-50 text-sky-700 border-sky-200",
    dot: "bg-sky-500",
  },
  "ecc verifikasi": {
    color: "processing",
    label: "ECC VERIFIKASI",
    className: "bg-sky-50 text-sky-700 border-sky-200",
    dot: "bg-sky-500",
  },

  // 3. RSM Approved - RSM (Teal)
  rsm: {
    color: "success",
    label: "RSM APPROVED",
    className: "bg-teal-50 text-teal-700 border-teal-200",
    dot: "bg-teal-500",
  },
  "rsm approved": {
    color: "success",
    label: "RSM APPROVED",
    className: "bg-teal-50 text-teal-700 border-teal-200",
    dot: "bg-teal-500",
  },

  // 4. Sales Head Approved - SHA (Purple / Violet)
  sha: {
    color: "purple",
    label: "SALES HEAD APPROVED",
    className: "bg-purple-50 text-purple-700 border-purple-200",
    dot: "bg-purple-500",
  },
  "sales head approved": {
    color: "purple",
    label: "SALES HEAD APPROVED",
    className: "bg-purple-50 text-purple-700 border-purple-200",
    dot: "bg-purple-500",
  },

  // 5. Distributor Kirim Dokumen - SEND (Orange)
  send: {
    color: "warning",
    label: "KIRIM DOKUMEN",
    className: "bg-orange-50 text-orange-700 border-orange-200",
    dot: "bg-orange-500",
  },
  "distributor kirim dokumen": {
    color: "warning",
    label: "DISTRIBUTOR KIRIM DOKUMEN",
    className: "bg-orange-50 text-orange-700 border-orange-200",
    dot: "bg-orange-500",
  },
  "kirim dokumen": {
    color: "warning",
    label: "KIRIM DOKUMEN",
    className: "bg-orange-50 text-orange-700 border-orange-200",
    dot: "bg-orange-500",
  },

  // 6. ECC Terima Dokumen - RECEIVE (Indigo)
  receive: {
    color: "blue",
    label: "ECC TERIMA DOK.",
    className: "bg-indigo-50 text-indigo-700 border-indigo-200",
    dot: "bg-indigo-500",
  },
  "ecc terima dok.": {
    color: "blue",
    label: "ECC TERIMA DOK.",
    className: "bg-indigo-50 text-indigo-700 border-indigo-200",
    dot: "bg-indigo-500",
  },
  "ecc terima dok": {
    color: "blue",
    label: "ECC TERIMA DOK.",
    className: "bg-indigo-50 text-indigo-700 border-indigo-200",
    dot: "bg-indigo-500",
  },
  "ecc terima dokumen": {
    color: "blue",
    label: "ECC TERIMA DOKUMEN",
    className: "bg-indigo-50 text-indigo-700 border-indigo-200",
    dot: "bg-indigo-500",
  },
  "terima dokumen": {
    color: "blue",
    label: "TERIMA DOKUMEN",
    className: "bg-indigo-50 text-indigo-700 border-indigo-200",
    dot: "bg-indigo-500",
  },

  // 7. Plan Payment - PLAN (Warm Amber / Gold)
  plan: {
    color: "gold",
    label: "PLAN PAYMENT",
    className: "bg-amber-50 text-amber-800 border-amber-200",
    dot: "bg-amber-500",
  },
  "plan payment": {
    color: "gold",
    label: "PLAN PAYMENT",
    className: "bg-amber-50 text-amber-800 border-amber-200",
    dot: "bg-amber-500",
  },

  // ── General / Fallback Statuses ──
  waiting_approval: {
    color: "warning",
    label: "WAITING APPROVAL",
    className: "bg-amber-50 text-amber-800 border-amber-200",
    dot: "bg-amber-500",
  },
  draft: {
    color: "default",
    label: "DRAFT",
    className: "bg-slate-100 text-slate-700 border-slate-200",
    dot: "bg-slate-400",
  },
  pending: {
    color: "warning",
    label: "PENDING",
    className: "bg-amber-50 text-amber-800 border-amber-200",
    dot: "bg-amber-500",
  },
  processing: {
    color: "processing",
    label: "PROCESSING",
    className: "bg-blue-50 text-blue-700 border-blue-200",
    dot: "bg-blue-500",
  },
};

/**
 * Maps a raw status string to a consistent, high-contrast StatusBadge.
 * Displays the actual status text from response with high readability and no washed-out colors.
 */
export function StatusBadge({ status, className = "" }) {
  if (!status) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide border shadow-2xs whitespace-nowrap bg-slate-100 text-slate-600 border-slate-200 ${className}`}
      >
        <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-slate-400" />
        <span className="whitespace-nowrap">PENDING</span>
      </span>
    );
  }

  const raw = String(status).toLowerCase().trim();
  let config = STATUS_CONFIG[raw];

  // Fallback: fuzzy match on substring (order matters: specific before generic)
  if (!config) {
    if (raw.includes("sales head") || raw === "sha") {
      config = STATUS_CONFIG.sha;
    } else if (raw.includes("rsm")) {
      config = STATUS_CONFIG.rsm;
    } else if (raw.includes("plan")) {
      config = STATUS_CONFIG.plan;
    } else if (raw.includes("ecc") && (raw.includes("terima") || raw.includes("receive"))) {
      config = STATUS_CONFIG.receive;
    } else if (raw.includes("ecc") || raw.includes("verif")) {
      config = STATUS_CONFIG.ecc;
    } else if (raw.includes("send") || raw.includes("kirim")) {
      config = STATUS_CONFIG.send;
    } else if (raw.includes("terima") || raw.includes("receive")) {
      config = STATUS_CONFIG.receive;
    } else if (raw.includes("pengajuan") || raw === "dr") {
      config = STATUS_CONFIG.dr;
    } else if (raw.includes("pay") || raw.includes("payment")) {
      config = STATUS_CONFIG.pay;
    } else if (raw.includes("approve") || raw.includes("success")) {
      config = STATUS_CONFIG.approved;
    } else if (
      raw.includes("reject") ||
      raw.includes("failed") ||
      raw.includes("rjc")
    ) {
      config = STATUS_CONFIG.rejected;
    } else if (
      raw.includes("proses") ||
      raw.includes("wait") ||
      raw.includes("menunggu") ||
      raw.includes("belum") ||
      raw.includes("pending")
    ) {
      config = raw.includes("wait") || raw.includes("menunggu")
        ? STATUS_CONFIG.waiting_approval
        : STATUS_CONFIG.processing;
    } else if (raw.includes("draft")) {
      config = STATUS_CONFIG.draft;
    } else {
      config = {
        color: "default",
        label: String(status).toUpperCase(),
        className: "bg-slate-100 text-slate-700 border-slate-200",
        dot: "bg-slate-400",
      };
    }
  }

  // Use the exact response status formatted to uppercase if it's descriptive,
  // or fall back to normalized config label if raw is a known code
  const isShortCode = [
    "y",
    "n",
    "apr",
    "rjc",
    "pay",
    "dr",
    "ecc",
    "rsm",
    "sha",
    "send",
    "receive",
    "plan",
  ].includes(raw);
  const displayLabel = isShortCode ? config.label : String(status).toUpperCase();

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide border shadow-2xs whitespace-nowrap select-none ${config.className} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${config.dot}`} />
      <span className="whitespace-nowrap">{displayLabel}</span>
    </span>
  );
}

/**
 * Returns a structured config object for custom styling outside Tag.
 * Useful for cards, banners, step indicators, etc.
 */
export function getStatusStyle(rawStatus) {
  const s = (rawStatus || "").toLowerCase().trim();
  let cfg;

  if (s.includes("sales head") || s === "sha") {
    cfg = {
      color: "purple",
      bg: "bg-purple-50",
      border: "border-purple-200",
      text: "text-purple-700",
      dot: "bg-purple-500",
    };
  } else if (s.includes("rsm")) {
    cfg = {
      color: "teal",
      bg: "bg-teal-50",
      border: "border-teal-200",
      text: "text-teal-700",
      dot: "bg-teal-500",
    };
  } else if (s.includes("plan")) {
    cfg = {
      color: "gold",
      bg: "bg-amber-50",
      border: "border-amber-200",
      text: "text-amber-800",
      dot: "bg-amber-500",
    };
  } else if (s.includes("send") || s.includes("kirim")) {
    cfg = {
      color: "warning",
      bg: "bg-orange-50",
      border: "border-orange-200",
      text: "text-orange-700",
      dot: "bg-orange-500",
    };
  } else if (s.includes("terima") || s.includes("receive")) {
    cfg = {
      color: "processing",
      bg: "bg-indigo-50",
      border: "border-indigo-200",
      text: "text-indigo-700",
      dot: "bg-indigo-500",
    };
  } else if (s.includes("ecc") || s.includes("verif")) {
    cfg = {
      color: "processing",
      bg: "bg-sky-50",
      border: "border-sky-200",
      text: "text-sky-700",
      dot: "bg-sky-500",
    };
  } else if (s.includes("pengajuan") || s === "dr") {
    cfg = {
      color: "default",
      bg: "bg-slate-100",
      border: "border-slate-300",
      text: "text-slate-700",
      dot: "bg-slate-500",
    };
  } else if (s.includes("approve") || s === "apr" || s === "y" || s === "success" || s.includes("pay") || s === "pay") {
    cfg = {
      color: "success",
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      text: "text-emerald-700",
      dot: "bg-emerald-500",
    };
  } else if (
    s.includes("reject") ||
    s === "failed" ||
    s === "rjc" ||
    s === "n"
  ) {
    cfg = {
      color: "error",
      bg: "bg-rose-50",
      border: "border-rose-200",
      text: "text-rose-700",
      dot: "bg-rose-500",
    };
  } else if (
    s.includes("proses") ||
    s.includes("wait") ||
    s.includes("menunggu") ||
    s.includes("belum")
  ) {
    cfg = {
      color: "processing",
      bg: "bg-amber-50",
      border: "border-amber-200",
      text: "text-amber-700",
      dot: "bg-amber-400",
    };
  } else {
    cfg = {
      color: "default",
      bg: "bg-slate-50",
      border: "border-slate-200",
      text: "text-slate-600",
      dot: "bg-slate-400",
    };
  }

  return cfg;
}
