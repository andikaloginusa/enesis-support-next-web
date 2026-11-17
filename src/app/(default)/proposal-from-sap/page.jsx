"use client";

import React, { useEffect, useState } from "react";
import { Button, Input, Select, Tooltip } from "antd";
import {
  ReloadOutlined,
  CloudUploadOutlined,
  DatabaseOutlined,
  DollarOutlined,
  EyeOutlined,
  SearchOutlined,
  TagsOutlined,
  FileExcelOutlined,
  AccountBookOutlined,
} from "@ant-design/icons";
import { useProposalFromSap, useDebounce } from "@/hooks";
import {
  DataTablePanel,
  renderCurrency,
  renderDate,
  renderBold,
  renderMedium,
  renderTruncated,
  renderMono,
} from "@/components/ui";
import {
  UploadProposalSapModal,
  CekProposalFromSapModal,
  ProposalFromSapDetailModal,
} from "@/components/features/proposal-from-sap";

// ─────────────────────────────────────────────────────────────────────────────
//  Filter Options
// ─────────────────────────────────────────────────────────────────────────────

const IS_ACTIVE_OPTIONS = [
  { value: "Y", label: "Aktif (Y)" },
  { value: "N", label: "Non-Aktif (N)" },
];

/** Template Excel untuk Update Brand Proposal From SAP (kolom A = WBS, kolom B = Brand) */
const UPDATE_BRAND_TEMPLATE_URL =
  "/templates/proposal/proposal-from-sap/template_upload_update_brand.xlsx";

/** Template Excel untuk Upload Update Klaim Detail Proposal From SAP */
const UPDATE_KLAIM_DETAIL_TEMPLATE_URL =
  "/templates/proposal/proposal-from-sap/template_upload_update_klaim_detail.xlsx";

/** Template Excel untuk Upload Mentah (Import) Proposal From SAP */
const UPLOAD_MENTAH_TEMPLATE_URL =
  "/templates/proposal/proposal-from-sap/template_upload_mentah_proposal_from_sap.xlsx";

/** Template Excel untuk Upload Update GL Account Proposal From SAP */
const UPDATE_GL_ACCOUNT_TEMPLATE_URL =
  "/templates/proposal/proposal-from-sap/template_update_gl_account.xlsx";

// ─────────────────────────────────────────────────────────────────────────────
//  Column Definitions
// ─────────────────────────────────────────────────────────────────────────────

