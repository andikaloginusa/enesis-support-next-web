"use client";

import React, { use, useState } from "react";
import {
  Button,
  Form,
  Select,
  Table,
  Typography,
  Modal,
} from "antd";
import {
  ArrowLeftOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  EditOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import moment from "moment";
import { useFkr } from "@/hooks";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  InfoField,
  StatusBadge,
  renderCurrency,
  renderDate,
  renderDateTime,
  renderNumber,
} from "@/components/ui";

// ─────────────────────────────────────────────────────────────────────────────
//  Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <div className="w-12 h-12 rounded-full border-2 border-t-emerald-600 border-b-emerald-600 border-l-transparent border-r-transparent animate-spin" />
      <Typography.Text className="text-slate-500 font-medium">
        Memuat Detail FKR...
      </Typography.Text>
    </div>
  );
}

function NotFoundState({ onBack }) {
  return (
    <Card className="max-w-2xl mx-auto mt-8">
      <CardContent className="text-center py-12">
        <CloseCircleOutlined className="text-red-400 text-5xl mb-4 block" />
        <Typography.Title level={4}>Data FKR Tidak Ditemukan</Typography.Title>
        <Typography.Text className="text-slate-400 block mb-6">
          Dokumen FKR yang Anda cari tidak tersedia atau tidak dapat diakses.
        </Typography.Text>
        <Button type="primary" onClick={onBack}>
          Kembali ke Daftar FKR
        </Button>
      </CardContent>
    </Card>
  );
}

function ApprovalStatusBanner({ currentApprover, docStatus }) {
  const isApproved = docStatus?.toLowerCase().includes("approve");
  const isRejected = docStatus?.toLowerCase().includes("reject");

  return (
    <div className="bg-gradient-to-r from-emerald-50/60 via-teal-50/40 to-white border border-emerald-100 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-200 flex-shrink-0">
          {isApproved ? (
            <CheckCircleOutlined className="text-xl" />
          ) : isRejected ? (
            <CloseCircleOutlined className="text-xl" />
          ) : (
            <ClockCircleOutlined className="text-xl animate-pulse" />
          )}
        </div>
        <div>
          <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest mb-1">
            Status Approval Saat Ini
          </p>
          {currentApprover ? (
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <p className="text-slate-800 text-sm font-semibold">
                Sedang menunggu persetujuan dari:
              </p>
              <p className="text-emerald-700 text-sm font-extrabold">
                {currentApprover.nama || currentApprover.name}
              </p>
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 text-[10px] font-extrabold uppercase border border-emerald-200">
                {currentApprover.jabatan || "Executor"}
              </span>
            </div>
          ) : isApproved ? (
            <p className="text-emerald-700 text-sm font-extrabold flex items-center gap-1.5">
              <CheckCircleOutlined />
              Persetujuan Selesai — seluruh tahapan telah disetujui.
            </p>
          ) : (
            <p className="text-slate-800 text-sm font-semibold">
              FKR dalam status:{" "}
              <span className="font-extrabold text-slate-700 capitalize">
                {docStatus || "Draft"}
              </span>
            </p>
          )}
        </div>
      </div>
      {currentApprover && (
        <div className="self-start sm:self-auto inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1 text-[10px] font-bold text-emerald-700 uppercase tracking-widest">
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping inline-block" />
          Siklus Aktif
        </div>
      )}
    </div>
  );
}

