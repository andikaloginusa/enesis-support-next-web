"use client";

import React, { useState } from "react";
import { Button, Space, Tooltip, Select, Typography } from "antd";
import {
  UploadOutlined,
  DownloadOutlined,
  ReloadOutlined,
  SwapOutlined,
  PlusOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import { useAddMoveBudget, useDebounce } from "@/hooks";
import { DataTablePanel, renderCurrency, renderBold } from "@/components/ui";
import { UploadBudgetFileModal } from "@/components/features/budget";

const { Text } = Typography;

// Generates dynamic year options: currentYear - 3 to currentYear + 1
const YEAR_OPTIONS = (() => {
  const cur = new Date().getFullYear();
  return Array.from({ length: 5 }, (_, i) => {
    const y = String(cur - 3 + i);
    return { value: y, label: `Tahun ${y}` };
  });
})();

export default function AddMoveBudgetPage() {
  const [searchValue, setSearchValue] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);

  const {
    params,
    handlePaginationChange,
    handleSearchChange,
    handleYearChange,
    budgetData,
    isLoading,
    isFetching,
    refetch,
    uploadAddBudget,
    isUploadingAdd,
    uploadMoveBudget,
    isUploadingMove,
  } = useAddMoveBudget();

  // Debounced search text
  useDebounce(
    () => {
      handleSearchChange(searchValue);
    },
    400,
    [searchValue],
  );

  const listData = budgetData?.results || [];
  const meta = budgetData?.meta || {};
  const totalItems = meta.count || 0;

  const columns = [
    {
      title: "No",
      key: "no",
      width: 70,
      align: "center",
      render: (_, __, index) =>
        (params.currentPage - 1) * params.pageSize + index + 1,
    },
    {
      title: "Group",
      dataIndex: "group_name",
      key: "group_name",
      width: 150,
      render: (val) => renderBold(val || "—"),
    },
    {
      title: "Quarter",
      dataIndex: "quarter",
      key: "quarter",
      width: 100,
      align: "center",
      render: (val) => (
        <span className="font-semibold text-slate-700">{val || "—"}</span>
      ),
    },
    {
      title: "Brand",
      dataIndex: "brand_code",
      key: "brand_code",
      width: 120,
      align: "center",
      render: (val) => val || "—",
    },
    {
      title: "Budget",
      dataIndex: "budget",
      key: "budget",
      width: 180,
      align: "right",
      render: (val) => (
        <span className="font-bold text-emerald-600">
          {renderCurrency(val)}
        </span>
      ),
    },
    {
      title: "Bulan",
      dataIndex: "nama_bulan",
      key: "nama_bulan",
      width: 120,
      align: "center",
      render: (val) => val || "—",
    },
    {
      title: "Activity",
      dataIndex: "activity_code",
      key: "activity_code",
      width: 140,
      align: "center",
      render: (val) => (
        <span className="font-mono text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
          {val || "—"}
        </span>
      ),
    },
    {
      title: "Keterangan",
      dataIndex: "keterangan",
      key: "keterangan",
      width: 250,
      render: (val) => val || "—",
    },
    {
      title: "Tahun",
      dataIndex: "year",
      key: "year",
      width: 90,
      align: "center",
      render: (val) => val || "—",
    },
  ];

  return (
    <>
      <DataTablePanel
        title="Add & Move Budget Support"
        description="Kelola alokasi budgeting produk, unggah penambahan budget (Add Budget), serta pemindahan budget (Move Budget) antar periode dan aktivitas."
        columns={columns}
        dataSource={listData}
        loading={isLoading || isFetching}
        rowKey={(row) =>
          row.id ||
          row.budget_id ||
          `${row.group_name}_${row.brand_code}_${row.activity_code}_${row.year}_${row.quarter}_${row.nama_bulan}`
        }
        scrollX={1200}
        pagination={{
          total: totalItems,
          pageSize: params.pageSize,
          current: params.currentPage,
          onChange: handlePaginationChange,
        }}
        searchProps={{
          placeholder: "Cari berdasarkan group, brand, atau keterangan...",
          value: searchValue,
          onChange: setSearchValue,
        }}
        filterBar={
          <div className="flex items-center gap-3 flex-wrap bg-slate-50/80 rounded-xl px-4 py-2.5 border border-slate-200/80">
            <FilterOutlined className="text-slate-400" />
            <Text className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
              Filter Tahun:
            </Text>
            <Select
              placeholder="Semua Tahun"
              allowClear
              value={params.budgetYear || undefined}
              onChange={(val) => handleYearChange(val || "")}
              options={YEAR_OPTIONS}
              size="middle"
              className="w-40"
            />
          </div>
        }
        extraHeaderActions={
          <Space size="middle" wrap>
            <Tooltip title="Upload data Add Budget baru">
              <Button
                type="primary"
                size="large"
                icon={<PlusOutlined />}
                onClick={() => setIsAddModalOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-700 border-emerald-600"
              >
                Upload Add Budget
              </Button>
            </Tooltip>

            <Tooltip title="Upload data Move Budget (Pindah Budget)">
              <Button
                type="primary"
                size="large"
                icon={<SwapOutlined />}
                onClick={() => setIsMoveModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 border-blue-600"
              >
                Upload Move Budget
              </Button>
            </Tooltip>

            <Tooltip title="Muat Ulang Data">
              <Button
                type="default"
                size="large"
                shape="circle"
                icon={
                  <ReloadOutlined
                    className={isFetching ? "animate-spin" : ""}
                  />
                }
                onClick={refetch}
                className="border-slate-300 text-slate-600 hover:text-emerald-600 hover:border-emerald-600"
              />
            </Tooltip>
          </Space>
        }
      />

      {/* Modal Upload Add Budget */}
      <UploadBudgetFileModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Upload Add Budget"
        description="Unggah file spreadsheet Excel untuk menambahkan alokasi budget baru ke dalam sistem."
        templateUrl="/templates/budget/TEMPLATE_TAMBAH_BUDGET.xlsx"
        templateFilename="TEMPLATE_TAMBAH_BUDGET.xlsx"
        onUpload={uploadAddBudget}
        isUploading={isUploadingAdd}
        confirmDescription="Apakah Anda yakin ingin menambahkan budget melalui file ini? Pastikan data sudah sesuai template."
        actionLabel="Simpan Add Budget"
        accentColor="emerald"
      />

      {/* Modal Upload Move Budget */}
      <UploadBudgetFileModal
        open={isMoveModalOpen}
        onClose={() => setIsMoveModalOpen(false)}
        title="Upload Move Budget"
        description="Unggah file spreadsheet Excel untuk memindahkan alokasi budget antar aktivitas / periode."
        templateUrl="/templates/budget/TEMPLATE_MOVE_BUDGET.xlsx"
        templateFilename="TEMPLATE_MOVE_BUDGET.xlsx"
        onUpload={uploadMoveBudget}
        isUploading={isUploadingMove}
        confirmDescription="Apakah Anda yakin ingin memproses pemindahan budget melalui file ini? Pastikan saldo mencukupi."
        actionLabel="Simpan Move Budget"
        accentColor="blue"
      />
    </>
  );
}
