"use client";

import React, { use } from "react";
import { Button, Table, Tabs, Tag, Typography } from "antd";
import {
  ArrowLeftOutlined,
  CloseCircleOutlined,
  FileTextOutlined,
  HistoryOutlined,
  WalletOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useSubmitFakturDetail } from "@/hooks/queries/useSubmitFakturDetail";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  InfoField,
  renderCurrency,
  renderMono,
} from "@/components/ui";
import { renderDate, renderDateTime } from "@/components/ui/ColumnRenderers";
import {
  SUBMIT_FAKTUR_ID_FIELD,
  getSubmitFakturStatusLabel,
  getSubmitFakturStatusMeta,
} from "@/config/submitFakturConfig";

const { Text } = Typography;

/**
 * Beri kunci unik pada baris tabel turunan.
 *
 * Parameter `index` pada fungsi `rowKey` sudah deprecated di antd v6, sehingga
 * kunci synthesits dibuat sebelum data masuk ke `Table`.
 */
const withRowKey = (rows, prefix) =>
  Array.isArray(rows)
    ? rows.map((row, index) => ({ ...row, _rowKey: `${prefix}-${index}` }))
    : [];

// ─────────────────────────────────────────────────────────────────────────────
//  Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <div className="w-12 h-12 rounded-full border-2 border-t-emerald-600 border-b-emerald-600 border-l-transparent border-r-transparent animate-spin" />
      <Text className="text-slate-500 font-medium">
        Memuat Detail Invoice Submit Faktur...
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
          Data Invoice Submit Faktur Tidak Ditemukan
        </Typography.Title>
        <Text className="text-slate-400 block mb-6">
          Invoice yang Anda cari tidak tersedia atau sudah tidak aktif.
        </Text>
        <Button type="primary" onClick={onBack}>
          Kembali ke Daftar Submit Faktur
        </Button>
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Main Page Component
// ─────────────────────────────────────────────────────────────────────────────

