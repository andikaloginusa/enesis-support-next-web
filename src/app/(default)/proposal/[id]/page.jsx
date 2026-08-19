"use client";

import React, { use, useState } from "react";
import {
  Button,
  Tag,
  Table,
  Typography,
  Grid,
  Divider,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  message,
  Tooltip,
} from "antd";
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  ShoppingOutlined,
  EditOutlined,
  SwapOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined,
  CalendarOutlined,
  DollarOutlined,
  TeamOutlined,
  TagOutlined,
  GlobalOutlined,
  PaperClipOutlined,
  BankOutlined,
  BarChartOutlined,
  InfoCircleOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useProposal } from "@/hooks";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui";
import moment from "moment";

const { Text, Title } = Typography;
const { useBreakpoint } = Grid;

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
  return moment(dateStr).format("DD MMM YYYY, HH:mm");
};

// ==========================================
// Sub-components
// ==========================================

/** A single labeled field block with icon */
const InfoField = ({
  label,
  value,
  icon,
  accent = false,
  mono = false,
  large = false,
}) => (
  <div className="flex flex-col gap-1">
    <div className="flex items-center gap-1.5">
      {icon && <span className="text-slate-400 text-[11px]">{icon}</span>}
      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
        {label}
      </span>
    </div>
    <span
      className={[
        large ? "text-lg font-extrabold" : "text-sm font-semibold",
        accent ? "text-blue-600" : "text-slate-800",
        mono ? "font-mono" : "",
      ].join(" ")}
    >
      {value || (
        <span className="text-slate-300 italic text-xs">Tidak tersedia</span>
      )}
    </span>
  </div>
);

/** Status config mapper */
const getStatusConfig = (rawStatus) => {
  const s = (rawStatus || "").toLowerCase();
  if (
    s.includes("approve") ||
    s === "apr" ||
    s === "y" ||
    s === "success" ||
    s === "on progress"
  ) {
    return {
      color: "success",
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      text: "text-emerald-700",
      dot: "bg-emerald-500",
    };
  }
  if (s.includes("reject") || s === "failed" || s === "reject" || s === "n") {
    return {
      color: "error",
      bg: "bg-rose-50",
      border: "border-rose-200",
      text: "text-rose-700",
      dot: "bg-rose-500",
    };
  }
  if (
    s.includes("proses") ||
    s.includes("wait") ||
    s.includes("menunggu") ||
    s.includes("pending") ||
    s.includes("belum")
  ) {
    return {
      color: "processing",
      bg: "bg-amber-50",
      border: "border-amber-200",
      text: "text-amber-700",
      dot: "bg-amber-400",
    };
  }
  return {
    color: "default",
    bg: "bg-slate-50",
    border: "border-slate-200",
    text: "text-slate-600",
    dot: "bg-slate-400",
  };
};

/** Circular step dot indicator */
const StepDot = ({ isApproved, isRejected, isCurrent, step }) => {
  if (isApproved)
    return (
      <span className="flex items-center justify-center w-9 h-9 rounded-full bg-emerald-500 shadow-md shadow-emerald-200 flex-shrink-0 ring-4 ring-emerald-50">
        <CheckOutlined className="text-white text-sm" />
      </span>
    );
  if (isRejected)
    return (
      <span className="flex items-center justify-center w-9 h-9 rounded-full bg-rose-500 shadow-md shadow-rose-200 flex-shrink-0 ring-4 ring-rose-50">
        <CloseCircleOutlined className="text-white text-sm" />
      </span>
    );
  if (isCurrent)
    return (
      <span className="flex items-center justify-center w-9 h-9 rounded-full bg-blue-600 shadow-md shadow-blue-200 flex-shrink-0 ring-4 ring-blue-50 animate-pulse">
        <ClockCircleOutlined className="text-white text-sm" />
      </span>
    );
  return (
    <span className="flex items-center justify-center w-9 h-9 rounded-full bg-slate-100 border-2 border-slate-200 flex-shrink-0">
      <span className="text-[10px] font-bold text-slate-400">{step}</span>
    </span>
  );
};

// ==========================================
// Main Component
// ==========================================

