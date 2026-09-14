"use client";

import React from "react";
import { Tooltip, Tag } from "antd";
import { formatCurrency, formatDate, formatDateTime } from "@/utils/formatters";
import { StatusBadge } from "./StatusBadge";

/**
 * Shared column render utilities for consistent table cell rendering
 * across all list pages. Import these instead of duplicating render logic.
 */

// ── Currency Cell ────────────────────────────────────────────────────────────

/**
 * Right-aligned bold currency cell with optional custom color.
 * @param {unknown} val   - Raw value to format
 * @param {string}  color - Tailwind color prefix (default: emerald)
 */
export function renderCurrency(val, color = "emerald") {
  if (val === null || val === undefined || val === "") {
    return <span className="text-slate-400">-</span>;
  }
  return (
    <span className={`font-semibold text-${color}-700`}>
      {formatCurrency(val)}
    </span>
  );
}

// ── Date Cells ───────────────────────────────────────────────────────────────

/**
 * Standard date cell (DD MMM YYYY).
 */
export function renderDate(val) {
  if (!val) return <span className="text-slate-400">-</span>;
  return <span className="text-slate-600">{formatDate(val)}</span>;
}

/**
 * Date-time cell (DD MMM YYYY, HH:mm).
 */
export function renderDateTime(val) {
  if (!val) return <span className="text-slate-400">-</span>;
  return <span className="text-slate-600">{formatDateTime(val)}</span>;
}

// ── Text Cells ──────────────────────────────────────────────────────────────

/**
 * Bold slate text cell — ideal for document numbers (nomor_fkr, nomor_klaim, etc.)
 */
export function renderBold(text) {
  return (
    <span className="font-semibold text-slate-800">
      {text || <span className="text-slate-400">-</span>}
    </span>
  );
}

/**
 * Medium slate text cell — ideal for names, distributors, etc.
 */
export function renderMedium(text) {
  return (
    <span className="font-medium text-slate-700">
      {text || <span className="text-slate-400">-</span>}
    </span>
  );
}

/**
 * Truncated text cell with tooltip on overflow.
 * Ideal for long names or descriptions in narrow columns.
 */
export function renderTruncated(text, maxWidth = 170) {
  if (!text) return <span className="text-slate-400">-</span>;
  return (
    <Tooltip title={text}>
      <span className="block truncate" style={{ maxWidth }}>
        {text}
      </span>
    </Tooltip>
  );
}

// ── Status Cell ─────────────────────────────────────────────────────────────

/**
 * Renders a consistent StatusBadge from a raw status value.
 */
export function renderStatus(status) {
  return <StatusBadge status={status} />;
}

// ── Tag Cell ─────────────────────────────────────────────────────────────────

/**
 * Renders a colored Ant Design Tag.
 */
export function renderTag(text, color = "blue") {
  if (!text) return <span className="text-slate-400">-</span>;
  return <Tag color={color}>{text}</Tag>;
}

// ── Mono Cell ────────────────────────────────────────────────────────────────

/**
 * Monospace text cell — ideal for NIK, document numbers, codes.
 */
export function renderMono(text) {
  return (
    <code className="font-mono text-xs text-slate-700">
      {text || <span className="text-slate-400">-</span>}
    </code>
  );
}

// ── Number Cell ─────────────────────────────────────────────────────────────

/**
 * Right-aligned integer with locale formatting (ID locale).
 */
export function renderNumber(val, decimals = 0) {
  if (val === null || val === undefined) return <span className="text-slate-400">-</span>;
  return (
    <span className="font-semibold text-slate-700">
      {Number(val).toLocaleString("id-ID", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
    </span>
  );
}
