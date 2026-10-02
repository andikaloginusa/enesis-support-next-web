"use client";

import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import {
  Button,
  Form,
  Space,
  Popconfirm,
  Tooltip,
  Select,
  DatePicker,
} from "antd";
import {
  DeleteOutlined,
  ReloadOutlined,
  EditOutlined,
  CloudUploadOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { useKlaim, useDebounce, useConfirm } from "@/hooks";
import {
  DataTablePanel,
  GenericFormModal,
  StatusBadge,
  renderCurrency,
  renderDate,
  renderDateTime,
  renderBold,
  renderTag,
} from "@/components/ui";
import { ReuploadKlaimDokumenModal } from "@/components/features/klaim/ReuploadKlaimDokumenModal";
import { KlaimDetailModal } from "@/components/features/klaim/KlaimDetailModal";
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

const DISTRIBUTOR_STATUS_OPTIONS = [
  { label: "Pengajuan - DR", value: "DR" },
  { label: "ECC Verifikasi - ECC", value: "ECC" },
  { label: "RSM Approved - RSM", value: "RSM" },
  { label: "Sales Head Approved - SHA", value: "SHA" },
  { label: "Distributor Kirim Dokumen - SEND", value: "SEND" },
  { label: "ECC terima dok. - RECEIVE", value: "RECEIVE" },
  { label: "Plan Payment - PLAN", value: "PLAN" },
  { label: "Payment Completed - PAY", value: "PAY" },
  { label: "Submit to SAP - SKP", value: "SKP" },
  { label: "Reject - RJC", value: "RJC" },
];

const DIRECT_STATUS_OPTIONS = [
  { label: "Pengajuan - DIRC1", value: "DIRC1" },
  { label: "KAM Approved - DIRC2", value: "DIRC2" },
  { label: "Sales Head Approved - DIRC3", value: "DIRC3" },
  { label: "Sales kirim dok. - DAD", value: "DAD" },
  { label: "ECC terima dok. - TDF", value: "TDF" },
  { label: "Plan Payment - APF", value: "APF" },
  { label: "Payment Completed - PAY", value: "PAY" },
  { label: "Submit to SAP - SKP", value: "SKP" },
  { label: "Reject - RJF", value: "RJF" },
];

function buildUpdateModalConfig({
  open,
  form,
  onCancel,
  onOk,
  confirmLoading,
  isDirect,
}) {
  const statusOptions = isDirect ? DIRECT_STATUS_OPTIONS : DISTRIBUTOR_STATUS_OPTIONS;

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
        options: statusOptions,
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

const buildColumns = ({ onEdit, onDelete, onReupload, onDetail }) => [
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
    render: (val) => renderDateTime(val),
  },
  {
    title: "Company",
    dataIndex: "company",
    key: "company",
    width: 110,
    render: (text) => (text ? renderBold(text) : "-"),
  },
  {
    title: "Region",
    dataIndex: "region",
    key: "region",
    width: 100,
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
    title: "Divisi",
    dataIndex: "divisi",
    key: "divisi",
    width: 120,
    render: (text) => text || "-",
  },
  {
    title: "Jenis Klaim",
    dataIndex: "jenis_klaim",
    key: "jenis_klaim",
    width: 130,
    render: (text) =>
      text ? renderTag(text, "purple") : "-",
  },
  {
    title: "Periode Klaim",
    dataIndex: "periode_klaim",
    key: "periode_klaim",
    width: 200,
    render: (text) => text || "-",
  },
  {
    title: "Vendor (NPWP)",
    key: "vendor",
    width: 220,
    render: (row) => (
      <div className="flex flex-col gap-0.5">
        <span className="font-semibold text-slate-700 text-xs truncate">
          {row.nama_npwp || "-"}
        </span>
        <span className="text-slate-400 text-[10px] truncate">
          {row.nomor_npwp || ""}
        </span>
      </div>
    ),
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
    title: "Disetujui (Sales)",
    dataIndex: "sales_approve_amount",
    key: "sales_approve_amount",
    width: 170,
    align: "right",
    render: (val) => renderCurrency(val),
  },
  {
    title: "Tgl Posting",
    dataIndex: "tanggal_posting",
    key: "tanggal_posting",
    width: 130,
    render: (val) => renderDate(val),
  },
  {
    title: "Doc SAP",
    dataIndex: "accounting_document_number",
    key: "accounting_document_number",
    width: 160,
    render: (text) => (text ? renderTag(text, "blue") : "-"),
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    width: 220,
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
        <Tooltip title="Lihat Detail Klaim">
          <Button
            type="default"
            shape="circle"
            icon={<EyeOutlined />}
            onClick={() => onDetail(row)}
            className="text-slate-600 border-slate-300 hover:!border-blue-400 hover:!text-blue-600 hover:!bg-blue-50"
          />
        </Tooltip>
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
        {row.is_direct_outlet && (
          <Tooltip title="Update Status Klaim">
            <Button
              type="primary"
              shape="circle"
              icon={<EditOutlined />}
              onClick={() => onEdit(row)}
              style={{ backgroundColor: BRAND_FOCUS_COLOR, borderColor: BRAND_FOCUS_COLOR }}
            />
          </Tooltip>
        )}
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
    handleFilterChange,
    resetParams,
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
  const [isDirectClaim, setIsDirectClaim] = useState(false);

  // ── Modal State: Re-upload Dokumen ──
  const [isReuploadModalOpen, setIsReuploadModalOpen] = useState(false);
  const [activeKlaim, setActiveKlaim] = useState(null); // { klaim_id, nomor_klaim }

  // ── Modal State: Detail Klaim ──
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [activeDetailKlaimId, setActiveDetailKlaimId] = useState(null);

  // ── Action Handlers: Update Status ──

  const openUpdateModal = (claim) => {
    setActiveClaimId(claim.klaim_id);
    setIsDirectClaim(Boolean(claim.is_direct_outlet));
    updateForm.resetFields();
    setIsUpdateModalOpen(true);
  };

  const closeUpdateModal = () => {
    updateForm.resetFields();
    setActiveClaimId(null);
    setIsDirectClaim(false);
    setIsUpdateModalOpen(false);
  };

  const handleUpdateStatusSubmit = async () => {
    try {
      const values = await updateForm.validateFields();
      const statusOptions = isDirectClaim ? DIRECT_STATUS_OPTIONS : DISTRIBUTOR_STATUS_OPTIONS;
      const selectedStatus = statusOptions.find(
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

  const openDetailModal = (claim) => {
    setActiveDetailKlaimId(claim.klaim_id);
    setIsDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setActiveDetailKlaimId(null);
    setIsDetailModalOpen(false);
  };

  // ── Column Definitions ──
  const columnsConfig = buildColumns({
    onEdit: openUpdateModal,
    onDelete: handleDeleteLogConfirm,
    onReupload: openReuploadModal,
    onDetail: openDetailModal,
  });

  const updateModalConfig = buildUpdateModalConfig({
    open: isUpdateModalOpen,
    form: updateForm,
    onCancel: closeUpdateModal,
    onOk: handleUpdateStatusSubmit,
    confirmLoading: loadingUpdateStatus,
    isDirect: isDirectClaim,
  });

  // ── Render ──
  return (
    <>
      {/* Filter Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Kode Status
            </label>
            <Select
              allowClear
              placeholder="Semua Status"
              className="w-full"
              value={params.kode_status || undefined}
              onChange={(v) => handleFilterChange("kode_status", v ?? "")}
              options={[...DISTRIBUTOR_STATUS_OPTIONS, ...DIRECT_STATUS_OPTIONS].map((opt) => ({
                value: opt.value,
                label: opt.label,
              }))}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Jenis Klaim
            </label>
            <Select
              allowClear
              placeholder="Semua Jenis"
              className="w-full"
              value={params.jenis_klaim || undefined}
              onChange={(v) => handleFilterChange("jenis_klaim", v ?? "")}
              options={[
                { value: "INFRA", label: "INFRA" },
                { value: "NON INFRA", label: "NON INFRA" },
              ]}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Fiscal Year
            </label>
            <Select
              allowClear
              placeholder="Semua Tahun"
              className="w-full"
              value={params.fiscal_year || undefined}
              onChange={(v) => handleFilterChange("fiscal_year", v ?? "")}
              options={[
                { value: "2024", label: "2024" },
                { value: "2025", label: "2025" },
                { value: "2026", label: "2026" },
                { value: "2027", label: "2027" },
              ]}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Tanggal Klaim (Dari)
            </label>
            <DatePicker
              format="YYYY-MM-DD"
              placeholder="YYYY-MM-DD"
              className="w-full"
              value={params.dateFrom ? dayjs(params.dateFrom) : null}
              onChange={(d) =>
                handleFilterChange("dateFrom", d ? d.format("YYYY-MM-DD") : "")
              }
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Tanggal Klaim (Sampai)
            </label>
            <DatePicker
              format="YYYY-MM-DD"
              placeholder="YYYY-MM-DD"
              className="w-full"
              value={params.dateTo ? dayjs(params.dateTo) : null}
              onChange={(d) =>
                handleFilterChange("dateTo", d ? d.format("YYYY-MM-DD") : "")
              }
            />
          </div>
          <div className="flex items-end">
            <Tooltip title="Reset semua filter">
              <Button
                block
                onClick={() => {
                  resetParams();
                  setSearchValue("");
                }}
              >
                Reset Filter
              </Button>
            </Tooltip>
          </div>
        </div>
      </div>

      <DataTablePanel
        title="Proposal Klaim Support"
        description="Kelola pengajuan proposal klaim, persetujuan SAP, dan tindakan reject log."
        columns={columnsConfig}
        dataSource={klaimList}
        loading={isListFetching}
        rowKey="klaim_id"
        scrollX={2400}
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

      {/* Detail Klaim Modal */}
      <KlaimDetailModal
        open={isDetailModalOpen}
        klaimId={activeDetailKlaimId}
        onClose={closeDetailModal}
      />
    </>
  );
}
