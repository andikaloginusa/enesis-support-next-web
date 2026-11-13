"use client";

import React from "react";
import { Modal, Button, Typography, Tag } from "antd";
import { FileTextOutlined } from "@ant-design/icons";
import { formatCurrency, formatDateTime } from "@/utils/formatters";

const { Text } = Typography;

/**
 * Definisi kelompok field yang ditampilkan pada modal detail.
 * Setiap field describes: label, key pada row, dan tipe render.
 */
const DETAIL_SECTIONS = [
  {
    title: "Identitas Proposal",
    icon: <FileTextOutlined className="text-blue-500" />,
    fields: [
      { label: "Proposal From SAP ID", key: "proposal_from_sap_id", type: "mono" },
      { label: "Nomor WBS", key: "reference_no_wbs_number", type: "mono" },
      { label: "Kode E-Prop SAP", key: "kode_eprop_sap", type: "mono" },
      { label: "Jenis E-Prop", key: "jenis_eprop" },
      { label: "Promo Type", key: "promo_type" },
      { label: "Activity Type", key: "activity_type" },
      { label: "WBS E-Prop Status", key: "wbs_eprop_status" },
    ],
  },
  {
    title: "Brand & Channel",
    icon: <FileTextOutlined className="text-violet-500" />,
    fields: [
      { label: "Brand", key: "brand" },
      { label: "Sub Brand", key: "sub_brand" },
      { label: "Channel", key: "channel" },
      { label: "Sub Channel", key: "sub_channel" },
    ],
  },
  {
    title: "Budget & Akun",
    icon: <FileTextOutlined className="text-emerald-500" />,
    fields: [
      { label: "Budget Proposal", key: "budget_proposal", type: "currency" },
      { label: "Budget Year", key: "budget_year" },
      { label: "Estimasi Sales", key: "estimasi_sales", type: "currency" },
      { label: "Account Group", key: "account_group" },
      { label: "Account Name", key: "account_name" },
      { label: "GL Account", key: "gl_account", type: "mono" },
      { label: "GL Account Name", key: "gl_account_name" },
    ],
  },
  {
    title: "Organisasi & Customer",
    icon: <FileTextOutlined className="text-amber-500" />,
    fields: [
      { label: "Branch Code", key: "branch_code", type: "mono" },
      { label: "Branch", key: "branch" },
      { label: "Company Code", key: "company_code", type: "mono" },
      { label: "Company Name", key: "company_name" },
      { label: "Region", key: "region" },
      { label: "Region Name", key: "region_name" },
      { label: "Country Code", key: "country_code", type: "mono" },
      { label: "Country Name", key: "country_name" },
      { label: "Executor", key: "executor" },
      { label: "Customer Code", key: "customer_code", type: "mono" },
      { label: "Customer Name", key: "customer_name" },
      { label: "Distributor", key: "distributor" },
    ],
  },
  {
    title: "Periode & Status",
    icon: <FileTextOutlined className="text-teal-500" />,
    fields: [
      { label: "Start Date", key: "start_date", type: "datetime" },
      { label: "End Date", key: "end_date", type: "datetime" },
      { label: "End Date Claim", key: "end_date_claim", type: "datetime" },
      { label: "Is Active", key: "isactive", type: "tag" },
    ],
  },
  {
    title: "Audit",
    icon: <FileTextOutlined className="text-slate-500" />,
    fields: [
      { label: "Created", key: "created", type: "datetime" },
      { label: "Created By", key: "createdby" },
      { label: "Updated", key: "updated", type: "datetime" },
      { label: "Updated By", key: "updatedby" },
      { label: "Keterangan Perubahan", key: "keterangan_perubahan" },
    ],
  },
];

/**
 * Render nilai satu field sesuai tipenya.
 */
function renderValue(value, type) {
  if (value === null || value === undefined || value === "") {
    return <span className="text-slate-400">-</span>;
  }

  switch (type) {
    case "currency":
      return (
        <span className="font-semibold text-emerald-700">
          {formatCurrency(value)}
        </span>
      );
    case "datetime":
      return (
        <span className="text-slate-700">{formatDateTime(value)}</span>
      );
    case "mono":
      return (
        <code className="font-mono text-xs text-slate-700">{String(value)}</code>
      );
    case "tag":
      return <Tag color={value === "Y" ? "green" : "default"}>{String(value)}</Tag>;
    default:
      return <span className="text-slate-700">{String(value)}</span>;
  }
}

/**
 * ProposalFromSapDetailModal — Menampilkan seluruh detail satu baris `proposal_from_sap`.
 *
 * Backend tidak menyediakan endpoint detail per baris, jadi data diambil dari
 * payload list yang sudah memuat seluruh kolom.
 *
 * @param {Object}   props
 * @param {boolean}  props.open
 * @param {Function} props.onClose
 * @param {Object}   [props.record] - Baris tabel yang dipilih
 */
export function ProposalFromSapDetailModal({ open, onClose, record }) {
  const wbs = record?.reference_no_wbs_number;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      width={880}
      centered
      destroyOnHidden
      title={
        <div className="flex items-center gap-2 pb-3 text-base font-bold border-b border-slate-100 text-slate-800">
          <FileTextOutlined className="text-blue-500" />
          <span>Detail Proposal From SAP</span>
        </div>
      }
      footer={
        <div className="flex justify-end">
          <Button size="large" onClick={onClose} className="rounded-lg">
            Tutup
          </Button>
        </div>
      }
      className="[&_.ant-modal-content]:rounded-xl"
    >
      <div className="py-4 space-y-5 max-h-[65vh] overflow-y-auto pr-1">
        {!record ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center">
              <FileTextOutlined className="text-slate-300 text-2xl" />
            </div>
            <Text className="text-slate-400 text-sm font-medium">
              Tidak ada data yang dipilih.
            </Text>
          </div>
        ) : (
          <>
            <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
              <Text className="block text-xs font-semibold text-blue-500 uppercase tracking-wide mb-1">
                Nomor WBS
              </Text>
              <Text className="block font-mono text-sm font-bold text-blue-900">
                {wbs || "-"}
              </Text>
            </div>

            {DETAIL_SECTIONS.map((section) => (
              <div key={section.title} className="space-y-2">
                <div className="flex items-center gap-2">
                  {section.icon}
                  <h3 className="m-0 text-sm font-bold text-slate-700">
                    {section.title}
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 border border-slate-100 rounded-xl px-4 py-3">
                  {section.fields.map((field) => (
                    <div
                      key={field.key}
                      className="flex items-baseline justify-between gap-3 min-w-0"
                    >
                      <Text className="text-xs text-slate-500 shrink-0">
                        {field.label}
                      </Text>
                      <span className="text-xs font-medium text-right min-w-0 truncate">
                        {renderValue(record?.[field.key], field.type)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </Modal>
  );
}
