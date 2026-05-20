"use client";

import React, { useEffect, useState } from "react";
import {
  Button,
  Tag,
  Space,
  Typography,
  Tooltip,
  Select,
} from "antd";
import {
  EyeOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import moment from "moment";
import { useRouter } from "next/navigation";
import { useProposal, useDebounce } from "@/hooks";
import { DataTablePanel } from "@/components/ui";

const { Text } = Typography;

// ==========================================
// 1. Formatters & Utility Helpers
// ==========================================

const formatCurrency = (val) => {
  if (val === null || val === undefined) return "-";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(val);
};

const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  return moment(dateStr).format("DD MMM YYYY");
};

export default function ProposalSupportPage() {
  const router = useRouter();

  // ==========================================
  // 2. React Query Hook State & Actions
  // ==========================================
  const {
    proposalList,
    totalCount,
    isListFetching,
    params,
    handlePaginationChange,
    handleSearchChange,
    handleFilterChange,
    refetchList,
  } = useProposal();

  // Local debounced search binding
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearch = useDebounce(searchValue, 400);

  useEffect(() => {
    handleSearchChange(debouncedSearch);
  }, [debouncedSearch, handleSearchChange]);

  // ==========================================
  // 3. Columns Configuration Declarations
  // ==========================================

  const columnsConfig = [
    {
      title: "Nomor Proposal",
      dataIndex: "documentno",
      key: "documentno",
      fixed: "left",
      width: 220,
      render: (text, row) => (
        <Text className="font-semibold text-slate-800">
          {text || row.nomor_proposal || row.nomor || row.reference_no || "-"}
        </Text>
      ),
    },
    {
      title: "Tanggal Pengajuan",
      dataIndex: "documentdate",
      key: "documentdate",
      width: 160,
      render: (val, row) => formatDate(val || row.created || row.tanggal_pengajuan),
    },
    {
      title: "Divisi",
      dataIndex: "division_code",
      key: "division_code",
      width: 120,
      render: (text, row) => <Text className="font-medium text-slate-700">{text || row.division || "-"}</Text>,
    },
    {
      title: "Nama Proposal",
      dataIndex: "name",
      key: "name",
      width: 280,
      render: (text, row) => (
        <Tooltip title={text || row.nama_vendor || row.nama_requester || "-"}>
          <Text className="block truncate max-w-[270px] font-medium text-slate-600">
            {text || row.nama_vendor || row.nama_requester || "-"}
          </Text>
        </Tooltip>
      ),
    },
    {
      title: "Nominal",
      dataIndex: "budget",
      key: "budget",
      width: 180,
      align: "right",
      render: (val, row) => (
        <Text className="font-semibold text-blue-600">
          {formatCurrency(val ?? row.amount ?? row.nominal ?? row.nominal_proposal ?? 0)}
        </Text>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 160,
      align: "center",
      render: (val, row) => {
        const rawStatus = (val || row.fcstatus || "PENDING").toLowerCase();
        let color = "processing";
        if (rawStatus === "approved" || rawStatus === "apr" || rawStatus === "y" || rawStatus === "success") color = "success";
        if (rawStatus === "rejected" || rawStatus === "failed" || rawStatus === "reject" || rawStatus === "n") color = "error";
        if (rawStatus === "waiting approval" || rawStatus === "draft" || rawStatus === "pending" || rawStatus === "on progress") color = "warning";

        return (
          <Tag color={color} className="font-semibold uppercase px-2 py-0.5 rounded border-none">
            {val || row.fcstatus || "PENDING"}
          </Tag>
        );
      },
    },
    {
      title: "Aksi",
      key: "action",
      align: "center",
      fixed: "right",
      width: 120,
      render: (row) => (
        <Tooltip title="Lihat Detail Proposal">
          <Button
            type="primary"
            shape="circle"
            icon={<EyeOutlined />}
            onClick={() => router.push(`/proposal/${row.proposal_id || row.id || row.fkr_id}`)}
            className="bg-blue-600 hover:bg-blue-700 border-blue-600"
          />
        </Tooltip>
      ),
    },
  ];

  // ==========================================
  // 4. Declarative Layout Render
  // ==========================================
  return (
    <DataTablePanel
      title="Proposal Support"
      description="Kelola pengajuan, detail proposal divisi, status verifikasi, dan pantau persetujuan workflow."
      columns={columnsConfig}
      dataSource={proposalList}
      loading={isListFetching}
      rowKey={(row) => row.proposal_id || row.id || row.fkr_id}
      pagination={{
        total: totalCount,
        pageSize: params.pageSize,
        current: params.currentPage,
        onChange: handlePaginationChange,
      }}
      searchProps={{
        placeholder: "Cari nomor proposal, divisi, atau pemohon...",
        value: searchValue,
        onChange: setSearchValue,
      }}
      extraHeaderActions={
        <Space size="middle">
          {/* Division Filter */}
          <Select
            placeholder="Pilih Divisi"
            allowClear
            style={{ width: 150 }}
            onChange={(val) => handleFilterChange("division", val)}
            options={[
              { value: "MM", label: "MM" },
              { value: "MT", label: "MT" },
              { value: "GT", label: "GT" },
              { value: "ECOM", label: "ECOM" },
              { value: "PHAR", label: "PHAR" },
            ]}
            className="font-medium"
          />

          {/* FC Status Filter */}
          <Select
            placeholder="Pilih Status"
            allowClear
            style={{ width: 140 }}
            onChange={(val) => handleFilterChange("fcstatus", val)}
            options={[
              { value: "Draft", label: "Draft" },
              { value: "Pending", label: "Pending" },
              { value: "Approved", label: "Approved" },
              { value: "Rejected", label: "Rejected" },
            ]}
            className="font-medium"
          />

          <Tooltip title="Muat Ulang Data">
            <Button
              type="default"
              shape="circle"
              size="large"
              icon={<ReloadOutlined className={isListFetching ? "spin" : ""} />}
              onClick={() => refetchList()}
            />
          </Tooltip>
        </Space>
      }
    />
  );
}
