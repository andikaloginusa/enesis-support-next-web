"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button, Space, Tooltip } from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { usePartnerBank, useDebounce, useConfirm } from "@/hooks";
import {
  DataTablePanel,
  renderBold,
  renderMedium,
  renderMono,
  renderTruncated,
} from "@/components/ui";
import { PartnerBankFormModal } from "@/components/features/partner-bank/PartnerBankFormModal";
import { PartnerBankDetailModal } from "@/components/features/partner-bank/PartnerBankDetailModal";
import {
  PARTNER_BANK_ID_FIELD,
  PARTNER_BANK_CODE_FIELD,
  toPartnerBankFormValues,
} from "@/config/partnerBankConfig";
import { BRAND_FOCUS_COLOR } from "@/utils/constants";

// ─────────────────────────────────────────────────────────────────────────────
//  Column Definitions
// ─────────────────────────────────────────────────────────────────────────────

const buildColumns = ({ onView, onEdit, onDelete, isDeleting }) => [
  {
    title: "Kode Cabang",
    dataIndex: PARTNER_BANK_CODE_FIELD,
    key: PARTNER_BANK_CODE_FIELD,
    fixed: "left",
    width: 160,
    render: (text) => renderBold(text),
  },
  {
    title: "Bank Key",
    dataIndex: "bank_key",
    key: "bank_key",
    width: 160,
    render: (text) => renderMono(text),
  },
  {
    title: "Nomor Rekening",
    dataIndex: "bank_account",
    key: "bank_account",
    width: 200,
    render: (text) => renderMono(text),
  },
  {
    title: "Part Bank Key",
    dataIndex: "part_bank_key",
    key: "part_bank_key",
    width: 160,
    render: (text) => renderMono(text),
  },
  {
    title: "Referensi",
    dataIndex: "reference_details",
    key: "reference_details",
    width: 260,
    render: (text) => renderTruncated(text, 220),
  },
  {
    title: "Pemegang Rekening",
    dataIndex: "account_holder",
    key: "account_holder",
    width: 280,
    render: (text) => renderMedium(text),
  },
  {
    title: "Aksi",
    key: "action",
    align: "center",
    fixed: "right",
    width: 160,
    render: (row) => (
      <Space size="middle">
        <Tooltip title="Lihat Detail Partner Bank">
          <Button
            type="default"
            shape="circle"
            icon={<EyeOutlined />}
            onClick={() => onView(row)}
            className="text-slate-600 border-slate-300 hover:!border-blue-400 hover:!text-blue-600 hover:!bg-blue-50"
          />
        </Tooltip>
        <Tooltip title="Edit Partner Bank">
          <Button
            type="primary"
            shape="circle"
            icon={<EditOutlined />}
            onClick={() => onEdit(row)}
            style={{
              backgroundColor: BRAND_FOCUS_COLOR,
              borderColor: BRAND_FOCUS_COLOR,
            }}
          />
        </Tooltip>
        <Tooltip title="Hapus Partner Bank">
          <Button
            type="dashed"
            danger
            shape="circle"
            loading={isDeleting}
            icon={<DeleteOutlined />}
            onClick={() => onDelete(row)}
          />
        </Tooltip>
      </Space>
    ),
  },
];

// ─────────────────────────────────────────────────────────────────────────────
//  Main Page Component
// ─────────────────────────────────────────────────────────────────────────────

