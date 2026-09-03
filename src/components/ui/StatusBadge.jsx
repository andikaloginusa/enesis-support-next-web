"use client";

import React from "react";
import { Tag } from "antd";

/**
 * Shared status configuration for consistent badge styling across all pages.
 */
const STATUS_CONFIG = {
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
  y: {
    color: "success",
    label: "APPROVED",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
  },
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
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide border shadow-2xs bg-slate-100 text-slate-600 border-slate-200 ${className}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
        <span>PENDING</span>
      </span>
    );
  }

  const raw = String(status).toLowerCase().trim();
  let config = STATUS_CONFIG[raw];

  // Fallback: fuzzy match on substring
  if (!config) {
    if (raw.includes("approve") || raw.includes("success")) {
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
  // or fall back to normalized config label if raw is a single-letter code ('y', 'n', 'apr', 'rjc')
  const isShortCode = ["y", "n", "apr", "rjc"].includes(raw);
  const displayLabel = isShortCode ? config.label : String(status).toUpperCase();

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide border shadow-2xs ${config.className} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <span>{displayLabel}</span>
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

  if (s.includes("approve") || s === "apr" || s === "y" || s === "success") {
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
