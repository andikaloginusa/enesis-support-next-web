"use client";

import React, { useEffect, useState } from "react";
import { Button, Space, Tooltip } from "antd";
import {
  EditOutlined,
  EyeOutlined,
  FileTextOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useConfirm, useDebounce } from "@/hooks";
import { useDataApprovalDirectOutlet } from "@/hooks/queries/useDataApprovalDirectOutlet";
import {
  DataTablePanel,
  renderBold,
  renderMedium,
  renderMono,
  renderTruncated,
} from "@/components/ui";
import { DirectOutletDetailModal } from "@/components/features/data-approval-direct-outlet/DirectOutletDetailModal";
import { UpdateNikKamModal } from "@/components/features/data-approval-direct-outlet/UpdateNikKamModal";
import {
  DATA_APPROVAL_DIRECT_OUTLET_ID_FIELD,
  DIRECT_OUTLET_KODE_VENDOR_FIELD,
  DIRECT_OUTLET_NAMA_KAM_FIELD,
  DIRECT_OUTLET_NAMA_OUTLET_FIELD,
  DIRECT_OUTLET_NAMA_PT_FIELD,
  DIRECT_OUTLET_NIK_KAM_FIELD,
  DIRECT_OUTLET_PAYMENT_FIELD,
} from "@/config/dataApprovalDirectOutletConfig";
import { BRAND_FOCUS_COLOR } from "@/utils/constants";

const LIST_ROUTE = "/data-approval-direct-outlet";

// ─────────────────────────────────────────────────────────────────────────────
//  Column Definitions
// ─────────────────────────────────────────────────────────────────────────────

