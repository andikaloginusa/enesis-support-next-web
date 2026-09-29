"use client";

import React from "react";
import {
  Modal,
  Table,
  Select,
  Button,
  Typography,
  Space,
  Alert,
  Spin,
} from "antd";
import {
  SyncOutlined,
  ReloadOutlined,
  FilterOutlined,
  FileSearchOutlined,
} from "@ant-design/icons";
import { useCmoSapCOrderWaitingList } from "@/hooks/queries/useCmoSapCOrderWaitingList";
import { useConfirm } from "@/hooks/useConfirm";

const { Text } = Typography;

/**
 * ProsesSapCOrderModal — Modal for viewing & processing SAP-waiting C-Order records.
 *
 * Features:
 * - Filter by Tahun & Bulan — triggered automatically when both filters are selected
 * - Paginated table of waiting C-Order records (from GET /support/cmo/get/list-corder-sap)
 * - "Proses SAP C-Order" batch button (PUT /cmo/process-sap-c-order)
 * - Auto-refresh list after processing
 *
 * Mirrors the pattern of ProsesSapCMOModal.
 *
 * @param {Object}   props
 * @param {boolean}  props.open
 * @param {Function} props.onCancel
 * @param {Function} props.onSuccess - Called after processSapCOrder succeeds
 */
export function ProsesSapCOrderModal({ open, onCancel, onSuccess }) {
  const {
    CMO_TAHUN_OPTIONS,
    CMO_BULAN_OPTIONS,
    filterTahun,
    filterBulan,
    handleTahunChange,
    handleBulanChange,
    hasActiveParams,
    sapList,
    totalCount,
    currentPage,
    pageSize,
    handlePageChange,
    isLoading,
    isFetching,
    isProcessing,
    processSapCOrder,
    refetch,
    resetFilters,
  } = useCmoSapCOrderWaitingList({ onSuccess });

  const { confirmAction } = useConfirm();

  const handleClose = () => {
    resetFilters();
    onCancel();
  };

  /**
   * Shows a contextual confirmation dialog before triggering the SAP C-Order
   * batch process (pulls XML from SFTP and updates nomor_sap + status).
   */
  const handleProsesSap = async () => {
    confirmAction({
      title: "Konfirmasi Proses SAP C-Order",
      description:
        `Apakah Anda yakin ingin memproses ${totalCount.toLocaleString("id-ID")} data C-Order yang sedang menunggu? ` +
        "Sistem akan menarik balikan XML dari SFTP dan memperbarui No. SAP serta status setiap C-Order.",
      okText: "Ya, Proses SAP C-Order",
      onConfirm: async () => {
        try {
          await processSapCOrder();
        } catch {
          /* error surfaced via hook notify */
        }
      },
    });
  };

  const columns = [
    {
      title: "ID C-Order",
      dataIndex: "c_order_id",
      key: "c_order_id",
      width: 300,
      ellipsis: true,
      render: (text) => (
        <Text className="text-xs text-slate-500 font-mono">{text || "—"}</Text>
      ),
    },
    {
      title: "No. SAP",
      dataIndex: "no_sap",
      key: "no_sap",
      width: 140,
      align: "center",
      render: (text) => (
        <span className="text-amber-500 text-xs font-semibold italic">
          {text || "—"}
        </span>
      ),
    },
    {
      title: "Week Number",
      dataIndex: "week_number",
      key: "week_number",
      width: 120,
      align: "center",
      render: (text) => (
        <Text className="font-semibold text-slate-700">{text ?? "—"}</Text>
      ),
    },
  ];

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      title={
        <div className="flex items-center gap-2">
          <SyncOutlined className="text-blue-500" />
          <span className="font-bold text-slate-800">Proses SAP C-Order</span>
        </div>
      }
      footer={
        <div className="flex items-center justify-between gap-3">
          <Text className="text-slate-500 text-xs">
            {hasActiveParams
              ? `${totalCount.toLocaleString("id-ID")} data menunggu`
              : "Pilih periode untuk melihat data"}
          </Text>
          <Space size="middle">
            <Button
              onClick={refetch}
              icon={<ReloadOutlined />}
              loading={isFetching}
              disabled={!hasActiveParams}
            >
              Refresh
            </Button>
            <Button
              type="primary"
              icon={<SyncOutlined />}
              onClick={handleProsesSap}
              loading={isProcessing}
              disabled={!hasActiveParams || totalCount === 0}
              style={{
                backgroundColor: "#1aac32",
                borderColor: "#1aac32",
                color: "#ffffff",
              }}
            >
              Proses SAP C-Order
            </Button>
          </Space>
        </div>
      }
      width={960}
      className="rounded-xl overflow-hidden"
      destroyOnHidden
    >
      <div className="py-4 space-y-4">
        {/* Filter Bar */}
        <div className="flex items-center gap-3 flex-wrap bg-slate-50 rounded-xl px-4 py-3 border border-slate-200">
          <FilterOutlined className="text-slate-400" />
          <Text className="text-slate-500 text-sm font-semibold shrink-0">Filter:</Text>
          <Select
            placeholder="Tahun"
            allowClear
            value={filterTahun || undefined}
            onChange={handleTahunChange}
            options={CMO_TAHUN_OPTIONS}
            size="middle"
            className="w-36"
            showSearch
            optionFilterProp="label"
          />
          <Select
            placeholder="Bulan"
            allowClear
            value={filterBulan || undefined}
            onChange={handleBulanChange}
            options={CMO_BULAN_OPTIONS}
            size="middle"
            className="w-44"
            showSearch
            optionFilterProp="label"
          />
        </div>

        {/* Empty State */}
        {!hasActiveParams && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
              <FileSearchOutlined className="text-slate-300 text-3xl" />
            </div>
            <Text className="text-slate-400 text-sm font-medium text-center max-w-xs">
              Pilih tahun dan bulan untuk menampilkan data C-Order yang menunggu
              balasan SAP.
            </Text>
          </div>
        )}

        {/* Loading */}
        {hasActiveParams && isLoading && (
          <div className="flex items-center justify-center py-16">
            <Spin description="Memuat data..." />
          </div>
        )}

        {/* Table */}
        {hasActiveParams && !isLoading && (
          <>
            <Alert
              title={`Menampilkan data C-Order Waiting SAP untuk periode ${filterBulan ? CMO_BULAN_OPTIONS.find((o) => o.value === filterBulan)?.label : ""} ${filterTahun || ""}`}
              type="info"
              showIcon
              className="rounded-lg"
            />
            <Table
              columns={columns}
              dataSource={sapList}
              rowKey="c_order_id"
              loading={isFetching}
              pagination={{
                total: totalCount,
                pageSize,
                current: currentPage,
                onChange: handlePageChange,
                showSizeChanger: true,
                pageSizeOptions: ["10", "20", "50"],
                showTotal: (total, range) =>
                  `Menampilkan ${range[0]}–${range[1]} dari ${total.toLocaleString("id-ID")} data`,
              }}
              scroll={{ x: 560 }}
              size="middle"
              className="[&_.ant-table]:rounded-xl [&_.ant-table]:overflow-hidden"
            />
          </>
        )}
      </div>
    </Modal>
  );
}
