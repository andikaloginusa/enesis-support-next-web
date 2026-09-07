"use client";

import React from "react";
import { Modal, Select, Button, Typography, Space, Alert } from "antd";
import {
  SyncOutlined,
  FilterOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { useCmoSapCOrderWaitingList } from "@/hooks/queries/useCmoSapCOrderWaitingList";

const { Text } = Typography;

/**
 * ProsesSapCOrderModal — Modal for processing SAP C-Order batch.
 *
 * Features:
 * - Filter by Tahun & Bulan
 * - Batch process PUT /cmo/process-sap-c-order
 * - Shows result alert after processing
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
    canProcess,
    isProcessing,
    result,
    processSapCOrder,
    resetFilters,
  } = useCmoSapCOrderWaitingList({ onSuccess });

  const handleClose = () => {
    resetFilters();
    onCancel();
  };

  const handleProsesSap = async () => {
    if (!canProcess) return;
    try {
      await processSapCOrder();
    } catch {
      /* error surfaced via hook notify */
    }
  };

  // Parse result message for display
  const resultMessage = result?.data?.message;
  const hasResult = result !== undefined;

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
            {canProcess
              ? `Periode: ${CMO_BULAN_OPTIONS.find((o) => o.value === filterBulan)?.label || ""} ${filterTahun || ""}`
              : "Pilih periode untuk memproses"}
          </Text>
          <Space size="middle">
            <Button
              type="primary"
              icon={<SyncOutlined />}
              onClick={handleProsesSap}
              loading={isProcessing}
              disabled={!canProcess}
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
      width={560}
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

        {/* Info Alert */}
        <Alert
          title="Tentang Proses SAP C-Order"
          description="Proses ini akan menarik balikan XML dari SFTP untuk semua data C-Order yang masih berstatus WAITING pada periode yang dipilih. Pastikan periode sudah benar sebelum melanjutkan."
          type="info"
          showIcon
          className="rounded-lg"
        />

        {/* Result Alert */}
        {hasResult && !isProcessing && (
          <Alert
            type="success"
            showIcon
            icon={<CheckCircleOutlined />}
            title="Proses Selesai"
            description={resultMessage || "Sinkronisasi SAP C-Order telah selesai diproses."}
            className="rounded-lg"
          />
        )}
      </div>
    </Modal>
  );
}