const buildColumns = ({ onView, onOpenDetailPage, onUpdate }) => [
  {
    title: "Kode Vendor",
    dataIndex: DIRECT_OUTLET_KODE_VENDOR_FIELD,
    key: DIRECT_OUTLET_KODE_VENDOR_FIELD,
    fixed: "left",
    width: 200,
    render: (text) => renderBold(text),
  },

  {
    title: "Nama Outlet",
    dataIndex: DIRECT_OUTLET_NAMA_OUTLET_FIELD,
    key: DIRECT_OUTLET_NAMA_OUTLET_FIELD,
    width: 200,
    render: (text) => renderBold(text),
  },
  {
    title: "Nama PT",
    dataIndex: DIRECT_OUTLET_NAMA_PT_FIELD,
    key: DIRECT_OUTLET_NAMA_PT_FIELD,
    width: 240,
    render: (text) => renderMedium(text),
  },
  {
    title: "Payment",
    dataIndex: DIRECT_OUTLET_PAYMENT_FIELD,
    key: DIRECT_OUTLET_PAYMENT_FIELD,
    width: 280,
    render: (text) => renderTruncated(text, 220),
  },
  {
    title: "NIK KAM",
    dataIndex: DIRECT_OUTLET_NIK_KAM_FIELD,
    key: DIRECT_OUTLET_NIK_KAM_FIELD,
    width: 180,
    render: (text) => renderMono(text),
  },
  {
    title: "Nama KAM",
    dataIndex: DIRECT_OUTLET_NAMA_KAM_FIELD,
    key: DIRECT_OUTLET_NAMA_KAM_FIELD,
    width: 260,
    render: (text) => renderMedium(text),
  },
  {
    title: "Aksi",
    key: "action",
    align: "center",
    fixed: "right",
    width: 170,
    render: (_, row) => (
      <Space size="small">
        <Tooltip title="Lihat Detail">
          <Button
            type="default"
            shape="circle"
            icon={<EyeOutlined />}
            onClick={() => onView(row)}
            className="text-slate-600 border-slate-300 hover:!border-blue-400 hover:!text-blue-600 hover:!bg-blue-50"
          />
        </Tooltip>
        <Tooltip title="Buka Halaman Detail">
          <Button
            type="default"
            shape="circle"
            icon={<FileTextOutlined />}
            onClick={() => onOpenDetailPage(row)}
            className="text-slate-600 border-slate-300 hover:!border-cyan-400 hover:!text-cyan-600 hover:!bg-cyan-50"
          />
        </Tooltip>
        <Tooltip title="Update NIK KAM">
          <Button
            type="primary"
            shape="circle"
            icon={<EditOutlined />}
            onClick={() => onUpdate(row)}
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

export default function DataApprovalDirectOutletPage() {
  const { confirmAction } = useConfirm();
  const router = useRouter();

  const {
    outletList,
    totalCount,
    isListFetching,
    params,
    handlePaginationChange,
    handleSearchChange,
    updateNikKam,
    isUpdatingNikKam,
    refetchList,
  } = useDataApprovalDirectOutlet();

  // ── Search State ──
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearch = useDebounce(searchValue, 400);

  useEffect(() => {
    handleSearchChange(debouncedSearch);
  }, [debouncedSearch, handleSearchChange]);

  // ── Modal State ──
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [activeRow, setActiveRow] = useState(null);
  const [updateError, setUpdateError] = useState("");

  const openDetailModal = (row) => {
    setActiveRow(row);
    setIsDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setActiveRow(null);
  };

  const openUpdateModal = (row) => {
    setActiveRow(row);
    setUpdateError("");
    setIsUpdateModalOpen(true);
  };

  const closeUpdateModal = () => {
    setIsUpdateModalOpen(false);
    setActiveRow(null);
    setUpdateError("");
  };

  const goToDetailPage = (row) => {
    router.push(`${LIST_ROUTE}/${row[DATA_APPROVAL_DIRECT_OUTLET_ID_FIELD]}`);
  };

  const handleUpdateSubmit = async (payload) => {
    confirmAction({
      title: "Konfirmasi Update NIK KAM",
      description:
        `Apakah Anda yakin ingin memperbarui NIK KAM untuk kode vendor ` +
        `"${activeRow?.[DIRECT_OUTLET_KODE_VENDOR_FIELD] ?? "-"}"? ` +
        `NIK KAM baru: "${payload[DIRECT_OUTLET_NIK_KAM_FIELD]}".`,
      okText: "Ya, Perbarui",
      onConfirm: async () => {
        try {
          await updateNikKam({
            [DATA_APPROVAL_DIRECT_OUTLET_ID_FIELD]:
              activeRow?.[DATA_APPROVAL_DIRECT_OUTLET_ID_FIELD],
            ...payload,
          });
          closeUpdateModal();
        } catch (error) {
          // Pesan error asli dari backend ditampilkan di dalam modal.
          setUpdateError(error?.message || "");
        }
      },
    });
  };

  const columns = buildColumns({
    onView: openDetailModal,
    onOpenDetailPage: goToDetailPage,
    onUpdate: openUpdateModal,
  });

  return (
    <>
      <DataTablePanel
        title="Data Approval Direct Outlet"
        description="Daftar persetujuan direct outlet beserta KAM yang Handles, perbarui NIK KAM bila data KAM keliru."
        columns={columns}
        dataSource={outletList}
        loading={isListFetching}
        rowKey={DATA_APPROVAL_DIRECT_OUTLET_ID_FIELD}
        scrollX={1600}
        pagination={{
          total: totalCount,
          pageSize: params.pageSize,
          current: params.currentPage,
          onChange: handlePaginationChange,
        }}
        searchProps={{
          placeholder:
            "Cari kode vendor, nama outlet, nama PT, NIK KAM, atau nama KAM...",
          value: searchValue,
          onChange: setSearchValue,
        }}
        extraHeaderActions={
          <Space size="middle">
            <Tooltip title="Muat Ulang Data">
              <Button
                type="default"
                shape="circle"
                icon={
                  <ReloadOutlined
                    className={isListFetching ? "animate-spin" : ""}
                  />
                }
                onClick={() => refetchList()}
              />
            </Tooltip>
          </Space>
        }
        emptyText="Tidak ada data approval direct outlet yang cocok dengan pencarian Anda."
      />

      {/* Quick view — isi sesuai data pada baris tabel */}
      <DirectOutletDetailModal
        open={isDetailModalOpen}
        record={activeRow}
        onClose={closeDetailModal}
        onOpenDetailPage={() => {
          const row = activeRow;
          closeDetailModal();
          if (row) goToDetailPage(row);
        }}
      />

      {/* Update NIK KAM */}
      <UpdateNikKamModal
        open={isUpdateModalOpen}
        record={activeRow}
        onCancel={closeUpdateModal}
        onSubmit={handleUpdateSubmit}
        confirmLoading={isUpdatingNikKam}
        errorDetails={updateError}
      />
    </>
  );
}