export default function SubmitFakturDetailPage({ params: paramsPromise }) {
  const resolvedParams = use(paramsPromise);
  const cInvoiceId = resolvedParams.c_invoice_id;
  const router = useRouter();

  const { detail, isLoading } = useSubmitFakturDetail({ cInvoiceId });

  // ── Detail Barang columns ──
  const detailsColumns = [
    {
      title: "Bundle ID",
      dataIndex: "bundle_id",
      key: "bundle_id",
      width: 150,
      render: (text) => renderMono(text),
    },
    {
      title: "Nomor PO",
      dataIndex: "nomor_po",
      key: "nomor_po",
      width: 140,
      render: (text) => renderMono(text),
    },
    {
      title: "Nomor GR",
      dataIndex: "nomor_gr",
      key: "nomor_gr",
      width: 140,
      render: (text) => renderMono(text),
    },
    {
      title: "Kode Kendaraan",
      dataIndex: "kode_kendaraan",
      key: "kode_kendaraan",
      width: 140,
      render: (text) => renderMono(text),
    },
    {
      title: "Jenis Kendaraan",
      dataIndex: "jenis_kendaraan",
      key: "jenis_kendaraan",
      width: 160,
    },
    {
      title: "Additional Cost",
      dataIndex: "additional_cost",
      key: "additional_cost",
      align: "right",
      width: 150,
      render: (text) => renderCurrency(text, "amber"),
    },
    {
      title: "Cost Shipment",
      dataIndex: "cost_shipment",
      key: "cost_shipment",
      align: "right",
      width: 150,
      render: (text) => renderCurrency(text, "amber"),
    },
    {
      title: "Total",
      dataIndex: "total",
      key: "total",
      align: "right",
      width: 150,
      render: (text) => renderCurrency(text),
    },
    {
      title: "Tgl POD Transporter",
      dataIndex: "tanggal_pod_transporter",
      key: "tanggal_pod_transporter",
      width: 160,
      render: (text) => renderDate(text),
    },
  ];

  // ── Biaya Lain columns ──
  const biayaLainColumns = [
    {
      title: "Keterangan",
      dataIndex: "keterangan",
      key: "keterangan",
      render: (text) => (
        <span className="text-sm text-slate-700">{text || "-"}</span>
      ),
    },
    {
      title: "Nomor ID",
      dataIndex: "nomor_id",
      key: "nomor_id",
      width: 150,
      render: (text) => renderMono(text),
    },
    {
      title: "Nomor GR",
      dataIndex: "nomor_gr",
      key: "nomor_gr",
      width: 150,
      render: (text) => renderMono(text),
    },
    {
      title: "Nomor PO",
      dataIndex: "nomor_po",
      key: "nomor_po",
      width: 150,
      render: (text) => renderMono(text),
    },
    {
      title: "Kode Material",
      dataIndex: "kode_material",
      key: "kode_material",
      width: 150,
      render: (text) => renderMono(text),
    },
    {
      title: "Kode Item",
      dataIndex: "kode_item",
      key: "kode_item",
      width: 150,
      render: (text) => renderMono(text),
    },
    {
      title: "Nominal",
      dataIndex: "nominal",
      key: "nominal",
      align: "right",
      width: 160,
      render: (text) => renderCurrency(text),
    },
  ];

  // ── Audit Faktur columns ──
  const auditColumns = [
    {
      title: "Waktu",
      dataIndex: "created",
      key: "created",
      width: 180,
      render: (text) => renderDateTime(text),
    },
    {
      title: "Kode Status",
      dataIndex: "kode_status",
      key: "kode_status",
      width: 140,
      render: (text) => {
        if (!text) return <span className="text-slate-400">-</span>;
        return (
          <Tag color={getSubmitFakturStatusMeta(text).color}>{text}</Tag>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (text) => (
        <span className="text-slate-700 text-sm">{text || "-"}</span>
      ),
    },
    {
      title: "Alasan Penolakan",
      dataIndex: "reason_reject",
      key: "reason_reject",
      render: (text) =>
        text ? (
          <span className="text-red-500 text-sm">{text}</span>
        ) : (
          <span className="text-slate-400">-</span>
        ),
    },
    {
      title: "User",
      dataIndex: "m_user_id",
      key: "m_user_id",
      width: 180,
      render: (text) => renderMono(text),
    },
  ];

  // ── Render States ──
  if (isLoading) return <LoadingSpinner />;
  if (!detail) {
    return <NotFoundState onBack={() => router.push("/submit-faktur")} />;
  }

  const statusMeta = getSubmitFakturStatusMeta(detail.kode_status);
  const details = withRowKey(detail.details, "detail");
  const biayaLain = withRowKey(detail.biaya_lain, "biaya-lain");
  const auditFaktur = withRowKey(detail.audit_faktur, "audit");

  return (
    <div className="space-y-6 max-w-full">
      {/* Back Navigation */}
      <div className="flex items-center justify-between">
        <Button
          type="link"
          icon={<ArrowLeftOutlined />}
          onClick={() => router.push("/submit-faktur")}
          className="text-emerald-600 hover:text-emerald-700 font-bold p-0 flex items-center gap-1 hover:translate-x-[-2px] transition-all"
        >
          Kembali ke Daftar Submit Faktur
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
                  Detail Invoice Submit Faktur
                </CardTitle>
                <CardDescription className="text-slate-400 mt-1">
                  Nomor Invoice:{" "}
                  <span className="font-semibold text-slate-700">
                    {detail.nomor_invoice || "-"}
                  </span>
                </CardDescription>
              </div>
              {detail.kode_status ? (
                <Tag color={statusMeta.color}>
                  {detail.status || statusMeta.label} ({detail.kode_status})
                </Tag>
              ) : null}
            </div>
          </CardHeader>
          <CardContent className="p-7">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-8 gap-x-12">
              <InfoField label="Nomor Invoice" value={detail.nomor_invoice} mono />
              <InfoField label="Nomor PO" value={detail.nomor_po} mono />
              <InfoField
                label="Nomor Surat Jalan"
                value={detail.nomor_surat_jalan}
                mono
              />
              <InfoField label="Nomor Faktur" value={detail.nomor_faktur} mono />
              <InfoField label="Nomor SAP" value={detail.nomor_sap} mono />
              <InfoField label="Kode Status" value={detail.kode_status} mono />
              <InfoField label="Status" value={detail.status} />
              <InfoField label="Tanggal Invoice" value={renderDate(detail.tanggal_invoice)} />
              <InfoField label="Tanggal Faktur" value={renderDate(detail.tanggal_faktur)} />
              <InfoField
                label="Payment Term"
                value={
                  detail.payment_term
                    ? `${detail.payment_term}${
                        detail.nama_payment_term
                          ? ` - ${detail.nama_payment_term}`
                          : ""
                      }`
                    : "-"
                }
                mono
              />
              <InfoField
                label="Nominal Sebelum PPN"
                value={renderCurrency(detail.nominal_invoice_sebelum_ppn)}
              />
              <InfoField
                label="Nominal Pajak"
                value={renderCurrency(detail.nominal_pajak, "amber")}
              />
              <InfoField
                label="Total Invoice"
                value={renderCurrency(detail.nominal_invoice_sesudah_ppn)}
              />
              <InfoField label="NPWP" value={detail.npwp} mono />
              <InfoField label="Perihal Klaim" value={detail.perihal_klaim} />
              <InfoField
                label="Alasan Penolakan"
                value={detail.reason}
                className="sm:col-span-2 lg:col-span-3"
              />
              <InfoField label="Dibuat" value={renderDateTime(detail.created)} />
              <InfoField label="Diperbarui" value={renderDateTime(detail.updated)} />
              <InfoField label="Diperbarui Oleh" value={detail.updatedby} mono />
              <InfoField
                label="Invoice ID"
                value={detail[SUBMIT_FAKTUR_ID_FIELD]}
                mono
                className="sm:col-span-2 lg:col-span-3"
              />
            </div>

            {detail.kode_status && (
              <div className="mt-6 rounded-xl bg-slate-50 border border-slate-200 px-4 py-3">
                <Text className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Keterangan Kode Status
                </Text>
                <Text className="block text-sm font-semibold text-slate-700 mt-1">
                  {getSubmitFakturStatusLabel(detail.kode_status)}
                </Text>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabs */}
        <Card className="shadow-sm border-slate-100 rounded-2xl overflow-hidden">
          <CardContent className="p-7">
            <Tabs
              defaultActiveKey="details"
              items={[
                {
                  key: "details",
                  label: (
                    <span className="flex items-center gap-1.5">
                      <FileTextOutlined /> Detail Barang ({details.length})
                    </span>
                  ),
                  children: (
                    <Table
                      columns={detailsColumns}
                      dataSource={details}
                      rowKey="_rowKey"
                      pagination={{ pageSize: 10, size: "small" }}
                      scroll={{ x: 1400 }}
                      className="border border-slate-100 rounded-xl overflow-hidden"
                      locale={{ emptyText: "Tidak ada detail barang." }}
                    />
                  ),
                },
                {
                  key: "biaya-lain",
                  label: (
                    <span className="flex items-center gap-1.5">
                      <WalletOutlined /> Biaya Lain ({biayaLain.length})
                    </span>
                  ),
                  children: (
                    <Table
                      columns={biayaLainColumns}
                      dataSource={biayaLain}
                      rowKey="_rowKey"
                      pagination={{ pageSize: 10, size: "small" }}
                      scroll={{ x: 1200 }}
                      className="border border-slate-100 rounded-xl overflow-hidden"
                      locale={{ emptyText: "Tidak ada biaya lain." }}
                    />
                  ),
                },
                {
                  key: "audit",
                  label: (
                    <span className="flex items-center gap-1.5">
                      <HistoryOutlined /> Audit Faktur ({auditFaktur.length})
                    </span>
                  ),
                  children: (
                    <Table
                      columns={auditColumns}
                      dataSource={auditFaktur}
                      rowKey="_rowKey"
                      pagination={{ pageSize: 10, size: "small" }}
                      scroll={{ x: 900 }}
                      className="border border-slate-100 rounded-xl overflow-hidden"
                      locale={{ emptyText: "Belum ada riwayat status." }}
                    />
                  ),
                },
              ]}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
