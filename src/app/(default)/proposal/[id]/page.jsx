"use client";

import React, { use, useState, useMemo } from "react";
import PropTypes from "prop-types";
import {
  Button,
  Tag,
  Table,
  Typography,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  message,
  Tooltip,
  Divider,
} from "antd";
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
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
import dayjs from "dayjs";
import { useProposal } from "@/hooks";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  InfoField,
  StatusBadge,
  getStatusStyle,
  renderCurrency,
  renderDate,
  renderDateTime,
} from "@/components/ui";

// ─────────────────────────────────────────────────────────────────────────────
//  Constants & Configurations
// ─────────────────────────────────────────────────────────────────────────────

const STRATEGIC_FIELDS = [
  {
    key: "background",
    label: "Latar Belakang (Background)",
    borderColor: "border-slate-300",
    rows: 4,
  },
  {
    key: "objective",
    label: "Tujuan (Objective)",
    borderColor: "border-blue-300",
    rows: 4,
  },
  {
    key: "mechanism",
    label: "Mekanisme Pelaksanaan",
    borderColor: "border-indigo-300",
    rows: 4,
  },
  {
    key: "kpi",
    label: "Indikator Kinerja (KPI)",
    borderColor: "border-purple-300",
    rows: 4,
    mono: true,
  },
];

/** Helper to safely convert various date formats into YYYY-MM-DD string */
function formatDateToISO(val) {
  if (!val) return null;
  if (typeof val === "string") return val.split("T")[0];
  if (typeof val.format === "function") return val.format("YYYY-MM-DD");
  return dayjs(val).isValid() ? dayjs(val).format("YYYY-MM-DD") : null;
}

// ─────────────────────────────────────────────────────────────────────────────
//  Sub-components: States & Visuals
// ─────────────────────────────────────────────────────────────────────────────

/** Animated loading skeleton for detail page load */
function DetailPageSkeleton() {
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

/** Error / Not found state */
function NotFoundState({ onBack }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
      <div className="w-20 h-20 rounded-full bg-rose-50 flex items-center justify-center">
        <CloseCircleOutlined className="text-rose-400 text-3xl" />
      </div>
      <div>
        <Typography.Title level={4} className="text-slate-800 mb-1">
          Data Proposal Tidak Ditemukan
        </Typography.Title>
        <Typography.Text className="text-slate-400 block max-w-xs mx-auto">
          Dokumen yang Anda cari tidak tersedia atau tidak dapat diakses.
        </Typography.Text>
      </div>
      <Button
        type="primary"
        onClick={onBack}
        className="bg-blue-600 hover:bg-blue-700 border-blue-600 rounded-xl font-semibold h-10 px-6"
      >
        Kembali ke Daftar Proposal
      </Button>
    </div>
  );
}

NotFoundState.propTypes = {
  onBack: PropTypes.func.isRequired,
};

/** Circular step indicator for approval timeline */
function StepDot({ isApproved, isRejected, isCurrent, step }) {
  if (isApproved) {
    return (
      <span className="w-9 h-9 rounded-full bg-emerald-500 shadow-md shadow-emerald-200 ring-4 ring-emerald-50 flex items-center justify-center flex-shrink-0">
        <CheckOutlined className="text-white text-sm" />
      </span>
    );
  }
  if (isRejected) {
    return (
      <span className="w-9 h-9 rounded-full bg-rose-500 shadow-md shadow-rose-200 ring-4 ring-rose-50 flex items-center justify-center flex-shrink-0">
        <CloseCircleOutlined className="text-white text-sm" />
      </span>
    );
  }
  if (isCurrent) {
    return (
      <span className="w-9 h-9 rounded-full bg-blue-600 shadow-md shadow-blue-200 ring-4 ring-blue-50 flex items-center justify-center flex-shrink-0 animate-pulse">
        <ClockCircleOutlined className="text-white text-sm" />
      </span>
    );
  }
  return (
    <span className="w-9 h-9 rounded-full bg-slate-100 border-2 border-slate-200 flex items-center justify-center flex-shrink-0">
      <span className="text-[10px] font-bold text-slate-400">{step}</span>
    </span>
  );
}

