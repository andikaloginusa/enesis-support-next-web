"use client";

import React, { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { Button, DatePicker, Select, Space, Tag, Tooltip } from "antd";
import {
  EditOutlined,
  EyeOutlined,
  ReloadOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useConfirm, useDebounce } from "@/hooks";
import { useNotify } from "@/utils/notify";
import { useSubmitFaktur } from "@/hooks/queries/useSubmitFaktur";
import { useTransporterOptions } from "@/hooks/queries/useTransporterOptions";
import {
  DataTablePanel,
  renderCurrency,
  renderMono,
  renderTruncated,
} from "@/components/ui";
import { renderDate } from "@/components/ui/ColumnRenderers";
import { UpdateSubmitFakturModal } from "@/components/features/submit-faktur/UpdateSubmitFakturModal";
import {
  SUBMIT_FAKTUR_ALL_STATUS_OPTIONS,
  SUBMIT_FAKTUR_ID_FIELD,
  getSubmitFakturStatusMeta,
} from "@/config/submitFakturConfig";
import { BRAND_FOCUS_COLOR } from "@/utils/constants";

// ─────────────────────────────────────────────────────────────────────────────
//  Column Definitions
// ─────────────────────────────────────────────────────────────────────────────

const buildColumns = ({ onUpdate, onView }) => [
  {
    title: "SLA",
    dataIndex: "timeAllert",
    key: "timeAllert",
    align: "center",
    width: 90,
    render: (value, row) =>
      value ? (
        <Tooltip
          title={`${row.leadTime && row.leadTime !== "-" ? `Tenggat SLA: ${row.leadTime}` : "Tenggat SLA belum ditentukan"}\nAksi terakhir: ${row.lastAction || "-"}`}
        >
          <WarningOutlined className="text-amber-500 text-base" />
        </Tooltip>
      ) : (
        <span className="text-slate-300">-</span>
      ),
  },
  {
    title: "Nomor Invoice",
    dataIndex: "nomor_invoice",
    key: "nomor_invoice",
    fixed: "left",
    width: 170,
    render: (text) => renderMono(text),
  },
  {
    title: "Nomor PO",
    dataIndex: "nomor_po",
    key: "nomor_po",
    width: 150,
    render: (text) => renderMono(text),
  },
  {
    title: "Transporter",
    key: "transporter",
    width: 220,
    render: (_, row) => (
      <div className="flex flex-col">
        <span className="text-sm text-slate-700">{row.nama || "-"}</span>
        <span className="text-xs text-slate-400 font-mono">{row.kode || "-"}</span>
      </div>
    ),
  },
  {
    title: "Status",
    key: "status",
    width: 240,
    render: (_, row) => (
      <div className="flex flex-col gap-1">
        {row.kode_status ? (
          <Tag
            color={getSubmitFakturStatusMeta(row.kode_status).color}
            className="w-fit"
          >
            {row.kode_status}
          </Tag>
        ) : (
          <span className="text-slate-400">-</span>
        )}
        <span className="text-xs text-slate-500">
          {renderTruncated(row.status, 200)}
        </span>
      </div>
    ),
  },
  {
    title: "Total Invoice",
    dataIndex: "nominal_invoice_sesudah_ppn",
    key: "nominal_invoice_sesudah_ppn",
    align: "right",
    width: 180,
    render: (text) => renderCurrency(text),
  },
  {
    title: "Tgl Invoice",
    dataIndex: "tanggal_invoice",
    key: "tanggal_invoice",
    width: 130,
    render: (text) => renderDate(text),
  },
  {
    title: "Tgl Faktur",
    dataIndex: "tanggal_faktur",
    key: "tanggal_faktur",
    width: 130,
    render: (text) => renderDate(text),
  },
  {
    title: "Payment Term",
    key: "payment_term",
    width: 190,
    render: (_, row) => (
      <div className="flex flex-col">
        <span className="text-sm text-slate-700 font-mono">
          {row.payment_term || "-"}
        </span>
        <span className="text-xs text-slate-400">
          {row.nama_payment_term || "-"}
        </span>
      </div>
    ),
  },
  {
    title: "Est. Tanggal Bayar",
    dataIndex: "estimated_date",
    key: "estimated_date",
    width: 150,
    render: (text) => renderDate(text),
  },
  {
    title: "Aksi",
    key: "action",
    align: "center",
    fixed: "right",
    width: 130,
    render: (_, row) => (
      <div className="flex items-center justify-center gap-2">
        <Tooltip title="Lihat Detail Invoice">
          <Button
            type="default"
            shape="circle"
            icon={<EyeOutlined />}
            onClick={() => onView(row)}
          />
        </Tooltip>
        <Tooltip title="Update Submit Faktur">
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
      </div>
    ),
  },
];

// ─────────────────────────────────────────────────────────────────────────────
//  Main Page Component
// ─────────────────────────────────────────────────────────────────────────────

export default function SubmitFakturPage() {
  const { confirmAction } = useConfirm();
  const { notifyWarning } = useNotify();
  const router = useRouter();

  const {
    invoiceList,
    totalCount,
    isListFetching,
    params,
    handlePaginationChange,
    handleSearchChange,
    handleFilterChange,
    resetParams,
    updateInvoice,
    isUpdatingInvoice,
    refetchList,
  } = useSubmitFaktur();

  // ── Search State ──
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearch = useDebounce(searchValue, 400);

  useEffect(() => {
    handleSearchChange(debouncedSearch);
  }, [debouncedSearch, handleSearchChange]);

  // ── Transporter Filter (server-side search) ──
  const [transporterSearch, setTransporterSearch] = useState("");
  const { options: transporterOptions, isFetching: isTransporterFetching } =
    useTransporterOptions({
      searchText: transporterSearch,
      pageSize: 50,
    });

  const transporterChoices = useMemo(
    () =>
      transporterOptions.map((item) => ({
        value: item.m_transporter_id,
        label: item.nama,
        kode: item.kode,
      })),
    [transporterOptions]
  );

  const statusChoices = useMemo(
    () =>
      SUBMIT_FAKTUR_ALL_STATUS_OPTIONS.map((item) => ({
        value: item.value,
        label: item.label,
      })),
    []
  );

  // ── Modal State ──
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [activeRow, setActiveRow] = useState(null);
  const [updateError, setUpdateError] = useState("");

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

  const handleViewDetail = (row) => {
    router.push(`/submit-faktur/${row[SUBMIT_FAKTUR_ID_FIELD]}`);
  };

  const handleUpdateSubmit = async (payload) => {
    if (Object.keys(payload).length === 0) {
      notifyWarning(
        "Tidak Ada Perubahan",
        "Tidak ada field yang diubah, tidak ada data yang dikirim ke server.",
      );
      return;
    }

    const changedFields = Object.keys(payload).join(", ");

    confirmAction({
      title: "Konfirmasi Update Submit Faktur",
      description:
        `Apakah Anda yakin ingin memperbarui invoice ` +
        `"${activeRow?.nomor_invoice ?? "-"}"? ` +
        `Field yang diperbarui: ${changedFields}. ` +
        `Perubahan status akan tercatat pada audit_submit_faktur.`,
      okText: "Ya, Perbarui",
      onConfirm: async () => {
        try {
          await updateInvoice({
            [SUBMIT_FAKTUR_ID_FIELD]: activeRow?.[SUBMIT_FAKTUR_ID_FIELD],
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
    onUpdate: openUpdateModal,
    onView: handleViewDetail,
  });

  const filterBar = (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      <div>
        <label className="block mb-1 text-xs font-semibold text-slate-600">
          Periode
        </label>
        <DatePicker
          picker="month"
          format="YYYY-MM"
          placeholder="Semua Periode"
          className="w-full"
          value={params.periode ? dayjs(params.periode) : null}
          onChange={(value) =>
            handleFilterChange("periode", value ? value.format("YYYY-MM") : "")
          }
        />
      </div>

      <div>
        <label className="block mb-1 text-xs font-semibold text-slate-600">
          Kode Status
        </label>
        <Select
          allowClear
          showSearch
          placeholder="Semua Status"
          className="w-full"
          value={params.status ? params.status : undefined}
          options={statusChoices}
          optionFilterProp="label"
          onChange={(value) => handleFilterChange("status", value ?? "")}
        />
      </div>

      <div>
        <label className="block mb-1 text-xs font-semibold text-slate-600">
          Transporter
        </label>
        <Select
          allowClear
          showSearch
          loading={isTransporterFetching}
          placeholder="Semua Transporter"
          className="w-full"
          value={params.transporter ? params.transporter : undefined}
          options={transporterChoices}
          filterOption={false}
          onSearch={setTransporterSearch}
          onChange={(value) => handleFilterChange("transporter", value ?? "")}
          optionRender={(option) => (
            <div className="flex items-center justify-between gap-4">
              <span className="font-semibold text-slate-700">
                {option.data.label}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {option.data.kode}
              </span>
            </div>
          )}
        />
      </div>

      <div className="flex items-end">
        <Button
          block
          onClick={() => {
            resetParams();
            setSearchValue("");
            setTransporterSearch("");
          }}
        >
          Reset Filter
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <DataTablePanel
        title="Submit Faktur Support"
        description="Pantau invoice Submit Faktur, perbarui status proses, tanggal invoice/faktur, dan payment term per invoice."
        columns={columns}
        dataSource={invoiceList}
        loading={isListFetching}
        rowKey={(row) => row[SUBMIT_FAKTUR_ID_FIELD]}
        scrollX={1700}
        filterBar={filterBar}
        pagination={{
          total: totalCount,
          pageSize: params.pageSize,
          current: params.currentPage,
          onChange: handlePaginationChange,
        }}
        searchProps={{
          placeholder: "Cari nomor invoice, PO, surat jalan, SAP, atau status...",
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
                  <ReloadOutlined className={isListFetching ? "animate-spin" : ""} />
                }
                onClick={() => refetchList()}
              />
            </Tooltip>
          </Space>
        }
        emptyText="Tidak ada invoice yang cocok dengan filter yang dipilih."
      />

      <UpdateSubmitFakturModal
        open={isUpdateModalOpen}
        invoice={activeRow}
        onCancel={closeUpdateModal}
        onSubmit={handleUpdateSubmit}
        confirmLoading={isUpdatingInvoice}
        errorDetails={updateError}
      />
    </>
  );
}