function WorkflowStepCard({ step, idx, onDelegasi }) {
  const raw = (step.status || "").toLowerCase();
  const isApproved =
    raw.includes("approve") || raw === "approved" || raw === "y" || raw === "success";
  const isCurrent =
    raw.includes("proses") || raw.includes("wait") || raw.includes("menunggu") ||
    raw.includes("belum") || raw === "pending";
  const isRejected = raw.includes("reject") || raw === "rejected" || raw === "failed";

  let dotColor = "bg-slate-200 border-slate-300";
  let cardBg = "bg-slate-50/50 border-slate-100";

  if (isApproved) {
    dotColor = "bg-emerald-500 border-emerald-600 ring-4 ring-emerald-50";
    cardBg = "bg-emerald-50/30 border-emerald-100/80";
  } else if (isRejected) {
    dotColor = "bg-rose-500 border-rose-600 ring-4 ring-rose-50";
    cardBg = "bg-rose-50/30 border-rose-100/80";
  } else if (isCurrent) {
    dotColor = "bg-emerald-600 border-emerald-700 ring-4 ring-emerald-50 animate-pulse";
    cardBg = "bg-blue-50/40 border-blue-100/80 shadow-sm";
  }

  return (
    <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-2xl border transition-all ${cardBg}`}>
      <div className="flex items-center gap-4 min-w-0 sm:w-1/4">
        <span className={`w-3.5 h-3.5 rounded-full border flex-shrink-0 ${dotColor}`} />
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Tahap {step.urutan || idx + 1}
          </span>
          <span className="text-xs font-extrabold text-emerald-600 uppercase tracking-wide truncate" title={step.jabatan || "Executor"}>
            {step.jabatan || "Executor"}
          </span>
        </div>
      </div>

      <div className="flex flex-col min-w-0 flex-1">
        <span className="text-sm font-extrabold text-slate-800 truncate" title={step.nama}>
          {step.nama || "-"}
        </span>
        <span className="text-[11px] text-slate-400 font-mono mt-0.5">
          NIK: {step.nik || "-"}
        </span>
      </div>

      <div className="flex flex-col sm:items-end gap-2 flex-shrink-0">
        <div className="flex items-center gap-3">
          <StatusBadge status={step.status} />
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => onDelegasi(step)}
            className="font-bold text-emerald-600 hover:text-emerald-700 text-xs p-0 h-auto flex items-center gap-0.5"
          >
            Delegasi
          </Button>
        </div>
        {step.updated_date && (
          <span className="text-[10px] text-slate-400 font-medium">
            Diverifikasi: {moment(step.updated_date).format("DD MMM YYYY, HH:mm")}
          </span>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Detail Field Grid Builder
// ─────────────────────────────────────────────────────────────────────────────

function buildDetailFields(fkrDetail) {
  const nominal =
    fkrDetail.amount !== undefined ? fkrDetail.amount : fkrDetail.nominal_fkr;

  return [
    { title: "Nomor FKR", value: fkrDetail.nomor_fkr },
    { title: "Status Dokumen", value: <StatusBadge status={fkrDetail.status} /> },
    { title: "Kode Status", value: fkrDetail.kode_status || "-" },
    {
      title: "Total Nilai FKR",
      value: (
        <span className="text-emerald-700 font-extrabold text-base">
          {renderCurrency(nominal)}
        </span>
      ),
    },
    { title: "Nomor SO", value: fkrDetail.nomor_so || "-" },
    { title: "Nomor GI", value: fkrDetail.nomor_gi || "-" },
    { title: "Nomor CN", value: fkrDetail.nomor_cn || "-" },
    { title: "Nama Pajak", value: fkrDetail.nama_pajak || "-" },
    { title: "Kode Pajak", value: fkrDetail.kode || "-" },
    { title: "Nama Distributor", value: fkrDetail.nama_distributor },
    { title: "Nama Channel", value: fkrDetail.nama_channel || "-" },
    { title: "Dibuat Tanggal", value: renderDateTime(fkrDetail.created) },
  ];
}

// ─────────────────────────────────────────────────────────────────────────────
//  Main Page Component
// ─────────────────────────────────────────────────────────────────────────────

export default function FkrDetailPage({ params: paramsPromise }) {
  const resolvedParams = use(paramsPromise);
  const fkrId = resolvedParams.id;
  const router = useRouter();

  const [formFKR] = Form.useForm();
  const [modal] = Modal.useModal();

  const {
    fkrDetail,
    isDetailLoading,
    candidatesList,
    isCandidatesLoading,
    fetchCandidatesForJabatan,
    clearActiveCandidates,
    updateApprover,
    isUpdatingApprover,
    refetchDetail,
  } = useFkr(fkrId);

  // ── Modal State ──
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeRow, setActiveRow] = useState(null);
  const [selectedApprovalId, setSelectedApprovalId] = useState(null);
  const [approvalValue, setApprovalValue] = useState(null);

  // ── Derived Data ──
  const sortedProgress = React.useMemo(() => {
    if (!fkrDetail?.progress) return [];
    return [...fkrDetail.progress].sort((a, b) => (a.urutan || 0) - (b.urutan || 0));
  }, [fkrDetail]);

  const currentApprover = React.useMemo(() => {
    if (!sortedProgress.length) return null;
    return (
      sortedProgress.find((item) => {
        const s = (item.status || "").toLowerCase();
        return (
          s.includes("proses") || s.includes("wait") ||
          s.includes("pending") || s.includes("menunggu") || s.includes("belum")
        );
      }) || null
    );
  }, [sortedProgress]);

  // ── Product Lines Columns ──
  const productLinesColumns = [
    {
      title: "No",
      align: "center",
      key: "no",
      width: 60,
      render: (_, __, idx) => idx + 1,
    },
    {
      title: "Kode Produk",
      dataIndex: "kode_produk",
      key: "kode_produk",
      width: 120,
      render: (v) => <Typography.Text className="font-mono text-xs">{v}</Typography.Text>,
    },
    {
      title: "Nama Barang",
      dataIndex: "nama_barang",
      key: "nama_barang",
      render: (text) => (
        <Typography.Text className="font-semibold text-slate-800">{text}</Typography.Text>
      ),
    },
    {
      title: "Satuan",
      dataIndex: "satuan",
      key: "satuan",
      width: 100,
      align: "center",
    },
    {
      title: "Total Retur",
      dataIndex: "total_retur",
      key: "total_retur",
      align: "right",
      width: 120,
      render: (val) => renderNumber(val),
    },
    {
      title: "Subtotal",
      dataIndex: "amount_item",
      key: "amount_item",
      align: "right",
      width: 160,
      render: (val) => (
        <Typography.Text className="font-bold text-emerald-700">
          {renderCurrency(val)}
        </Typography.Text>
      ),
    },
  ];

  // ── Select Options Builder ──
  const userOptions = React.useMemo(() => {
    if (!activeRow) return [];
    const opts = [{ value: activeRow.m_user_id, label: `${activeRow.nik} – ${activeRow.nama}` }];
    (candidatesList || []).forEach((c) => {
      if (activeRow && c.m_user_id === activeRow.m_user_id) return;
      opts.push({ value: c.m_user_id, label: `${c.nik || c.employee_id} – ${c.nama_user || c.name}` });
    });
    return opts;
  }, [activeRow, candidatesList]);

  const filterOption = (input, option) =>
    (option?.label ?? "").toLowerCase().includes(input.toLowerCase());

  // ── Action Handlers ──

  const openDelegasiModal = (row) => {
    setActiveRow(row);
    fetchCandidatesForJabatan(row.jabatan);
    setSelectedApprovalId(row.fkr_approval_id);
    setApprovalValue(row.m_user_id);
    formFKR.setFieldsValue({ m_user_id: row.m_user_id });
    setIsModalOpen(true);
  };

  const closeDelegasiModal = () => {
    setIsModalOpen(false);
    setActiveRow(null);
    setSelectedApprovalId(null);
    setApprovalValue(null);
    clearActiveCandidates();
    formFKR.resetFields();
  };

  const handleDelegasiOk = () => {
    formFKR.validateFields()
      .then((values) => {
        modal.confirm({
          title: "Simpan Perubahan?",
          icon: <ExclamationCircleOutlined className="text-amber-500" />,
          okText: "Ya, Simpan",
          cancelText: "Batal",
          okButtonProps: {
            className: "bg-emerald-600 hover:bg-emerald-700 border-emerald-600 rounded-lg",
            size: "large",
          },
          cancelButtonProps: { size: "large" },
          onOk: async () => {
            try {
              await updateApprover({ id: selectedApprovalId, m_user_id: values.m_user_id });
              closeDelegasiModal();
              refetchDetail();
            } catch { /* Handled by mutation onError */ }
          },
        });
      })
      .catch(() => { /* Validation styled by Ant Design */ });
  };

  // ── Render States ──
  if (isDetailLoading) return <LoadingSpinner />;
  if (!fkrDetail) return <NotFoundState onBack={() => router.push("/fkr")} />;

  const detailFields = buildDetailFields(fkrDetail);
  const hasProductLines = Array.isArray(fkrDetail.lines) && fkrDetail.lines.length > 0;

  return (
    <div className="space-y-6 max-w-full">
      {/* Back Navigation */}
      <div className="flex items-center justify-between">
        <Button
          type="link"
          icon={<ArrowLeftOutlined />}
          onClick={() => router.push("/fkr")}
          className="text-emerald-600 hover:text-emerald-700 font-bold p-0 flex items-center gap-1 hover:translate-x-[-2px] transition-all"
        >
          Kembali ke Daftar FKR
        </Button>
      </div>

      {/* Status Banner */}
      <ApprovalStatusBanner
        currentApprover={currentApprover}
        docStatus={fkrDetail.status}
      />

      <div className="space-y-8">
        {/* Detail Card */}
        <Card className="shadow-sm border-slate-100 rounded-2xl overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-6 px-7">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex flex-col gap-1">
                <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <ShoppingOutlined className="text-emerald-600 text-2xl" />
                  Detail Dokumen FKR
                </CardTitle>
                <CardDescription className="text-slate-400 mt-1">
                  Dokumen Number:{" "}
                  <span className="font-semibold text-slate-700">{fkrDetail.nomor_fkr}</span>
                </CardDescription>
              </div>
              <StatusBadge status={fkrDetail.status} />
            </div>
          </CardHeader>
          <CardContent className="p-7">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-12">
              {detailFields.map((item, idx) => (
                <InfoField key={idx} label={item.title} value={item.value} />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Product Lines */}
        {hasProductLines && (
          <Card className="shadow-sm border-slate-100 rounded-2xl overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-5 px-7">
              <div className="flex items-center gap-3">
                <ShoppingOutlined className="text-emerald-600 text-2xl" />
                <div>
                  <CardTitle className="text-base font-bold text-slate-800">
                    Daftar Barang Retur
                  </CardTitle>
                  <CardDescription className="text-slate-400 mt-1">
                    Rincian item barang atau produk dalam pengajuan klaim ritel ini.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-7">
              <Table
                columns={productLinesColumns}
                dataSource={fkrDetail.lines}
                rowKey="fkr_detail_id"
                pagination={{ pageSize: 10, size: "small" }}
                className="border border-slate-100 rounded-xl overflow-hidden"
              />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Workflow Stepper */}
      <Card className="shadow-sm border-slate-100 rounded-2xl overflow-hidden">
        <CardHeader className="bg-white border-b border-slate-100 py-6 px-7">
          <CardTitle className="text-lg font-extrabold text-slate-800">
            Alur Persetujuan
          </CardTitle>
          <CardDescription className="text-slate-400 mt-1">
            Tahapan otorisasi berjenjang beserta opsi delegasi per langkah.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-7">
          <div className="flex flex-col gap-4">
            {sortedProgress.map((step, idx) => (
              <WorkflowStepCard
                key={step.fkr_approval_id || idx}
                step={step}
                idx={idx}
                onDelegasi={openDelegasiModal}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Delegasi Modal */}
      <Modal
        title={
          <div className="text-slate-800 font-bold text-lg border-b border-slate-100 pb-3">
            Edit Approval
          </div>
        }
        open={isModalOpen}
        okButtonProps={{
          disabled: !approvalValue,
          className: "bg-emerald-600 hover:bg-emerald-700 border-emerald-600 rounded-lg",
          size: "large",
        }}
        cancelButtonProps={{ size: "large", className: "rounded-lg" }}
        onOk={handleDelegasiOk}
        onCancel={closeDelegasiModal}
        confirmLoading={isUpdatingApprover}
        className="rounded-xl overflow-hidden"
      >
        <div className="py-4">
          <Typography.Text className="block text-slate-500 text-sm mb-4 leading-relaxed">
            Pilih user pengganti dengan jabatan yang sama untuk mendelegasikan langkah approval ini.
          </Typography.Text>
          <Form form={formFKR} layout="vertical">
            <Form.Item
              label={<Typography.Text className="font-semibold text-slate-700">User</Typography.Text>}
              name="m_user_id"
              rules={[{ required: true, message: "Pilih user pengganti!" }]}
            >
              <Select
                showSearch
                placeholder="Pilih User"
                optionFilterProp="label"
                onChange={(val) => setApprovalValue(val)}
                filterOption={filterOption}
                options={userOptions}
                loading={isCandidatesLoading}
                size="large"
                className="w-full rounded-lg"
              />
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </div>
  );
}
