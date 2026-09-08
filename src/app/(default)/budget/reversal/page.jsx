"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Space, Tooltip, Tag } from "antd";
import {
  UploadOutlined,
  DownloadOutlined,
  ReloadOutlined,
  EyeOutlined,
  FileExcelOutlined,
} from "@ant-design/icons";
import { useReversalBudget, useDebounce } from "@/hooks";
import { DataTablePanel, renderDate, renderBold } from "@/components/ui";
import { UploadReversalModal } from "@/components/features/budget";

export default function ReversalBudgetPage() {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const {
    params,
    handlePaginationChange,
    handleSearchChange,
    headersData,
    isHeadersLoading,
    isHeadersFetching,
    refetchHeaders,
    uploadReversal,
    isUploading,
    generateProcessCode,
  } = useReversalBudget();

  // Debounced search for Kode Proses
  useDebounce(
    () => {
      handleSearchChange(searchValue);
    },
    400,
    [searchValue],
  );

  const listData = headersData?.results || [];
  const meta = headersData?.meta || {};
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
      title: "Nama Pengirim",
      dataIndex: "created_by",
      key: "created_by",
      width: 180,
      render: (val) => renderBold(val || "—"),
    },
    {
      title: "Waktu Kirim",
      dataIndex: "created_date",
      key: "created_date",
      width: 180,
      align: "center",
      render: (val) => renderDate(val),
    },
    {
      title: "File Excel",
      dataIndex: "excel",
      key: "excel",
      width: 250,
      render: (val) => (
        <div className="flex items-center gap-1.5 text-slate-600 text-xs font-mono">
          <FileExcelOutlined className="text-emerald-600" />
          <span className="truncate">{val || "—"}</span>
        </div>
      ),
    },
    {
      title: "Kode Proses",
      dataIndex: "kode_proses",
      key: "kode_proses",
      width: 180,
      align: "center",
      render: (val) => (
        <Tag color="blue" className="font-mono font-semibold px-2 py-0.5">
          {val || "—"}
        </Tag>
      ),
    },
    {
      title: "Aksi",
      key: "action",
      width: 110,
      align: "center",
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<EyeOutlined />}
          onClick={() =>
            router.push(
              `/budget/reversal/${record.reversal_header_id}/${record.kode_proses}`,
            )
          }
          className="bg-emerald-600 hover:bg-emerald-700 border-emerald-600"
        >
          Detail
        </Button>
      ),
    },
  ];

  return (
    <>
      <DataTablePanel
        title="Reversal Budget Header Support"
        description="Kelola dan pantau riwayat unggahan data Reversal Budget, validasi kode proses, serta status approval budget."
        columns={columns}
        dataSource={listData}
        loading={isHeadersLoading || isHeadersFetching}
        rowKey={(row) => row.reversal_header_id || row.kode_proses}
        scrollX={1000}
        pagination={{
          total: totalItems,
          pageSize: params.pageSize,
          current: params.currentPage,
          onChange: handlePaginationChange,
        }}
        searchProps={{
          placeholder: "Cari berdasarkan kode proses...",
          value: searchValue,
          onChange: setSearchValue,
        }}
        extraHeaderActions={
          <Space size="middle">
            <Tooltip title="Upload data Reversal Budget baru">
              <Button
                type="primary"
                size="large"
                icon={<UploadOutlined />}
                onClick={() => setIsUploadModalOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-700 border-emerald-600"
              >
                Upload Reversal
              </Button>
            </Tooltip>

            <Tooltip title="Unduh format template Excel untuk Reversal Budget">
              <Button
                type="default"
                size="large"
                icon={<DownloadOutlined />}
                href="/templates/budget/TEMPLATE_REVERSE_BUDGET.xlsx"
                download="TEMPLATE_REVERSE_BUDGET.xlsx"
                className="border-slate-300 text-slate-700 hover:text-emerald-600 hover:border-emerald-600"
              >
                Download Template
              </Button>
            </Tooltip>

            <Tooltip title="Muat Ulang Data">
              <Button
                type="default"
                size="large"
                shape="circle"
                icon={
                  <ReloadOutlined
                    className={isHeadersFetching ? "animate-spin" : ""}
                  />
                }
                onClick={refetchHeaders}
                className="border-slate-300 text-slate-600 hover:text-emerald-600 hover:border-emerald-600"
              />
            </Tooltip>
          </Space>
        }
      />

      {/* Modal Upload Reversal */}
      <UploadReversalModal
        open={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={uploadReversal}
        isUploading={isUploading}
        generateProcessCode={generateProcessCode}
      />
    </>
  );
}