StepDot.propTypes = {
  isApproved: PropTypes.bool,
  isRejected: PropTypes.bool,
  isCurrent: PropTypes.bool,
  step: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
};

/** Approval Timeline Card row */
function ApprovalStepCard({ step, idx, onDelegasi }) {
  const raw = (step.status || step.status_approval_desc || "").toLowerCase();
  const isApproved = raw.includes("approve") || raw === "y" || raw === "success";
  const isCurrent = raw.includes("proses") || raw.includes("wait") || raw.includes("menunggu") || raw.includes("belum");
  const isRejected = raw.includes("reject") || raw === "failed";

  let cardCls = "border-slate-100 bg-white";
  if (isApproved) cardCls = "border-emerald-100/80 bg-emerald-50/30";
  if (isRejected) cardCls = "border-rose-100/80 bg-rose-50/30";
  if (isCurrent) cardCls = "border-blue-200/80 bg-blue-50/40 shadow-sm shadow-blue-100";

  const actionDate = step.updated_date || step.dateaction || step.created_date;

  return (
    <div className={`relative flex items-start gap-4 p-4 rounded-2xl border transition-all ${cardCls}`}>
      <StepDot isApproved={isApproved} isRejected={isRejected} isCurrent={isCurrent} step={step.no_appr || idx + 1} />
      <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-extrabold text-slate-800 text-sm">
              {step.name || step.nama || "-"}
            </span>
            <span className="inline-flex items-center px-2 py-0 rounded-md bg-blue-50 border border-blue-100 text-blue-600 font-semibold text-[10px] uppercase">
              {step.position_appr || step.jabatan || "Executor"}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-[11px] text-slate-400 font-mono">
              NIK: {step.employee_id || step.nik || "-"}
            </span>
            <span className="text-slate-200">|</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase">
              Tahap {step.no_appr || idx + 1}
            </span>
          </div>
          {actionDate && (
            <span className="text-[10px] text-slate-400 mt-1 block">
              {isApproved ? "Disetujui" : isRejected ? "Ditolak" : "Diverifikasi"}: {renderDateTime(actionDate)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <StatusBadge status={step.status || step.status_approval_desc} />
          <Tooltip title="Delegasikan approval ke karyawan lain">
            <Button
              size="small"
              icon={<SwapOutlined />}
              onClick={() => onDelegasi(step)}
              className="border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all"
            >
              Delegasi
            </Button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}

ApprovalStepCard.propTypes = {
  step: PropTypes.object.isRequired,
  idx: PropTypes.number.isRequired,
  onDelegasi: PropTypes.func.isRequired,
};

/** Quick stats summary row */
function ApprovalSummaryRow({ label, value, bg, text }) {
  return (
    <div className={`flex items-center justify-between rounded-lg px-3 py-2 ${bg}`}>
      <span className="text-xs font-medium text-slate-600">{label}</span>
      <span className={`font-bold text-base ${text}`}>{value}</span>
    </div>
  );
}

ApprovalSummaryRow.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  bg: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
};

// ─────────────────────────────────────────────────────────────────────────────
//  Modal Sub-components
// ─────────────────────────────────────────────────────────────────────────────

/** Modal for delegating approval steps */
function DelegasiModal({
  open,
  form,
  onCancel,
  onSubmit,
  confirmLoading,
  candidates,
  candidatesLoading,
  activeStep,
  selectedEmployeeId,
  onSelectChange,
  filterOption,
}) {
  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      width={480}
      className="rounded-2xl overflow-hidden"
      styles={{ body: { padding: 0 } }}
      closable={false}
      destroyOnClose
    >
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
          <SwapOutlined className="text-white text-lg" />
        </div>
        <div>
          <h2 className="text-white font-bold text-base leading-tight">Delegasi Approval</h2>
          <p className="text-blue-200 text-xs mt-0.5">Alihkan tahap persetujuan ke karyawan lain</p>
        </div>
      </div>

      <div className="p-6">
        {activeStep && (
          <div className="mb-5 p-4 bg-blue-50 border border-blue-100 rounded-xl">
            <p className="text-[10px] font-bold uppercase tracking-widest text-blue-500 mb-1.5">
              Tahap yang Didelegasikan
            </p>
            <p className="text-sm font-extrabold text-slate-800">
              {activeStep.name || activeStep.nama || "-"}
            </p>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              NIK: {activeStep.employee_id || activeStep.nik || "-"} &nbsp;|&nbsp;{" "}
              {activeStep.position_appr || activeStep.jabatan || "-"}
            </p>
          </div>
        )}

        <Typography.Text className="text-slate-500 text-sm mb-5 block leading-relaxed">
          Pilih karyawan pengganti untuk mendelegasikan langkah approval ini.
          Karyawan yang dipilih akan menerima notifikasi untuk melakukan persetujuan.
        </Typography.Text>

        <Form form={form} layout="vertical">
          <Form.Item
            label={<span className="font-semibold text-slate-700 text-sm">Karyawan Pengganti</span>}
            name="nip"
            rules={[{ required: true, message: "Pilih karyawan pengganti!" }]}
          >
            <Select
              showSearch
              placeholder="Cari NIK atau Nama Karyawan..."
              optionFilterProp="label"
              onChange={onSelectChange}
              filterOption={filterOption}
              options={candidates}
              loading={candidatesLoading}
              size="large"
              className="w-full rounded-xl"
            />
          </Form.Item>
        </Form>

        <div className="flex items-center gap-3 mt-6">
          <Button
            size="large"
            onClick={onCancel}
            className="flex-1 rounded-xl font-semibold border-slate-200 text-slate-500 hover:text-slate-700 hover:border-slate-300"
          >
            Batal
          </Button>
          <Button
            type="primary"
            size="large"
            loading={confirmLoading}
            disabled={!selectedEmployeeId}
            onClick={onSubmit}
            className="flex-1 rounded-xl font-semibold bg-blue-600 hover:bg-blue-700 border-blue-600"
          >
            Delegasikan
          </Button>
        </div>
      </div>
    </Modal>
  );
}

DelegasiModal.propTypes = {
  open: PropTypes.bool.isRequired,
  form: PropTypes.object.isRequired,
  onCancel: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  confirmLoading: PropTypes.bool,
  candidates: PropTypes.array.isRequired,
  candidatesLoading: PropTypes.bool,
  activeStep: PropTypes.object,
  selectedEmployeeId: PropTypes.string,
  onSelectChange: PropTypes.func.isRequired,
  filterOption: PropTypes.func.isRequired,
};

/** Modular modal for updating a single proposal header field (PATCH) */
function SingleFieldEditModal({
  open,
  onCancel,
  fieldContext,
  proposalDetail,
  onSave,
  confirmLoading,
}) {
  const [form] = Form.useForm();

  // Initialize form value whenever modal opens with a specific field context
  React.useEffect(() => {
    if (open && fieldContext) {
      const rawVal = proposalDetail?.[fieldContext.fieldKey];
      if (fieldContext.type === "date") {
        form.setFieldsValue({
          value: rawVal ? dayjs(rawVal) : null,
        });
      } else {
        form.setFieldsValue({
          value: rawVal ?? "",
        });
      }
    } else {
      form.resetFields();
    }
  }, [open, fieldContext, proposalDetail, form]);

  const handleFinish = (values) => {
    if (!fieldContext) return;
    const { fieldKey, type } = fieldContext;
    let formattedValue;

    if (type === "date") {
      formattedValue = formatDateToISO(values.value);
      const oldDate = formatDateToISO(proposalDetail?.[fieldKey]);
      if (formattedValue === oldDate) {
        message.warning("Tidak ada perubahan tanggal.");
        return;
      }
    } else {
      formattedValue = values.value !== undefined ? values.value : "";
      const oldValue = proposalDetail?.[fieldKey] ?? "";
      if (formattedValue === oldValue) {
        message.warning("Tidak ada perubahan data.");
        return;
      }
    }

    const payload = {
      proposal_id: Number(proposalDetail?.proposal_id),
      [fieldKey]: formattedValue,
    };

    onSave(payload);
  };

  if (!fieldContext) return null;

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      width={560}
      className="rounded-2xl overflow-hidden"
      styles={{ body: { padding: 0 } }}
      closable={false}
      destroyOnClose
    >
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0">
          <EditOutlined className="text-white text-base" />
        </div>
        <div>
          <h2 className="text-white font-bold text-sm leading-tight">Edit {fieldContext.label}</h2>
          <p className="text-slate-300 text-[11px] mt-0.5">Perbarui data proposal secara spesifik</p>
        </div>
      </div>

      <Form form={form} layout="vertical" onFinish={handleFinish} className="p-6 space-y-4">
        <Form.Item
          name="value"
          label={<span className="font-semibold text-slate-600 text-xs uppercase tracking-wider">{fieldContext.label}</span>}
          className="mb-0"
        >
          {fieldContext.type === "date" ? (
            <DatePicker
              placeholder={`Pilih ${fieldContext.label.toLowerCase()}...`}
              size="large"
              style={{ width: "100%" }}
              className="rounded-xl"
            />
          ) : (
            <Input.TextArea
              placeholder={`Masukkan ${fieldContext.label.toLowerCase()}...`}
              rows={fieldContext.rows || 4}
              className={`rounded-xl text-sm ${fieldContext.mono ? "font-mono text-xs" : ""}`}
              autoFocus
            />
          )}
        </Form.Item>

        <div className="flex items-center gap-3 pt-3 border-t border-slate-100 mt-5">
          <Button
            size="large"
            onClick={onCancel}
            className="flex-1 rounded-xl font-semibold border-slate-200 text-slate-500 hover:text-slate-700"
          >
            Batal
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            loading={confirmLoading}
            className="flex-1 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 border-blue-600 shadow-sm shadow-blue-200"
          >
            Simpan Perubahan
          </Button>
        </div>
      </Form>
    </Modal>
  );
}

SingleFieldEditModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  fieldContext: PropTypes.shape({
    fieldKey: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    type: PropTypes.oneOf(["date", "textarea"]),
    rows: PropTypes.number,
    mono: PropTypes.bool,
  }),
  proposalDetail: PropTypes.object,
  onSave: PropTypes.func.isRequired,
  confirmLoading: PropTypes.bool,
};

