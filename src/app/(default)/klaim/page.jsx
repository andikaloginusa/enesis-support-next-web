"use client";

import React, { useEffect, useState } from "react";
import {
  Button,
  Form,
  Tag,
  Space,
  Popconfirm,
  Typography,
  Tooltip,
} from "antd";
import {
  DeleteOutlined,
  ReloadOutlined,
  EditOutlined,
} from "@ant-design/icons";
import moment from "moment";
import { useKlaim, useDebounce } from "@/hooks";
import { DataTablePanel, GenericFormModal } from "@/components/ui";

const { Text } = Typography;

// ==========================================
// 1. Pure Formatters & Utility Helpers
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

export default function KlaimSupportPage() {
  // ==========================================
  // 2. React Query Hook State & Mutations
  // ==========================================
  const {
    claims,
    total,
    fetching,
    params,
    handlePaginationChange,
    handleSearchChange,
    deleteLogSubmit,
    updateStatusKlaim,
    loadingUpdateStatus,
    refetch,
  } = useKlaim();

  // Local debounced search binding
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearch = useDebounce(searchValue, 400);

  useEffect(() => {
    handleSearchChange(debouncedSearch);
  }, [debouncedSearch, handleSearchChange]);

  // ==========================================
  // 3. Local Forms & Modal States
  // ==========================================
  const [updateForm] = Form.useForm();
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [activeClaimId, setActiveClaimId] = useState(null);

  // Safely extract m_user_id from local storage current_user
  const getUserId = () => {
    if (typeof window !== "undefined") {
      try {
        const credsStr = localStorage.getItem("user_credent");
        if (credsStr) {
          const creds = JSON.parse(credsStr);
          return creds.m_user_id || creds.id || "";
        }
      } catch (err) {
        console.error("Failed to parse user credentials from storage", err);
      }
    }
    return "";
  };

  // ==========================================
  // 4. Action Handlers (Single Responsibility)
  // ==========================================

  // Update Status Modal triggers
  const openUpdateModal = (claim) => {
    setActiveClaimId(claim.klaim_id);
    updateForm.resetFields();
    setIsUpdateModalOpen(true);
  };

  const closeUpdateModal = () => {
    updateForm.resetFields();
    setActiveClaimId(null);
    setIsUpdateModalOpen(false);
  };

  const handleUpdateStatusSubmit = async () => {
    try {
      const values = await updateForm.validateFields();
      const payload = {
        m_user_id: getUserId(),
        klaim_id: activeClaimId,
        kode_status_baru: values.kode_status_baru ?? "",
        reason: values.reason?.trim() ?? "",
      };

      await updateStatusKlaim(payload);
      closeUpdateModal();
    } catch (err) {
      // Validations highlighted automatically
    }
  };

  const handleDeleteLogConfirm = async (nomorKlaim) => {
    await deleteLogSubmit(nomorKlaim);
  };

  // ==========================================
  // 5. Columns Configuration Declarations
  // ==========================================

  const columnsConfig = [
    {
      title: "Nomor Klaim",
      dataIndex: "nomor_klaim",
      key: "nomor_klaim",
      fixed: "left",
      width: 240,
      render: (text) => <Text className="font-semibold text-slate-800">{text}</Text>,
    },
    {
      title: "Tanggal Klaim",
      dataIndex: "created",
      key: "created",
      width: 150,
      render: (val) => formatDate(val),
    },
    {
      title: "Leadtime",
      dataIndex: "leadTime",
      key: "leadTime",
      width: 150,
      render: (val) => formatDate(val),
    },
    {
      title: "Distributor",
      dataIndex: "nama",
      key: "nama",
      width: 180,
      render: (text) => (
        <Tooltip title={text}>
          <Text className="block truncate max-w-[170px]">{text || "-"}</Text>
        </Tooltip>
      ),
    },
    {
      title: "Total (Excl. PPN)",
      dataIndex: "total_klaim",
      key: "total_klaim",
      width: 160,
      align: "right",
      render: (val) => formatCurrency(val),
    },
    {
      title: "PPN",
      dataIndex: "nominal_pajak",
      key: "nominal_pajak",
      width: 130,
      align: "right",
      render: (val) => formatCurrency(val),
    },
    {
      title: "Klaim + PPN",
      key: "nominal_claimable",
      width: 165,
      align: "right",
      render: (row) => (
        <Text className="font-bold text-[#1aac32]">
          {formatCurrency(row.nominal_claimable)}
        </Text>
      ),
    },
    {
      title: "Doc SAP",
      dataIndex: "accounting_document_number",
      key: "accounting_document_number",
      width: 130,
      render: (text) => (text ? <Tag color="blue">{text}</Tag> : "-"),
    },
    {
      title: "Region",
      dataIndex: "region",
      key: "region",
      width: 120,
      render: (text) =>
        text ? (
          <Tag color="default" className="capitalize">
            {text.toLowerCase()}
          </Tag>
        ) : (
          "-"
        ),
    },
    {
      title: "Total Disetujui (Excl. PPN)",
      key: "sales_approve_amount",
      width: 180,
      align: "right",
      render: (row) => (
        <Text className="font-semibold text-emerald-700">
          {formatCurrency(row.sales_approve_amount)}
        </Text>
      ),
    },
    {
      title: "Status",
      key: "status",
      width: 130,
      align: "center",
      render: (row) => {
        const status = row.status?.toLowerCase();
        let color = "processing";
        if (status === "approved" || status === "success") color = "success";
        if (status === "reject" || status === "rejected" || status === "failed" || status === "rjc") color = "error";

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
      width: 160, // Snug, visually balanced width for exactly 2 circle action buttons
      render: (row) => (
        <Space size="middle">
          {/* Update Status Trigger Icon (Also handles Rejections now) */}
          <Tooltip title="Update Status Klaim">
            <Button
              type="primary"
              shape="circle"
              icon={<EditOutlined />}
              onClick={() => openUpdateModal(row)}
              style={{ backgroundColor: "#1aac32", borderColor: "#1aac32" }}
            />
          </Tooltip>

          {/* Secure Double Confirmation Delete Popconfirm */}
          <Tooltip title="Delete Log Submit">
            <Popconfirm
              title="Hapus Log Submit"
              description={`Apakah Anda yakin ingin menghapus log submit klaim ${row.nomor_klaim}?`}
              onConfirm={() => handleDeleteLogConfirm(row.nomor_klaim)}
              okText="Ya, Hapus"
              cancelText="Batal"
              okButtonProps={{ danger: true }}
              placement="topRight"
            >
              <Button type="dashed" danger shape="circle" icon={<DeleteOutlined />} />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  // ==========================================
  // 6. Declarative Form Modal Configurations
  // ==========================================

  // Schema for Update Status Modal (supporting both status transitions and RJC rejections)
  const updateStatusModalConfig = {
    title: "Update Status Proposal Klaim",
    description: "Ubah kode status pengajuan proposal klaim ini secara formal ke dalam sistem ERP.",
    open: isUpdateModalOpen,
    form: updateForm,
    onCancel: closeUpdateModal,
    onOk: handleUpdateStatusSubmit,
    confirmLoading: loadingUpdateStatus, // Spinner bound to status mutation loading state
    okText: "Update Status",
    okButtonProps: { style: { backgroundColor: "#1aac32", borderColor: "#1aac32" } },
    fields: [
      {
        name: "kode_status_baru",
        label: "Kode Status Baru",
        type: "select",
        placeholder: "Pilih kode status baru...",
        rules: [{ required: true, message: "Harap pilih kode status baru!" }],
        options: [
          { label: "Pengajuan - DR", value: "DR" },
          { label: "ECC Verifikasi - ECC", value: "ECC" },
          { label: "RSM Approved - RSM", value: "RSM" },
          { label: "Sales Head Approved - SHA", value: "SHA" },
          { label: "Distributor Kirim Dokumen - SEND", value: "SEND" },
          { label: "ECC terima dok. - RECEIVE", value: "RECEIVE" },
          { label: "Plan Payment - PLAN", value: "PLAN" },
          { label: "Reject - RJC", value: "RJC" },
        ],
      },
      {
        name: "reason",
        label: "Alasan Perubahan Status / Reject",
        type: "textarea",
        placeholder: "Berikan alasan penyesuaian kode status baru ini...",
        rules: [{ required: true, message: "Harap berikan alasan perubahan status!" }],
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
        title="Proposal Klaim Support"
        description="Kelola pengajuan proposal klaim, persetujuan SAP, dan tindakan reject log."
        columns={columnsConfig}
        dataSource={claims}
        loading={fetching}
        rowKey="klaim_id"
        pagination={{
          total: total,
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
              icon={<ReloadOutlined className={fetching ? "spin" : ""} />}
              onClick={() => refetch()}
            />
          </Tooltip>
        }
      />

      {/* Render standalone GenericFormModal driven entirely by JavaScript configs */}
      <GenericFormModal {...updateStatusModalConfig} />
    </>
  );
}
