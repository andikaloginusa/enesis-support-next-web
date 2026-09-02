"use client";

import React from "react";
import { Typography, Tooltip, Tag } from "antd";
import { formatCurrency, formatDate, formatDateTime } from "@/utils/formatters";
import { StatusBadge } from "./StatusBadge";

const { Text } = Typography;

/**
 * Shared column render utilities for consistent table cell rendering
 * across all list pages. Import these instead of duplicating render logic.
 */

// ── Currency Cell ────────────────────────────────────────────────────────────

/**
 * Right-aligned bold green currency cell.
 */
export function renderCurrency(val, options = {}) {
  const { className = "font-semibold text-slate-700", color = "emerald" } = options;
  return (
    <Text className={`font-semibold text-${color}-700`}>
      {formatCurrency(val)}
    </Text>
  );
}

/**
 * Right-aligned bold currency cell with custom color class.
 */
export function renderMoney(val, colorClass = "text-emerald-700 font-bold") {
  return <Text className={colorClass}>{formatCurrency(val)}</Text>;
}

// ── Date Cell ─────────────────────────────────────────────────────────────────

/**
 * Standard date cell (DD MMM YYYY).
 */
export function renderDate(val) {
  return <Text className="text-slate-600">{formatDate(val)}</Text>;
}

/**
 * Date-time cell (DD MMM YYYY, HH:mm).
 */
export function renderDateTime(val) {
  return <Text className="text-slate-600">{formatDateTime(val)}</Text>;
}

// ── Text Cells ─────────────────────────────────────────────────────────────────

/**
 * Bold slate text cell — ideal for document numbers (nomor_fkr, nomor_klaim, etc.)
 */
export function renderBold(text) {
  return <Text className="font-semibold text-slate-800">{text || "-"}</Text>;
}

/**
 * Medium slate text cell — ideal for names, distributors, etc.
 */
export function renderMedium(text) {
  return <Text className="font-medium text-slate-700">{text || "-"}</Text>;
}

/**
 * Truncated text cell with tooltip on overflow.
 * Ideal for long names or descriptions in narrow columns.
 */
export function renderTruncated(text, maxWidth = 170) {
  if (!text) return <Text className="text-slate-400">-</Text>;
  return (
    <Tooltip title={text}>
      <Text className="block truncate" style={{ maxWidth }}>
        {text}
      </Text>
    </Tooltip>
  );
}

// ── Status Cell ────────────────────────────────────────────────────────────────

/**
 * Renders a consistent StatusBadge from a raw status value.
 */
export function renderStatus(status) {
  return <StatusBadge status={status} />;
}

// ── Tag Cell ──────────────────────────────────────────────────────────────────

/**
 * Renders a colored Ant Design Tag.
 */
export function renderTag(text, color = "blue") {
  if (!text) return <Text className="text-slate-400">-</Text>;
  return <Tag color={color}>{text}</Tag>;
}

// ── Mono Cell ─────────────────────────────────────────────────────────────────

/**
 * Monospace text cell — ideal for NIK, document numbers, codes.
 */
export function renderMono(text) {
  return (
    <Text className="font-mono text-xs text-slate-700">{text || "-"}</Text>
  );
}

// ── Number Cell ────────────────────────────────────────────────────────────────

/**
 * Right-aligned integer with locale formatting.
 */
export function renderNumber(val, decimals = 0) {
  if (val === null || val === undefined) return "-";
  return (
    <Text className="font-semibold text-slate-700">
      {Number(val).toLocaleString("id-ID", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
    </Text>
  );
}
