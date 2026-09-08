"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  Descriptions,
  Tabs,
  Table,
  Button,
  Tag,
  Typography,
  Space,
  Spin,
} from "antd";
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  FileExcelOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useReversalBudget } from "@/hooks";
import { renderCurrency, renderDate, renderBold } from "@/components/ui";
import { ReversalDetailItemModal } from "@/components/features/budget";

const { Title, Text } = Typography;

export default function ReversalBudgetDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { revheadId, kodeProses } = params;

  const [activeTab, setActiveTab] = useState("success");
  const [selectedDetailItem, setSelectedDetailItem] = useState(null);
  const [detailModalType, setDetailModalType] = useState("success");
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const {
    headerDetail,
    isDetailLoading,
    refetchDetail,
    successData,
    isSuccessLoading,
    refetchSuccess,
    rejectData,
    isRejectLoading,
    refetchReject,
  } = useReversalBudget({ revheadId, kodeProses });

  const successList = successData?.results || (Array.isArray(successData) ? successData : []);
  const rejectList = rejectData?.results || (Array.isArray(rejectData) ? rejectData : []);

  const openItemDetail = (item, type) => {
    setSelectedDetailItem(item);
    setDetailModalType(type);
    setIsDetailModalOpen(true);
  };

  // ── Success Table Columns ──
  const successColumns = [
    {
      title: "No",
      key: "no",
      width: 70,
      align: "center",
      render: (_, __, idx) => idx + 1,
    },
    {
      title: "Budget ID",
      dataIndex: "proposal_budget_id",
      key: "proposal_budget_id",
      width: 180,
      render: (val) => <Text className="font-mono text-xs">{val || "—"}</Text>,
    },
    {
      title: "Jumlah Reverse",
      dataIndex: "reverse_amount",
      key: "reverse_amount",
      width: 200,
      align: "right",
      render: (val) => (
        <span className="font-semibold text-emerald-600">
          {renderCurrency(val)}
        </span>
      ),
    },
    {
      title: "Waktu Kirim",
      dataIndex: "created_date",
      key: "created_date",
      width: 180,
      align: "center",
      render: (val) => renderDate(val),
    },
    {
      title: "Aksi",
      key: "action",
      width: 100,
      align: "center",
      render: (_, record) => (
        <Button
          size="small"
          type="primary"
          icon={<EyeOutlined />}
          onClick={() => openItemDetail(record, "success")}
          className="bg-emerald-600 hover:bg-emerald-700 border-emerald-600 text-xs"
        >
          Detail
        </Button>
      ),
    },
  ];

  // ── Reject Table Columns ──
  const rejectColumns = [
    {
      title: "No",
      key: "no",
      width: 70,
      align: "center",
      render: (_, __, idx) => idx + 1,
    },
    {
      title: "No Proposal",
      dataIndex: "nomor_proposal",
      key: "nomor_proposal",
      width: 200,
      render: (val) => renderBold(val || "—"),
    },
    {
      title: "Branch",
      dataIndex: "branch",
      key: "branch",
      width: 150,
      render: (val) => val || "—",
    },
    {
      title: "Brand",
      dataIndex: "brand",
      key: "brand",
      width: 150,
      render: (val) => val || "—",
    },
    {
      title: "Hasil Reversal",
      dataIndex: "hasil_reversal",
      key: "hasil_reversal",
      width: 200,
      align: "right",
      render: (val) => (
        <span className="font-semibold text-rose-600">
          {renderCurrency(val)}
        </span>
      ),
    },
    {
      title: "Aksi",
      key: "action",
      width: 100,
      align: "center",
      render: (_, record) => (
        <Button
          size="small"
          type="primary"
          danger
          icon={<EyeOutlined />}
          onClick={() => openItemDetail(record, "reject")}
          className="text-xs"
        >
          Detail
        </Button>
      ),
    },
  ];

  const headerObj = headerDetail || {};

  return (
    <div className="space-y-6 max-w-full">
      {/* ── Navigation & Title ── */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            type="default"
            shape="circle"
            icon={<ArrowLeftOutlined />}
            onClick={() => router.push("/budget/reversal")}
            className="border-slate-300 text-slate-600 hover:text-emerald-600 hover:border-emerald-600"
          />
          <div>
            <div className="flex items-center gap-2">
              <Title level={4} className="!mb-0 text-slate-800">
                Detail Reversal Budget
              </Title>
              <Tag color="blue" className="font-mono text-sm px-2.5 py-0.5">
                {kodeProses}
              </Tag>
            </div>
            <Text className="text-slate-400 text-xs mt-0.5 block">
              Tinjau rincian hasil pemrosesan file Reversal Budget untuk kode proses ini
            </Text>
          </div>
        </div>

        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => {
              refetchDetail();
              refetchSuccess();
              refetchReject();
            }}
            className="border-slate-300 text-slate-600 hover:text-emerald-600 hover:border-emerald-600"
          >
            Muat Ulang
          </Button>
        </Space>
      </div>

      {/* ── Reversal Header Meta Card ── */}
      <Card
        className="rounded-2xl border-slate-200/80 shadow-sm"
        loading={isDetailLoading}
      >
        <Descriptions
          title={<Text className="font-bold text-slate-700">Informasi Pengiriman Reversal</Text>}
          bordered
          size="small"
          column={{ xxl: 4, xl: 4, lg: 2, md: 2, sm: 1, xs: 1 }}
          className="rounded-xl overflow-hidden"
        >
          <Descriptions.Item label="Nama Pengirim">
            <span className="font-semibold text-slate-800">
              {headerObj.created_by || "—"}
            </span>
          </Descriptions.Item>
          <Descriptions.Item label="Waktu Pengiriman">
            {renderDate(headerObj.created_date)}
          </Descriptions.Item>
          <Descriptions.Item label="File Excel">
            <div className="flex items-center gap-1.5 font-mono text-xs text-slate-700">
              <FileExcelOutlined className="text-emerald-600" />
              <span>{headerObj.excel || "—"}</span>
            </div>
          </Descriptions.Item>
          <Descriptions.Item label="Kode Proses">
            <Tag color="blue" className="font-mono font-semibold">
              {headerObj.kode_proses || kodeProses || "—"}
            </Tag>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* ── Success & Reject Tabs ── */}
      <Card className="rounded-2xl border-slate-200/80 shadow-sm overflow-hidden">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: "success",
              label: (
                <div className="flex items-center gap-2 px-1">
                  <CheckCircleOutlined className="text-emerald-600" />
                  <span>Reversal Berhasil (Success)</span>
                  <Tag color="success" className="ml-1 rounded-full text-xs">
                    {successList.length}
                  </Tag>
                </div>
              ),
              children: (
                <div className="pt-2">
                  <Table
                    columns={successColumns}
                    dataSource={successList}
                    loading={isSuccessLoading}
                    rowKey={(r) =>
                      r.proposal_reverse_id ||
                      r.proposal_budget_id ||
                      `${r.reverse_by}_${r.created_date}_${r.reverse_amount}`
                    }
                    pagination={{ pageSize: 10 }}
                    size="middle"
                    className="border border-slate-200/80 rounded-xl overflow-hidden"
                  />
                </div>
              ),
            },
            {
              key: "reject",
              label: (
                <div className="flex items-center gap-2 px-1">
                  <CloseCircleOutlined className="text-rose-600" />
                  <span>Reversal Ditolak (Reject)</span>
                  <Tag color="error" className="ml-1 rounded-full text-xs">
                    {rejectList.length}
                  </Tag>
                </div>
              ),
              children: (
                <div className="pt-2">
                  <Table
                    columns={rejectColumns}
                    dataSource={rejectList}
                    loading={isRejectLoading}
                    rowKey={(r) =>
                      r.temp_validation_reversal_reject_id ||
                      `${r.nomor_proposal}_${r.activity_code}_${r.periode}`
                    }
                    pagination={{ pageSize: 10 }}
                    size="middle"
                    className="border border-slate-200/80 rounded-xl overflow-hidden"
                  />
                </div>
              ),
            },
          ]}
        />
      </Card>

      {/* ── Item Detail Modal ── */}
      <ReversalDetailItemModal
        open={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        data={selectedDetailItem}
        type={detailModalType}
      />
    </div>
  );
}
