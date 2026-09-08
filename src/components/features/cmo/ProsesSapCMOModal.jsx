"use client";

import React, { useState } from "react";
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
import { useCmoSapWaitingList } from "@/hooks/queries/useCmoSapWaitingList";
import { renderDate, renderBold } from "@/components/ui";
import { useConfirm } from "@/hooks/useConfirm";

const { Text } = Typography;

/**
 * ProsesSapCMOModal — Modal for viewing & processing SAP-waiting CMO records.
 *
 * Features:
 * - Filter by Tahun & Bulan — triggered via "Tampilkan" button (not auto)
 * - Paginated table of waiting CMO records (from listGetSapCMO endpoint)
 * - "Proses SAP CMO" batch button (PUT /cmo/process-sap-cmo)
 * - Auto-refresh list after processing
 *
 * @param {Object}   props
 * @param {boolean}  props.open
 * @param {Function} props.onCancel
 * @param {Function} props.onSuccess - Called after processSapCMO succeeds
 */
export function ProsesSapCMOModal({ open, onCancel, onSuccess }) {
  const {
    CMO_TAHUN_OPTIONS,
    CMO_BULAN_OPTIONS,
    activeParams,
    hasActiveParams,
    sapList,
    totalCount,
    currentPage,
    pageSize,
    handlePageChange,
    isLoading,
    isFetching,
    isProcessing,
    triggerFetch,
    processSapCMO,
    refetch,
  } = useCmoSapWaitingList({ onSuccess });

  const { confirmAction } = useConfirm();

  // Local filter state — only triggers API call when "Tampilkan" is clicked
  const [filterTahun, setFilterTahun] = useState("");
  const [filterBulan, setFilterBulan] = useState("");

  const handleClose = () => {
    setFilterTahun("");
    setFilterBulan("");
    onCancel();
  };

  /**
   * Shows a contextual confirmation dialog before triggering the SAP CMO
   * batch process (pulls XML from SFTP and updates no_sap + status).
   */
  const handleProsesSap = async () => {
    confirmAction({
      title: "Konfirmasi Proses SAP CMO",
      description:
        `Apakah Anda yakin ingin memproses ${totalCount.toLocaleString("id-ID")} data CMO yang sedang menunggu? ` +
        "Sistem akan menarik balikan XML dari SFTP dan memperbarui No. SAP serta status setiap CMO.",
      okText: "Ya, Proses SAP CMO",
      onConfirm: async () => {
        try {
          await processSapCMO();
        } catch {
          /* error surfaced via hook notify */
        }
      },
    });
  };

  const columns = [
    {
      title: "Nomor CMO",
      dataIndex: "nomor_cmo",
      key: "nomor_cmo",
      width: 260,
      render: (text) => renderBold(text),
    },
    {
      title: "Tahun",
      dataIndex: "tahun",
      key: "tahun",
      width: 80,
      align: "center",
      render: (text) => (
        <Text className="font-semibold text-slate-700">{text || "—"}</Text>
      ),
    },
    {
      title: "Bulan",
      dataIndex: "bulan",
      key: "bulan",
      width: 80,
      align: "center",
      render: (val) => {
        const MONTHS = [
          "",
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "Mei",
          "Jun",
          "Jul",
          "Agu",
          "Sep",
          "Okt",
          "Nov",
          "Des",
        ];
        const idx = parseInt(val, 10);
        return (
          <Text className="font-semibold text-slate-700">
            {MONTHS[idx] || val || "—"}
          </Text>
        );
      },
    },
    {
      title: "No. SAP",
      dataIndex: "no_sap",
      key: "no_sap",
      width: 120,
      align: "center",
      render: (text) => (
        <span className="text-amber-500 text-xs font-semibold italic">
          {text || "—"}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 160,
      align: "center",
      render: (text) => (
        <Text className="text-slate-600 text-xs">{text || "—"}</Text>
      ),
    },
    {
      title: "Dibuat",
      dataIndex: "created",
      key: "created",
      width: 150,
      render: (val) => renderDate(val),
    },
  ];

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      title={
        <div className="flex items-center gap-2">
          <SyncOutlined className="text-blue-500" />
          <span className="font-bold text-slate-800">Proses SAP CMO</span>
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
              Proses SAP CMO
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
            onChange={(val) => {
              setFilterTahun(val);
              if (val && filterBulan) {
                triggerFetch(val, filterBulan);
              }
            }}
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
            onChange={(val) => {
              setFilterBulan(val);
              if (val && filterTahun) {
                triggerFetch(filterTahun, val);
              }
            }}
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
              Pilih tahun dan bulan untuk menampilkan data CMO yang menunggu
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
              title={`Menampilkan data CMO Waiting SAP untuk periode ${filterBulan ? CMO_BULAN_OPTIONS.find((o) => o.value === filterBulan)?.label : ""} ${filterTahun || ""}`}
              type="info"
              showIcon
              className="rounded-lg"
            />
            <Table
              columns={columns}
              dataSource={sapList}
              rowKey="cmo_id"
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
              scroll={{ x: 800 }}
              size="middle"
              className="[&_.ant-table]:rounded-xl [&_.ant-table]:overflow-hidden"
            />
          </>
        )}
      </div>
    </Modal>
  );
}
