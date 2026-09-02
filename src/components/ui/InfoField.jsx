"use client";

import React from "react";
import { Typography } from "antd";

const { Text } = Typography;

/**
 * A reusable labeled field block with optional icon.
 * Suitable for detail pages that render a grid of labeled fields.
 */
export function InfoField({
  label,
  value,
  icon,
  accent = false,
  mono = false,
  large = false,
  className = "",
}) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <div className="flex items-center gap-1.5">
        {icon && <span className="text-slate-400 text-[11px]">{icon}</span>}
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
          {label}
        </span>
      </div>
      <span
        className={[
          large ? "text-lg font-extrabold" : "text-sm font-semibold",
          accent ? "text-blue-600" : "text-slate-800",
          mono ? "font-mono" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {value || (
          <span className="text-slate-300 italic text-xs">Tidak tersedia</span>
        )}
      </span>
    </div>
  );
}
