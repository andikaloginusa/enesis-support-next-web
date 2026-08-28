"use client";

import React, { useEffect, useState } from "react";
import {
  Button,
  Form,
  Tag,
  Space,
  Typography,
  Tooltip,
} from "antd";
import {
  EyeOutlined,
  CloseCircleOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import moment from "moment";
import { useRouter } from "next/navigation";
import { useFkr, useDebounce } from "@/hooks";
import { DataTablePanel, GenericFormModal } from "@/components/ui";
import { getUserId } from "@/utils/storage";

const { Text } = Typography;

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
  return moment(dateStr).format("DD MMM YYYY");
};

export default function FkrSupportPage() {
  const router = useRouter();

  // ==========================================
  // 2. React Query Hook State & Mutations
  // ==========================================
  const {
    fkrList,
    totalCount,
    isListFetching,
    params,
    handlePaginationChange,
    handleSearchChange,
    rejectFkr,
    isRejecting,
    refetchList,
  } = useFkr();

  // Local debounced search binding
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearch = useDebounce(searchValue, 400);

  useEffect(() => {
    handleSearchChange(debouncedSearch);
  }, [debouncedSearch, handleSearchChange]);

  // ==========================================
  // 3. Local Forms & Rejection Modal States
  // ==========================================
  const [rejectForm] = Form.useForm();
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [activeFkrId, setActiveFkrId] = useState(null);
  const [activeFkrNo, setActiveFkrNo] = useState("");

  // ==========================================
  // 4. Action Handlers (Single Responsibility)
  // ==========================================

  const openRejectModal = (fkr) => {
    setActiveFkrId(fkr.fkr_id);
    setActiveFkrNo(fkr.nomor_fkr);
    rejectForm.resetFields();
    setIsRejectModalOpen(true);
  };

  const closeRejectModal = () => {
    rejectForm.resetFields();
    setActiveFkrId(null);
    setActiveFkrNo("");
    setIsRejectModalOpen(false);
  };

  const handleRejectSubmit = async () => {
    try {
      const values = await rejectForm.validateFields();
      const payload = {
        fkr_id: activeFkrId,
        reason: values.reason?.trim() ?? "",
        kode_status: "RJC",
        m_user_id: getUserId(),
      };

      await rejectFkr(payload);
      closeRejectModal();
    } catch (err) {
      // Form validation errors will be styled automatically by Ant Design Form.Item
    }
  };

  // ==========================================
  // 5. Columns Configuration Declarations
  // ==========================================

  const columnsConfig = [
    {
      title: "Nomor FKR",
      dataIndex: "nomor_fkr",
      key: "nomor_fkr",
      fixed: "left",
      width: 200,
      render: (text) => <Text className="font-semibold text-slate-800">{text}</Text>,
    },
    {
      title: "Tanggal Pengajuan",
      dataIndex: "created",
      key: "created",
      width: 160,
      render: (val) => formatDate(val),
    },
    {
      title: "Distributor",
      dataIndex: "nama_distributor",
      key: "nama_distributor",
      width: 250,
      render: (text) => (
        <Tooltip title={text}>
          <Text className="block truncate max-w-[240px] font-medium text-slate-700">{text || "-"}</Text>
        </Tooltip>
      ),
    },
    {
      title: "Pemohon",
      dataIndex: "nama_requester",
      key: "nama_requester",
      width: 180,
      render: (text) => <Text className="text-slate-600">{text || "-"}</Text>,
    },
    {
      title: "Nominal FKR",
      dataIndex: "nominal_fkr",
      key: "nominal_fkr",
      width: 180,
      align: "right",
      render: (val) => (
        <Text className="font-semibold text-[#1aac32]">
          {formatCurrency(val)}
        </Text>
      ),
    },
    {
      title: "Status",
      key: "status",
      width: 160,
      align: "center",
      render: (row) => {
        const status = row.status?.toLowerCase();
        let color = "processing";
        if (status === "approved") color = "success";
        if (status === "rejected" || status === "failed" || status === "reject") color = "error";
        if (status === "waiting approval") color = "warning";

        return (
          <Tag color={color} className="font-semibold uppercase px-2 py-0.5 rounded border-none">
            {row.status || "PENDING"}
          </Tag>
        );
      },
    },
    {
      title: "Aksi",
      key: "action",
      align: "center",
      fixed: "right",
      width: 140,
      render: (row) => (
        <Space size="middle">
          {/* Detail View Router trigger */}
          <Tooltip title="Lihat Detail FKR">
            <Button
              type="primary"
              shape="circle"
              icon={<EyeOutlined />}
              onClick={() => router.push(`/fkr/${row.fkr_id}`)}
              style={{ backgroundColor: "#1677ff", borderColor: "#1677ff" }}
            />
          </Tooltip>

          {/* Reject trigger popup reason modal */}
          {row.status !== "REJECTED" && (
            <Tooltip title="Reject FKR">
              <Button
                type="primary"
                danger
                shape="circle"
                icon={<CloseCircleOutlined />}
                onClick={() => openRejectModal(row)}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  // ==========================================
  // 6. Declarative Form Modal Configurations
  // ==========================================

  const rejectModalConfig = {
    title: `Reject Formulir Klaim Ritel (FKR)`,
    description: `Harap masukkan alasan penolakan formal untuk dokumen FKR nomor ${activeFkrNo}. Tindakan ini tidak dapat dibatalkan.`,
    open: isRejectModalOpen,
    form: rejectForm,
    onCancel: closeRejectModal,
    onOk: handleRejectSubmit,
    confirmLoading: isRejecting,
    okText: "Reject Sekarang",
    okButtonProps: { danger: true },
    fields: [
      {
        name: "reason",
        label: "Alasan Penolakan",
        type: "textarea",
        placeholder: "Masukkan alasan detail penolakan...",
        rules: [{ required: true, message: "Alasan penolakan harus diisi!" }],
        rows: 4,
      },
    ],
  };

  // ==========================================
  // 7. Declarative Layout Render
  // ==========================================
  return (
    <>
      <DataTablePanel
        title="Formulir Klaim Ritel (FKR) Support"
        description="Kelola pengajuan, detail persetujuan, dan tindakan reject untuk modul Formulir Klaim Ritel."
        columns={columnsConfig}
        dataSource={fkrList}
        loading={isListFetching}
        rowKey="fkr_id"
        pagination={{
          total: totalCount,
          pageSize: params.pageSize,
          current: params.currentPage,
          onChange: handlePaginationChange,
        }}
        searchProps={{
          placeholder: "Cari nomor FKR, distributor, atau pemohon...",
          value: searchValue,
          onChange: setSearchValue,
        }}
        extraHeaderActions={
          <Tooltip title="Muat Ulang Data">
            <Button
              type="default"
              shape="circle"
              size="large"
              icon={<ReloadOutlined className={isListFetching ? "spin" : ""} />}
              onClick={() => refetchList()}
            />
          </Tooltip>
        }
      />

      <GenericFormModal {...rejectModalConfig} />
    </>
  );
}
