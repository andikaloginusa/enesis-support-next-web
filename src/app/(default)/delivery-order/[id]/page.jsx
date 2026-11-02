"use client";

import React, { use } from "react";
import { Button, Table, Tabs, Tag, Typography } from "antd";
import {
  ArrowLeftOutlined,
  CloseCircleOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
  HistoryOutlined,
  ShoppingOutlined,
  WalletOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useDeliveryOrderDetail } from "@/hooks/queries/useDeliveryOrderDetail";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  InfoField,
  renderDateTime,
  renderNumber,
} from "@/components/ui";
import {
  DELIVERY_ORDER_BUNDLE_FIELD,
  getDeliveryOrderStatusLabel,
  getDeliveryOrderStatusMeta,
} from "@/config/deliveryOrderConfig";

const { Text } = Typography;

// ─────────────────────────────────────────────────────────────────────────────
//  Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <div className="w-12 h-12 rounded-full border-2 border-t-emerald-600 border-b-emerald-600 border-l-transparent border-r-transparent animate-spin" />
      <Text className="text-slate-500 font-medium">
        Memuat Detail Delivery Order...
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
          Data Delivery Order Tidak Ditemukan
        </Typography.Title>
        <Text className="text-slate-400 block mb-6">
          Delivery Order yang Anda cari tidak tersedia atau sudah tidak aktif.
        </Text>
        <Button type="primary" onClick={onBack}>
          Kembali ke Daftar Delivery Order
        </Button>
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Main Page Component
// ─────────────────────────────────────────────────────────────────────────────

