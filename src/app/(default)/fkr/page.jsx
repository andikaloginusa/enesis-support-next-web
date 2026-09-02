"use client";

import React, { useEffect, useState } from "react";
import { Button, Form, Space, Tooltip } from "antd";
import { EyeOutlined, CloseCircleOutlined, ReloadOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useFkr, useDebounce } from "@/hooks";
import { getUserId } from "@/utils/storage";
import {
  DataTablePanel,
  GenericFormModal,
  StatusBadge,
  renderCurrency,
  renderDate,
  renderTruncated,
  renderBold,
  renderMedium,
} from "@/components/ui";

// ─────────────────────────────────────────────────────────────────────────────
//  Modal Config Builder
// ─────────────────────────────────────────────────────────────────────────────

const REJECT_MODAL_CONFIG = {
  title: "Reject Formulir Klaim Ritel (FKR)",
  buildDescription: (fkrNo) =>
    `Harap masukkan alasan penolakan formal untuk dokumen FKR nomor ${fkrNo}. Tindakan ini tidak dapat dibatalkan.`,
  okText: "Reject Sekarang",
  okButtonProps: { danger: true },
  fields: [
    {
      name: "reason",
      label: "Alasan Penolakan",
      type: "textarea",
      placeholder: "Masukkan alasan detail penolakan...",
      rules: [{ required: true, message: "Alasan penolakan harus diisi!" }],
      rows: 4,
    },
  ],
};

function buildRejectModalConfig({ open, form, onCancel, onOk, confirmLoading, fkrNo }) {
  return {
    title: REJECT_MODAL_CONFIG.title,
    description: REJECT_MODAL_CONFIG.buildDescription(fkrNo),
    open,
    form,
    onCancel,
    onOk,
    confirmLoading,
    okText: REJECT_MODAL_CONFIG.okText,
    okButtonProps: REJECT_MODAL_CONFIG.okButtonProps,
    fields: REJECT_MODAL_CONFIG.fields,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
//  Column Definitions
// ─────────────────────────────────────────────────────────────────────────────

const buildColumns = ({ onView, onReject }) => [
  {
    title: "Nomor FKR",
    dataIndex: "nomor_fkr",
    key: "nomor_fkr",
    fixed: "left",
    width: 200,
    render: (text) => renderBold(text),
  },
  {
    title: "Tanggal Pengajuan",
    dataIndex: "created",
    key: "created",
    width: 160,
    render: (val) => renderDate(val),
  },
  {
    title: "Distributor",
    dataIndex: "nama_distributor",
    key: "nama_distributor",
    width: 250,
    render: (text) => renderTruncated(text, 240),
  },
  {
    title: "Pemohon",
    dataIndex: "nama_requester",
    key: "nama_requester",
    width: 180,
    render: (text) => renderMedium(text),
  },
  {
    title: "Nominal FKR",
    dataIndex: "nominal_fkr",
    key: "nominal_fkr",
    width: 180,
    align: "right",
    render: (val) => renderCurrency(val, { color: "emerald" }),
  },
  {
    title: "Status",
    key: "status",
    width: 160,
    align: "center",
    render: (row) => <StatusBadge status={row.status} />,
  },
  {
    title: "Aksi",
    key: "action",
    align: "center",
    fixed: "right",
    width: 140,
    render: (row) => (
      <Space size="middle">
        <Tooltip title="Lihat Detail FKR">
          <Button
            type="primary"
            shape="circle"
            icon={<EyeOutlined />}
            onClick={() => onView(row)}
            style={{ backgroundColor: "#1677ff", borderColor: "#1677ff" }}
          />
        </Tooltip>
        {row.status !== "REJECTED" && (
          <Tooltip title="Reject FKR">
            <Button
              type="primary"
              danger
              shape="circle"
              icon={<CloseCircleOutlined />}
              onClick={() => onReject(row)}
            />
          </Tooltip>
        )}
      </Space>
    ),
  },
];

// ─────────────────────────────────────────────────────────────────────────────
//  Main Page Component
// ─────────────────────────────────────────────────────────────────────────────

export default function FkrSupportPage() {
  const router = useRouter();

  const {
    fkrList,
    totalCount,
    isListFetching,
    params,
    handlePaginationChange,
    handleSearchChange,
    rejectFkr,
    isRejecting,
    refetchList,
  } = useFkr();

  // ── Search State ──
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearch = useDebounce(searchValue, 400);

  useEffect(() => {
    handleSearchChange(debouncedSearch);
  }, [debouncedSearch, handleSearchChange]);

  // ── Modal State ──
  const [rejectForm] = Form.useForm();
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [activeFkr, setActiveFkr] = useState({ id: null, no: "" });

  // ── Action Handlers ──

  const openRejectModal = (fkr) => {
    setActiveFkr({ id: fkr.fkr_id, no: fkr.nomor_fkr });
    rejectForm.resetFields();
    setIsRejectModalOpen(true);
  };

  const closeRejectModal = () => {
    rejectForm.resetFields();
    setActiveFkr({ id: null, no: "" });
    setIsRejectModalOpen(false);
  };

  const handleRejectSubmit = async () => {
    try {
      const values = await rejectForm.validateFields();
      await rejectFkr({
        fkr_id: activeFkr.id,
        reason: values.reason?.trim() ?? "",
        kode_status: "RJC",
        m_user_id: getUserId(),
      });
      closeRejectModal();
    } catch {
      // Validation errors handled by Ant Design
    }
  };

  // ── Column Definitions ──
  const columnsConfig = buildColumns({
    onView: (row) => router.push(`/fkr/${row.fkr_id}`),
    onReject: openRejectModal,
  });

  const rejectModalConfig = buildRejectModalConfig({
    open: isRejectModalOpen,
    form: rejectForm,
    onCancel: closeRejectModal,
    onOk: handleRejectSubmit,
    confirmLoading: isRejecting,
    fkrNo: activeFkr.no,
  });

  // ── Render ──
  return (
    <>
      <DataTablePanel
        title="Formulir Klaim Ritel (FKR) Support"
        description="Kelola pengajuan, detail persetujuan, dan tindakan reject untuk modul Formulir Klaim Ritel."
        columns={columnsConfig}
        dataSource={fkrList}
        loading={isListFetching}
        rowKey="fkr_id"
        pagination={{
          total: totalCount,
          pageSize: params.pageSize,
          current: params.currentPage,
          onChange: handlePaginationChange,
        }}
        searchProps={{
          placeholder: "Cari nomor FKR, distributor, atau pemohon...",
          value: searchValue,
          onChange: setSearchValue,
        }}
        extraHeaderActions={
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
        }
      />

      <GenericFormModal {...rejectModalConfig} />
    </>
  );
}
