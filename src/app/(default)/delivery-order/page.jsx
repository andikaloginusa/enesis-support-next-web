"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Space, Tag, Tooltip } from "antd";
import {
  DownloadOutlined,
  EditOutlined,
  EyeOutlined,
  FileExcelOutlined,
  ReloadOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { useConfirm, useDebounce, useDeliveryOrder } from "@/hooks";
import {
  DataTablePanel,
  renderBold,
  renderMedium,
  renderMono,
  renderTruncated,
} from "@/components/ui";
import { renderDateTime } from "@/components/ui/ColumnRenderers";
import { DeliveryOrderDetailModal } from "@/components/features/delivery-order/DeliveryOrderDetailModal";
import { UpdateDeliveryOrderStatusModal } from "@/components/features/delivery-order/UpdateDeliveryOrderStatusModal";
import { UploadDeliveryOrderStatusModal } from "@/components/features/delivery-order/UploadDeliveryOrderStatusModal";
import { BundleReadyInvoiceModal } from "@/components/features/delivery-order/BundleReadyInvoiceModal";
import { useDeliveryOrderExcelUpload } from "@/hooks/queries/useDeliveryOrderExcelUpload";
import {
  DELIVERY_ORDER_BUNDLE_FIELD,
  DELIVERY_ORDER_ID_FIELD,
  DELIVERY_ORDER_STATUS_OPTIONS,
  DELIVERY_ORDER_TEMPLATE_FILENAME,
  DELIVERY_ORDER_TEMPLATE_URL,
  getDeliveryOrderStatusMeta,
} from "@/config/deliveryOrderConfig";
import { BRAND_FOCUS_COLOR } from "@/utils/constants";

// ─────────────────────────────────────────────────────────────────────────────
//  Column Definitions
// ─────────────────────────────────────────────────────────────────────────────

const buildColumns = ({ onView, onEdit }) => [
  {
    title: "Bundle ID",
    dataIndex: DELIVERY_ORDER_BUNDLE_FIELD,
    key: DELIVERY_ORDER_BUNDLE_FIELD,
    fixed: "left",
    width: 140,
    render: (text) => renderMono(text),
  },
  {
    title: "Console Number",
    dataIndex: "console_number",
    key: "console_number",
    width: 160,
    render: (text) => renderMono(text),
  },
  {
    title: "Nomor DO",
    dataIndex: "nomor_do",
    key: "nomor_do",
    width: 170,
    render: (text) => renderBold(text),
  },
  {
    title: "Nomor SO",
    dataIndex: "nomor_so",
    key: "nomor_so",
    width: 160,
    render: (text) => renderMedium(text),
  },
  {
    title: "Kode Status",
    dataIndex: "kode_status",
    key: "kode_status",
    width: 130,
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
    width: 220,
    render: (text) => renderTruncated(text, 200),
  },
  {
    title: "Transporter",
    dataIndex: "m_transporter_id",
    key: "m_transporter_id",
    width: 160,
    render: (text) => renderMono(text),
  },
  {
    title: "Tujuan",
    dataIndex: "tujuan",
    key: "tujuan",
    width: 220,
    render: (text) => renderTruncated(text, 200),
  },
  {
    title: "Dibuat",
    dataIndex: "created",
    key: "created",
    width: 170,
    render: (text) => renderDateTime(text),
  },
  {
    title: "Aksi",
    key: "action",
    align: "center",
    fixed: "right",
    width: 120,
    render: (row) => (
      <Space size="middle">
        <Tooltip title="Lihat Detail Delivery Order">
          <Button
            type="default"
            shape="circle"
            icon={<EyeOutlined />}
            onClick={() => onView(row)}
            className="text-slate-600 border-slate-300 hover:!border-blue-400 hover:!text-blue-600 hover:!bg-blue-50"
          />
        </Tooltip>
        <Tooltip title="Update Status Delivery Order">
          <Button
            type="primary"
            shape="circle"
            icon={<EditOutlined />}
            onClick={() => onEdit(row)}
            style={{
              backgroundColor: BRAND_FOCUS_COLOR,
              borderColor: BRAND_FOCUS_COLOR,
            }}
          />
        </Tooltip>
      </Space>
    ),
  },
];

// ─────────────────────────────────────────────────────────────────────────────
//  Main Page Component
// ─────────────────────────────────────────────────────────────────────────────

export default function DeliveryOrderPage() {
  const router = useRouter();
  const { confirmAction } = useConfirm();

  const {
    deliveryOrderList,
    totalCount,
    isListFetching,
    params,
    handlePaginationChange,
    handleSearchChange,
    updateDeliveryOrderStatus,
    isUpdatingDeliveryOrderStatus,
    updateErrorDetails,
    resetUpdateStatus,
    refetchList,
  } = useDeliveryOrder();

  const {
    uploadDeliveryOrderStatus,
    isUploading,
    errorDetails,
    resetExcelUpload,
  } = useDeliveryOrderExcelUpload();

  // ── Search State ──
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearch = useDebounce(searchValue, 400);

  useEffect(() => {
    handleSearchChange(debouncedSearch);
  }, [debouncedSearch, handleSearchChange]);

  // ── Modal State ──
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [activeRow, setActiveRow] = useState(null);

  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isBundleReadyOpen, setIsBundleReadyOpen] = useState(false);

  // ── Action Handlers ──

  const openDetailModal = (row) => {
    setActiveRow(row);
    setIsDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setActiveRow(null);
  };

  const openUpdateModal = (row) => {
    resetUpdateStatus();
    setActiveRow(row);
    setIsUpdateModalOpen(true);
  };

  const closeUpdateModal = () => {
    resetUpdateStatus();
    setIsUpdateModalOpen(false);
    setActiveRow(null);
  };

  const handleViewMore = (deliveryOrderId) => {
    closeDetailModal();
    router.push(`/delivery-order/${deliveryOrderId}`);
  };

  const handleUpdateSubmit = async ({ delivery_order_id, kode_status }) => {
    const option = DELIVERY_ORDER_STATUS_OPTIONS.find(
      (item) => item.value === kode_status,
    );

    confirmAction({
      title: "Konfirmasi Update Status Delivery Order",
      description:
        `Apakah Anda yakin ingin mengubah status Delivery Order bundle ` +
        `"${activeRow?.[DELIVERY_ORDER_BUNDLE_FIELD] ?? "-"}" menjadi ` +
        `"${option?.description ?? kode_status} (${kode_status})"? ` +
        `Perubahan akan langsung tercatat ke dalam sistem.`,
      okText: "Ya, Perbarui Status",
      onConfirm: async () => {
        try {
          await updateDeliveryOrderStatus({
            [DELIVERY_ORDER_ID_FIELD]: delivery_order_id,
            kode_status,
          });
          closeUpdateModal();
        } catch {
          /* error detail ditampilkan di dalam modal update */
        }
      },
    });
  };

  const openUploadModal = () => {
    resetExcelUpload();
    setIsUploadModalOpen(true);
  };

  const closeUploadModal = () => {
    resetExcelUpload();
    setIsUploadModalOpen(false);
  };

  const handleUploadSubmit = ({ file }) => {
    confirmAction({
      title: "Konfirmasi Upload Update Status Delivery Order",
      description:
        `Apakah Anda yakin ingin meng-upload file "${file.name}" untuk ` +
        `memperbarui status Delivery Order secara massal? ` +
        `Seluruh baris dalam file akan diproses — bila ada satu baris tidak ` +
        `valid, tidak ada data yang diperbarui.`,
      okText: "Ya, Upload",
      onConfirm: async () => {
        try {
          await uploadDeliveryOrderStatus({ file });
        } catch {
          /* detail per-baris ditampilkan di dalam modal upload */
        }
      },
    });
  };

  // ── Column Definitions ──
  const columnsConfig = buildColumns({
    onView: openDetailModal,
    onEdit: openUpdateModal,
  });

  // ── Render ──
  return (
    <>
      <DataTablePanel
        title="Delivery Order"
        description="Kelola status Delivery Order: pantau bundle yang sedang diproses, perbarui status per baris, atau lakukan pembaruan massal dari Excel."
        columns={columnsConfig}
        dataSource={deliveryOrderList}
        loading={isListFetching}
        rowKey={DELIVERY_ORDER_ID_FIELD}
        scrollX={1600}
        pagination={{
          total: totalCount,
          pageSize: params.pageSize,
          current: params.currentPage,
          onChange: handlePaginationChange,
        }}
        searchProps={{
          placeholder: "Cari bundle ID atau console number...",
          value: searchValue,
          onChange: setSearchValue,
        }}
        extraHeaderActions={
          <Space size="middle" wrap>
            <Tooltip title="Tampilkan daftar bundle yang siap di-invoice">
              <Button
                type="primary"
                size="large"
                icon={<FileExcelOutlined />}
                onClick={() => setIsBundleReadyOpen(true)}
                style={{
                  backgroundColor: BRAND_FOCUS_COLOR,
                  borderColor: BRAND_FOCUS_COLOR,
                }}
              >
                Get List Bundle Ready Invoice
              </Button>
            </Tooltip>
            <Tooltip title="Unduh template Excel update status Delivery Order">
              <a
                href={DELIVERY_ORDER_TEMPLATE_URL}
                download={DELIVERY_ORDER_TEMPLATE_FILENAME}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  type="default"
                  size="large"
                  icon={<DownloadOutlined />}
                  className="border-emerald-500 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-600"
                >
                  Download Template
                </Button>
              </a>
            </Tooltip>
            <Tooltip title="Update status Delivery Order massal dari Excel">
              <Button
                type="default"
                size="large"
                icon={<UploadOutlined />}
                onClick={openUploadModal}
                className="border-blue-500 text-blue-600 hover:bg-blue-50 hover:border-blue-600"
              >
                Upload Update Status DO
              </Button>
            </Tooltip>
            <Tooltip title="Muat Ulang Data">
              <Button
                type="default"
                shape="circle"
                size="large"
                icon={
                  <ReloadOutlined
                    className={isListFetching ? "animate-spin" : ""}
                  />
                }
                onClick={refetchList}
              />
            </Tooltip>
          </Space>
        }
      />

      {/* Detail Modal */}
      <DeliveryOrderDetailModal
        open={isDetailModalOpen}
        deliveryOrder={activeRow}
        onClose={closeDetailModal}
        onViewMore={handleViewMore}
      />

      {/* Update Status Modal */}
      <UpdateDeliveryOrderStatusModal
        open={isUpdateModalOpen}
        deliveryOrder={activeRow}
        onCancel={closeUpdateModal}
        onSubmit={handleUpdateSubmit}
        confirmLoading={isUpdatingDeliveryOrderStatus}
        errorDetails={updateErrorDetails}
      />

      {/* Upload Excel Modal */}
      <UploadDeliveryOrderStatusModal
        open={isUploadModalOpen}
        onCancel={closeUploadModal}
        onSubmit={handleUploadSubmit}
        confirmLoading={isUploading}
        errorDetails={errorDetails}
      />

      {/* Bundle Ready Invoice Modal */}
      <BundleReadyInvoiceModal
        open={isBundleReadyOpen}
        onClose={() => setIsBundleReadyOpen(false)}
      />
    </>
  );
}
