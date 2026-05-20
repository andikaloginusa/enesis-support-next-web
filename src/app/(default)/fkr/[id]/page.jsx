"use client";

import React, { use, useState } from "react";
import {
  Button,
  Form,
  Select,
  Tag,
  Table,
  Typography,
  Modal,
  Grid,
  Divider,
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
import { useFkr } from "@/hooks";
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

export default function FkrDetailPage({ params: paramsPromise }) {
  const resolvedParams = use(paramsPromise);
  const fkrId = resolvedParams.id;

  const router = useRouter();
  const screens = useBreakpoint();
  const [formFKR] = Form.useForm();
  
  // Ant Design dynamic confirmation modal instance
  const [modal, contextHolder] = Modal.useModal();

  // ==========================================
  // 2. React Query Hook State & Mutations
  // ==========================================
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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedApprovalId, setSelectedApprovalId] = useState(null);
  const [defaultValueApproval, setDefaultValueApproval] = useState(null);
  const [approvalValue, setApprovalValue] = useState(null);
  const [activeRow, setActiveRow] = useState(null);

  // Sort the approvals progress list by 'urutan' ascendingly to reflect step sequence
  const sortedProgress = React.useMemo(() => {
    if (!fkrDetail || !Array.isArray(fkrDetail.progress)) return [];
    return [...fkrDetail.progress].sort((a, b) => (a.urutan || 0) - (b.urutan || 0));
  }, [fkrDetail]);

  // Find the active pending step
  const currentApprover = React.useMemo(() => {
    if (!sortedProgress.length) return null;
    return sortedProgress.find(item => {
      const statusLower = (item.status || "").toLowerCase();
      return statusLower.includes("proses") || statusLower.includes("wait") || statusLower.includes("pending") || statusLower.includes("menunggu") || statusLower.includes("belum");
    }) || null;
  }, [sortedProgress]);

  // ==========================================
  // 3. Action Handlers (Single Responsibility)
  // ==========================================

  const showModal = (row) => {
    setActiveRow(row);
    // Dynamically query list data of employees with the same jabatan
    fetchCandidatesForJabatan(row.jabatan);
    
    setDefaultValueApproval(row.m_user_id);
    setSelectedApprovalId(row.fkr_approval_id);
    setApprovalValue(row.m_user_id);
    
    formFKR.setFieldsValue({ m_user_id: row.m_user_id });
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setSelectedApprovalId(null);
    setDefaultValueApproval(null);
    setApprovalValue(null);
    setActiveRow(null);
    clearActiveCandidates(); // Empty the state when cancel or closing modal
    formFKR.resetFields();
  };

  const handleOk = () => {
    formFKR
      .validateFields()
      .then((values) => {
        const dataUpdate = {
          id: selectedApprovalId,
          m_user_id: values.m_user_id,
        };

        modal.confirm({
          title: "Apakah Anda yakin ingin menyimpan data ini?",
          icon: <ExclamationCircleOutlined className="text-amber-500" />,
          okText: "Ya, Simpan",
          cancelText: "Batal",
          okButtonProps: { 
            className: "bg-emerald-600 hover:bg-emerald-700 border-emerald-600 rounded-lg",
            size: "large"
          },
          cancelButtonProps: {
            size: "large"
          },
          onOk: async () => {
            try {
              await updateApprover(dataUpdate);
              setIsModalOpen(false);
              clearActiveCandidates();
              refetchDetail();
            } catch (err) {
              // Handled gracefully by the mutation's onError handler
            }
          },
        });
      })
      .catch((error) => {
        // Form validation errors are highlighted automatically by Ant Design fields
      });
  };

  if (isDetailLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
        <Text className="text-slate-500 font-medium">Memuat Detail FKR...</Text>
      </div>
    );
  }

  if (!fkrDetail) {
    return (
      <Card className="max-w-2xl mx-auto mt-8">
        <CardContent className="text-center py-12">
          <CloseCircleOutlined className="text-red-500 text-5xl mb-4" />
          <Title level={4}>Data FKR Tidak Ditemukan</Title>
          <Text className="text-slate-400 block mb-6">
            Dokumen FKR yang Anda cari tidak tersedia atau tidak dapat diakses.
          </Text>
          <Button type="primary" onClick={() => router.push("/fkr")}>
            Kembali ke Daftar FKR
          </Button>
        </CardContent>
      </Card>
    );
  }

  // ==========================================
  // 4. Data Configurations (Mapped to provided API structure)
  // ==========================================

  const detailDataMapped = [
    { title: "Nomor FKR", value: fkrDetail.nomor_fkr },
    {
      title: "Status Dokumen",
      value: (
        <Tag
          color={
            fkrDetail.status?.toLowerCase().includes("approve")
              ? "success"
              : fkrDetail.status?.toLowerCase().includes("reject")
              ? "error"
              : "warning"
          }
          className="font-extrabold rounded-md border-none text-xs uppercase px-2.5 py-0.5 m-0 shadow-sm"
        >
          {fkrDetail.status || "PENDING"}
        </Tag>
      ),
    },
    { title: "Kode Status", value: fkrDetail.kode_status || "-" },
    {
      title: "Total Nilai FKR",
      value: (
        <span className="text-emerald-700 font-extrabold text-base tracking-tight">
          {formatCurrency(fkrDetail.amount !== undefined ? fkrDetail.amount : fkrDetail.nominal_fkr)}
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
    { title: "Dibuat Tanggal", value: formatDate(fkrDetail.created) },
  ];

  // ==========================================
  // 5. Columns Configuration for Progress Table
  // ==========================================

  const columnsConfig = [
    {
      title: "No",
      align: "center",
      key: "no",
      width: 70,
      render: (_, row) => row.urutan || "-",
    },
    {
      title: "Nama",
      dataIndex: "nama",
      key: "nama",
      render: (text) => <Text className="font-semibold text-slate-800">{text}</Text>,
    },
    {
      title: "NIK",
      dataIndex: "nik",
      key: "nik",
      render: (row) => row || "-",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      align: "center",
      width: 170,
      render: (status) => {
        const val = status?.toLowerCase();
        let color = "processing";
        let icon = <ClockCircleOutlined />;
        if (val === "approved" || val === "success") {
          color = "success";
          icon = <CheckCircleOutlined />;
        }
        if (val === "rejected" || val === "failed" || val === "rjc") {
          color = "error";
          icon = <CloseCircleOutlined />;
        }

        return (
          <Tag icon={icon} color={color} className="font-semibold uppercase px-2.5 py-0.5 rounded border-none">
            {status || "PENDING"}
          </Tag>
        );
      },
    },
    {
      title: "Jabatan",
      dataIndex: "jabatan",
      key: "jabatan",
      render: (val) => <Tag color="cyan" className="font-semibold uppercase text-xs">{val || "-"}</Tag>,
    },
    {
      title: "Action",
      key: "action",
      align: "center",
      width: 120,
      render: (row) => (
        <Button
          type="primary"
          icon={<EditOutlined />}
          onClick={() => showModal(row)}
          style={{ backgroundColor: "#1aac32", borderColor: "#1aac32" }}
          className="font-bold shadow-sm flex items-center gap-1 mx-auto hover:brightness-95"
        >
          Edit
        </Button>
      ),
    },
  ];

  // ==========================================
  // 6. Columns for Product Lines Table
  // ==========================================

  const productLinesColumns = [
    {
      title: "No",
      align: "center",
      key: "no",
      width: 60,
      render: (_, row, idx) => row.nomor || idx + 1,
    },
    {
      title: "Kode Produk",
      dataIndex: "kode_produk",
      key: "kode_produk",
      width: 120,
      render: (val) => <Text className="font-mono text-xs">{val}</Text>,
    },
    {
      title: "Nama Barang",
      dataIndex: "nama_barang",
      key: "nama_barang",
      render: (text) => <Text className="font-semibold text-slate-800">{text}</Text>,
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
      render: (val) => <Text className="font-semibold text-slate-700">{val?.toLocaleString("id-ID") || 0}</Text>,
    },
    {
      title: "Subtotal",
      dataIndex: "amount_item",
      key: "amount_item",
      align: "right",
      width: 160,
      render: (val) => <Text className="font-bold text-emerald-700">{formatCurrency(val)}</Text>,
    },
  ];

  // Candidates list options mapper for select input in exact 'nik - nama' format
  const userApprovalOpt = () => {
    const list = [];
    
    // Inject the active row's current employee as the initial fallback option
    if (activeRow) {
      list.push({
        value: activeRow.m_user_id,
        label: `${activeRow.nik} - ${activeRow.nama}`,
      });
    }

    // Merge in loaded candidates of the same jabatan avoiding duplication
    if (Array.isArray(candidatesList)) {
      candidatesList.forEach((data) => {
        if (activeRow && data.m_user_id === activeRow.m_user_id) {
          return;
        }
        list.push({
          value: data.m_user_id,
          label: `${data.nik} - ${data.nama_user}`,
        });
      });
    }
    return list;
  };

  const filterOption = (input, option) =>
    (option?.label ?? "").toLowerCase().includes(input.toLowerCase());

  // ==========================================
  // 7. Declarative Layout Render
  // ==========================================

  return (
    <div className="space-y-6 max-w-full">
      {contextHolder}

      {/* 1. Header Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <Button
          type="link"
          icon={<ArrowLeftOutlined />}
          onClick={() => router.push("/fkr")}
          className="text-emerald-600 hover:text-emerald-700 font-bold p-0 flex items-center gap-1 transition-all hover:translate-x-[-2px]"
        >
          Kembali ke Daftar FKR
        </Button>
      </div>

      {/* Dynamic current approval status header banner (Millennial/Gen Z airy card) */}
      <div className="bg-gradient-to-r from-emerald-50/50 via-teal-50/30 to-white border border-emerald-100 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 shadow-sm backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-200">
            <ClockCircleOutlined className="text-xl animate-spin-slow" />
          </div>
          <div>
            <Text className="text-xs text-emerald-600 font-bold uppercase tracking-widest block mb-1">Status Approval Saat Ini</Text>
            {currentApprover ? (
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <Text className="text-slate-800 text-sm font-semibold">
                  Sedang menunggu persetujuan dari:
                </Text>
                <Text className="text-emerald-700 text-sm font-extrabold">
                  {currentApprover.nama || currentApprover.name}
                </Text>
                <Tag color="emerald" className="font-extrabold uppercase text-[10px] px-2 py-0.5 rounded-md border-none shadow-sm m-0">
                  {currentApprover.jabatan || "Executor"}
                </Tag>
              </div>
            ) : fkrDetail.status?.toLowerCase().includes("approve") ? (
              <Text className="text-emerald-700 text-sm font-extrabold flex items-center gap-1.5">
                <CheckCircleOutlined /> Persetujuan Selesai! Seluruh tahapan telah disetujui sepenuhnya.
              </Text>
            ) : (
              <Text className="text-slate-800 text-sm font-semibold">
                FKR dalam status: <span className="capitalize font-bold text-slate-700">{fkrDetail.status || "Draft"}</span>
              </Text>
            )}
          </div>
        </div>
        {currentApprover && (
          <div className="flex items-center gap-2 self-start sm:self-auto bg-emerald-100/50 border border-emerald-200/50 rounded-full px-3 py-1 font-bold text-[10px] text-emerald-700 uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
            Siklus Aktif
          </div>
        )}
      </div>

      {/* 2. Main Content Stack */}
      <div className="space-y-8">
          
          {/* Card Detail Data */}
          <Card className="shadow-sm border-slate-100 rounded-2xl overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-6 px-7">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <ShoppingOutlined className="text-emerald-600 text-2xl" />
                    Detail Dokumen FKR
                  </CardTitle>
                  <CardDescription className="text-slate-400 mt-1">
                    Dokumen Number: <span className="font-semibold text-slate-700">{fkrDetail.nomor_fkr}</span>
                  </CardDescription>
                </div>
                <div>
                  <Tag
                    color={
                      fkrDetail.status?.toLowerCase().includes("approve")
                        ? "success"
                        : fkrDetail.status?.toLowerCase().includes("reject")
                        ? "error"
                        : "warning"
                    }
                    className="font-bold uppercase px-3 py-1 rounded-md text-xs border-none shadow-sm"
                  >
                    {fkrDetail.status || "PENDING"}
                  </Tag>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-7">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-12">
                {detailDataMapped.map((item, idx) => (
                  <div key={idx} className="flex flex-col">
                    <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1.5">{item.title}</Text>
                    <Text className="text-slate-900 font-extrabold text-base leading-snug">{item.value}</Text>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Product lines table (If lines array has items) */}
          {Array.isArray(fkrDetail.lines) && fkrDetail.lines.length > 0 && (
            <Card className="shadow-sm border-slate-100 rounded-2xl overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-5 px-7">
                <div className="flex items-center gap-3">
                  <ShoppingOutlined className="text-emerald-600 text-2xl" />
                  <div>
                    <CardTitle className="text-base font-bold text-slate-800">Daftar Barang Retur</CardTitle>
                    <CardDescription className="text-slate-400 mt-1">Daftar rincian item barang/produk dalam pengajuan klaim ritel ini.</CardDescription>
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

      {/* 3. Stepper Workflow Timeline (Full Width / col-12 - Spacious Vertical List of Rows) */}
      <Card className="shadow-sm border-slate-100 rounded-2xl overflow-hidden mt-6">
        <CardHeader className="bg-white border-b border-slate-100 py-6 px-7">
          <CardTitle className="text-lg font-extrabold text-slate-800">
            Alur Persetujuan
          </CardTitle>
          <CardDescription className="text-slate-400 mt-1">
            Tahapan otorisasi berjenjang yang transparan beserta re-delegasi
          </CardDescription>
        </CardHeader>
        <CardContent className="p-7">
          <div className="flex flex-col gap-4 relative">
            {sortedProgress.map((step, idx) => {
              const rawStatus = (step.status || "").toLowerCase();
              let isApproved = rawStatus.includes("approve") || rawStatus === "approved" || rawStatus === "y" || rawStatus === "success";
              let isCurrent = rawStatus.includes("proses") || rawStatus.includes("wait") || rawStatus.includes("menunggu") || rawStatus.includes("belum") || rawStatus === "pending";
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
                dotColor = "bg-emerald-600 border-emerald-700 ring-4 ring-emerald-50 animate-pulse";
                cardBg = "bg-blue-50/40 border-blue-100/80 shadow-sm";
                tagColor = "processing";
              }

              return (
                <div 
                  key={step.fkr_approval_id || idx} 
                  className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-2xl border transition-all ${cardBg}`}
                >
                  {/* Left Section: Sequence & Jabatan */}
                  <div className="flex items-center gap-4 min-w-0 sm:w-1/4">
                    <span className={`w-3.5 h-3.5 rounded-full border flex-shrink-0 ${dotColor}`} />
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Tahap {step.urutan || idx + 1}</span>
                      <span className="text-xs font-extrabold text-emerald-600 uppercase tracking-wide truncate mt-0.5" title={step.jabatan || "Executor"}>
                        {step.jabatan || "Executor"}
                      </span>
                    </div>
                  </div>

                  {/* Middle Section: Name and NIK */}
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-sm font-extrabold text-slate-800 truncate" title={step.nama}>
                      {step.nama || "-"}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono mt-0.5">NIK: {step.nik || "-"}</span>
                  </div>

                  {/* Right Section: Status Tag, Verification Date & Delegasi button */}
                  <div className="flex flex-col sm:items-end gap-2 flex-shrink-0">
                    <div className="flex items-center gap-4">
                      <Tag color={tagColor} className="font-semibold uppercase text-[10px] px-2.5 py-0.5 rounded-md border-none m-0 shadow-sm">
                        {statusLabel}
                      </Tag>
                      <Button
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => showModal(step)}
                        className="font-bold text-emerald-600 hover:text-emerald-700 text-xs p-0 h-auto flex items-center gap-0.5 border-none shadow-none"
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
            })}
          </div>
        </CardContent>
      </Card>

      {/* 4. Dynamic Delegasi Edit Approval Modal */}
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
          size: "large"
        }}
        cancelButtonProps={{
          size: "large",
          className: "rounded-lg"
        }}
        onOk={handleOk}
        onCancel={handleCancel}
        confirmLoading={isUpdatingApprover}
        className="rounded-xl overflow-hidden"
      >
        <div className="py-4">
          <Text className="block text-slate-500 text-sm mb-4 leading-relaxed">
            Pilih user pengganti dengan jabatan yang sama untuk mendelegasikan langkah approval ini.
          </Text>
          
          <Form form={formFKR} layout="vertical">
            <Form.Item
              label={<Text className="font-semibold text-slate-700">User</Text>}
              name="m_user_id"
              rules={[{ required: true, message: "Pilih user pengganti!" }]}
            >
              <Select
                style={{ width: "100%" }}
                showSearch
                placeholder="Pilih User"
                optionFilterProp="label"
                onChange={(val) => setApprovalValue(val)}
                filterOption={filterOption}
                options={userApprovalOpt()}
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
