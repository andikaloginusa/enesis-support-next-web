"use client";

import React, { use, useMemo } from "react";
import { Button, Typography } from "antd";
import {
  ArrowLeftOutlined,
  CloseCircleOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useDataApprovalDirectOutletDetail } from "@/hooks/queries/useDataApprovalDirectOutletDetail";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  InfoField,
} from "@/components/ui";
import {
  DATA_APPROVAL_DIRECT_OUTLET_ID_FIELD,
  DIRECT_OUTLET_DISPLAY_FIELDS,
  DIRECT_OUTLET_FIELD_LABELS,
  DIRECT_OUTLET_KODE_VENDOR_FIELD,
  DIRECT_OUTLET_NAMA_KAM_FIELD,
  DIRECT_OUTLET_NAMA_OUTLET_FIELD,
  DIRECT_OUTLET_NAMA_PT_FIELD,
  DIRECT_OUTLET_NIK_KAM_FIELD,
  DIRECT_OUTLET_PAYMENT_FIELD,
} from "@/config/dataApprovalDirectOutletConfig";

const { Text } = Typography;

const LIST_ROUTE = "/data-approval-direct-outlet";

/**
 * Ubah nama field API menjadi label yang enak dibaca.
 *
 * @param {string} key - Nama field pada response API
 * @returns {string}
 */
const humanizeKey = (key) =>
  DIRECT_OUTLET_FIELD_LABELS[key] ??
  key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

// ─────────────────────────────────────────────────────────────────────────────
//  Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <div className="w-12 h-12 rounded-full border-2 border-t-emerald-600 border-b-emerald-600 border-l-transparent border-r-transparent animate-spin" />
      <Text className="text-slate-500 font-medium">
        Memuat Detail Data Approval Direct Outlet...
      </Text>
    </div>
  );
}

function NotFoundState({ onBack }) {
  return (
    <Card className="max-w-2xl mx-auto mt-8">
      <CardContent className="text-center py-12">
        <CloseCircleOutlined className="text-red-400 text-5xl mb-4 block" />
        <Typography.Title level={4}>
          Data Approval Direct Outlet Tidak Ditemukan
        </Typography.Title>
        <Text className="text-slate-400 block mb-6">
          Data yang Anda cari tidak tersedia atau sudah tidak aktif.
        </Text>
        <Button type="primary" onClick={onBack}>
          Kembali ke Daftar Direct Outlet
        </Button>
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Main Page Component
// ─────────────────────────────────────────────────────────────────────────────

export default function DataApprovalDirectOutletDetailPage({
  params: paramsPromise,
}) {
  const resolvedParams = use(paramsPromise);
  const dataApprovalDirectOutletId =
    resolvedParams[DATA_APPROVAL_DIRECT_OUTLET_ID_FIELD];
  const router = useRouter();

  const { detail, isLoading } = useDataApprovalDirectOutletDetail({
    dataApprovalDirectOutletId,
  });

  // Field tambahan dari endpoint detail yang tidak ada di tabel.
  const extraFields = useMemo(() => {
    if (!detail) return [];

    const known = [
      ...DIRECT_OUTLET_DISPLAY_FIELDS,
      DATA_APPROVAL_DIRECT_OUTLET_ID_FIELD,
    ];

    return Object.entries(detail).filter(
      ([key, value]) =>
        !known.includes(key) && value !== null && value !== "",
    );
  }, [detail]);

  // ── Render States ──
  if (isLoading) return <LoadingSpinner />;
  if (!detail) {
    return <NotFoundState onBack={() => router.push(LIST_ROUTE)} />;
  }

  return (
    <div className="space-y-6 max-w-full">
      {/* Back Navigation */}
      <div className="flex items-center justify-between">
        <Button
          type="link"
          icon={<ArrowLeftOutlined />}
          onClick={() => router.push(LIST_ROUTE)}
          className="text-emerald-600 hover:text-emerald-700 font-bold p-0 flex items-center gap-1 hover:translate-x-[-2px] transition-all"
        >
          Kembali ke Daftar Direct Outlet
        </Button>
      </div>

      <div className="space-y-8">
        {/* Header Card */}
        <Card className="shadow-sm border-slate-100 rounded-2xl overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-6 px-7">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex flex-col gap-1">
                <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <FileTextOutlined className="text-emerald-600 text-2xl" />
                  Detail Data Approval Direct Outlet
                </CardTitle>
                <CardDescription className="text-slate-400 mt-1">
                  Kode Vendor:{" "}
                  <span className="font-semibold text-slate-700">
                    {detail[DIRECT_OUTLET_KODE_VENDOR_FIELD] || "-"}
                  </span>
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-7">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-8 gap-x-12">
              <InfoField
                label="Kode Vendor"
                value={detail[DIRECT_OUTLET_KODE_VENDOR_FIELD]}
                mono
              />
              <InfoField
                label="Nama Outlet"
                value={detail[DIRECT_OUTLET_NAMA_OUTLET_FIELD]}
              />
              <InfoField
                label="Nama PT"
                value={detail[DIRECT_OUTLET_NAMA_PT_FIELD]}
              />
              <InfoField
                label="Payment"
                value={detail[DIRECT_OUTLET_PAYMENT_FIELD]}
              />
              <InfoField
                label="NIK KAM"
                value={detail[DIRECT_OUTLET_NIK_KAM_FIELD]}
                mono
              />
              <InfoField
                label="Nama KAM"
                value={detail[DIRECT_OUTLET_NAMA_KAM_FIELD]}
              />
              <InfoField
                label="ID"
                value={detail[DATA_APPROVAL_DIRECT_OUTLET_ID_FIELD]}
                mono
                className="sm:col-span-2 lg:col-span-3"
              />
            </div>
          </CardContent>
        </Card>

        {/* Field tambahan dari endpoint detail */}
        {extraFields.length > 0 ? (
          <Card className="shadow-sm border-slate-100 rounded-2xl overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-6 px-7">
              <CardTitle className="text-base font-bold text-slate-900">
                Field Lainnya
              </CardTitle>
            </CardHeader>
            <CardContent className="p-7">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-8 gap-x-12">
                {extraFields.map(([key, value]) => (
                  <InfoField
                    key={key}
                    label={humanizeKey(key)}
                    value={String(value)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
