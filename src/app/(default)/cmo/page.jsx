"use client";

import React, { useEffect, useState } from "react";
import { Button, Space, Tooltip, Select, Typography } from "antd";
import {
  ReloadOutlined,
  SyncOutlined,
  FileExcelOutlined,
  CloseCircleOutlined,
  RedoOutlined,
} from "@ant-design/icons";
import { useCmo, useDebounce } from "@/hooks";
import { getUserId } from "@/utils/storage";
import {
  DataTablePanel,
  StatusBadge,
  renderDate,
  renderBold,
} from "@/components/ui";
import { ReplaceTemplateModal } from "@/components/features/cmo/ReplaceTemplateModal";
import { RegenerateCOrderModal } from "@/components/features/cmo/RegenerateCOrderModal";
import { RejectKillCmoModal } from "@/components/features/cmo/RejectKillCmoModal";
import { ProcessResultModal } from "@/components/features/cmo/ProcessResultModal";
import { ProsesSapCMOModal } from "@/components/features/cmo/ProsesSapCMOModal";
import { ProsesSapCOrderModal } from "@/components/features/cmo/ProsesSapCOrderModal";
import {
  CMO_BULAN_OPTIONS,
  CMO_TAHUN_OPTIONS,
  CMO_KATEGORI_OPTIONS,
  buildSearchText,
} from "@/config/cmoConfig";

const { Text } = Typography;

// ─────────────────────────────────────────────────────────────────────────────
//  Column Definitions
// ─────────────────────────────────────────────────────────────────────────────

const buildColumns = ({ onRejectKill }) => [
  {
    title: "Nomor CMO",
    dataIndex: "nomor_cmo",
    key: "nomor_cmo",
    fixed: "left",
    width: 200,
    render: (text) => renderBold(text),
  },
  {
    title: "Tahun",
    dataIndex: "tahun",
    key: "tahun",
    width: 100,
    align: "center",
    render: (text) => (
      <span className="font-semibold text-slate-700">{text || "—"}</span>
    ),
  },
  {
    title: "Bulan",
    dataIndex: "bulan",
    key: "bulan",
    width: 100,
    align: "center",
    render: (val) => {
      const MONTHS = [
        "", "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
        "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
      ];
      const idx = parseInt(val, 10);
      return (
        <span className="font-semibold text-slate-700">
          {MONTHS[idx] || val || "—"}
        </span>
      );
    },
  },
  {
    title: "No. SAP",
    dataIndex: "no_sap",
    key: "no_sap",
    width: 140,
    align: "center",
    render: (text) =>
      text && text !== "ADD-PO" ? (
        <span className="font-mono text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
          {text}
        </span>
      ) : (
        <span className="text-amber-500 text-xs font-semibold italic">
          {text === "ADD-PO" ? "ADD-PO" : "—"}
        </span>
      ),
  },
  {
    title: "Status",
    key: "status",
    width: 160,
    align: "center",
    render: (row) => <StatusBadge status={row.status} />,
  },
  {
    title: "Dibuat",
    dataIndex: "created",
    key: "created",
    width: 160,
    render: (val) => renderDate(val),
  },
  {
    title: "Aksi",
    key: "action",
    align: "center",
    fixed: "right",
    width: 100,
    render: (row) => (
      <Space size="middle">
        <Tooltip title="Reject / Kill CMO">
          <Button
            type="primary"
            danger
            shape="circle"
            icon={<CloseCircleOutlined />}
            onClick={() => onRejectKill(row)}
          />
        </Tooltip>
      </Space>
    ),
  },
];

// ─────────────────────────────────────────────────────────────────────────────
//  Main Page Component
// ─────────────────────────────────────────────────────────────────────────────