export default function ProposalDetailPage({ params: paramsPromise }) {
  const resolvedParams = use(paramsPromise);
  const proposalId = resolvedParams.id;

  const router = useRouter();
  const screens = useBreakpoint();

  const [modal, contextHolder] = Modal.useModal();

  // ==========================================
  // 2. React Query Hook State
  // ==========================================
  const {
    proposalDetail,
    isDetailLoading,
    refetchDetail,
    updateProposalData,
    isUpdatingProposal,
    delegasiApproval,
    isDelegating,
    candidatesList,
    isCandidatesLoading,
    fetchCandidatesForJabatan,
    clearActiveCandidates,
  } = useProposal(proposalId);

  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [form] = Form.useForm();

  // ==========================================
  // Delegasi Modal State
  // ==========================================
  const [formDelegasi] = Form.useForm();
  const [isDelegasiModalOpen, setIsDelegasiModalOpen] = useState(false);
  const [activeStepRow, setActiveStepRow] = useState(null);
  const [delegasiApprovalId, setDelegasiApprovalId] = useState(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);

  const openDelegasiModal = (step) => {
    setActiveStepRow(step);
    setDelegasiApprovalId(step.proposal_approval_id);
    setSelectedEmployeeId(null);
    formDelegasi.resetFields();
    // Enable candidates query Ã¢â‚¬â€ API returns all candidates, no jabatan needed
    fetchCandidatesForJabatan();
    setIsDelegasiModalOpen(true);
  };

  const closeDelegasiModal = () => {
    setIsDelegasiModalOpen(false);
    setActiveStepRow(null);
    setDelegasiApprovalId(null);
    setSelectedEmployeeId(null);
    clearActiveCandidates(); // Resets activeJabatan Ã¢â€ â€™ disables candidates query
    formDelegasi.resetFields();
  };

  const handleDelegasiSubmit = () => {
    formDelegasi.validateFields().then(async (values) => {
      modal.confirm({
        title: "Konfirmasi Delegasi",
        icon: <ExclamationCircleOutlined className="text-amber-500" />,
        content: "Apakah Anda yakin ingin mendelegasikan approval ini?",
        okText: "Ya, Delegasikan",
        cancelText: "Batal",
        okButtonProps: {
          className: "bg-blue-600 hover:bg-blue-700 border-blue-600 rounded-lg",
          size: "large",
        },
        cancelButtonProps: { size: "large" },
        onOk: async () => {
          try {
            await delegasiApproval({
              proposal_approval_id: `${delegasiApprovalId}`,
              nip: values.nip,
            });
            closeDelegasiModal();
            refetchDetail();
          } catch (_) {
            // Handled by mutation onError
          }
        },
      });
    });
  };

  // Options builder for Select Ã¢â‚¬â€ uses candidatesList from React Query
  // key: index ensures uniqueness even if API returns duplicate employee_id/nip
  const delegasiOptions = Array.isArray(candidatesList)
    ? candidatesList.map((data, index) => {
        const nik = data.nip || data.employee_id || "";
        const name = data.name || data.nama_user || data.nama || "";
        return {
          key: index,
          value: nik,
          label: `${nik} - ${name}`,
          searchNik: String(nik).toLowerCase(),
          searchName: String(name).toLowerCase(),
        };
      })
    : [];

  // Update filter untuk mencocokkan input dengan label, NIK, atau Nama
  const filterDelegasiOption = (input, option) => {
    const searchInput = (input || "").toLowerCase();
    const matchLabel = (option?.label ?? "").toLowerCase().includes(searchInput);
    const matchNik = (option?.searchNik ?? "").includes(searchInput);
    const matchName = (option?.searchName ?? "").includes(searchInput);
    return matchLabel || matchNik || matchName;
  };

  const handleOpenEditModal = () => {
    form.setFieldsValue({
      title: proposalDetail?.title || proposalDetail?.name || "",
      background: proposalDetail?.background || "",
      objective: proposalDetail?.objective || "",
      mechanism: proposalDetail?.mechanism || "",
      kpi: proposalDetail?.kpi || "",
      expired_date: proposalDetail?.expired_date
        ? moment(proposalDetail.expired_date)
        : null,
    });
    setIsEditModalOpen(true);
  };

  const handleSaveUpdate = async (values) => {
    const getPayloadValue = (fieldKey, newValue) => {
      const oldValue = proposalDetail[fieldKey];

      if (fieldKey === "expired_date") {
        const formattedNew = newValue
          ? moment(newValue).format("YYYY-MM-DD")
          : null;
        const formattedOld = oldValue
          ? moment(oldValue).format("YYYY-MM-DD")
          : null;
        if (formattedNew === formattedOld) return null;
        return formattedNew;
      }

      const trimmedNew =
        typeof newValue === "string" ? newValue.trim() : newValue;
      const trimmedOld =
        typeof oldValue === "string" ? oldValue.trim() : oldValue;
      if (trimmedNew === trimmedOld) return null;
      return trimmedNew === "" ? null : trimmedNew;
    };

    const payload = {
      proposal_id: Number(proposalId),
      title: getPayloadValue("title", values.title),
      background: getPayloadValue("background", values.background),
      objective: getPayloadValue("objective", values.objective),
      mechanism: getPayloadValue("mechanism", values.mechanism),
      kpi: getPayloadValue("kpi", values.kpi),
      expired_date: getPayloadValue("expired_date", values.expired_date),
    };

    // Ensure at least one field is not null (changed)
    const hasChanges = Object.keys(payload).some(
      (key) => key !== "proposal_id" && payload[key] !== null
    );

    if (!hasChanges) {
      message.warning("Tidak ada perubahan data untuk disimpan.");
      return;
    }

    try {
      await updateProposalData(payload);
      setIsEditModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  // Sort the approvals progress list by 'urutan' ascendingly to reflect step sequence
  const sortedProgress = React.useMemo(() => {
    if (!proposalDetail) return [];
    const progressList =
      proposalDetail.approvalprogress || proposalDetail.progress || [];
    return [...progressList].sort(
      (a, b) => (a.no_appr || a.urutan || 0) - (b.no_appr || b.urutan || 0)
    );
  }, [proposalDetail]);

  // Find the active pending step
  const currentApprover = React.useMemo(() => {
    if (!sortedProgress.length) return null;
    return (
      sortedProgress.find((item) => {
        const statusLower = (item.status || "").toLowerCase();
        return (
          statusLower.includes("proses") ||
          statusLower.includes("wait") ||
          statusLower.includes("pending") ||
          statusLower.includes("menunggu")
        );
      }) || null
    );
  }, [sortedProgress]);

  // ==========================================
  // Loading State
  // ==========================================
  if (isDetailLoading) {
    return (
      <div className="space-y-5 pb-10 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="h-9 w-32 bg-slate-100 rounded-xl" />
          <div className="flex gap-2">
            <div className="h-7 w-24 bg-slate-100 rounded-lg" />
            <div className="h-9 w-36 bg-slate-100 rounded-xl" />
          </div>
        </div>
        <div className="h-40 bg-slate-100 rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-5">
            <div className="h-64 bg-slate-100 rounded-2xl" />
            <div className="h-48 bg-slate-100 rounded-2xl" />
          </div>
          <div className="space-y-5">
            <div className="h-48 bg-slate-100 rounded-2xl" />
            <div className="h-40 bg-slate-100 rounded-2xl" />
          </div>
        </div>
        <div className="h-64 bg-slate-100 rounded-2xl" />
      </div>
    );
  }

  if (!proposalDetail) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
        <div className="w-20 h-20 rounded-full bg-rose-50 flex items-center justify-center">
          <CloseCircleOutlined className="text-rose-400 text-3xl" />
        </div>
        <div>
          <Title level={4} className="text-slate-800 mb-1">
            Data Proposal Tidak Ditemukan
          </Title>
          <Text className="text-slate-400 block max-w-xs mx-auto">
            Dokumen yang Anda cari tidak tersedia atau tidak dapat diakses.
          </Text>
        </div>
        <Button
          type="primary"
          onClick={() => router.push("/proposal")}
          className="bg-blue-600 hover:bg-blue-700 border-blue-600 rounded-xl font-semibold h-10 px-6"
        >
          Kembali ke Daftar Proposal
        </Button>
      </div>
    );
  }

  // ==========================================
  // 3. Data Preparation
  // ==========================================
  const docNo =
    proposalDetail.proposal_no ||
    proposalDetail.documentno ||
    proposalDetail.nomor_proposal ||
    proposalDetail.nomor ||
    "-";
  const docStatus = (
    proposalDetail.status ||
    proposalDetail.fcstatus ||
    "PENDING"
  ).toLowerCase();
  const statusConfig = getStatusConfig(docStatus);
  const budgetLines = proposalDetail.budget || proposalDetail.lines || [];
  const attachmentFiles = proposalDetail.file || [];
  const totalBudget =
    proposalDetail.total_budget ??
    proposalDetail.amount ??
    0;

  // ==========================================
  // 4. Render
  // ==========================================
  return (
    <div className="space-y-5 pb-10">
      {contextHolder}

      {/* â”€â”€ Top Navigation Row â”€â”€ */}
      <div className="flex items-center justify-between">
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => router.push("/proposal")}
          className="text-slate-500 hover:text-slate-700 hover:bg-slate-100 font-semibold flex items-center gap-1.5 rounded-xl h-9 px-3 transition-all"
        >
          Kembali
        </Button>

        <div className="flex items-center gap-2">
          <Tag
            className={`font-semibold uppercase text-xs px-3 py-1 rounded-lg border m-0 ${statusConfig.bg} ${statusConfig.border} ${statusConfig.text}`}
          >
            <span
              className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${statusConfig.dot}`}
            />
            {proposalDetail.status || proposalDetail.fcstatus || "PENDING"}
          </Tag>
          {proposalDetail && (
            <Button
              icon={<EditOutlined />}
              onClick={handleOpenEditModal}
              className="bg-white border-slate-200 text-slate-700 hover:text-blue-600 hover:border-blue-300 font-semibold rounded-xl h-9 px-4 flex items-center gap-1.5"
            >
              Edit Proposal
            </Button>
          )}
        </div>
      </div>

      {/* â”€â”€ Hero Header Card (clean / neutral) â”€â”€ */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5">
          <div className="flex items-start gap-4 min-w-0 flex-1">
            <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-slate-100 flex-shrink-0">
              <FileTextOutlined className="text-slate-600 text-lg" />
            </div>
            <div className="min-w-0">
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-1">
                Proposal Support Â· {docNo}
              </p>
              <h1 className="text-slate-900 font-bold text-lg leading-snug line-clamp-2">
                {proposalDetail.title || proposalDetail.name || "Detail Proposal"}
              </h1>
              <p className="text-slate-500 text-sm mt-1 font-medium">
                <CalendarOutlined className="mr-1 text-slate-400" />
                {formatDate(
                  proposalDetail.proposal_date ||
                    proposalDetail.documentdate ||
                    proposalDetail.created
                )}
              </p>
            </div>
          </div>

          {/* Budget highlight */}
          <div className="flex-shrink-0 bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 text-right">
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-0.5">
              Total Anggaran
            </p>
            <p className="text-slate-800 font-black text-2xl tracking-tight leading-none">
              {formatCurrency(totalBudget)}
            </p>
          </div>
        </div>

        {/* Current Approver / Status Banner */}
        {currentApprover ? (
          <div className="mt-4 flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping flex-shrink-0" />
            <span className="text-amber-800 text-xs font-medium">
              Menunggu persetujuan:{" "}
              <strong>{currentApprover.name || currentApprover.nama}</strong>{" "}
              <span className="text-amber-600">
                ({currentApprover.position_appr || currentApprover.jabatan || "Executor"})
              </span>
            </span>
          </div>
        ) : docStatus === "approved" ||
          docStatus === "apr" ||
          docStatus === "y" ||
          docStatus === "success" ? (
          <div className="mt-4 flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5">
            <CheckCircleOutlined className="text-emerald-500 flex-shrink-0" />
            <span className="text-emerald-700 text-xs font-semibold">
              Semua tahapan persetujuan telah selesai & disetujui sepenuhnya.
            </span>
          </div>
        ) : null}
      </div>


      {/* Ã¢â€â‚¬Ã¢â€â‚¬ Approval Timeline (Full Width) Ã¢â€â‚¬Ã¢â€â‚¬ */}
      <Card className="border-slate-200/70 shadow-sm">
        <CardHeader className="bg-slate-50/60 border-b border-slate-100 py-4 px-6">
          <CardTitle className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <CheckCircleOutlined className="text-slate-500" />
            Alur Persetujuan
          </CardTitle>
          <CardDescription className="text-[11px] text-slate-400 mt-0.5">
            Tahapan otorisasi berjenjang Ã‚Â· Klik &quot;Delegasi&quot; untuk
            mendelegasikan approval
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {sortedProgress.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <TeamOutlined className="text-3xl mb-2 opacity-40" />
              <p className="text-sm">Tidak ada data alur persetujuan.</p>
            </div>
          ) : (
            <div className="relative">
              {/* Vertical connector line */}
              <div className="absolute left-[17px] top-9 bottom-9 w-px bg-gradient-to-b from-blue-200 via-slate-200 to-slate-100 pointer-events-none" />

              <div className="flex flex-col gap-3">
                {sortedProgress.map((step, idx) => {
                  const rawStatus = (
                    step.status ||
                    step.status_approval_desc ||
                    ""
                  ).toLowerCase();
                  const isApproved =
                    rawStatus.includes("approve") ||
                    rawStatus === "y" ||
                    rawStatus === "success";
                  const isCurrent =
                    rawStatus.includes("proses") ||
                    rawStatus.includes("wait") ||
                    rawStatus.includes("menunggu") ||
                    rawStatus.includes("belum");
                  const isRejected =
                    rawStatus.includes("reject") || rawStatus === "failed";
                  const cfg = getStatusConfig(rawStatus);

                  let cardCls = "border-slate-100 bg-white";
                  if (isApproved) cardCls = "border-emerald-100/80 bg-emerald-50/30";
                  if (isRejected) cardCls = "border-rose-100/80 bg-rose-50/30";
                  if (isCurrent)
                    cardCls =
                      "border-blue-200/80 bg-blue-50/40 shadow-sm shadow-blue-100";

                  return (
                    <div
                      key={step.proposal_approval_id || idx}
                      className={`relative flex items-start gap-4 p-4 rounded-2xl border transition-all ${cardCls}`}
                    >
                      {/* Step dot */}
                      <StepDot
                        isApproved={isApproved}
                        isRejected={isRejected}
                        isCurrent={isCurrent}
                        step={step.no_appr || idx + 1}
                      />

                      {/* Step content */}
                      <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-extrabold text-slate-800 text-sm">
                              {step.name || step.nama || "-"}
                            </span>
                            <Tag className="font-semibold text-[10px] uppercase text-blue-600 bg-blue-50 border-blue-100 rounded-md m-0 px-2 py-0">
                              {step.position_appr ||
                                step.jabatan ||
                                "Executor"}
                            </Tag>
                          </div>
                          <div className="flex items-center gap-3 mt-0.5">
                            <span className="text-[11px] text-slate-400 font-mono">
                              NIK: {step.employee_id || step.nik || "-"}
                            </span>
                            <span className="text-slate-200">Ã‚Â·</span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase">
                              Tahap {step.no_appr || idx + 1}
                            </span>
                          </div>
                          {(step.updated_date ||
                            step.dateaction ||
                            step.created_date) && (
                            <span className="text-[10px] text-slate-400 mt-1 block">
                              {isApproved
                                ? "Ã¢Å“â€¦ Disetujui"
                                : isRejected
                                  ? "Ã¢ÂÅ’ Ditolak"
                                  : "Ã¢ÂÂ³ Diverifikasi"}
                              :{" "}
                              {moment(
                                step.updated_date ||
                                  step.dateaction ||
                                  step.created_date
                              ).format("DD MMM YYYY, HH:mm")}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Tag
                            color={cfg.color}
                            className="font-semibold uppercase text-[10px] px-2.5 py-0.5 rounded-lg border-none m-0"
                          >
                            {step.status ||
                              step.status_approval_desc ||
                              "Menunggu"}
                          </Tag>
                          <Tooltip title="Delegasikan approval ke karyawan lain">
                            <Button
                              size="small"
                              icon={<SwapOutlined />}
                              onClick={() => openDelegasiModal(step)}
                              className="border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all"
                            >
                              Delegasi
                            </Button>
                          </Tooltip>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>


      {/* â”€â”€ Main Two-Column Grid â”€â”€ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* LEFT: Main Details (2/3 width) */}
        <div className="lg:col-span-2 space-y-5">
          {/* Core Information */}
          <Card className="border-slate-200/70 shadow-sm">
            <CardHeader className="bg-slate-50/60 border-b border-slate-100 py-4 px-6">
              <CardTitle className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <InfoCircleOutlined className="text-slate-500" />
                Informasi Utama
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <InfoField
                  label="Nomor Dokumen"
                  value={docNo}
                  icon={<FileTextOutlined />}
                  mono
                />
                <InfoField
                  label="Tanggal Proposal"
                  value={formatDate(
                    proposalDetail.proposal_date ||
                      proposalDetail.documentdate ||
                      proposalDetail.created
                  )}
                  icon={<CalendarOutlined />}
                />
                <InfoField
                  label="Divisi & Region"
                  value={`${
                    proposalDetail.division_code ||
                    proposalDetail.division ||
                    "-"
                  } Ã‚Â· ${proposalDetail.region || "-"}`}
                  icon={<GlobalOutlined />}
                />
                <InfoField
                  label="Brand"
                  value={proposalDetail.brand || "-"}
                  icon={<TagOutlined />}
                />
                <InfoField
                  label="Vendor / Agency"
                  value={
                    proposalDetail.nama_vendor
                      ? `${proposalDetail.nama_vendor}${
                          proposalDetail.kode_vendor
                            ? ` (${proposalDetail.kode_vendor})`
                            : ""
                        }`
                      : "-"
                  }
                  icon={<BankOutlined />}
                />
                <InfoField
                  label="Periode / Tahun"
                  value={`${
                    proposalDetail.budget_year || proposalDetail.period || "-"
                  }${
                    proposalDetail.period_start
                      ? ` Ã‚Â· ${proposalDetail.period_start} s/d ${proposalDetail.period_end}`
                      : ""
                  }`}
                  icon={<CalendarOutlined />}
                />
              </div>

              <Divider className="my-5 border-slate-100" />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Budget highlight */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4 flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-blue-400">
                    <DollarOutlined className="text-xs" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">
                      Nominal Anggaran
                    </span>
                  </div>
                  <span className="text-blue-700 font-black text-lg tracking-tight leading-tight">
                    {formatCurrency(totalBudget)}
                  </span>
                </div>

                {/* Expired date */}
                <div
                  className={`rounded-xl p-4 flex flex-col gap-1 border ${
                    proposalDetail.expired_date
                      ? "bg-amber-50 border-amber-100"
                      : "bg-slate-50 border-slate-100"
                  }`}
                >
                  <div
                    className={`flex items-center gap-1.5 ${
                      proposalDetail.expired_date
                        ? "text-amber-400"
                        : "text-slate-400"
                    }`}
                  >
                    <CalendarOutlined className="text-xs" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">
                      Expired Date
                    </span>
                  </div>
                  <span
                    className={`font-bold text-sm ${
                      proposalDetail.expired_date
                        ? "text-amber-700"
                        : "text-slate-400 italic text-xs"
                    }`}
                  >
                    {proposalDetail.expired_date
                      ? formatDate(proposalDetail.expired_date)
                      : "Tidak ada expired date"}
                  </span>
                </div>

                {/* PO & Reversal */}
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <BarChartOutlined className="text-xs" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">
                      Biaya PO & Reversal
                    </span>
                  </div>
                  <span className="text-slate-700 font-semibold text-sm">
                    PO: {proposalDetail.biaya_po || "-"} Ã‚Â· Reversal:{" "}
                    {proposalDetail.is_reversal || "-"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Strategic Context */}
          {(proposalDetail.background ||
            proposalDetail.objective ||
            proposalDetail.mechanism ||
            proposalDetail.kpi) && (
            <Card className="border-slate-200/70 shadow-sm">
              <CardHeader className="bg-slate-50/60 border-b border-slate-100 py-4 px-6">
                <CardTitle className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <BarChartOutlined className="text-purple-500" />
                  Konteks Strategis & Target
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                {proposalDetail.background && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                      Latar Belakang (Background)
                    </p>
                    <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line border-l-2 border-slate-200 pl-3">
                      {proposalDetail.background}
                    </p>
                  </div>
                )}
                {proposalDetail.objective && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                      Tujuan (Objective)
                    </p>
                    <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line border-l-2 border-blue-200 pl-3">
                      {proposalDetail.objective}
                    </p>
                  </div>
                )}
                {proposalDetail.mechanism && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                      Mekanisme Pelaksanaan
                    </p>
                    <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line border-l-2 border-indigo-200 pl-3">
                      {proposalDetail.mechanism}
                    </p>
                  </div>
                )}
                {proposalDetail.kpi && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                      Indikator Kinerja (KPI)
                    </p>
                    <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-mono text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                      {proposalDetail.kpi}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Budget Lines */}
          {budgetLines.length > 0 && (
            <Card className="border-slate-200/70 shadow-sm">
              <CardHeader className="bg-slate-50/60 border-b border-slate-100 py-4 px-6">
                <CardTitle className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <DollarOutlined className="text-emerald-500" />
                  Rincian Anggaran & Varian Produk
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table
                  dataSource={budgetLines}
                  rowKey={(row) =>
                    row.proposal_budget_id ||
                    row.budget_id ||
                    row.id ||
                    Math.random().toString()
                  }
                  pagination={false}
                  size="small"
                  columns={[
                    {
                      title: "#",
                      key: "index",
                      width: 44,
                      align: "center",
                      render: (_, __, idx) => (
                        <span className="text-slate-400 font-bold text-xs">
                          {idx + 1}
                        </span>
                      ),
                    },
                    {
                      title: "Aktivitas & Kode Anggaran",
                      dataIndex: "activity",
                      key: "activity",
                      render: (t, r) => (
                        <div className="flex flex-col gap-1 py-1">
                          <span className="font-semibold text-slate-800 text-sm">
                            {t || "-"}
                          </span>
                          {r.activity_code && (
                            <span className="text-[10px] text-slate-400 font-mono">
                              Kode: {r.activity_code}
                            </span>
                          )}
                          {/* Nested Product Variants */}
                          {Array.isArray(r.variant) &&
                            r.variant.length > 0 && (
                              <div className="mt-1.5 pl-3 border-l-2 border-blue-300 flex flex-col gap-0.5">
                                <span className="text-[9px] uppercase font-bold text-blue-500 tracking-wider">
                                  Varian SKU:
                                </span>
                                {r.variant.map((v, i) => (
                                  <span
                                    key={i}
                                    className="text-xs text-slate-600"
                                  >
                                    Ã‚Â· {v.variant_desc || v.variant_id}{" "}
                                    {v.package_type
                                      ? `(${v.package_type})`
                                      : ""}
                                  </span>
                                ))}
                              </div>
                            )}
                        </div>
                      ),
                    },
                    {
                      title: "Brand",
                      dataIndex: "brand",
                      key: "brand",
                      width: 80,
                      align: "center",
                      render: (t) => (
                        <Tag
                          color="blue"
                          className="font-semibold text-xs rounded-md border-none"
                        >
                          {t || "-"}
                        </Tag>
                      ),
                    },
                    {
                      title: "Bulan",
                      dataIndex: "bulan",
                      key: "bulan",
                      width: 80,
                      align: "center",
                      render: (t) => (
                        <span className="text-slate-600 text-xs">
                          {t || "-"}
                        </span>
                      ),
                    },
                    {
                      title: "Outstanding Klaim",
                      dataIndex: "outstanding_klaim",
                      key: "outstanding_klaim",
                      width: 150,
                      align: "right",
                      render: (val) => (
                        <span className="font-mono text-slate-600 text-xs">
                          {formatCurrency(val)}
                        </span>
                      ),
                    },
                    {
                      title: "Budget to Approve",
                      dataIndex: "budgettoapprove",
                      key: "budgettoapprove",
                      width: 150,
                      align: "right",
                      render: (val) => (
                        <span className="font-bold text-emerald-600 font-mono text-sm">
                          {formatCurrency(val)}
                        </span>
                      ),
                    },
                  ]}
                  className="rounded-b-2xl overflow-hidden"
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* RIGHT: Sidebar (1/3 width) */}
        <div className="space-y-5">
          {/* Attachments */}
          {attachmentFiles.length > 0 && (
            <Card className="border-slate-200/70 shadow-sm">
              <CardHeader className="bg-slate-50/60 border-b border-slate-100 py-4 px-5">
                <CardTitle className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <PaperClipOutlined className="text-orange-400" />
                  Lampiran ({attachmentFiles.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="flex flex-col gap-2">
                  {attachmentFiles.map((fileItem, fileIdx) => (
                    <div
                      key={fileItem.uid || fileIdx}
                      className="flex items-center gap-3 p-3 border border-slate-200/60 rounded-xl bg-white hover:bg-blue-50/50 hover:border-blue-200 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-orange-50 text-orange-500 flex-shrink-0 group-hover:bg-orange-100 transition-colors">
                        <PaperClipOutlined className="text-base" />
                      </div>
                      <div className="flex flex-col min-w-0 flex-1">
                        <span
                          className="font-semibold text-slate-700 text-xs truncate group-hover:text-blue-700 transition-colors"
                          title={fileItem.name}
                        >
                          {fileItem.name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium mt-0.5">
                          Lampiran #{fileItem.no || fileIdx + 1}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Stats */}
          <Card className="border-slate-200/70 shadow-sm">
            <CardHeader className="bg-slate-50/60 border-b border-slate-100 py-4 px-5">
              <CardTitle className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <TeamOutlined className="text-blue-500" />
                Ringkasan Approval
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                {[
                  {
                    label: "Total Tahapan",
                    value: sortedProgress.length,
                    color: "text-slate-700",
                    bg: "bg-slate-100",
                  },
                  {
                    label: "Disetujui",
                    value: sortedProgress.filter((s) => {
                      const r = (s.status || "").toLowerCase();
                      return (
                        r.includes("approve") ||
                        r === "y" ||
                        r === "success"
                      );
                    }).length,
                    color: "text-emerald-700",
                    bg: "bg-emerald-50",
                  },
                  {
                    label: "Menunggu",
                    value: sortedProgress.filter((s) => {
                      const r = (s.status || "").toLowerCase();
                      return (
                        r.includes("proses") ||
                        r.includes("wait") ||
                        r.includes("menunggu") ||
                        r.includes("belum") ||
                        r.includes("pending")
                      );
                    }).length,
                    color: "text-amber-700",
                    bg: "bg-amber-50",
                  },
                  {
                    label: "Ditolak",
                    value: sortedProgress.filter((s) => {
                      const r = (s.status || "").toLowerCase();
                      return r.includes("reject") || r === "failed";
                    }).length,
                    color: "text-rose-700",
                    bg: "bg-rose-50",
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className={`flex items-center justify-between rounded-lg px-3 py-2 ${stat.bg}`}
                  >
                    <span className="text-xs font-medium text-slate-600">
                      {stat.label}
                    </span>
                    <span className={`font-bold text-base ${stat.color}`}>
                      {stat.value}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      {/* Ã¢â€â‚¬Ã¢â€â‚¬ Delegasi Approval Modal Ã¢â€â‚¬Ã¢â€â‚¬ */}
      <Modal
        title={null}
        open={isDelegasiModalOpen}
        footer={null}
        onCancel={closeDelegasiModal}
        width={480}
        className="rounded-2xl overflow-hidden"
        styles={{ body: { padding: 0 } }}
      >
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <SwapOutlined className="text-white text-lg" />
          </div>
          <div>
            <h2 className="text-white font-bold text-base leading-tight">
              Delegasi Approval
            </h2>
            <p className="text-blue-200 text-xs mt-0.5">
              Alihkan tahap persetujuan ke karyawan lain
            </p>
          </div>
        </div>

        <div className="p-6">
          {activeStepRow && (
            <div className="mb-5 p-4 bg-blue-50 border border-blue-100 rounded-xl">
              <p className="text-[10px] font-bold uppercase tracking-widest text-blue-500 mb-1.5">
                Tahap yang Didelegasikan
              </p>
              <p className="text-sm font-extrabold text-slate-800">
                {activeStepRow.name || activeStepRow.nama || "-"}
              </p>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                NIK: {activeStepRow.employee_id || activeStepRow.nik || "-"}
                &nbsp;Ã‚Â·&nbsp;{" "}
                {activeStepRow.position_appr || activeStepRow.jabatan || "-"}
              </p>
            </div>
          )}

          <p className="text-slate-500 text-sm mb-5 leading-relaxed">
            Pilih karyawan pengganti untuk mendelegasikan langkah approval ini.
            Karyawan yang dipilih akan menerima notifikasi untuk melakukan
            persetujuan.
          </p>

          <Form form={formDelegasi} layout="vertical">
            <Form.Item
              label={
                <span className="font-semibold text-slate-700 text-sm">
                  Karyawan Pengganti
                </span>
              }
              name="nip"
              rules={[
                { required: true, message: "Pilih karyawan pengganti!" },
              ]}
            >
              <Select
                style={{ width: "100%" }}
                showSearch
                placeholder="Cari NIK atau Nama Karyawan..."
                optionFilterProp="label"
                onChange={(val) => setSelectedEmployeeId(val)}
                filterOption={filterDelegasiOption}
                options={delegasiOptions}
                loading={isCandidatesLoading}
                size="large"
                className="w-full rounded-xl"
              />
            </Form.Item>
          </Form>

          <div className="flex items-center gap-3 mt-6">
            <Button
              size="large"
              onClick={closeDelegasiModal}
              className="flex-1 rounded-xl font-semibold border-slate-200 text-slate-500 hover:text-slate-700 hover:border-slate-300"
            >
              Batal
            </Button>
            <Button
              type="primary"
              size="large"
              loading={isDelegating}
              disabled={!selectedEmployeeId}
              onClick={handleDelegasiSubmit}
              className="flex-1 rounded-xl font-semibold bg-blue-600 hover:bg-blue-700 border-blue-600"
            >
              Delegasikan
            </Button>
          </div>
        </div>
      </Modal>

      {/* Ã¢â€â‚¬Ã¢â€â‚¬ Edit Proposal Modal Ã¢â€â‚¬Ã¢â€â‚¬ */}
      <Modal
        title={null}
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        footer={null}
        width={680}
        className="rounded-2xl overflow-hidden"
        styles={{ body: { padding: 0 } }}
      >
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
            <EditOutlined className="text-white text-lg" />
          </div>
          <div>
            <h2 className="text-white font-bold text-base leading-tight">
              Edit Proposal
            </h2>
            <p className="text-slate-300 text-xs mt-0.5">
              Perbarui informasi detail proposal
            </p>
          </div>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveUpdate}
          className="p-6 space-y-1"
        >
          <Form.Item
            name="title"
            label={
              <span className="font-semibold text-slate-600 text-xs uppercase tracking-wider">
                Title Proposal
              </span>
            }
          >
            <Input.TextArea
              placeholder="Masukkan nama / title proposal..."
              rows={2}
              className="rounded-xl text-sm"
            />
          </Form.Item>

          <Form.Item
            name="expired_date"
            label={
              <span className="font-semibold text-slate-600 text-xs uppercase tracking-wider">
                Tanggal Kadaluarsa
              </span>
            }
          >
            <DatePicker
              placeholder="Pilih tanggal kadaluarsa"
              size="large"
              style={{ width: "100%" }}
              className="rounded-xl"
            />
          </Form.Item>

          <Divider className="!my-4 border-slate-100">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Konteks Strategis
            </span>
          </Divider>

          <Form.Item
            name="background"
            label={
              <span className="font-semibold text-slate-600 text-xs uppercase tracking-wider">
                Latar Belakang (Background)
              </span>
            }
          >
            <Input.TextArea
              placeholder="Tuliskan latar belakang proposal..."
              rows={3}
              className="rounded-xl text-sm"
            />
          </Form.Item>

          <Form.Item
            name="objective"
            label={
              <span className="font-semibold text-slate-600 text-xs uppercase tracking-wider">
                Tujuan (Objective)
              </span>
            }
          >
            <Input.TextArea
              placeholder="Tuliskan tujuan proposal..."
              rows={3}
              className="rounded-xl text-sm"
            />
          </Form.Item>

          <Form.Item
            name="mechanism"
            label={
              <span className="font-semibold text-slate-600 text-xs uppercase tracking-wider">
                Mekanisme Pelaksanaan
              </span>
            }
          >
            <Input.TextArea
              placeholder="Tuliskan mekanisme pelaksanaan..."
              rows={3}
              className="rounded-xl text-sm"
            />
          </Form.Item>

          <Form.Item
            name="kpi"
            label={
              <span className="font-semibold text-slate-600 text-xs uppercase tracking-wider">
                Indikator Kinerja (KPI)
              </span>
            }
          >
            <Input.TextArea
              placeholder="Tuliskan indikator kinerja / KPI..."
              rows={3}
              className="rounded-xl font-mono text-xs"
            />
          </Form.Item>

          <div className="flex items-center gap-3 pt-4 border-t border-slate-100 mt-6">
            <Button
              onClick={() => setIsEditModalOpen(false)}
              size="large"
              className="flex-1 rounded-xl font-semibold border-slate-200 text-slate-500 hover:text-slate-700"
            >
              Batal
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={isUpdatingProposal}
              className="flex-1 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 border-blue-600 shadow-sm shadow-blue-200"
            >
              Simpan Perubahan
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
