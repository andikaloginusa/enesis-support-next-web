"use client";

import React from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Shared Status Configuration
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Normalized status config keys (lowercase, hyphenated).
 * Used for both `StatusBadge` rendering and `getStatusStyle` utility.
 */
export const STATUS_CONFIG = {
  // ── Success / Approved ──
  approved: {
    label: "APPROVED",
    color: "success",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
  },
  success: {
    label: "SUCCESS",
    color: "success",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
  },
  apr: {
    label: "APPROVED",
    color: "success",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
  },
  pay: {
    label: "PAYMENT COMPLETED",
    color: "success",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
  },
  "payment completed": {
    label: "PAYMENT COMPLETED",
    color: "success",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
  },
  y: {
    label: "APPROVED",
    color: "success",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
  },
  "rsm approved": {
    label: "RSM APPROVED",
    color: "success",
    bg: "bg-teal-50",
    border: "border-teal-200",
    text: "text-teal-700",
    dot: "bg-teal-500",
  },

  // ── Error / Rejected ──
  rejected: {
    label: "REJECTED",
    color: "error",
    bg: "bg-rose-50",
    border: "border-rose-200",
    text: "text-rose-700",
    dot: "bg-rose-500",
  },
  reject: {
    label: "REJECTED",
    color: "error",
    bg: "bg-rose-50",
    border: "border-rose-200",
    text: "text-rose-700",
    dot: "bg-rose-500",
  },
  failed: {
    label: "FAILED",
    color: "error",
    bg: "bg-rose-50",
    border: "border-rose-200",
    text: "text-rose-700",
    dot: "bg-rose-500",
  },
  rjc: {
    label: "REJECTED",
    color: "error",
    bg: "bg-rose-50",
    border: "border-rose-200",
    text: "text-rose-700",
    dot: "bg-rose-500",
  },
  n: {
    label: "REJECTED",
    color: "error",
    bg: "bg-rose-50",
    border: "border-rose-200",
    text: "text-rose-700",
    dot: "bg-rose-500",
  },

  // ── Klaim Flow Statuses ──
  dr: {
    label: "PENGAJUAN",
    color: "default",
    bg: "bg-slate-100",
    border: "border-slate-300",
    text: "text-slate-700",
    dot: "bg-slate-500",
  },
  pengajuan: {
    label: "PENGAJUAN",
    color: "default",
    bg: "bg-slate-100",
    border: "border-slate-300",
    text: "text-slate-700",
    dot: "bg-slate-500",
  },
  ecc: {
    label: "ECC VERIFIKASI",
    color: "processing",
    bg: "bg-sky-50",
    border: "border-sky-200",
    text: "text-sky-700",
    dot: "bg-sky-500",
  },
  "ecc verifikasi": {
    label: "ECC VERIFIKASI",
    color: "processing",
    bg: "bg-sky-50",
    border: "border-sky-200",
    text: "text-sky-700",
    dot: "bg-sky-500",
  },
  rsm: {
    label: "RSM APPROVED",
    color: "success",
    bg: "bg-teal-50",
    border: "border-teal-200",
    text: "text-teal-700",
    dot: "bg-teal-500",
  },
  sha: {
    label: "SALES HEAD APPROVED",
    color: "purple",
    bg: "bg-purple-50",
    border: "border-purple-200",
    text: "text-purple-700",
    dot: "bg-purple-500",
  },
  "sales head approved": {
    label: "SALES HEAD APPROVED",
    color: "purple",
    bg: "bg-purple-50",
    border: "border-purple-200",
    text: "text-purple-700",
    dot: "bg-purple-500",
  },
  send: {
    label: "KIRIM DOKUMEN",
    color: "warning",
    bg: "bg-orange-50",
    border: "border-orange-200",
    text: "text-orange-700",
    dot: "bg-orange-500",
  },
  "distributor kirim dokumen": {
    label: "DISTRIBUTOR KIRIM DOKUMEN",
    color: "warning",
    bg: "bg-orange-50",
    border: "border-orange-200",
    text: "text-orange-700",
    dot: "bg-orange-500",
  },
  "kirim dokumen": {
    label: "KIRIM DOKUMEN",
    color: "warning",
    bg: "bg-orange-50",
    border: "border-orange-200",
    text: "text-orange-700",
    dot: "bg-orange-500",
  },
  receive: {
    label: "ECC TERIMA DOK.",
    color: "blue",
    bg: "bg-indigo-50",
    border: "border-indigo-200",
    text: "text-indigo-700",
    dot: "bg-indigo-500",
  },
  "ecc terima dok.": {
    label: "ECC TERIMA DOK.",
    color: "blue",
    bg: "bg-indigo-50",
    border: "border-indigo-200",
    text: "text-indigo-700",
    dot: "bg-indigo-500",
  },
  "ecc terima dok": {
    label: "ECC TERIMA DOK.",
    color: "blue",
    bg: "bg-indigo-50",
    border: "border-indigo-200",
    text: "text-indigo-700",
    dot: "bg-indigo-500",
  },
  "ecc terima dokumen": {
    label: "ECC TERIMA DOKUMEN",
    color: "blue",
    bg: "bg-indigo-50",
    border: "border-indigo-200",
    text: "text-indigo-700",
    dot: "bg-indigo-500",
  },
  "terima dokumen": {
    label: "TERIMA DOKUMEN",
    color: "blue",
    bg: "bg-indigo-50",
    border: "border-indigo-200",
    text: "text-indigo-700",
    dot: "bg-indigo-500",
  },
  plan: {
    label: "PLAN PAYMENT",
    color: "gold",
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-800",
    dot: "bg-amber-500",
  },
  "plan payment": {
    label: "PLAN PAYMENT",
    color: "gold",
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-800",
    dot: "bg-amber-500",
  },

  // ── General / Fallback ──
  waiting_approval: {
    label: "WAITING APPROVAL",
    color: "warning",
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-800",
    dot: "bg-amber-500",
  },
  draft: {
    label: "DRAFT",
    color: "default",
    bg: "bg-slate-100",
    border: "border-slate-200",
    text: "text-slate-700",
    dot: "bg-slate-400",
  },
  pending: {
    label: "PENDING",
    color: "warning",
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-800",
    dot: "bg-amber-500",
  },
  processing: {
    label: "PROCESSING",
    color: "processing",
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-700",
    dot: "bg-blue-500",
  },
};

