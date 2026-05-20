"use client";

import React, { use } from "react";
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
  DatePicker,
  message,
} from "antd";
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  ShoppingOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useProposal } from "@/hooks";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui";
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

export default function ProposalDetailPage({ params: paramsPromise }) {
  const resolvedParams = use(paramsPromise);
  const proposalId = resolvedParams.id;

  const router = useRouter();
  const screens = useBreakpoint();

  // ==========================================
  // 2. React Query Hook State
  // ==========================================
  const {
    proposalDetail,
    isDetailLoading,
    updateProposalData,
    isUpdatingProposal,
  } = useProposal(proposalId);

  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [form] = Form.useForm();

  const handleOpenEditModal = () => {
    form.setFieldsValue({
      title: proposalDetail?.title || proposalDetail?.name || "",
      background: proposalDetail?.background || "",
      objective: proposalDetail?.objective || "",
      mechanism: proposalDetail?.mechanism || "",
      kpi: proposalDetail?.kpi || "",
      expired_date: proposalDetail?.expired_date ? moment(proposalDetail.expired_date) : null,
    });
    setIsEditModalOpen(true);
  };

  const handleSaveUpdate = async (values) => {
    const getPayloadValue = (fieldKey, newValue) => {
      const oldValue = proposalDetail[fieldKey];
      
      if (fieldKey === "expired_date") {
        const formattedNew = newValue ? moment(newValue).format("YYYY-MM-DD") : null;
        const formattedOld = oldValue ? moment(oldValue).format("YYYY-MM-DD") : null;
        if (formattedNew === formattedOld) return null;
        return formattedNew;
      }

      const trimmedNew = typeof newValue === "string" ? newValue.trim() : newValue;
      const trimmedOld = typeof oldValue === "string" ? oldValue.trim() : oldValue;
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
    const progressList = proposalDetail.approvalprogress || proposalDetail.progress || [];
    return [...progressList].sort((a, b) => (a.no_appr || a.urutan || 0) - (b.no_appr || b.urutan || 0));
  }, [proposalDetail]);

  // Find the active pending step
  const currentApprover = React.useMemo(() => {
    if (!sortedProgress.length) return null;
    return sortedProgress.find(item => {
      const statusLower = (item.status || "").toLowerCase();
      return statusLower.includes("proses") || statusLower.includes("wait") || statusLower.includes("pending") || statusLower.includes("menunggu");
    }) || null;
  }, [sortedProgress]);

  if (isDetailLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        <Text className="text-slate-500 font-medium">Memuat Detail Proposal...</Text>
      </div>
    );
  }

  if (!proposalDetail) {
    return (
      <Card className="max-w-2xl mx-auto mt-8 border-slate-200">
        <CardContent className="text-center py-12">
          <CloseCircleOutlined className="text-red-500 text-5xl mb-4" />
          <Title level={4}>Data Proposal Tidak Ditemukan</Title>
          <Text className="text-slate-400 block mb-6">
            Dokumen Proposal yang Anda cari tidak tersedia atau tidak dapat diakses.
          </Text>
          <Button type="primary" onClick={() => router.push("/proposal")} className="bg-blue-600 hover:bg-blue-700 border-blue-600">
            Kembali ke Daftar Proposal
          </Button>
        </CardContent>
      </Card>
    );
  }

  // ==========================================
  // 3. Table Column Setup for Approval Steps
  // ==========================================
  const progressColumns = [
    {
      title: "No",
      key: "no",
      width: 60,
      align: "center",
      render: (_, row, index) => <Text className="font-semibold text-slate-500">{row.no_appr || row.urutan || index + 1}</Text>,
    },
    {
      title: "Jabatan",
      key: "jabatan",
      width: 140,
      render: (row) => <Text className="font-semibold text-slate-800">{row.position_appr || row.jabatan || "Executor"}</Text>,
    },
    {
      title: "Nama / NIK",
      key: "user",
      width: 220,
      render: (row) => (
        <div className="flex flex-col">
          <Text className="font-medium text-slate-700">{row.name || row.nama || "-"}</Text>
          <Text className="text-xs text-slate-400 font-mono">{row.employee_id || row.nik || "-"}</Text>
        </div>
      ),
    },
    {
      title: "Status",
      key: "status",
      width: 165,
      render: (row) => {
        const rawStatus = (row.status || row.status_approval_desc || "").toLowerCase();
        let color = "default";
        let icon = <ClockCircleOutlined />;
        
        if (rawStatus.includes("approve") || rawStatus === "approved" || rawStatus === "y") {
          color = "success";
          icon = <CheckCircleOutlined />;
        } else if (rawStatus.includes("reject") || rawStatus === "rejected" || rawStatus === "failed") {
          color = "error";
          icon = <CloseCircleOutlined />;
        } else if (rawStatus.includes("verif") || rawStatus.includes("proses") || rawStatus.includes("wait") || rawStatus.includes("menunggu") || rawStatus.includes("belum")) {
          color = "processing";
          icon = <ClockCircleOutlined className="animate-pulse" />;
        }

        return (
          <Tag icon={icon} color={color} className="font-medium uppercase px-2 py-0.5 rounded border-none">
            {row.status || row.status_approval_desc || "Belum diproses"}
          </Tag>
        );
      },
    },
    {
      title: "Tanggal Aksi",
      key: "dateaction",
      width: 140,
      render: (row) => {
        const val = row.updated_date || row.dateaction || row.created_date;
        return <Text className="text-xs text-slate-500 font-medium">{val ? moment(val).format("DD MMM YYYY") : "-"}</Text>;
      },
    },
  ];

  // ==========================================
  // 4. Declarative Layout Render
  // ==========================================
  const docNo = proposalDetail.proposal_no || proposalDetail.documentno || proposalDetail.nomor_proposal || proposalDetail.nomor || "-";
  const docStatus = (proposalDetail.status || proposalDetail.fcstatus || "PENDING").toLowerCase();
  const budgetLines = proposalDetail.budget || proposalDetail.lines || [];
  const attachmentFiles = proposalDetail.file || [];

  return (
    <div className="p-1 space-y-6">
      {/* Top Navigation Row */}
      <div className="flex items-center justify-between">
        <Button
          type="link"
          icon={<ArrowLeftOutlined />}
          onClick={() => router.push("/proposal")}
          className="text-blue-600 hover:text-blue-700 font-bold p-0 flex items-center gap-1 transition-all hover:translate-x-[-2px]"
        >
          Kembali ke Daftar Proposal
        </Button>
        {proposalDetail && (
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={handleOpenEditModal}
            className="bg-blue-600 hover:bg-blue-700 border-blue-600 font-bold px-5 h-9 rounded-xl flex items-center gap-1.5 shadow-sm"
          >
            Edit Detail Proposal
          </Button>
        )}
      </div>

      {/* Dynamic current approval status header banner (Millennial/Gen Z airy card) */}
      <div className="bg-gradient-to-r from-blue-50/50 via-indigo-50/30 to-white border border-blue-100 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 shadow-sm backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 text-white shadow-md shadow-blue-200">
            <ClockCircleOutlined className="text-xl animate-spin-slow" />
          </div>
          <div>
            <Text className="text-xs text-blue-500 font-bold uppercase tracking-widest block mb-1">Status Approval Saat Ini</Text>
            {currentApprover ? (
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <Text className="text-slate-800 text-sm font-semibold">
                  Sedang menunggu persetujuan dari:
                </Text>
                <Text className="text-blue-700 text-sm font-extrabold">
                  {currentApprover.name || currentApprover.nama}
                </Text>
                <Tag color="blue" className="font-extrabold uppercase text-[10px] px-2 py-0.5 rounded-md border-none shadow-sm m-0">
                  {currentApprover.position_appr || currentApprover.jabatan || "Executor"}
                </Tag>
              </div>
            ) : docStatus === "approved" || docStatus === "apr" || docStatus === "y" || docStatus === "success" ? (
              <Text className="text-emerald-700 text-sm font-extrabold flex items-center gap-1.5">
                <CheckCircleOutlined /> Persetujuan Selesai! Seluruh tahapan telah disetujui sepenuhnya.
              </Text>
            ) : (
              <Text className="text-slate-800 text-sm font-semibold">
                Proposal dalam status: <span className="capitalize font-bold text-slate-700">{proposalDetail.status || "Draft"}</span>
              </Text>
            )}
          </div>
        </div>
        {currentApprover && (
          <div className="flex items-center gap-2 self-start sm:self-auto bg-blue-100/50 border border-blue-200/50 rounded-full px-3 py-1 font-bold text-[10px] text-blue-700 uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
            Siklus Aktif
          </div>
        )}
      </div>

      {/* Main Container Stack */}
      <div className="space-y-8">
          
          {/* Main Details Card */}
          <Card className="shadow-sm border-slate-100 rounded-2xl overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-6 px-7">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <ShoppingOutlined className="text-blue-600 text-2xl" />
                    Detail Proposal Support
                  </CardTitle>
                  <CardDescription className="text-slate-400 mt-1">
                    Dokumen Number: <span className="font-semibold text-slate-700">{docNo}</span>
                  </CardDescription>
                </div>
                <div>
                  <Tag
                    color={
                      docStatus === "approved" || docStatus === "apr" || docStatus === "y" || docStatus === "success" || docStatus === "on progress"
                        ? "success"
                        : docStatus === "rejected" || docStatus === "failed" || docStatus === "reject" || docStatus === "n"
                        ? "error"
                        : "warning"
                    }
                    className="font-bold uppercase px-3 py-1 rounded-md text-xs border-none shadow-sm"
                  >
                    {proposalDetail.status || proposalDetail.fcstatus || "PENDING"}
                  </Tag>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-7">
              {/* Core Information Grid (Spacious Airy Layout) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
                <div className="flex flex-col">
                  <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1.5">Nomor Proposal</Text>
                  <Text className="text-slate-900 font-extrabold text-base">{docNo}</Text>
                </div>

                <div className="flex flex-col">
                  <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1.5">Tanggal Proposal</Text>
                  <Text className="text-slate-800 font-semibold">{formatDate(proposalDetail.proposal_date || proposalDetail.documentdate || proposalDetail.created)}</Text>
                </div>

                <div className="flex flex-col md:col-span-2">
                  <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1.5">Nama Proposal / Project</Text>
                  <Text className="text-slate-900 font-extrabold text-lg leading-snug">{proposalDetail.title || proposalDetail.name || "-"}</Text>
                </div>

                <div className="flex flex-col">
                  <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1.5">Divisi & Region</Text>
                  <Text className="text-slate-800 font-semibold">
                    {proposalDetail.division_code || proposalDetail.division || "-"} | {proposalDetail.region || "-"}
                  </Text>
                </div>

                <div className="flex flex-col">
                  <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1.5">Brand</Text>
                  <Text className="text-slate-800 font-semibold">{proposalDetail.brand || "-"}</Text>
                </div>

                <div className="flex flex-col">
                  <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1.5">Vendor / Agency</Text>
                  <Text className="text-slate-800 font-semibold">
                    {proposalDetail.nama_vendor || "-"} 
                    {proposalDetail.kode_vendor ? ` (${proposalDetail.kode_vendor})` : ""}
                  </Text>
                </div>

                <div className="flex flex-col">
                  <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1.5">Periode / Tahun</Text>
                  <Text className="text-slate-800 font-semibold">
                    {proposalDetail.budget_year || proposalDetail.period || "-"}
                    {proposalDetail.period_start ? ` [${proposalDetail.period_start} s/d ${proposalDetail.period_end}]` : ""}
                  </Text>
                </div>

                <div className="flex flex-col">
                  <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1.5">Tanggal Kadaluarsa (Expired Date)</Text>
                  <Text className="text-amber-600 font-extrabold">
                    {proposalDetail.expired_date ? formatDate(proposalDetail.expired_date) : "TIDAK ADA EXPIRED DATE"}
                  </Text>
                </div>

                <div className="flex flex-col">
                  <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1.5">Nominal Anggaran (Budget)</Text>
                  <Text className="text-blue-600 font-black text-xl tracking-tight">
                    {formatCurrency(proposalDetail.total_budget ?? proposalDetail.budget ?? proposalDetail.amount ?? 0)}
                  </Text>
                </div>

                <div className="flex flex-col">
                  <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1.5">Biaya PO & Reversal</Text>
                  <Text className="text-slate-800 font-semibold">
                    Biaya PO: <span className="font-bold">{proposalDetail.biaya_po || "-"}</span> | Reversal: <span className="font-bold">{proposalDetail.is_reversal || "-"}</span>
                  </Text>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Strategic Context Cards (Background, Objectives, Mech, KPI) */}
          {(proposalDetail.background || proposalDetail.objective || proposalDetail.mechanism || proposalDetail.kpi) && (
            <Card className="shadow-sm border-slate-100 rounded-2xl overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-5 px-7">
                <CardTitle className="text-base font-bold text-slate-800">
                  Konteks Strategis & Target Proposal
                </CardTitle>
              </CardHeader>
              <CardContent className="p-7 space-y-6">
                {proposalDetail.background && (
                  <div>
                    <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1.5">Latar Belakang (Background)</Text>
                    <Text className="text-slate-700 whitespace-pre-line text-sm leading-relaxed">{proposalDetail.background}</Text>
                  </div>
                )}
                
                {proposalDetail.objective && (
                  <div>
                    <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1.5">Tujuan (Objective)</Text>
                    <Text className="text-slate-700 whitespace-pre-line text-sm leading-relaxed">{proposalDetail.objective}</Text>
                  </div>
                )}

                {proposalDetail.mechanism && (
                  <div>
                    <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1.5">Mekanisme Pelaksanaan (Mechanism)</Text>
                    <Text className="text-slate-700 whitespace-pre-line text-sm leading-relaxed">{proposalDetail.mechanism}</Text>
                  </div>
                )}

                {proposalDetail.kpi && (
                  <div>
                    <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1.5">Indikator Kinerja (KPI)</Text>
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 mt-2 text-slate-700 whitespace-pre-line text-xs font-semibold font-mono leading-relaxed">
                      {proposalDetail.kpi}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Budget Lines and Product Variants */}
          {budgetLines.length > 0 && (
            <Card className="shadow-sm border-slate-100 rounded-2xl overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-5 px-7">
                <CardTitle className="text-base font-bold text-slate-800">
                  Rincian Anggaran & Varian Produk
                </CardTitle>
              </CardHeader>
              <CardContent className="p-7">
                <Table
                  dataSource={budgetLines}
                  rowKey={(row) => row.proposal_budget_id || row.budget_id || row.id || Math.random().toString()}
                  pagination={false}
                  bordered
                  size="small"
                  columns={[
                    {
                      title: "No",
                      key: "index",
                      width: 50,
                      align: "center",
                      render: (_, __, idx) => idx + 1,
                    },
                    {
                      title: "Aktivitas & Kode Anggaran",
                      dataIndex: "activity",
                      key: "activity",
                      render: (t, r) => (
                        <div className="flex flex-col gap-1">
                          <Text className="font-semibold text-slate-800">{t || "-"}</Text>
                          {r.activity_code && (
                            <Text className="text-[11px] text-slate-400 font-mono">
                              Kode: {r.activity_code}
                            </Text>
                          )}
                          {/* Nested Product Variants */}
                          {Array.isArray(r.variant) && r.variant.length > 0 && (
                            <div className="mt-1.5 pl-3 border-l-2 border-blue-400 flex flex-col gap-0.5">
                              <span className="text-[9px] uppercase font-bold text-blue-500 tracking-wider">Varian SKU Produk:</span>
                              {r.variant.map((v, i) => (
                                <Text key={i} className="text-xs text-slate-600 font-medium">
                                  • {v.variant_desc || v.variant_id} {v.package_type ? `(${v.package_type})` : ""}
                                </Text>
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
                      render: (t) => <Tag color="blue" className="font-semibold">{t || "-"}</Tag>,
                    },
                    {
                      title: "Bulan",
                      dataIndex: "bulan",
                      key: "bulan",
                      width: 90,
                      align: "center",
                    },
                    {
                      title: "Outstanding Klaim",
                      dataIndex: "outstanding_klaim",
                      key: "outstanding_klaim",
                      width: 140,
                      align: "right",
                      render: (val) => <Text className="font-mono text-slate-600">{formatCurrency(val)}</Text>,
                    },
                    {
                      title: "Budget to Approve",
                      dataIndex: "budgettoapprove",
                      key: "budgettoapprove",
                      width: 140,
                      align: "right",
                      render: (val) => <Text className="font-bold text-emerald-600">{formatCurrency(val)}</Text>,
                    },
                  ]}
                  className="border border-slate-100 rounded-lg overflow-hidden"
                />
              </CardContent>
            </Card>
          )}

          {/* Attached Files List */}
          {attachmentFiles.length > 0 && (
            <Card className="shadow-sm border-slate-100 rounded-2xl overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-5 px-7">
                <CardTitle className="text-base font-bold text-slate-800">
                  Dokumen Lampiran (Attachments)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-7">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {attachmentFiles.map((fileItem, fileIdx) => (
                    <div 
                      key={fileItem.uid || fileIdx} 
                      className="flex items-center gap-3.5 p-4 border border-slate-200/60 rounded-xl bg-slate-50/50 hover:bg-slate-100/50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100 text-blue-600">
                        <ShoppingOutlined className="text-lg" />
                      </div>
                      <div className="flex flex-col min-w-0 flex-1">
                        <Text className="font-bold text-slate-700 text-xs truncate" title={fileItem.name}>
                          {fileItem.name}
                        </Text>
                        <Text className="text-[9px] text-slate-400 uppercase font-black mt-0.5 tracking-wider">
                          File Attachment #{fileItem.no || fileIdx + 1}
                        </Text>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        {/* Attached Files Card closes */}
        </div>

      {/* 3. Stepper Workflow Timeline (Full Width / col-12 - Spacious Vertical List of Rows) */}
      <Card className="shadow-sm border-slate-100 rounded-2xl overflow-hidden mt-6">
        <CardHeader className="bg-white border-b border-slate-100 py-6 px-7">
          <CardTitle className="text-lg font-extrabold text-slate-800">
            Alur Persetujuan
          </CardTitle>
          <CardDescription className="text-slate-400 mt-1">
            Tahapan otorisasi berjenjang yang transparan
          </CardDescription>
        </CardHeader>
        <CardContent className="p-7">
          <div className="flex flex-col gap-4 relative">
            {sortedProgress.map((step, idx) => {
              const rawStatus = (step.status || step.status_approval_desc || "").toLowerCase();
              let isApproved = rawStatus.includes("approve") || rawStatus === "approved" || rawStatus === "y" || rawStatus === "success";
              let isCurrent = rawStatus.includes("proses") || rawStatus.includes("wait") || rawStatus.includes("menunggu") || rawStatus.includes("belum");
              let isRejected = rawStatus.includes("reject") || rawStatus === "rejected" || rawStatus === "failed";
              
              // Style configurations
              let dotColor = "bg-slate-200 border-slate-300";
              let cardBg = "bg-slate-50/50 border-slate-100";
              let tagColor = "default";
              let statusLabel = step.status || "Menunggu";

              if (isApproved) {
                dotColor = "bg-emerald-500 border-emerald-600 ring-4 ring-emerald-50";
                cardBg = "bg-emerald-50/30 border-emerald-100/80";
                tagColor = "success";
              } else if (isRejected) {
                dotColor = "bg-rose-500 border-rose-600 ring-4 ring-rose-50";
                cardBg = "bg-rose-50/30 border-rose-100/80";
                tagColor = "error";
              } else if (isCurrent) {
                dotColor = "bg-blue-600 border-blue-700 ring-4 ring-blue-50 animate-pulse";
                cardBg = "bg-blue-50/40 border-blue-100/80 shadow-sm";
                tagColor = "processing";
              }

              return (
                <div 
                  key={step.proposal_approval_id || idx} 
                  className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-2xl border transition-all ${cardBg}`}
                >
                  {/* Left Section: Sequence & Position/Role */}
                  <div className="flex items-center gap-4 min-w-0 sm:w-1/4">
                    <span className={`w-3.5 h-3.5 rounded-full border flex-shrink-0 ${dotColor}`} />
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Tahap {step.no_appr || idx + 1}</span>
                      <span className="text-xs font-extrabold text-blue-600 uppercase tracking-wide truncate mt-0.5" title={step.position_appr || step.jabatan || "Executor"}>
                        {step.position_appr || step.jabatan || "Executor"}
                      </span>
                    </div>
                  </div>

                  {/* Middle Section: Name and Employee ID */}
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-sm font-extrabold text-slate-800 truncate" title={step.name || step.nama}>
                      {step.name || step.nama || "-"}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono mt-0.5">NIK: {step.employee_id || step.nik || "-"}</span>
                  </div>

                  {/* Right Section: Status Tag & Date */}
                  <div className="flex flex-col sm:items-end gap-2 flex-shrink-0">
                    <div className="flex items-center gap-4">
                      <Tag color={tagColor} className="font-semibold uppercase text-[10px] px-2.5 py-0.5 rounded-md border-none m-0 shadow-sm">
                        {statusLabel}
                      </Tag>
                    </div>
                    {(step.updated_date || step.dateaction || step.created_date) && (
                      <span className="text-[10px] text-slate-400 font-medium">
                        Diverifikasi: {moment(step.updated_date || step.dateaction || step.created_date).format("DD MMM YYYY, HH:mm")}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 4. Edit Proposal Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4 pr-6">
            <EditOutlined className="text-blue-600 text-xl" />
            <span className="text-lg font-black text-slate-800">Edit Data Detail Proposal</span>
          </div>
        }
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        footer={null}
        width={720}
        className="rounded-2xl overflow-hidden"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveUpdate}
          className="mt-6 space-y-4"
        >
          <Form.Item
            name="title"
            label={<span className="font-bold text-slate-700 text-xs uppercase tracking-wider">Nama Proposal / Project</span>}
          >
            <Input placeholder="Masukkan Nama Proposal..." size="large" className="rounded-xl" />
          </Form.Item>

          <Form.Item
            name="expired_date"
            label={<span className="font-bold text-slate-700 text-xs uppercase tracking-wider">Tanggal Kadaluarsa (Expired Date)</span>}
          >
            <DatePicker placeholder="Pilih Tanggal Kadaluarsa" size="large" style={{ width: "100%" }} className="rounded-xl" />
          </Form.Item>

          <Form.Item
            name="background"
            label={<span className="font-bold text-slate-700 text-xs uppercase tracking-wider">Latar Belakang (Background)</span>}
          >
            <Input.TextArea placeholder="Tuliskan latar belakang..." rows={3} className="rounded-xl" />
          </Form.Item>

          <Form.Item
            name="objective"
            label={<span className="font-bold text-slate-700 text-xs uppercase tracking-wider">Tujuan (Objective)</span>}
          >
            <Input.TextArea placeholder="Tuliskan tujuan proposal..." rows={3} className="rounded-xl" />
          </Form.Item>

          <Form.Item
            name="mechanism"
            label={<span className="font-bold text-slate-700 text-xs uppercase tracking-wider">Mekanisme Pelaksanaan (Mechanism)</span>}
          >
            <Input.TextArea placeholder="Tuliskan mekanisme pelaksanaan..." rows={3} className="rounded-xl" />
          </Form.Item>

          <Form.Item
            name="kpi"
            label={<span className="font-bold text-slate-700 text-xs uppercase tracking-wider">Indikator Kinerja (KPI)</span>}
          >
            <Input.TextArea placeholder="Tuliskan indikator kinerja / KPI..." rows={3} className="rounded-xl font-mono text-xs" />
          </Form.Item>

          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-6 mt-6">
            <Button
              onClick={() => setIsEditModalOpen(false)}
              size="large"
              className="rounded-xl font-bold border-slate-200 text-slate-500 hover:text-slate-700"
            >
              Batal
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={isUpdatingProposal}
              className="rounded-xl font-bold bg-blue-600 hover:bg-blue-700 border-blue-600 px-6"
            >
              Simpan Perubahan
            </Button>
          </div>
        </Form>
      </Modal>

    </div>
  );
}
