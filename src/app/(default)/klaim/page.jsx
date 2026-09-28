"use client";

import React, { useEffect, useState } from "react";
import {
  Button,
  Form,
  Space,
  Popconfirm,
  Tooltip,
} from "antd";
import {
  DeleteOutlined,
  ReloadOutlined,
  EditOutlined,
  CloudUploadOutlined,
} from "@ant-design/icons";
import { useKlaim, useDebounce, useConfirm } from "@/hooks";
import {
  DataTablePanel,
  GenericFormModal,
  StatusBadge,
  renderCurrency,
  renderDate,
  renderTruncated,
  renderBold,
  renderTag,
} from "@/components/ui";
import { ReuploadKlaimDokumenModal } from "@/components/features/klaim/ReuploadKlaimDokumenModal";
import { getUserId } from "@/utils/storage";
import { BRAND_FOCUS_COLOR } from "@/utils/constants";

// ─────────────────────────────────────────────────────────────────────────────
//  Status Badge Render for Klaim Table
// ─────────────────────────────────────────────────────────────────────────────

function KlaimStatusCell({ status }) {
  return <StatusBadge status={status} />;
}

// ─────────────────────────────────────────────────────────────────────────────
//  Modal Config Builder
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { label: "Pengajuan - DR", value: "DR" },
  { label: "ECC Verifikasi - ECC", value: "ECC" },
  { label: "RSM Approved - RSM", value: "RSM" },
  { label: "Sales Head Approved - SHA", value: "SHA" },
  { label: "Distributor Kirim Dokumen - SEND", value: "SEND" },
  { label: "ECC terima dok. - RECEIVE", value: "RECEIVE" },
  { label: "Plan Payment - PLAN", value: "PLAN" },
  { label: "Payment Completed - PAY", value: "PAY" },
  { label: "Reject - RJC", value: "RJC" },
];