function buildColumns({ onViewDetail, onCheckBudget }) {
  return [
    {
      title: "Nomor WBS",
      dataIndex: "reference_no_wbs_number",
      key: "reference_no_wbs_number",
      fixed: "left",
      width: 190,
      render: (text) => renderMono(text),
    },
    {
      title: "Kode E-Prop SAP",
      dataIndex: "kode_eprop_sap",
      key: "kode_eprop_sap",
      width: 180,
      render: (text) => renderBold(text),
    },
    {
      title: "Brand",
      dataIndex: "brand",
      key: "brand",
      width: 140,
      render: (text) => renderMedium(text),
    },
    {
      title: "Sub Brand",
      dataIndex: "sub_brand",
      key: "sub_brand",
      width: 140,
      render: (text) => renderMedium(text),
    },
    {
      title: "Account Name",
      dataIndex: "account_name",
      key: "account_name",
      width: 200,
      render: (text) => renderTruncated(text, 190),
    },
    {
      title: "Branch",
      dataIndex: "branch",
      key: "branch",
      width: 140,
      render: (text) => renderMedium(text),
    },
    {
      title: "Budget Proposal",
      dataIndex: "budget_proposal",
      key: "budget_proposal",
      width: 170,
      align: "right",
      render: (val) => renderCurrency(val),
    },
    {
      title: "Budget Year",
      dataIndex: "budget_year",
      key: "budget_year",
      width: 120,
      align: "center",
      render: (text) => renderBold(text),
    },
    {
      title: "Estimasi Sales",
      dataIndex: "estimasi_sales",
      key: "estimasi_sales",
      width: 170,
      align: "right",
      render: (val) => renderCurrency(val),
    },
    {
      title: "Customer Name",
      dataIndex: "customer_name",
      key: "customer_name",
      width: 220,
      render: (text) => renderTruncated(text, 210),
    },
    {
      title: "Distributor",
      dataIndex: "distributor",
      key: "distributor",
      width: 180,
      render: (text) => renderTruncated(text, 170),
    },
    {
      title: "Executor",
      dataIndex: "executor",
      key: "executor",
      width: 160,
      render: (text) => renderMedium(text),
    },
    {
      title: "Company Name",
      dataIndex: "company_name",
      key: "company_name",
      width: 180,
      render: (text) => renderTruncated(text, 170),
    },
    {
      title: "GL Account",
      dataIndex: "gl_account",
      key: "gl_account",
      width: 140,
      render: (text) => renderMono(text),
    },
    {
      title: "Start Date",
      dataIndex: "start_date",
      key: "start_date",
      width: 140,
      render: (val) => renderDate(val),
    },
    {
      title: "End Date",
      dataIndex: "end_date",
      key: "end_date",
      width: 140,
      render: (val) => renderDate(val),
    },
    {
      title: "WBS E-Prop Status",
      dataIndex: "wbs_eprop_status",
      key: "wbs_eprop_status",
      width: 160,
      render: (text) => renderMedium(text),
    },
    {
      title: "Is Active",
      dataIndex: "isactive",
      key: "isactive",
      width: 110,
      align: "center",
      render: (text) =>
        text === "Y" ? (
          <span className="font-semibold text-emerald-600">Aktif</span>
        ) : (
          <span className="text-slate-400">Non-Aktif</span>
        ),
    },
    {
      title: "Created",
      dataIndex: "created",
      key: "created",
      width: 150,
      render: (val) => renderDate(val),
    },
    {
      title: "Keterangan Perubahan",
      dataIndex: "keterangan_perubahan",
      key: "keterangan_perubahan",
      width: 220,
      render: (text) => renderTruncated(text, 210),
    },
    {
      title: "Aksi",
      key: "action",
      align: "center",
      fixed: "right",
      width: 210,
      render: (row) => (
        <div className="flex items-center justify-center gap-2">
          <Tooltip title="Lihat detail proposal from SAP">
            <Button
              size="small"
              icon={<EyeOutlined className="text-emerald-600" />}
              onClick={() => onViewDetail(row)}
              className="border-emerald-200 text-emerald-700 bg-emerald-50 hover:!bg-emerald-600 hover:!text-white hover:!border-emerald-600 font-semibold text-xs rounded-lg px-2.5 h-7 inline-flex items-center gap-1 transition-all cursor-pointer active:scale-95"
            >
              Detail
            </Button>
          </Tooltip>
          <Tooltip title="Cek budget proposal dari SAP">
            <Button
              size="small"
              icon={<SearchOutlined className="text-blue-600" />}
              onClick={() => onCheckBudget(row)}
              disabled={!row.kode_eprop_sap}
              className="border-blue-200 text-blue-700 bg-blue-50 hover:!bg-blue-600 hover:!text-white hover:!border-blue-600 font-semibold text-xs rounded-lg px-2.5 h-7 inline-flex items-center gap-1 transition-all cursor-pointer active:scale-95"
            >
              Cek Budget
            </Button>
          </Tooltip>
        </div>
      ),
    },
  ];
}

// ─────────────────────────────────────────────────────────────────────────────
//  Main Page Component
// ─────────────────────────────────────────────────────────────────────────────

