"use client";

import React, { useState } from "react";
import { Tabs, Card, Tag, Tooltip, Typography, Badge } from "antd";
import {
  FileExcelOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  CalendarOutlined,
  IdcardOutlined,
  LinkOutlined,
  DollarOutlined,
  NumberOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";

const { Text, Title } = Typography;

// ─── Data Sources ──────────────────────────────────────────────────────────────

const TEMPLATES = {
  fkr_pemusnahan: {
    key: "fkr_pemusnahan",
    title: "FKR Pemusnahan",
    filename: "Template Upload Open FKR Pemusnahan.xlsx",
    endpoint: "Template Upload Open FKR Pemusnahan.xlsx",
    description:
      "Upload massal data pemusnahan FKR berdasarkan kode distributor dan rentang tanggal. Setiap baris mewakili satu pasangan distributor dan periode pemusnahan.",
    columns: [
      {
        name: "Kode Distributor",
        index: 1,
        type: "String",
        mandatory: true,
        icon: <IdcardOutlined />,
        description:
          "Kode unik distributor yang melakukan pemusnahan barang FKR.",
        example: "6000435, 6000534, 6000999",
        validation:
          "Tidak boleh kosong. Harus angka kode distributor yang terdaftar di sistem (例: 6000435).",
      },
      {
        name: "Start",
        index: 2,
        type: "Date",
        mandatory: true,
        icon: <CalendarOutlined />,
        description:
          "Tanggal awal rentang periode pemusnahan (termasuk tanggal ini).",
        example: "2026-08-05",
        validation:
          "Format tanggal. Wajib diisi. Start harus lebih kecil atau sama dengan End.",
      },
      {
        name: "End",
        index: 3,
        type: "Date",
        mandatory: true,
        icon: <CalendarOutlined />,
        description:
          "Tanggal akhir rentang periode pemusnahan (termasuk tanggal ini).",
        example: "2026-08-05",
        validation:
          "Format tanggal (YYYY-MM-DD). Wajib diisi. End harus lebih besar atau sama dengan Start.",
      },
    ],
    additionalFields: [
      {
        name: "Nomor Work Order (WO)",
        type: "String",
        mandatory: true,
        source: "Form Input (di luar Excel)",
        description:
          "Nomor Work Order sebagai justifikasi/log audit proses upload ini. Diisi manual di form sebelum upload.",
        example:
          "WO/IT BUSINESS APPLICATION/26/0056619, WO/IT BUSINESS APPLICATION/26/0056620",
      },
    ],
    color: "emerald",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    textColor: "text-emerald-600",
    badgeBg: "bg-emerald-100 text-emerald-700",
  },
  proposal_email: {
    key: "proposal_email",
    title: "Proposal Send Email Ulang",
    filename: "Template Proposal Send Email.xlsx",
    endpoint: "Template Proposal Send Email.xlsx",
    description:
      "Upload daftar nomor proposal untuk memicu pengiriman ulang email notifikasi ke approver terkait. Cocok untuk email yang gagal terkirim.",
    columns: [
      {
        name: "Nomor E-PROP",
        index: 1,
        type: "String",
        mandatory: true,
        icon: <NumberOutlined />,
        description:
          "Nomor dokumen proposal yang akan dikirim ulang email notifikasinya.",
        example: "121099/MI/MM/JUL/2026",
        validation:
          "Tidak boleh kosong. Harus merupakan nomor proposal yang sudah ada di sistem.",
      },
    ],
    additionalFields: [],
    color: "blue",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    textColor: "text-blue-600",
    badgeBg: "bg-blue-100 text-blue-700",
  },
  reverse_internasional: {
    key: "reverse_internasional",
    title: "Reverse Internasional",
    filename: "Template Reverse Internasional.xlsx",
    endpoint: "Template Reverse Internasional.xlsx",
    description:
      "Upload data budget untuk proses reversal internasional secara batch. Setiap baris mewakili satu entri budget yang akan di-reverse.",
    columns: [
      {
        name: "budget_id",
        index: 1,
        type: "UUID / String",
        mandatory: true,
        icon: <IdcardOutlined />,
        description:
          "ID unik budget yang akan di-reverse. ID ini diperoleh dari sistem budget management.",
        example: "42f5572e-01d9-49b2-8866-7d0af30d65de",
        validation:
          "Tidak boleh kosong. Harus merupakan budget_id yang valid dan masih aktif di sistem.",
      },
      {
        name: "budget",
        index: 2,
        type: "Decimal / Number",
        mandatory: true,
        icon: <DollarOutlined />,
        description: "Jumlah nominal budget yang akan di-reverse.",
        example: "1500000, 1500000.50",
        validation:
          "Tidak boleh kosong. Harus angka positif. Format desimal menggunakan titik (. ).",
      },
    ],
    additionalFields: [],
    color: "purple",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    textColor: "text-purple-600",
    badgeBg: "bg-purple-100 text-purple-700",
  },
};

// ─── Column Card Component ──────────────────────────────────────────────────────

function ColumnCard({ col, templateColor }) {
  const typeColors = {
    String: { bg: "bg-slate-100", text: "text-slate-700", dot: "bg-slate-400" },
    Date: { bg: "bg-amber-100", text: "text-amber-700", dot: "bg-amber-400" },
    Number: { bg: "bg-cyan-100", text: "text-cyan-700", dot: "bg-cyan-400" },
    "UUID / String": {
      bg: "bg-indigo-100",
      text: "text-indigo-700",
      dot: "bg-indigo-400",
    },
    Decimal: {
      bg: "bg-emerald-100",
      text: "text-emerald-700",
      dot: "bg-emerald-400",
    },
  };
  const tc = typeColors[col.type] || typeColors.String;

  return (
    <div className="rounded-xl border border-slate-200 bg-white hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Header */}
      <div
        className={`px-4 py-3 bg-${templateColor}-50 border-b border-${templateColor}-100 flex items-center justify-between gap-3`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center bg-${templateColor}-100 text-${templateColor}-600 flex-shrink-0`}
          >
            <span className="text-xs font-bold">{col.index}</span>
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-slate-800 text-sm leading-tight truncate">
              {col.name}
            </p>
            <p className="text-xs text-slate-400 font-mono">{col.type}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${tc.bg} ${tc.text}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${tc.dot}`} />
            {col.type}
          </span>
          {col.mandatory ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
              Wajib
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500">
              Opsional
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">
        <div>
          <div className="flex items-start gap-2 mb-1.5">
            <InfoCircleOutlined className="text-xs text-slate-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Deskripsi
            </p>
          </div>
          <p className="text-sm text-slate-700 leading-relaxed pl-4">
            {col.description}
          </p>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <CheckCircleOutlined className="text-xs text-emerald-500" />
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Contoh
            </p>
          </div>
          <div className="pl-4">
            <code className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-md font-mono">
              {col.example}
            </code>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <InfoCircleOutlined className="text-xs text-amber-500" />
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Validasi
            </p>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed pl-4">
            {col.validation}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Additional Field Card ─────────────────────────────────────────────────────

function AdditionalFieldCard({ field, templateColor }) {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50/50 overflow-hidden">
      <div className="px-4 py-3 bg-amber-100/60 border-b border-amber-200 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ClockCircleOutlined className="text-amber-600" />
          <span className="font-semibold text-sm text-amber-800">
            Input Manual
          </span>
        </div>
        <span className="text-xs text-amber-600 bg-amber-200/60 px-2 py-0.5 rounded-full font-medium">
          Diisi di form
        </span>
      </div>
      <div className="p-4 space-y-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm text-slate-800">
            {field.name}
          </span>
          {field.mandatory && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700">
              Wajib
            </span>
          )}
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          {field.description}
        </p>
        {field.example && (
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-slate-400">Contoh:</span>
            <code className="text-xs bg-white border border-amber-200 text-slate-700 px-2 py-0.5 rounded font-mono">
              {field.example}
            </code>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Template Tab Content ──────────────────────────────────────────────────────

function TemplateTabContent({ template }) {
  const colorMap = {
    emerald: {
      header: "bg-emerald-600",
      light: "bg-emerald-50",
      border: "border-emerald-200",
      badge: "bg-emerald-100 text-emerald-700",
    },
    blue: {
      header: "bg-blue-600",
      light: "bg-blue-50",
      border: "border-blue-200",
      badge: "bg-blue-100 text-blue-700",
    },
    purple: {
      header: "bg-purple-600",
      light: "bg-purple-50",
      border: "border-purple-200",
      badge: "bg-purple-100 text-purple-700",
    },
  };
  const cm = colorMap[template.color] || colorMap.emerald;

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div
        className={`rounded-xl border ${cm.border} bg-white overflow-hidden shadow-sm`}
      >
        <div className={`${cm.header} px-5 py-4 flex items-start gap-4`}>
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
            <FileExcelOutlined className="text-white text-lg" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-bold text-base leading-tight">
              {template.title}
            </h3>
            <p className="text-white/70 text-xs mt-0.5 font-mono">
              {template.filename}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Tag className="font-mono text-xs bg-white/20 border-white/30 text-white rounded-full">
              Format: .xlsx
            </Tag>
          </div>
        </div>
        <div className="px-5 py-4 bg-white">
          <p className="text-sm text-slate-600 leading-relaxed">
            {template.description}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <span
                className={`inline-block w-2 h-2 rounded-full ${cm.header.replace("bg-", "bg-")}`}
              />
              {template.columns.length} kolom Excel
            </span>
            <span className="w-px h-3 bg-slate-200" />
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-rose-400" />
              {template.columns.filter((c) => c.mandatory).length} kolom wajib
            </span>
            {template.additionalFields.length > 0 && (
              <>
                <span className="w-px h-3 bg-slate-200" />
                <span className="inline-flex items-center gap-1.5">
                  <span className="inline-block w-2 h-2 rounded-full bg-amber-400" />
                  {template.additionalFields.length} input manual
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Column Cards */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className={`inline-block w-3 h-3 rounded-sm ${cm.header}`} />
          <Title
            level={5}
            className="!text-sm !font-semibold !text-slate-700 !mb-0"
          >
            Kolom Excel
          </Title>
          <span className="text-xs text-slate-400">
            ({template.columns.length} kolom)
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {template.columns.map((col) => (
            <ColumnCard
              key={col.name}
              col={col}
              templateColor={template.color}
            />
          ))}
        </div>
      </div>

      {/* Additional Fields (manual inputs) */}
      {template.additionalFields.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-block w-3 h-3 rounded-sm bg-amber-400" />
            <Title
              level={5}
              className="!text-sm !font-semibold !text-slate-700 !mb-0"
            >
              Input Manual
            </Title>
            <span className="text-xs text-slate-400">
              (diisi di form, bukan di Excel)
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {template.additionalFields.map((field) => (
              <AdditionalFieldCard
                key={field.name}
                field={field}
                templateColor={template.color}
              />
            ))}
          </div>
        </div>
      )}

      {/* Summary Table */}
      <div className={`rounded-xl border ${cm.border} overflow-hidden`}>
        <div className={`px-4 py-3 ${cm.light} border-b ${cm.border}`}>
          <Title
            level={5}
            className="!text-sm !font-semibold !text-slate-700 !mb-0"
          >
            Ringkasan Kolom
          </Title>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-2.5 text-left font-semibold text-slate-600 text-xs uppercase tracking-wide w-8">
                No
              </th>
              <th className="px-4 py-2.5 text-left font-semibold text-slate-600 text-xs uppercase tracking-wide">
                Nama Kolom
              </th>
              <th className="px-4 py-2.5 text-left font-semibold text-slate-600 text-xs uppercase tracking-wide">
                Tipe Data
              </th>
              <th className="px-4 py-2.5 text-left font-semibold text-slate-600 text-xs uppercase tracking-wide">
                Wajib
              </th>
              <th className="px-4 py-2.5 text-left font-semibold text-slate-600 text-xs uppercase tracking-wide">
                Contoh
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {template.columns.map((col) => (
              <tr
                key={col.name}
                className="hover:bg-slate-50/60 transition-colors"
              >
                <td className="px-4 py-2.5 text-slate-400 text-xs font-mono text-center">
                  {col.index}
                </td>
                <td className="px-4 py-2.5 font-semibold text-slate-800 text-sm">
                  {col.name}
                </td>
                <td className="px-4 py-2.5">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium bg-slate-100 text-slate-600`}
                  >
                    {col.type}
                  </span>
                </td>
                <td className="px-4 py-2.5">
                  {col.mandatory ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600">
                      <CheckCircleOutlined className="text-rose-500" /> Ya
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">Tidak</span>
                  )}
                </td>
                <td className="px-4 py-2.5">
                  <code className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">
                    {col.example}
                  </code>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────────

export default function TemplateGuidePage() {
  const [activeTab, setActiveTab] = useState("fkr_pemusnahan");

  const tabItems = [
    {
      key: "fkr_pemusnahan",
      label: (
        <span className="flex items-center gap-2">
          <FileExcelOutlined className="text-emerald-600" />
          FKR Pemusnahan
          <Badge count={3} size="small" className="ml-1" />
        </span>
      ),
      children: <TemplateTabContent template={TEMPLATES.fkr_pemusnahan} />,
    },
    {
      key: "proposal_email",
      label: (
        <span className="flex items-center gap-2">
          <FileExcelOutlined className="text-blue-600" />
          Proposal Email Ulang
          <Badge count={1} size="small" className="ml-1" />
        </span>
      ),
      children: <TemplateTabContent template={TEMPLATES.proposal_email} />,
    },
    {
      key: "reverse_internasional",
      label: (
        <span className="flex items-center gap-2">
          <FileExcelOutlined className="text-purple-600" />
          Reverse Internasional
          <Badge count={2} size="small" className="ml-1" />
        </span>
      ),
      children: (
        <TemplateTabContent template={TEMPLATES.reverse_internasional} />
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Page Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-5">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center flex-shrink-0">
              <FileExcelOutlined className="text-white text-lg" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 leading-tight">
                Panduan Template Excel
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Ketentuan dan spesifikasi kolom untuk setiap template upload
                Excel di ENESIS Support.
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded bg-emerald-100 flex items-center justify-center">
                <span className="text-emerald-600 font-bold text-xs">3</span>
              </div>
              <span>FKR Pemusnahan</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600 font-bold text-xs">1</span>
              </div>
              <span>Proposal Email Ulang</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded bg-purple-100 flex items-center justify-center">
                <span className="text-purple-600 font-bold text-xs">2</span>
              </div>
              <span>Reverse Internasional</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          size="large"
          className="template-guide-tabs"
          inkBarStyle={{
            backgroundColor: "#1aac32",
            height: "3px",
            borderRadius: "2px",
          }}
          tabBarStyle={{ borderBottom: "1px solid #e2e8f0" }}
        />
      </div>

      {/* Footer */}
      <div className="max-w-6xl mx-auto px-6 pb-8">
        <div className="rounded-xl border border-slate-200 bg-white px-5 py-4 flex items-start gap-3">
          <InfoCircleOutlined className="text-blue-500 text-base flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-slate-700">
              Tips Penggunaan
            </p>
            <ul className="mt-1.5 space-y-1 text-xs text-slate-500">
              <li>
                • Download template resmi dari setiap modal upload — jangan ubah
                struktur kolomnya.
              </li>
              <li>
                • Pastikan tidak ada baris kosong di antara data — data harus
                berurutan tanpa celah.
              </li>
              <li>
                • Format tanggal yang didukung:{" "}
                <code className="bg-slate-100 px-1 rounded font-mono">
                  YYYY-MM-DD
                </code>{" "}
                atau{" "}
                <code className="bg-slate-100 px-1 rounded font-mono">
                  DD/MM/YYYY
                </code>
                .
              </li>
              <li>
                • Hapus baris contoh/sample di template sebelum mengisi data
                asli Anda.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