export default function DeliveryOrderDetailPage({ params: paramsPromise }) {
  const resolvedParams = use(paramsPromise);
  const deliveryOrderId = resolvedParams.id;
  const router = useRouter();

  const { detail, isLoading } = useDeliveryOrderDetail({
    deliveryOrderId,
  });

  // ── Detail Barang columns ──
  const detailsColumns = [
    {
      title: "Line",
      dataIndex: "line",
      key: "line",
      align: "center",
      width: 70,
    },
    {
      title: "Kode Barang",
      dataIndex: "kode_barang",
      key: "kode_barang",
      width: 140,
      render: (text) => <span className="font-mono text-xs">{text || "-"}</span>,
    },
    {
      title: "Nama Barang",
      dataIndex: "nama_barang",
      key: "nama_barang",
      render: (text) => (
        <span className="font-semibold text-slate-800">{text || "-"}</span>
      ),
    },
    {
      title: "Jumlah",
      dataIndex: "jumlah",
      key: "jumlah",
      align: "right",
      width: 120,
      render: (text) => renderNumber(text),
    },
    {
      title: "Tonase",
      dataIndex: "tonase",
      key: "tonase",
      align: "right",
      width: 120,
      render: (text) => renderNumber(text, 2),
    },
    {
      title: "Kubikasi",
      dataIndex: "kubikasi",
      key: "kubikasi",
      align: "right",
      width: 120,
      render: (text) => renderNumber(text, 3),
    },
    {
      title: "Batch",
      dataIndex: "batch",
      key: "batch",
      width: 140,
      render: (text) => <span className="font-mono text-xs">{text || "-"}</span>,
    },
    {
      title: "Satuan",
      dataIndex: "satuan",
      key: "satuan",
      width: 100,
      align: "center",
    },
    {
      title: "Location Storage",
      dataIndex: "location_storage",
      key: "location_storage",
      width: 170,
    },
    {
      title: "Expired Date",
      dataIndex: "expired_date",
      key: "expired_date",
      width: 160,
      render: (text) => renderDateTime(text),
    },
  ];

  // ── Tracking columns ──
  const trackingColumns = [
    {
      title: "Waktu",
      dataIndex: "created",
      key: "created",
      width: 200,
      render: (text) => renderDateTime(text),
    },
    {
      title: "Latitude",
      dataIndex: "latitude",
      key: "latitude",
      width: 160,
      render: (text) => <span className="font-mono text-xs">{text || "-"}</span>,
    },
    {
      title: "Longitude",
      dataIndex: "longitude",
      key: "longitude",
      width: 160,
      render: (text) => <span className="font-mono text-xs">{text || "-"}</span>,
    },
  ];

  // ── Riwayat Status columns ──
  const auditColumns = [
    {
      title: "Waktu",
      dataIndex: "created",
      key: "created",
      width: 200,
      render: (text) => renderDateTime(text),
    },
    {
      title: "Kode Status",
      dataIndex: "kode_status",
      key: "kode_status",
      width: 140,
      render: (text) => {
        if (!text) return <span className="text-slate-400">-</span>;
        const meta = getDeliveryOrderStatusMeta(text);
        return <Tag color={meta.color}>{text}</Tag>;
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (text) => <span className="text-slate-700 text-sm">{text || "-"}</span>,
    },
    {
      title: "User",
      dataIndex: "m_user_id",
      key: "m_user_id",
      width: 180,
      render: (text) => <span className="font-mono text-xs">{text || "-"}</span>,
    },
  ];

  // ── Biaya Tambahan columns ──
  const addCostColumns = [
    {
      title: "Kode Status",
      dataIndex: "kode_status",
      key: "kode_status",
      width: 140,
      render: (text) => {
        if (!text) return <span className="text-slate-400">-</span>;
        const meta = getDeliveryOrderStatusMeta(text);
        return <Tag color={meta.color}>{text}</Tag>;
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (text) => <span className="text-slate-700 text-sm">{text || "-"}</span>,
    },
    {
      title: "File Name",
      dataIndex: "file_name",
      key: "file_name",
      render: (text) => <span className="text-slate-600 text-sm">{text || "-"}</span>,
    },
  ];

  // ── Render States ──
  if (isLoading) return <LoadingSpinner />;
  if (!detail) {
    return <NotFoundState onBack={() => router.push("/delivery-order")} />;
  }

  const statusMeta = getDeliveryOrderStatusMeta(detail.kode_status);
  const details = Array.isArray(detail.details) ? detail.details : [];
  const tracking = Array.isArray(detail.tracking) ? detail.tracking : [];
  const auditTracking = Array.isArray(detail.audit_tracking)
    ? detail.audit_tracking
    : [];
  const addCost = Array.isArray(detail.add_cost) ? detail.add_cost : [];

  return (
    <div className="space-y-6 max-w-full">
      {/* Back Navigation */}
      <div className="flex items-center justify-between">
        <Button
          type="link"
          icon={<ArrowLeftOutlined />}
          onClick={() => router.push("/delivery-order")}
          className="text-emerald-600 hover:text-emerald-700 font-bold p-0 flex items-center gap-1 hover:translate-x-[-2px] transition-all"
        >
          Kembali ke Daftar Delivery Order
        </Button>
      </div>

      <div className="space-y-8">
        {/* Header Card */}
        <Card className="shadow-sm border-slate-100 rounded-2xl overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-6 px-7">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex flex-col gap-1">
                <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <ShoppingOutlined className="text-emerald-600 text-2xl" />
                  Detail Delivery Order
                </CardTitle>
                <CardDescription className="text-slate-400 mt-1">
                  Bundle:{" "}
                  <span className="font-semibold text-slate-700">
                    {detail[DELIVERY_ORDER_BUNDLE_FIELD] || "-"}
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
              <InfoField
                label="Bundle ID"
                value={detail[DELIVERY_ORDER_BUNDLE_FIELD]}
                mono
              />
              <InfoField label="Console Number" value={detail.console_number} mono />
              <InfoField label="Nomor DO" value={detail.nomor_do} mono />
              <InfoField label="Nomor SO" value={detail.nomor_so} mono />
              <InfoField label="Kode Status" value={detail.kode_status} mono />
              <InfoField
                label="Status"
                value={detail.status}
              />
              <InfoField label="Distributor" value={detail.m_distributor_id} mono />
              <InfoField label="Transporter" value={detail.m_transporter_id} mono />
              <InfoField label="Tujuan" value={detail.tujuan} />
              <InfoField label="Route" value={detail.route} />
              <InfoField label="Alamat" value={detail.alamat} />
              <InfoField label="Kode Pos" value={detail.kode_pos} mono />
              <InfoField
                label="Tanggal POD Transporter"
                value={renderDateTime(detail.tanggal_pod_transporter)}
              />
              <InfoField
                label="Tanggal Sampai Tujuan"
                value={renderDateTime(detail.tanggal_sampai_tujuan)}
              />
              <InfoField label="Tonase" value={renderNumber(detail.tonase, 2)} />
              <InfoField label="Kubikasi" value={renderNumber(detail.kubikasi, 3)} />
              <InfoField label="Dibuat" value={renderDateTime(detail.created)} />
              <InfoField label="Diperbarui" value={renderDateTime(detail.updated)} />
              <InfoField label="Diperbarui Oleh" value={detail.updatedby} mono />
              <InfoField
                label="Delivery Order ID"
                value={detail.delivery_order_id}
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
                  {getDeliveryOrderStatusLabel(detail.kode_status)}
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
                      rowKey="delivery_order_detail_id"
                      pagination={{ pageSize: 10, size: "small" }}
                      scroll={{ x: 1300 }}
                      className="border border-slate-100 rounded-xl overflow-hidden"
                      locale={{ emptyText: "Tidak ada detail barang." }}
                    />
                  ),
                },
                {
                  key: "tracking",
                  label: (
                    <span className="flex items-center gap-1.5">
                      <EnvironmentOutlined /> Tracking ({tracking.length})
                    </span>
                  ),
                  children: (
                    <Table
                      columns={trackingColumns}
                      dataSource={tracking}
                      rowKey={(_, index) => `tracking-${index}`}
                      pagination={{ pageSize: 10, size: "small" }}
                      scroll={{ x: 600 }}
                      className="border border-slate-100 rounded-xl overflow-hidden"
                      locale={{ emptyText: "Belum ada data tracking." }}
                    />
                  ),
                },
                {
                  key: "audit",
                  label: (
                    <span className="flex items-center gap-1.5">
                      <HistoryOutlined /> Riwayat Status ({auditTracking.length})
                    </span>
                  ),
                  children: (
                    <Table
                      columns={auditColumns}
                      dataSource={auditTracking}
                      rowKey="audit_tracking_id"
                      pagination={{ pageSize: 10, size: "small" }}
                      scroll={{ x: 800 }}
                      className="border border-slate-100 rounded-xl overflow-hidden"
                      locale={{ emptyText: "Belum ada riwayat status." }}
                    />
                  ),
                },
                {
                  key: "add-cost",
                  label: (
                    <span className="flex items-center gap-1.5">
                      <WalletOutlined /> Biaya Tambahan ({addCost.length})
                    </span>
                  ),
                  children: (
                    <Table
                      columns={addCostColumns}
                      dataSource={addCost}
                      rowKey="delivery_order_add_cost_id"
                      pagination={{ pageSize: 10, size: "small" }}
                      scroll={{ x: 700 }}
                      className="border border-slate-100 rounded-xl overflow-hidden"
                      locale={{ emptyText: "Tidak ada biaya tambahan." }}
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