export default function PartnerBankPage() {
  const {
    partnerBankList,
    totalCount,
    isListFetching,
    params,
    handlePaginationChange,
    handleSearchChange,
    createPartnerBank,
    isCreatingPartnerBank,
    updatePartnerBank,
    isUpdatingPartnerBank,
    deletePartnerBank,
    isDeletingPartnerBank,
    refetchList,
  } = usePartnerBank();

  const { confirmAction } = useConfirm();

  // ── Search State ──
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearch = useDebounce(searchValue, 400);

  useEffect(() => {
    handleSearchChange(debouncedSearch);
  }, [debouncedSearch, handleSearchChange]);

  // ── Modal State ──
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState("create");
  const [activeRow, setActiveRow] = useState(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [activeDetailId, setActiveDetailId] = useState(null);

  // Keep a stable identity so the form modal is not reset on unrelated re-renders
  const formInitialValues = useMemo(
    () =>
      formMode === "edit" && activeRow
        ? toPartnerBankFormValues(activeRow)
        : undefined,
    [formMode, activeRow],
  );

  // ── Action Handlers ──

  const openCreateModal = () => {
    setActiveRow(null);
    setFormMode("create");
    setIsFormModalOpen(true);
  };

  const openEditModal = (row) => {
    setActiveRow(row);
    setFormMode("edit");
    setIsFormModalOpen(true);
  };

  const closeFormModal = () => {
    setIsFormModalOpen(false);
    setActiveRow(null);
    setFormMode("create");
  };

  const openDetailModal = (row) => {
    setActiveDetailId(row[PARTNER_BANK_ID_FIELD]);
    setIsDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setActiveDetailId(null);
  };

  const handleFormSubmit = async (values) => {
    if (formMode === "edit") {
      confirmAction({
        title: "Konfirmasi Update Partner Bank",
        description:
          `Apakah Anda yakin ingin memperbarui partner bank "${values.account_holder}"? ` +
          `Perubahan akan langsung tercatat ke dalam sistem.`,
        okText: "Ya, Simpan Perubahan",
        onConfirm: async () => {
          await updatePartnerBank({
            id: activeRow[PARTNER_BANK_ID_FIELD],
            ...values,
          });
          closeFormModal();
        },
      });
      return;
    }

    confirmAction({
      title: "Konfirmasi Tambah Partner Bank",
      description:
        `Apakah Anda yakin ingin menambahkan partner bank "${values.account_holder}" ` +
        `dengan rekening ${values.bank_account}?`,
      okText: "Ya, Simpan",
      onConfirm: async () => {
        await createPartnerBank(values);
        closeFormModal();
      },
    });
  };

  const handleDelete = (row) => {
    confirmAction({
      title: "Konfirmasi Hapus Partner Bank",
      description:
        `Apakah Anda yakin ingin menghapus partner bank "${row.account_holder}" ` +
        `(${row.bank_account})? Tindakan ini tidak dapat dibatalkan.`,
      okText: "Ya, Hapus",
      danger: true,
      onConfirm: async () => {
        await deletePartnerBank(row[PARTNER_BANK_ID_FIELD]);
      },
    });
  };

  // ── Column Definitions ──
  const columnsConfig = buildColumns({
    onView: openDetailModal,
    onEdit: openEditModal,
    onDelete: handleDelete,
    isDeleting: isDeletingPartnerBank,
  });

  // ── Render ──
  return (
    <>
      <DataTablePanel
        title="Partner Bank"
        description="Kelola master rekening bank partner: kode cabang, nomor rekening, dan pemilik rekening."
        columns={columnsConfig}
        dataSource={partnerBankList}
        loading={isListFetching}
        rowKey={PARTNER_BANK_ID_FIELD}
        scrollX={1400}
        pagination={{
          total: totalCount,
          pageSize: params.pageSize,
          current: params.currentPage,
          onChange: handlePaginationChange,
        }}
        searchProps={{
          placeholder: "Cari kode cabang, bank key, nomor rekening, atau pemilik rekening...",
          value: searchValue,
          onChange: setSearchValue,
        }}
        extraHeaderActions={
          <Space size="middle">
            <Tooltip title="Tambah Partner Bank">
              <Button
                type="primary"
                size="large"
                icon={<PlusOutlined />}
                onClick={openCreateModal}
                style={{
                  backgroundColor: BRAND_FOCUS_COLOR,
                  borderColor: BRAND_FOCUS_COLOR,
                }}
              >
                Tambah Partner Bank
              </Button>
            </Tooltip>
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

      {/* Create / Edit Modal */}
      <PartnerBankFormModal
        open={isFormModalOpen}
        mode={formMode}
        initialValues={formInitialValues}
        onCancel={closeFormModal}
        onSubmit={handleFormSubmit}
        confirmLoading={
          formMode === "edit" ? isUpdatingPartnerBank : isCreatingPartnerBank
        }
      />

      {/* Detail Modal */}
      <PartnerBankDetailModal
        open={isDetailModalOpen}
        partnerBankId={activeDetailId}
        onClose={closeDetailModal}
      />
    </>
  );
}