export default function ProposalFromSapPage() {
  const {
    sapList,
    totalCount,
    isListFetching,
    params,
    handlePaginationChange,
    handleSearchChange,
    handleFilterChange,
    refetchList,
    uploadProposalSapKlaimDetail,
    isUploadingProposalSapKlaim,
    uploadProposalSapKlaimResult,
    uploadProposalSapImport,
    isUploadingProposalSapImport,
    uploadProposalSapImportResult,
    uploadProposalSapAmount,
    isUploadingProposalSapAmount,
    uploadProposalSapAmountResult,
    uploadProposalSapBrand,
    isUploadingProposalSapBrand,
    uploadProposalSapBrandResult,
    uploadProposalSapGlAccount,
    isUploadingProposalSapGlAccount,
    uploadProposalSapGlAccountResult,
  } = useProposalFromSap();

  // ── Search State ──
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearch = useDebounce(searchValue, 400);

  useEffect(() => {
    handleSearchChange(debouncedSearch);
  }, [debouncedSearch, handleSearchChange]);

  // ── Filter State ( uncontrolled input) ──
  const [brandFilter, setBrandFilter] = useState("");
  const [budgetYearFilter, setBudgetYearFilter] = useState("");
  const [kodeProsesFilter, setKodeProsesFilter] = useState("");

  // ── Modal State ──
  const [sapKlaimModalOpen, setSapKlaimModalOpen] = useState(false);
  const [sapImportModalOpen, setSapImportModalOpen] = useState(false);
  const [sapAmountModalOpen, setSapAmountModalOpen] = useState(false);
  const [sapBrandModalOpen, setSapBrandModalOpen] = useState(false);
  const [sapGlAccountModalOpen, setSapGlAccountModalOpen] = useState(false);
  const [cekSapModalOpen, setCekSapModalOpen] = useState(false);
  const [cekSapKode, setCekSapKode] = useState("");
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailRecord, setDetailRecord] = useState(null);

  const columnsConfig = buildColumns({
    onViewDetail: (row) => {
      setDetailRecord(row);
      setDetailOpen(true);
    },
    onCheckBudget: (row) => {
      setCekSapKode(row.kode_eprop_sap || "");
      setCekSapModalOpen(true);
    },
  });

  const filterBar = (
    <div className="flex flex-wrap items-center gap-3">
      <Input
        placeholder="Brand"
        value={brandFilter}
        onChange={(e) => setBrandFilter(e.target.value)}
        onBlur={() => handleFilterChange("brand", brandFilter.trim())}
        onPressEnter={() => handleFilterChange("brand", brandFilter.trim())}
        allowClear
        className="w-48 text-sm rounded-xl border-slate-200"
      />
      <Input
        placeholder="Budget Year"
        value={budgetYearFilter}
        onChange={(e) => setBudgetYearFilter(e.target.value)}
        onBlur={() =>
          handleFilterChange("budget_year", budgetYearFilter.trim())
        }
        onPressEnter={() =>
          handleFilterChange("budget_year", budgetYearFilter.trim())
        }
        allowClear
        className="w-40 text-sm rounded-xl border-slate-200"
      />
      <Select
        placeholder="Semua Status Aktif"
        allowClear
        style={{ width: 180 }}
        value={params.isactive || undefined}
        onChange={(val) => handleFilterChange("isactive", val)}
        options={IS_ACTIVE_OPTIONS}
        className="font-medium"
      />
      <Input
        placeholder="Kode Proses"
        value={kodeProsesFilter}
        onChange={(e) => setKodeProsesFilter(e.target.value)}
        onBlur={() =>
          handleFilterChange("kode_proses", kodeProsesFilter.trim())
        }
        onPressEnter={() =>
          handleFilterChange("kode_proses", kodeProsesFilter.trim())
        }
        allowClear
        className="w-56 text-sm rounded-xl border-slate-200"
      />
    </div>
  );

  return (
    <>
      <DataTablePanel
        title="Proposal From SAP"
        description="Kelola data proposal dari SAP, update brand, dan pantau budget proposal per nomor WBS."
        columns={columnsConfig}
        dataSource={sapList}
        loading={isListFetching}
        rowKey={(row) => row.proposal_from_sap_id}
        scrollX={2900}
        pagination={{
          total: totalCount,
          pageSize: params.pageSize,
          current: params.currentPage,
          onChange: handlePaginationChange,
        }}
        searchProps={{
          placeholder:
            "Cari nomor WBS, kode e-prop SAP, brand, atau customer...",
          value: searchValue,
          onChange: setSearchValue,
        }}
        filterBar={filterBar}
        extraHeaderActions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              icon={<CloudUploadOutlined />}
              onClick={() => setSapKlaimModalOpen(true)}
              loading={isUploadingProposalSapKlaim}
              className="h-9 px-4 rounded-lg border-orange-200 text-orange-600 hover:text-white hover:border-orange-500 hover:bg-orange-500 font-medium text-sm flex items-center gap-1.5 transition-all"
            >
              Klaim &amp; Budget ID
            </Button>

            <Button
              icon={<DatabaseOutlined />}
              onClick={() => setSapImportModalOpen(true)}
              loading={isUploadingProposalSapImport}
              className="h-9 px-4 rounded-lg border-blue-200 text-blue-600 hover:text-white hover:border-blue-500 hover:bg-blue-500 font-medium text-sm flex items-center gap-1.5 transition-all"
            >
              Import
            </Button>

            <Button
              href={UPLOAD_MENTAH_TEMPLATE_URL}
              download
              icon={<FileExcelOutlined />}
              className="h-9 px-4 rounded-lg border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50 font-medium text-sm flex items-center gap-1.5 transition-all"
            >
              Template Mentah
            </Button>

            <Button
              icon={<DollarOutlined />}
              onClick={() => setSapAmountModalOpen(true)}
              loading={isUploadingProposalSapAmount}
              className="h-9 px-4 rounded-lg border-emerald-200 text-emerald-600 hover:text-white hover:border-emerald-500 hover:bg-emerald-500 font-medium text-sm flex items-center gap-1.5 transition-all"
            >
              Amount
            </Button>

            <Button
              icon={<TagsOutlined />}
              onClick={() => setSapBrandModalOpen(true)}
              loading={isUploadingProposalSapBrand}
              className="h-9 px-4 rounded-lg border-violet-200 text-violet-600 hover:text-white hover:border-violet-500 hover:bg-violet-500 font-medium text-sm flex items-center gap-1.5 transition-all"
            >
              Update Brand
            </Button>

            <Button
              icon={<AccountBookOutlined />}
              onClick={() => setSapGlAccountModalOpen(true)}
              loading={isUploadingProposalSapGlAccount}
              className="h-9 px-4 rounded-lg border-cyan-200 text-cyan-600 hover:text-white hover:border-cyan-500 hover:bg-cyan-500 font-medium text-sm flex items-center gap-1.5 transition-all"
            >
              Update GL Account
            </Button>
            <span className="self-center w-px h-5 mx-1 bg-slate-200" />

            <Button
              icon={<SearchOutlined />}
              onClick={() => {
                setCekSapKode("");
                setCekSapModalOpen(true);
              }}
              className="h-9 px-4 rounded-lg border-slate-200 text-slate-600 hover:text-emerald-600 hover:border-emerald-400 hover:bg-emerald-50 font-medium text-sm flex items-center gap-1.5 transition-all"
            >
              Cek Budget
            </Button>

            <Button
              shape="circle"
              icon={
                <ReloadOutlined
                  className={isListFetching ? "animate-spin" : ""}
                />
              }
              onClick={refetchList}
              className="h-9 w-9 border-slate-200 text-slate-500 hover:text-slate-700 hover:border-slate-300"
            />
          </div>
        }
      />

      {/* Upload Proposal SAP — Klaim Detail & Budget ID */}
      <UploadProposalSapModal
        open={sapKlaimModalOpen}
        onClose={() => setSapKlaimModalOpen(false)}
        variant="klaim"
        onUpload={uploadProposalSapKlaimDetail}
        isUploading={isUploadingProposalSapKlaim}
        result={uploadProposalSapKlaimResult}
        templateUrl={UPDATE_KLAIM_DETAIL_TEMPLATE_URL}
      />

      {/* Upload Proposal SAP — Import (Mentah) */}
      <UploadProposalSapModal
        open={sapImportModalOpen}
        onClose={() => setSapImportModalOpen(false)}
        variant="import"
        onUpload={uploadProposalSapImport}
        isUploading={isUploadingProposalSapImport}
        result={uploadProposalSapImportResult}
        templateUrl={UPLOAD_MENTAH_TEMPLATE_URL}
      />

      {/* Upload Proposal SAP — Amount */}
      <UploadProposalSapModal
        open={sapAmountModalOpen}
        onClose={() => setSapAmountModalOpen(false)}
        variant="amount"
        onUpload={uploadProposalSapAmount}
        isUploading={isUploadingProposalSapAmount}
        result={uploadProposalSapAmountResult}
      />

      {/* Upload Update Brand Proposal From SAP */}
      <UploadProposalSapModal
        open={sapBrandModalOpen}
        onClose={() => setSapBrandModalOpen(false)}
        variant="brand"
        onUpload={uploadProposalSapBrand}
        isUploading={isUploadingProposalSapBrand}
        result={uploadProposalSapBrandResult}
        templateUrl={UPDATE_BRAND_TEMPLATE_URL}
      />

      {/* Upload Update GL Account Proposal From SAP */}
      <UploadProposalSapModal
        open={sapGlAccountModalOpen}
        onClose={() => setSapGlAccountModalOpen(false)}
        variant="gl_account"
        onUpload={uploadProposalSapGlAccount}
        isUploading={isUploadingProposalSapGlAccount}
        result={uploadProposalSapGlAccountResult}
        templateUrl={UPDATE_GL_ACCOUNT_TEMPLATE_URL}
      />

      {/* Cek Budget Proposal — dari toolbar */}
      <CekProposalFromSapModal
        open={cekSapModalOpen}
        onClose={() => setCekSapModalOpen(false)}
        initialKodeEpropSap={cekSapKode}
      />

      {/* Detail baris proposal_from_sap */}
      <ProposalFromSapDetailModal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        record={detailRecord}
      />
    </>
  );
}