// Short-code keys that should display the normalized label, not the raw value
const SHORT_CODE_KEYS = new Set([
  "y", "n", "apr", "rjc", "pay",
  "dr", "ecc", "rsm", "sha",
  "send", "receive", "plan",
]);

// ─────────────────────────────────────────────────────────────────────────────
// Fuzzy Resolver — single source of truth for both StatusBadge and getStatusStyle
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fuzzy-match a raw status string to a STATUS_CONFIG entry.
 * Tries exact key first, then ordered substring rules.
 *
 * @param {string} raw - Raw status string (will be lowercased)
 * @returns {Object} STATUS_CONFIG entry
 */
export function resolveStatus(raw) {
  const s = (raw || "").toLowerCase().trim();

  // 1. Exact match
  const exact = STATUS_CONFIG[s];
  if (exact) return exact;

  // 2. Fuzzy substring match (order: specific → generic)
  if (s.includes("sales head") || s === "sha") {
    return STATUS_CONFIG.sha;
  }
  if (s.includes("rsm")) {
    return STATUS_CONFIG.rsm;
  }
  if (s.includes("plan")) {
    return STATUS_CONFIG.plan;
  }
  if ((s.includes("ecc") && s.includes("terima")) || s.includes("receive")) {
    return STATUS_CONFIG.receive;
  }
  if (s.includes("ecc") || s.includes("verif")) {
    return STATUS_CONFIG.ecc;
  }
  if (s.includes("send") || s.includes("kirim")) {
    return STATUS_CONFIG.send;
  }
  if (s.includes("terima") || s.includes("receive")) {
    return STATUS_CONFIG.receive;
  }
  if (s.includes("pengajuan") || s === "dr") {
    return STATUS_CONFIG.dr;
  }
  if (s.includes("pay") || s.includes("payment")) {
    return STATUS_CONFIG.pay;
  }
  if (s.includes("approve") || s.includes("success")) {
    return STATUS_CONFIG.approved;
  }
  if (s.includes("reject") || s.includes("failed") || s.includes("rjc")) {
    return STATUS_CONFIG.rejected;
  }
  if (s.includes("wait") || s.includes("menunggu")) {
    return STATUS_CONFIG.waiting_approval;
  }
  if (s.includes("proses") || s.includes("belum") || s.includes("pending")) {
    return STATUS_CONFIG.processing;
  }
  if (s.includes("draft")) {
    return STATUS_CONFIG.draft;
  }

  // 3. Unknown — dynamic fallback
  return {
    color: "default",
    label: String(raw).toUpperCase(),
    bg: "bg-slate-100",
    border: "border-slate-200",
    text: "text-slate-700",
    dot: "bg-slate-400",
  };
}

/**
 * Determines what label to display for a given raw status.
 * Short codes show the normalized label; descriptive statuses show the raw text.
 */
function resolveLabel(raw) {
  const s = (raw || "").toLowerCase().trim();
  return SHORT_CODE_KEYS.has(s) ? resolveStatus(raw).label : String(raw).toUpperCase();
}

// ─────────────────────────────────────────────────────────────────────────────
// StatusBadge Component
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Maps a raw status string to a consistent, high-contrast StatusBadge.
 * Displays the actual status text from response with good readability.
 */
export function StatusBadge({ status, className = "" }) {
  if (!status) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide border shadow-sm bg-slate-100 text-slate-600 border-slate-200 ${className}`}
      >
        <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-slate-400" />
        <span>PENDING</span>
      </span>
    );
  }

  const config = resolveStatus(status);
  const label = resolveLabel(status);

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide border shadow-sm whitespace-nowrap select-none ${config.bg} ${config.text} ${config.border} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${config.dot}`} />
      <span>{label}</span>
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// getStatusStyle — utility for cards / banners / step indicators
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns a structured style config for use outside Tag/Badge components.
 * Useful for cards, banners, and step indicator styling.
 *
 * @param {string} rawStatus - Raw status string
 * @returns {{ color: string, bg: string, border: string, text: string, dot: string }}
 */
export function getStatusStyle(rawStatus) {
  return resolveStatus(rawStatus);
}
