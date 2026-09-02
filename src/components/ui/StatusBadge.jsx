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
  },
  success: {
    color: "success",
    label: "SUCCESS",
  },
  apr: {
    color: "success",
    label: "APR",
  },
  y: {
    color: "success",
    label: "Y",
  },
  rejected: {
    color: "error",
    label: "REJECTED",
  },
  reject: {
    color: "error",
    label: "REJECTED",
  },
  failed: {
    color: "error",
    label: "FAILED",
  },
  rjc: {
    color: "error",
    label: "RJC",
  },
  n: {
    color: "error",
    label: "REJECTED",
  },
  waiting_approval: {
    color: "warning",
    label: "WAITING",
  },
  draft: {
    color: "default",
    label: "DRAFT",
  },
  pending: {
    color: "warning",
    label: "PENDING",
  },
  processing: {
    color: "processing",
    label: "PROCESSING",
  },
};

/**
 * Maps a raw status string to a consistent Ant Design Tag badge.
 * Uses STATUS_CONFIG lookup with lowercase normalization.
 */
export function StatusBadge({ status, className = "" }) {
  const raw = (status || "").toLowerCase().trim();
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
      config = STATUS_CONFIG.processing;
    } else {
      config = { color: "default", label: (status || "PENDING").toUpperCase() };
    }
  }

  return (
    <Tag
      color={config.color}
      className={`font-semibold uppercase text-[10px] px-2 py-0.5 rounded border-none ${className}`}
    >
      {config.label}
    </Tag>
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
