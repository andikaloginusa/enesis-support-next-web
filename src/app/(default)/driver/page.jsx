"use client";

import React, { useState } from "react";
import { Button, Space, Tooltip } from "antd";
import { EditOutlined, ReloadOutlined } from "@ant-design/icons";
import { useDriver } from "@/hooks/queries/useDriver";
import { useDebounce } from "@/hooks/useDebounce";
import { DataTablePanel, renderMono } from "@/components/ui";
import { renderDateTime } from "@/components/ui/ColumnRenderers";
import { UpdateDriverTransporterModal } from "@/components/features/driver/UpdateDriverTransporterModal";
import { BRAND_FOCUS_COLOR } from "@/utils/constants";

// ─────────────────────────────────────────────────────────────────────────────
// Column Definitions
// ─────────────────────────────────────────────────────────────────────────────

const buildColumns = ({ onUpdateTransporter }) => [
  {
    title: "Kode Driver",
    dataIndex: "kode",
    key: "kode",
    fixed: "left",
    width: 140,
    render: (text) => renderMono(text || "-"),
  },
  {
    title: "Nama Driver",
    dataIndex: "nama",
    key: "nama",
    width: 220,
    render: (text) => <span className="text-sm text-slate-700">{text || "-"}</span>,
  },
  {
    title: "Kode Transporter",
    dataIndex: "kode_transporter",
    key: "kode_transporter",
    width: 150,
    render: (text) => renderMono(text || "-"),
  },
  {
    title: "Nama Transporter",
    dataIndex: "nama_transporter",
    key: "nama_transporter",
    width: 260,
    render: (text) => (
      <span className="text-sm text-slate-700">{text || "-"}</span>
    ),
  },
  {
    title: "No. HP",
    dataIndex: "nomor_hp",
    key: "nomor_hp",
    width: 160,
    render: (text) => renderMono(text || "-"),
  },
  {
    title: "No. KTP",
    dataIndex: "nomor_ktp",
    key: "nomor_ktp",
    width: 170,
    render: (text) => renderMono(text || "-"),
  },
  {
    title: "No. SIM",
    dataIndex: "nomor_sim",
    key: "nomor_sim",
    width: 170,
    render: (text) => renderMono(text || "-"),
  },
  {
    title: "Tgl Lahir",
    dataIndex: "tgl_lahir",
    key: "tgl_lahir",
    width: 140,
    render: (text) => renderDateTime(text),
  },
  {
    title: "Aksi",
    key: "action",
    align: "center",
    fixed: "right",
    width: 120,
    render: (_, row) => (
      <Tooltip title="Update Transporter Driver">
        <Button
          type="primary"
          shape="circle"
          icon={<EditOutlined />}
          onClick={() => onUpdateTransporter(row)}
          style={{
            backgroundColor: BRAND_FOCUS_COLOR,
            borderColor: BRAND_FOCUS_COLOR,
          }}
        />
      </Tooltip>
    ),
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Main Page Component
// ─────────────────────────────────────────────────────────────────────────────

export default function DriverPage() {
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearch = useDebounce(searchValue, 400);

  const {
    driverList,
    isListFetching,
    refetchList,
    updateDriverTransporter,
    isUpdatingDriverTransporter,
  } = useDriver({ searchText: debouncedSearch });

  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [activeRow, setActiveRow] = useState(null);

  const openUpdateModal = (row) => {
    setActiveRow(row);
    setIsUpdateModalOpen(true);
  };

  const closeUpdateModal = () => {
    setIsUpdateModalOpen(false);
    setActiveRow(null);
  };

  const handleUpdateSubmit = async ({ m_driver_id, m_transporter_id }) => {
    try {
      await updateDriverTransporter({ m_driver_id, m_transporter_id });
      closeUpdateModal();
    } catch {
      /* notifikasi error ditangani oleh hook useDriver */
    }
  };

  const columns = buildColumns({ onUpdateTransporter: openUpdateModal });

  return (
    <>
      <DataTablePanel
        title="Driver Support"
        description="Kelola data driver dan perpindahan transporter. Backend membatasi 10 baris per request, gunakan pencarian untuk menyaring data."
        columns={columns}
        dataSource={driverList}
        loading={isListFetching}
        rowKey={(row) => row.m_driver_id}
        scrollX={1500}
        searchProps={{
          placeholder: "Cari kode/nama driver, KTP, SIM, HP, atau transporter...",
          value: searchValue,
          onChange: setSearchValue,
        }}
        extraHeaderActions={
          <Space size="middle">
            <Tooltip title="Muat Ulang Data">
              <Button
                type="default"
                shape="circle"
                size="middle"
                icon={
                  <ReloadOutlined className={isListFetching ? "animate-spin" : ""} />
                }
                onClick={() => refetchList()}
              />
            </Tooltip>
          </Space>
        }
        emptyText="Tidak ada data driver yang cocok dengan kata kunci pencarian."
      />

      <UpdateDriverTransporterModal
        open={isUpdateModalOpen}
        driver={activeRow}
        onCancel={closeUpdateModal}
        onSubmit={handleUpdateSubmit}
        confirmLoading={isUpdatingDriverTransporter}
      />
    </>
  );
}