export default function CmoSupportPage() {
  const {
    cmoList,
    totalCount,
    currentPage,
    isListFetching,
    params,
    handlePaginationChange,
    handleFilterChange,
    refetchList,
    regenerateCOrder,
    isRegeneratingCOrder,
    rejectOrKillCMO,
    isRejectingOrKilling,
    replaceTemplate,
    isReplacingTemplate,
  } = useCmo();

  // ── Filter State — defaults: tahun & bulan saat ini, kategori CMO ──
  const currentYear = new Date().getFullYear();
  const currentMonth = String(new Date().getMonth() + 1);
  const [filterTahun, setFilterTahun] = useState(String(currentYear));
  const [filterBulan, setFilterBulan] = useState(currentMonth);
  const [filterKategori, setFilterKategori] = useState("CMO");
  const debouncedTahun = useDebounce(filterTahun, 400);
  const debouncedBulan = useDebounce(filterBulan, 400);
  const debouncedKategori = useDebounce(filterKategori, 400);

  // Live preview of the searchText being built
  const previewSearchText = buildSearchText(filterTahun, filterKategori, filterBulan);

  useEffect(() => {
    handleFilterChange("tahun", debouncedTahun);
  }, [debouncedTahun, handleFilterChange]);

  useEffect(() => {
    handleFilterChange("bulan", debouncedBulan);
  }, [debouncedBulan, handleFilterChange]);

  useEffect(() => {
    handleFilterChange("kategori", debouncedKategori);
  }, [debouncedKategori, handleFilterChange]);

  // ── Modal State ──
  const [isReplaceTemplateOpen, setIsReplaceTemplateOpen] = useState(false);
  const [isRegenCOrderOpen, setIsRegenCOrderOpen] = useState(false);
  const [isRejectKillOpen, setIsRejectKillOpen] = useState(false);
  const [isResultOpen, setIsResultOpen] = useState(false);
  const [isProsesSapOpen, setIsProsesSapOpen] = useState(false);
  const [isProsesSapCOrderOpen, setIsProsesSapCOrderOpen] = useState(false);
  const [activeCmo, setActiveCmo] = useState(null);

  // ── Regen Result State ──
  const [regenResult, setRegenResult] = useState({
    successList: [],
    errorList: [],
    successCount: 0,
    errorCount: 0,
  });

  // ── Action Handlers ──

  const openReplaceTemplate = () => setIsReplaceTemplateOpen(true);
  const closeReplaceTemplate = () => setIsReplaceTemplateOpen(false);

  const openRegenCOrder = () => setIsRegenCOrderOpen(true);
  const closeRegenCOrder = () => setIsRegenCOrderOpen(false);

  const handleRegenCOrderSubmit = async ({ tahun, bulan, week_number }) => {
    try {
      const result = await regenerateCOrder({ tahun, bulan, week_number });
      const payload = result?.data || {};
      const successList = Array.isArray(payload.listsCmoSuccess)
        ? payload.listsCmoSuccess.map((id) => ({ cmo_id: id }))
        : [];
      const errorList = Array.isArray(payload.listsCmoError)
        ? payload.listsCmoError
        : [];

      setRegenResult({
        successList,
        errorList,
        successCount: successList.length,
        errorCount: errorList.length,
      });
      setIsResultOpen(true);
      closeRegenCOrder();
    } catch {
      // Error surfaced via useNotify in the hook
    }
  };

  const openRejectKill = (cmo) => {
    setActiveCmo(cmo);
    setIsRejectKillOpen(true);
  };

  const closeRejectKill = () => {
    setActiveCmo(null);
    setIsRejectKillOpen(false);
  };

  const handleRejectKillSubmit = async ({ cmo_id, action }) => {
    try {
      await rejectOrKillCMO({
        cmo_id,
        action,
        m_user_id: getUserId(),
      });
      closeRejectKill();
    } catch {
      // Error surfaced via useNotify in the hook
    }
  };

  // ── Column Definitions ──
  const columnsConfig = buildColumns({
    onRejectKill: openRejectKill,
  });

  // ── Render ──
  return (
    <>
      <DataTablePanel
        title="CMO Support"
        description="Kelola Customer Monthly Order — proses data SAP, regenerate C-Order, dan aksi reject/kill CMO."
        columns={columnsConfig}
        dataSource={cmoList}
        loading={isListFetching}
        rowKey="cmo_id"
        filterBar={
          <div className="flex flex-col gap-3">
            {/* Filter Controls */}
            <div className="flex items-center gap-3 flex-wrap">
              <Text className="text-slate-500 text-sm font-medium shrink-0">Filter:</Text>
              <Select
                placeholder="Tahun"
                allowClear
                value={filterTahun || undefined}
                onChange={setFilterTahun}
                options={CMO_TAHUN_OPTIONS}
                size="middle"
                className="w-32"
                showSearch
                optionFilterProp="label"
              />
              <Select
                placeholder="Bulan"
                allowClear
                value={filterBulan || undefined}
                onChange={setFilterBulan}
                options={CMO_BULAN_OPTIONS}
                size="middle"
                className="w-44"
                showSearch
                optionFilterProp="label"
              />
              <Select
                placeholder="Kategori"
                allowClear
                value={filterKategori || undefined}
                onChange={setFilterKategori}
                options={CMO_KATEGORI_OPTIONS}
                size="middle"
                className="w-36"
                showSearch
                optionFilterProp="label"
              />
            </div>
            {/* SearchText Preview */}
            {previewSearchText ? (
              <div className="flex items-center gap-2">
                <Text className="text-slate-400 text-xs">searchText:</Text>
                <code className="bg-slate-100 text-slate-600 text-xs font-mono px-2 py-0.5 rounded border border-slate-200">
                  {previewSearchText}
                </code>
              </div>
            ) : (
              <Text className="text-slate-400 text-xs italic">
                Pilih tahun, bulan, dan kategori untuk memuat data
              </Text>
            )}
          </div>
        }
        pagination={{
          total: totalCount,
          pageSize: params.pageSize,
          current: currentPage,
          onChange: handlePaginationChange,
        }}
        extraHeaderActions={
          <Space size="middle" wrap>
            {/* Proses SAP CMO */}
            <Tooltip title="Proses SAP CMO — tarik balikan XML dari SFTP">
              <Button
                type="primary"
                size="large"
                icon={<SyncOutlined />}
                onClick={() => setIsProsesSapOpen(true)}
                style={{
                  backgroundColor: "#1aac32",
                  borderColor: "#1aac32",
                  color: "#ffffff",
                }}
              >
                Proses SAP CMO
              </Button>
            </Tooltip>

            {/* Replace Template */}
            <Tooltip title="Ganti Template CMO / Add PO via Excel">
              <Button
                type="default"
                size="large"
                icon={<FileExcelOutlined />}
                onClick={openReplaceTemplate}
                className="border-emerald-500 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-600"
              >
                Ganti Template
              </Button>
            </Tooltip>

            {/* Regenerate C-Order */}
            <Tooltip title="Regenerasi C-Order dari data CMO">
              <Button
                type="default"
                size="large"
                icon={<RedoOutlined />}
                onClick={openRegenCOrder}
                className="border-blue-500 text-blue-600 hover:bg-blue-50 hover:border-blue-600"
              >
                Regenerasi C-Order
              </Button>
            </Tooltip>

            {/* Proses SAP C-Order */}
            <Tooltip title="Proses SAP C-Order — tarik balikan XML dari SFTP">
              <Button
                type="primary"
                size="large"
                icon={<SyncOutlined />}
                onClick={() => setIsProsesSapCOrderOpen(true)}
                style={{
                  backgroundColor: "#722ed1",
                  borderColor: "#722ed1",
                  color: "#ffffff",
                }}
              >
                Proses SAP C-Order
              </Button>
            </Tooltip>

            {/* Refresh */}
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

      {/* Replace Template Modal */}
      <ReplaceTemplateModal
        open={isReplaceTemplateOpen}
        onCancel={closeReplaceTemplate}
        onSubmit={async ({ tipe_template, version, file }) => {
          await replaceTemplate({ tipe_template, version, file });
          closeReplaceTemplate();
        }}
        confirmLoading={isReplacingTemplate}
      />

      {/* Regenerate C-Order Modal */}
      <RegenerateCOrderModal
        open={isRegenCOrderOpen}
        onCancel={closeRegenCOrder}
        onSubmit={handleRegenCOrderSubmit}
        confirmLoading={isRegeneratingCOrder}
      />

      {/* Reject / Kill Modal */}
      <RejectKillCmoModal
        open={isRejectKillOpen}
        onCancel={closeRejectKill}
        onSubmit={handleRejectKillSubmit}
        confirmLoading={isRejectingOrKilling}
        cmo={activeCmo}
      />

      {/* Regen Result Modal */}
      <ProcessResultModal
        open={isResultOpen}
        onCancel={() => setIsResultOpen(false)}
        title="Hasil Regenerasi C-Order"
        description="Ringkasan hasil proses regenerasi C-Order berdasarkan data CMO."
        successList={regenResult.successList}
        errorList={regenResult.errorList}
        successCount={regenResult.successCount}
        errorCount={regenResult.errorCount}
      />

      {/* Proses SAP CMO Modal */}
      <ProsesSapCMOModal
        open={isProsesSapOpen}
        onCancel={() => setIsProsesSapOpen(false)}
        onSuccess={refetchList}
      />

      {/* Proses SAP C-Order Modal */}
      <ProsesSapCOrderModal
        open={isProsesSapCOrderOpen}
        onCancel={() => setIsProsesSapCOrderOpen(false)}
        onSuccess={refetchList}
      />
    </>
  );
}