// ─────────────────────────────────────────────────────────────────────────────
//  Main Page Component
// ─────────────────────────────────────────────────────────────────────────────

export default function ProposalDetailPage({ params: paramsPromise }) {
  const resolvedParams = use(paramsPromise);
  const proposalId = resolvedParams.id;
  const router = useRouter();

  const [modal] = Modal.useModal();
  const [formDelegasi] = Form.useForm();

  const [isDelegasiModalOpen, setIsDelegasiModalOpen] = useState(false);
  const [singleEditContext, setSingleEditContext] = useState(null);
  const [activeStep, setActiveStep] = useState(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);

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

  // ── Derived Data ──
  const sortedProgress = useMemo(() => {
    if (!proposalDetail) return [];
    const list = proposalDetail.approvalprogress || proposalDetail.progress || [];
    return [...list].sort((a, b) => (a.no_appr || a.urutan || 0) - (b.no_appr || b.urutan || 0));
  }, [proposalDetail]);

  const currentApprover = useMemo(() => {
    if (!sortedProgress.length) return null;
    return (
      sortedProgress.find((item) => {
        const s = (item.status || "").toLowerCase();
        return s.includes("proses") || s.includes("wait") || s.includes("pending") || s.includes("menunggu");
      }) || null
    );
  }, [sortedProgress]);

  const docStatus = (proposalDetail?.status || proposalDetail?.fcstatus || "PENDING").toLowerCase();

  // Delegasi Select Options
  const delegasiOptions = useMemo(() => {
    if (!Array.isArray(candidatesList)) return [];
    return candidatesList.map((data, i) => {
      const nik = data.nip || data.employee_id || "";
      const name = data.name || data.nama_user || data.nama || "";
      return {
        key: i,
        value: nik,
        label: `${nik} – ${name}`,
        searchNik: String(nik).toLowerCase(),
        searchName: String(name).toLowerCase(),
      };
    });
  }, [candidatesList]);

  const filterDelegasiOption = (input, option) => {
    const s = (input || "").toLowerCase();
    return (
      (option?.label ?? "").toLowerCase().includes(s) ||
      (option?.searchNik ?? "").includes(s) ||
      (option?.searchName ?? "").includes(s)
    );
  };

  // ── Action Handlers ──

  const openDelegasiModal = (step) => {
    setActiveStep(step);
    setSelectedEmployeeId(null);
    formDelegasi.resetFields();
    fetchCandidatesForJabatan();
    setIsDelegasiModalOpen(true);
  };

  const closeDelegasiModal = () => {
    setIsDelegasiModalOpen(false);
    setActiveStep(null);
    setSelectedEmployeeId(null);
    clearActiveCandidates();
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
        okButtonProps: { className: "bg-blue-600 hover:bg-blue-700 border-blue-600 rounded-lg", size: "large" },
        cancelButtonProps: { size: "large" },
        onOk: async () => {
          try {
            await delegasiApproval({
              proposal_approval_id: `${activeStep.proposal_approval_id}`,
              nip: values.nip,
            });
            closeDelegasiModal();
            refetchDetail();
          } catch {
            /* Handled by mutation onError */
          }
        },
      });
    });
  };

  const openSingleFieldEdit = (fieldKey, label, type = "textarea", extra = {}) => {
    setSingleEditContext({ fieldKey, label, type, ...extra });
  };

  const closeSingleFieldEdit = () => {
    setSingleEditContext(null);
  };

  const handleSave = async (payload) => {
    try {
      await updateProposalData(payload);
      setSingleEditContext(null);
      refetchDetail();
    } catch (err) {
      console.error(err);
    }
  };

  // ── Render States ──
  if (isDetailLoading) return <DetailPageSkeleton />;
  if (!proposalDetail) return <NotFoundState onBack={() => router.push("/proposal")} />;

  const docNo = proposalDetail.proposal_no || proposalDetail.documentno || proposalDetail.nomor_proposal || proposalDetail.nomor || "-";
  const budgetLines = proposalDetail.budget || proposalDetail.lines || [];
  const attachmentFiles = proposalDetail.file || [];
  const totalBudget = proposalDetail.total_budget ?? proposalDetail.amount ?? 0;

  const statsApproved = sortedProgress.filter((s) => {
    const r = (s.status || "").toLowerCase();
    return r.includes("approve") || r === "y" || r === "success";
  }).length;
  const statsPending = sortedProgress.filter((s) => {
    const r = (s.status || "").toLowerCase();
    return r.includes("proses") || r.includes("wait") || r.includes("menunggu") || r.includes("belum") || r.includes("pending");
  }).length;
  const statsRejected = sortedProgress.filter((s) => {
    const r = (s.status || "").toLowerCase();
    return r.includes("reject") || r === "failed";
  }).length;

  return (
    <div className="space-y-5 pb-10">
      {/* Top Navigation Row */}
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
          <StatusBadge status={proposalDetail.status || proposalDetail.fcstatus} />
        </div>
      </div>

      {/* Hero Header Card */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5">
          <div className="flex items-start gap-4 min-w-0 flex-1">
            <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
              <FileTextOutlined className="text-slate-600 text-lg" />
            </div>
            <div className="min-w-0">
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-1">
                Proposal Support &middot; {docNo}
              </p>
              <div className="flex items-start gap-2">
                <h1 className="text-slate-900 font-bold text-lg leading-snug line-clamp-2">
                  {proposalDetail.title || proposalDetail.name || "Detail Proposal"}
                </h1>
                <Button
                  type="text"
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => openSingleFieldEdit("title", "Title Proposal", "textarea", { rows: 2 })}
                  className="text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg h-7 px-2 flex items-center gap-1 text-xs font-semibold flex-shrink-0"
                  title="Edit Title Proposal"
                >
                  Edit
                </Button>
              </div>
              <p className="text-slate-500 text-sm mt-1 font-medium">
                <CalendarOutlined className="mr-1 text-slate-400" />
                {renderDateTime(proposalDetail.proposal_date || proposalDetail.documentdate || proposalDetail.created)}
              </p>
            </div>
          </div>
          <div className="flex-shrink-0 bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 text-right">
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-0.5">Total Anggaran</p>
            <p className="text-slate-800 font-black text-2xl tracking-tight leading-none">
              {renderCurrency(totalBudget)}
            </p>
          </div>
        </div>

        {/* Current Approver Banner */}
        {currentApprover ? (
          <div className="mt-4 flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping flex-shrink-0" />
            <span className="text-amber-800 text-xs font-medium">
              Menunggu persetujuan: <strong>{currentApprover.name || currentApprover.nama}</strong>{" "}
              <span className="text-amber-600">
                ({currentApprover.position_appr || currentApprover.jabatan || "Executor"})
              </span>
            </span>
          </div>
        ) : (docStatus === "approved" || docStatus === "apr" || docStatus === "y" || docStatus === "success") ? (
          <div className="mt-4 flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5">
            <CheckCircleOutlined className="text-emerald-500 flex-shrink-0" />
            <span className="text-emerald-700 text-xs font-semibold">
              Semua tahapan persetujuan telah selesai & disetujui sepenuhnya.
            </span>
          </div>
        ) : null}
      </div>

      {/* Approval Timeline */}
      <Card className="border-slate-200/70 shadow-sm">
        <CardHeader className="bg-slate-50/60 border-b border-slate-100 py-4 px-6">
          <CardTitle className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <CheckCircleOutlined className="text-slate-500" />
            Alur Persetujuan
          </CardTitle>
          <CardDescription className="text-[11px] text-slate-400 mt-0.5">
            Tahapan otorisasi berjenjang. Klik &quot;Delegasi&quot; untuk mendelegasikan approval.
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
              <div className="absolute left-[17px] top-9 bottom-9 w-px bg-gradient-to-b from-blue-200 via-slate-200 to-slate-100 pointer-events-none" />
              <div className="flex flex-col gap-3">
                {sortedProgress.map((step, idx) => (
                  <ApprovalStepCard
                    key={step.proposal_approval_id || idx}
                    step={step}
                    idx={idx}
                    onDelegasi={openDelegasiModal}
                  />
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Two-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column */}
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
                <InfoField label="Nomor Dokumen" value={docNo} icon={<FileTextOutlined />} mono />
                <InfoField
                  label="Tanggal Proposal"
                  value={renderDate(proposalDetail.proposal_date || proposalDetail.documentdate || proposalDetail.created)}
                  icon={<CalendarOutlined />}
                />
                <InfoField
                  label="Divisi & Region"
                  value={`${proposalDetail.division_code || proposalDetail.division || "-"} – ${proposalDetail.region || "-"}`}
                  icon={<GlobalOutlined />}
                />
                <InfoField label="Brand" value={proposalDetail.brand || "-"} icon={<TagOutlined />} />
                <InfoField
                  label="Vendor / Agency"
                  value={proposalDetail.nama_vendor ? `${proposalDetail.nama_vendor}${proposalDetail.kode_vendor ? ` (${proposalDetail.kode_vendor})` : ""}` : "-"}
                  icon={<BankOutlined />}
                />
                <InfoField
                  label="Periode / Tahun"
                  value={`${proposalDetail.budget_year || proposalDetail.period || "-"}${proposalDetail.period_start ? ` – ${proposalDetail.period_start} s/d ${proposalDetail.period_end}` : ""}`}
                  icon={<CalendarOutlined />}
                />
              </div>

              <Divider className="my-5 border-slate-100" />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4 flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-blue-400">
                    <DollarOutlined className="text-xs" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Nominal Anggaran</span>
                  </div>
                  <span className="text-blue-700 font-black text-lg tracking-tight leading-tight">
                    {renderCurrency(totalBudget)}
                  </span>
                </div>
                <div className={`rounded-xl p-4 flex flex-col justify-between gap-2 border ${proposalDetail.expired_date ? "bg-amber-50/70 border-amber-200" : "bg-slate-50 border-slate-200"}`}>
                  <div className="flex items-center justify-between">
                    <div className={`flex items-center gap-1.5 ${proposalDetail.expired_date ? "text-amber-600" : "text-slate-400"}`}>
                      <CalendarOutlined className="text-xs" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Expired Date</span>
                    </div>
                    <Button
                      type="text"
                      size="small"
                      icon={<EditOutlined />}
                      onClick={() => openSingleFieldEdit("expired_date", "Tanggal Kadaluarsa", "date")}
                      className="text-amber-700 hover:text-amber-900 hover:bg-amber-100 rounded-md h-6 px-1.5 text-xs font-semibold flex items-center gap-1"
                    >
                      Edit
                    </Button>
                  </div>
                  <span className={`font-bold text-sm ${proposalDetail.expired_date ? "text-amber-800" : "text-slate-400 italic text-xs"}`}>
                    {proposalDetail.expired_date ? renderDate(proposalDetail.expired_date) : "Belum diatur"}
                  </span>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <BarChartOutlined className="text-xs" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Biaya PO & Reversal</span>
                  </div>
                  <span className="text-slate-700 font-semibold text-sm">
                    PO: {proposalDetail.biaya_po || "-"} | Reversal: {proposalDetail.is_reversal || "-"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Strategic Context */}
          <Card className="border-slate-200/70 shadow-sm">
            <CardHeader className="bg-slate-50/60 border-b border-slate-100 py-4 px-6">
              <CardTitle className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <BarChartOutlined className="text-purple-500" />
                Konteks Strategis & Target
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              {STRATEGIC_FIELDS.map(({ key, label, borderColor, rows, mono }) => {
                const val = proposalDetail[key];
                return (
                  <div key={key} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
                      <Button
                        type="text"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => openSingleFieldEdit(key, label, "textarea", { rows, mono })}
                        className="text-slate-400 hover:text-blue-600 hover:bg-blue-50 font-semibold text-xs h-6 px-2 rounded-md flex items-center gap-1"
                      >
                        Edit
                      </Button>
                    </div>
                    {val ? (
                      mono ? (
                        <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-mono text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                          {val}
                        </div>
                      ) : (
                        <p className={`text-slate-700 text-sm leading-relaxed whitespace-pre-line border-l-2 ${borderColor} pl-3`}>
                          {val}
                        </p>
                      )
                    ) : (
                      <p className="text-slate-400 italic text-xs border-l-2 border-slate-200 pl-3">
                        Belum diisi. Klik edit untuk menambahkan {label.toLowerCase()}.
                      </p>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Budget Lines Table */}
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
                  rowKey={(row) => row.proposal_budget_id || row.budget_id || row.id || Math.random().toString()}
                  pagination={false}
                  size="small"
                  columns={[
                    {
                      title: "#",
                      key: "index",
                      width: 44,
                      align: "center",
                      render: (_, __, idx) => <span className="text-slate-400 font-bold text-xs">{idx + 1}</span>,
                    },
                    {
                      title: "Aktivitas & Kode Anggaran",
                      dataIndex: "activity",
                      key: "activity",
                      render: (t, r) => (
                        <div className="flex flex-col gap-1 py-1">
                          <span className="font-semibold text-slate-800 text-sm">{t || "-"}</span>
                          {r.activity_code && <span className="text-[10px] text-slate-400 font-mono">Kode: {r.activity_code}</span>}
                          {Array.isArray(r.variant) && r.variant.length > 0 && (
                            <div className="mt-1.5 pl-3 border-l-2 border-blue-300 flex flex-col gap-0.5">
                              <span className="text-[9px] uppercase font-bold text-blue-500 tracking-wider">Varian SKU:</span>
                              {r.variant.map((v, i) => (
                                <span key={i} className="text-xs text-slate-600">
                                  - {v.variant_desc || v.variant_id} {v.package_type ? `(${v.package_type})` : ""}
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
                      render: (t) => <Tag color="blue" className="font-semibold text-xs rounded-md border-none">{t || "-"}</Tag>,
                    },
                    {
                      title: "Bulan",
                      dataIndex: "bulan",
                      key: "bulan",
                      width: 80,
                      align: "center",
                      render: (t) => <span className="text-slate-600 text-xs">{t || "-"}</span>,
                    },
                    {
                      title: "Outstanding Klaim",
                      dataIndex: "outstanding_klaim",
                      key: "outstanding_klaim",
                      width: 150,
                      align: "right",
                      render: (v) => <span className="font-mono text-slate-600 text-xs">{renderCurrency(v)}</span>,
                    },
                    {
                      title: "Budget to Approve",
                      dataIndex: "budgettoapprove",
                      key: "budgettoapprove",
                      width: 150,
                      align: "right",
                      render: (v) => <span className="font-bold text-emerald-600 font-mono text-sm">{renderCurrency(v)}</span>,
                    },
                  ]}
                  className="rounded-b-2xl overflow-hidden"
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column: Sidebar */}
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
                  {attachmentFiles.map((fileItem, idx) => {
                    const fileUrl = `https://apiesales.enesis.com/apigateway/apiesales/proposal/file/${proposalId}/${encodeURIComponent(fileItem.name)}/`;
                    return (
                      <a
                        key={fileItem.uid || idx}
                        href={fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 border border-slate-200/60 rounded-xl bg-white hover:bg-slate-50 hover:border-slate-300 transition-all group no-underline"
                      >
                        <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center flex-shrink-0 group-hover:bg-slate-200 transition-colors">
                          <PaperClipOutlined className="text-base" />
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="font-semibold text-slate-700 text-xs truncate group-hover:text-slate-900 transition-colors" title={fileItem.name}>
                            {fileItem.name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium mt-0.5">Dokumen #{fileItem.no || idx + 1}</span>
                        </div>
                        <span className="text-[11px] font-semibold text-white bg-emerald-500 group-hover:bg-emerald-600 transition-colors px-3 py-1.5 rounded-lg flex-shrink-0">
                          Lihat
                        </span>
                      </a>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Approval Summary */}
          <Card className="border-slate-200/70 shadow-sm">
            <CardHeader className="bg-slate-50/60 border-b border-slate-100 py-4 px-5">
              <CardTitle className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <TeamOutlined className="text-blue-500" />
                Ringkasan Approval
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                <ApprovalSummaryRow label="Total Tahapan" value={sortedProgress.length} bg="bg-slate-100" text="text-slate-700" />
                <ApprovalSummaryRow label="Disetujui" value={statsApproved} bg="bg-emerald-50" text="text-emerald-700" />
                <ApprovalSummaryRow label="Menunggu" value={statsPending} bg="bg-amber-50" text="text-amber-700" />
                <ApprovalSummaryRow label="Ditolak" value={statsRejected} bg="bg-rose-50" text="text-rose-700" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delegasi Modal */}
      <DelegasiModal
        open={isDelegasiModalOpen}
        form={formDelegasi}
        onCancel={closeDelegasiModal}
        onSubmit={handleDelegasiSubmit}
        confirmLoading={isDelegating}
        candidates={delegasiOptions}
        candidatesLoading={isCandidatesLoading}
        activeStep={activeStep}
        selectedEmployeeId={selectedEmployeeId}
        onSelectChange={setSelectedEmployeeId}
        filterOption={filterDelegasiOption}
      />

      {/* Single Field Edit Modal */}
      <SingleFieldEditModal
        open={!!singleEditContext}
        onCancel={closeSingleFieldEdit}
        fieldContext={singleEditContext}
        proposalDetail={proposalDetail}
        onSave={handleSave}
        confirmLoading={isUpdatingProposal}
      />
    </div>
  );
}