function buildUpdateModalConfig({
  open,
  form,
  onCancel,
  onOk,
  confirmLoading,
  activeClaimId,
}) {
  return {
    title: "Update Status Proposal Klaim",
    description:
      "Ubah kode status pengajuan proposal klaim ini secara formal ke dalam sistem ERP.",
    open,
    form,
    onCancel,
    onOk,
    confirmLoading,
    okText: "Update Status",
    okButtonProps: {
      style: { backgroundColor: BRAND_FOCUS_COLOR, borderColor: BRAND_FOCUS_COLOR },
    },
    fields: [
      {
        name: "kode_status_baru",
        label: "Kode Status Baru",
        type: "select",
        placeholder: "Pilih kode status baru...",
        rules: [
          { required: true, message: "Harap pilih kode status baru!" },
        ],
        options: STATUS_OPTIONS,
      },
      {
        name: "reason",
        label: "Alasan Perubahan Status / Reject",
        type: "textarea",
        placeholder: "Berikan alasan penyesuaian kode status baru ini...",
        rules: [
          { required: true, message: "Harap berikan alasan perubahan status!" },
        ],
        rows: 4,
      },
    ],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
//  Column Definitions
// ─────────────────────────────────────────────────────────────────────────────

const buildColumns = ({ onEdit, onDelete, onReupload }) => [
  {
    title: "Nomor Klaim",
    dataIndex: "nomor_klaim",
    key: "nomor_klaim",
    fixed: "left",
    width: 240,
    render: (text) => renderBold(text),
  },
  {
    title: "Tanggal Klaim",
    dataIndex: "created",
    key: "created",
    width: 150,
    render: (val) => renderDate(val),
  },
  {
    title: "Leadtime",
    dataIndex: "leadTime",
    key: "leadTime",
    width: 150,
    render: (val) => renderDate(val),
  },
  {
    title: "Distributor",
    dataIndex: "nama",
    key: "nama",
    width: 180,
    render: (text) => renderTruncated(text, 170),
  },
  {
    title: "Total (Excl. PPN)",
    dataIndex: "total_klaim",
    key: "total_klaim",
    width: 160,
    align: "right",
    render: (val) => renderCurrency(val),
  },
  {
    title: "PPN",
    dataIndex: "nominal_pajak",
    key: "nominal_pajak",
    width: 130,
    align: "right",
    render: (val) => renderCurrency(val),
  },
  {
    title: "Klaim + PPN",
    key: "nominal_claimable",
    width: 165,
    align: "right",
    render: (row) => (
      <span className="font-bold text-[#1aac32]">
        {renderCurrency(row.nominal_claimable)}
      </span>
    ),
  },
  {
    title: "Doc SAP",
    dataIndex: "accounting_document_number",
    key: "accounting_document_number",
    width: 130,
    render: (text) => (text ? renderTag(text, "blue") : "-"),
  },
  {
    title: "Region",
    dataIndex: "region",
    key: "region",
    width: 120,
    render: (text) =>
      text ? (
        <span className="capitalize text-xs font-medium text-slate-600">
          {text.toLowerCase()}
        </span>
      ) : (
        "-"
      ),
  },
  {
    title: "Total Disetujui (Excl. PPN)",
    key: "sales_approve_amount",
    width: 180,
    align: "right",
    render: (row) => renderCurrency(row.sales_approve_amount),
  },
  {
    title: "Status",
    key: "status",
    width: 210,
    align: "center",
    render: (row) => <KlaimStatusCell status={row.status} />,
  },
  {
    title: "Aksi",
    key: "action",
    align: "center",
    fixed: "right",
    width: 230,
    render: (row) => (
      <Space size="middle">
        <Tooltip title="Re-upload Dokumen Klaim">
          <Button
            type="primary"
            shape="circle"
            icon={<CloudUploadOutlined />}
            onClick={() => onReupload(row)}
            style={{
              backgroundColor: "#2563eb",
              borderColor: "#2563eb",
            }}
          />
        </Tooltip>
        <Tooltip title="Update Status Klaim">
          <Button
            type="primary"
            shape="circle"
            icon={<EditOutlined />}
            onClick={() => onEdit(row)}
            style={{ backgroundColor: BRAND_FOCUS_COLOR, borderColor: BRAND_FOCUS_COLOR }}
          />
        </Tooltip>
        <Tooltip title="Hapus Log Submit">
          <Popconfirm
            title="Hapus Log Submit"
            description={`Apakah Anda yakin ingin menghapus log submit klaim ${row.nomor_klaim}?`}
            onConfirm={() => onDelete(row.klaim_id)}
            okText="Ya, Hapus"
            cancelText="Batal"
            okButtonProps={{ danger: true }}
            placement="topRight"
          >
            <Button
              type="dashed"
              danger
              shape="circle"
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </Tooltip>
      </Space>
    ),
  },
];

// ─────────────────────────────────────────────────────────────────────────────
//  Main Page Component
// ─────────────────────────────────────────────────────────────────────────────

export default function KlaimSupportPage() {
  const {
    klaimList,
    totalCount,
    isListFetching,
    params,
    handlePaginationChange,
    handleSearchChange,
    deleteLogSubmit,
    updateStatusKlaim,
    loadingUpdateStatus,
    loadingReupload,
    reuploadDokumenKlaim,
    refetchList,
  } = useKlaim();

  const { confirmAction } = useConfirm();

  // ── Search State ──
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearch = useDebounce(searchValue, 400);

  useEffect(() => {
    handleSearchChange(debouncedSearch);
  }, [debouncedSearch, handleSearchChange]);

  // ── Modal State: Update Status ──
  const [updateForm] = Form.useForm();
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [activeClaimId, setActiveClaimId] = useState(null);

  // ── Modal State: Re-upload Dokumen ──
  const [isReuploadModalOpen, setIsReuploadModalOpen] = useState(false);
  const [activeKlaim, setActiveKlaim] = useState(null); // { klaim_id, nomor_klaim }

  // ── Action Handlers: Update Status ──

  const openUpdateModal = (claim) => {
    setActiveClaimId(claim.klaim_id);
    updateForm.resetFields();
    setIsUpdateModalOpen(true);
  };

  const closeUpdateModal = () => {
    updateForm.resetFields();
    setActiveClaimId(null);
    setIsUpdateModalOpen(false);
  };

  const handleUpdateStatusSubmit = async () => {
    try {
      const values = await updateForm.validateFields();
      const selectedStatus = STATUS_OPTIONS.find(
        (opt) => opt.value === values.kode_status_baru
      );

      confirmAction({
        title: "Konfirmasi Perubahan Status Klaim",
        description:
          `Apakah Anda yakin ingin mengubah status klaim ini` +
          `${selectedStatus ? ` menjadi "${selectedStatus.label}"` : ""}?` +
          ` Perubahan akan langsung tercatat ke dalam sistem ERP.`,
        okText: "Ya, Ubah Status",
        onConfirm: async () => {
          await updateStatusKlaim({
            m_user_id: getUserId(),
            klaim_id: activeClaimId,
            kode_status_baru: values.kode_status_baru ?? "",
            reason: values.reason?.trim() ?? "",
          });
          closeUpdateModal();
        },
      });
    } catch {
      // Validation errors are highlighted automatically by Ant Design
    }
  };

  const handleDeleteLogConfirm = async (klaimId) => {
    await deleteLogSubmit(klaimId);
  };

  // ── Action Handlers: Re-upload Dokumen ──

  const openReuploadModal = (claim) => {
    setActiveKlaim({ klaim_id: claim.klaim_id, nomor_klaim: claim.nomor_klaim });
    setIsReuploadModalOpen(true);
  };

  const closeReuploadModal = () => {
    setActiveKlaim(null);
    setIsReuploadModalOpen(false);
  };

  const handleReuploadSubmit = async ({ klaim_id, document_type, reason, file }) => {
    confirmAction({
      title: "Konfirmasi Upload Ulang Dokumen Klaim",
      description:
        `Apakah Anda yakin ingin mengunggah ulang dokumen "${document_type}" untuk klaim ini? ` +
        `File sebelumnya akan diganti dengan yang baru.`,
      okText: "Ya, Upload Sekarang",
      onConfirm: async () => {
        await reuploadDokumenKlaim({
          m_user_id: getUserId(),
          klaim_id,
          document_type,
          reason,
          file,
        });
        closeReuploadModal();
      },
    });
  };

  // ── Column Definitions ──
  const columnsConfig = buildColumns({
    onEdit: openUpdateModal,
    onDelete: handleDeleteLogConfirm,
    onReupload: openReuploadModal,
  });

  const updateModalConfig = buildUpdateModalConfig({
    open: isUpdateModalOpen,
    form: updateForm,
    onCancel: closeUpdateModal,
    onOk: handleUpdateStatusSubmit,
    confirmLoading: loadingUpdateStatus,
    activeClaimId,
  });

  // ── Render ──
  return (
    <>
      <DataTablePanel
        title="Proposal Klaim Support"
        description="Kelola pengajuan proposal klaim, persetujuan SAP, dan tindakan reject log."
        columns={columnsConfig}
        dataSource={klaimList}
        loading={isListFetching}
        rowKey="klaim_id"
        scrollX={1850}
        pagination={{
          total: totalCount,
          pageSize: params.pageSize,
          current: params.currentPage,
          onChange: handlePaginationChange,
        }}
        searchProps={{
          placeholder: "Cari nomor klaim atau distributor...",
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

      {/* Update Status Modal */}
      <GenericFormModal {...updateModalConfig} />

      {/* Re-upload Dokumen Modal */}
      <ReuploadKlaimDokumenModal
        open={isReuploadModalOpen}
        onCancel={closeReuploadModal}
        onSubmit={handleReuploadSubmit}
        confirmLoading={loadingReupload}
        klaimId={activeKlaim?.klaim_id}
        klaimNo={activeKlaim?.nomor_klaim}
      />
    </>
  );
}
