"use client";

import React, { useState } from "react";
import {
  Modal,
  Button,
  Typography,
  Tabs,
  Table,
  Descriptions,
  Tag,
  Space,
  Spin,
  Alert,
  Tooltip,
  Divider,
} from "antd";
import {
  InfoCircleOutlined,
  HistoryOutlined,
  FileTextOutlined,
  OrderedListOutlined,
  DownloadOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  SyncOutlined,
  EyeOutlined,
  RightOutlined,
  DownOutlined,
} from "@ant-design/icons";
import { useKlaimDetail } from "@/hooks/queries/useKlaimDetail";
import {
  renderCurrency,
  renderDate,
  renderBold,
  renderTag,
} from "@/components/ui";

const { Text, Title } = Typography;

/**
 * Download raw content as a .txt file (safe fallback — XML may be malformed).
 */
function downloadLog(content, filename) {
  try {
    const blob = new Blob([content ?? ""], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch {
    /* silently fail — avoid crashing the modal */
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Tab panes
// ─────────────────────────────────────────────────────────────────────────────

function InfoTab({ data }) {
  if (!data) return null;

  const DOC_FILES = [
    { key: "file_invoice", label: "Invoice" },
    { key: "file_surat_klaim_sesuai_prinsiple", label: "Surat Klaim Prinsiple" },
    { key: "file_faktur_pajak", label: "Faktur Pajak" },
    { key: "file_eproposal", label: "E-Proposal" },
    { key: "file_ktp", label: "KTP" },
    { key: "file_rekap_klaim", label: "Rekap Klaim" },
    { key: "file_copy_faktur", label: "Copy Faktur" },
    { key: "file_skp", label: "Surat Keterangan Pajak (SKP)" },
    { key: "file_program", label: "File Program" },
  ];

  const docFiles = DOC_FILES.filter((f) => data[f.key]);

  return (
    <div className="space-y-6">
      {/* ── Identitas Klaim ── */}
      <section>
        <Title level={5} className="text-slate-700 mb-3 text-sm">
          Identitas Klaim
        </Title>
        <Descriptions
          size="small"
          column={2}
          className="[&_.ant-descriptions-item-label]:text-slate-500 [&_.ant-descriptions-item-content]:text-slate-800 [&_.ant-descriptions-item]:py-1"
        >
          <Descriptions.Item label="Nomor Klaim">
            {renderBold(data.nomor_klaim)}
          </Descriptions.Item>
          <Descriptions.Item label="Nomor Proposal">
            <Text className="font-mono text-xs">{data.nomor_proposal || "—"}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color={data.status === "Payment Completed" ? "green" : "blue"} className="rounded-full">
              {data.status || "—"}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Kode Status">
            <Text code>{data.kode_status || "—"}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Jenis Klaim">
            {data.jenis_klaim || "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Periode Klaim">
            {data.periode_klaim || "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Region">{data.region || "—"}</Descriptions.Item>
          <Descriptions.Item label="Kode Region">{data.kode_region || "—"}</Descriptions.Item>
          <Descriptions.Item label="Company Code">{data.company_code || "—"}</Descriptions.Item>
          <Descriptions.Item label="Divisi">{data.divisi || "—"}</Descriptions.Item>
        </Descriptions>
      </section>

      <Divider className="my-4" />

      {/* ── Distributor & Kontak ── */}
      <section>
        <Title level={5} className="text-slate-700 mb-3 text-sm">
          Distributor & Kontak
        </Title>
        <Descriptions
          size="small"
          column={2}
          className="[&_.ant-descriptions-item-label]:text-slate-500 [&_.ant-descriptions-item-content]:text-slate-800 [&_.ant-descriptions-item]:py-1"
        >
          <Descriptions.Item label="Nama">{data.nama || "—"}</Descriptions.Item>
          <Descriptions.Item label="Ship To">{data.ship_to || "—"}</Descriptions.Item>
          <Descriptions.Item label="NIK RSM">{data.nik_rsm || "—"}</Descriptions.Item>
          <Descriptions.Item label="NIK ASM">{data.nik_asm || "—"}</Descriptions.Item>
          <Descriptions.Item label="NIK Sales Head">{data.nik_sales_head || "—"}</Descriptions.Item>
          <Descriptions.Item label="NIK KAM">{data.nik_kam || "—"}</Descriptions.Item>
          <Descriptions.Item label="Nama Outlet">{data.nama_outlet || "—"}</Descriptions.Item>
          <Descriptions.Item label="Surdon Group">{data.surdon_group_golive || "—"}</Descriptions.Item>
        </Descriptions>
      </section>

      <Divider className="my-4" />

      {/* ── NPWP ── */}
      <section>
        <Title level={5} className="text-slate-700 mb-3 text-sm">
          NPWP & Faktur
        </Title>
        <Descriptions
          size="small"
          column={2}
          className="[&_.ant-descriptions-item-label]:text-slate-500 [&_.ant-descriptions-item-content]:text-slate-800 [&_.ant-descriptions-item]:py-1"
        >
          <Descriptions.Item label="Nomor NPWP">{data.nomor_npwp || "—"}</Descriptions.Item>
          <Descriptions.Item label="Nama NPWP">{data.nama_npwp || "—"}</Descriptions.Item>
          <Descriptions.Item label="Nomor KTP">{data.nomor_ktp || "—"}</Descriptions.Item>
          <Descriptions.Item label="Nama KTP">{data.nama_ktp || "—"}</Descriptions.Item>
          <Descriptions.Item label="Nomor Faktur">{data.nomor_faktur || "—"}</Descriptions.Item>
          <Descriptions.Item label="Tipe Pajak">{data.tipe_pajak || "—"}</Descriptions.Item>
          <Descriptions.Item label="Tanggal Faktur Pajak">
            {data.tanggal_faktur_pajak ? renderDate(data.tanggal_faktur_pajak) : "—"}
          </Descriptions.Item>
        </Descriptions>
      </section>

      <Divider className="my-4" />

      {/* ── Nominal ── */}
      <section>
        <Title level={5} className="text-slate-700 mb-3 text-sm">
          Nominal & Invoice
        </Title>
        <Descriptions
          size="small"
          column={2}
          className="[&_.ant-descriptions-item-label]:text-slate-500 [&_.ant-descriptions-item-content]:text-slate-800 [&_.ant-descriptions-item]:py-1"
        >
          <Descriptions.Item label="Total Klaim (Excl. PPN)">
            <Text className="font-bold text-slate-800">{renderCurrency(data.total_klaim)}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Nominal Pajak">
            {renderCurrency(data.nominal_pajak)}
          </Descriptions.Item>
          <Descriptions.Item label="Klaim + PPN (Claimable)">
            <Text className="font-bold text-[#1aac32]">
              {renderCurrency(data.nominal_claimable)}
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label="Sales Approved">
            {renderCurrency(data.sales_approve_amount)}
          </Descriptions.Item>
          <Descriptions.Item label="ASDH Approved">
            {renderCurrency(data.asdh_approve_amount)}
          </Descriptions.Item>
          <Descriptions.Item label="Invoice / Kwitansi Outlet">
            {data.invoice || data.kwitansi_outlet || "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Tanggal Invoice">
            {data.tanggal_invoice ? renderDate(data.tanggal_invoice) : "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Tanggal Posting">
            {data.tanggal_posting ? renderDate(data.tanggal_posting) : "—"}
          </Descriptions.Item>
        </Descriptions>
      </section>

      <Divider className="my-4" />

      {/* ── Pembayaran ── */}
      <section>
        <Title level={5} className="text-slate-700 mb-3 text-sm">
          Pembayaran & SAP
        </Title>
        <Descriptions
          size="small"
          column={2}
          className="[&_.ant-descriptions-item-label]:text-slate-500 [&_.ant-descriptions-item-content]:text-slate-800 [&_.ant-descriptions-item]:py-1"
        >
          <Descriptions.Item label="Nomor Payment">
            {data.nomor_payment || "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Tanggal Bayar">
            {data.tgl_bayar ? renderDate(data.tgl_bayar) : "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Accounting Doc. Number">
            {data.accounting_document_number
              ? renderTag(data.accounting_document_number, "blue")
              : "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Fiscal Year">{data.fiscal_year || "—"}</Descriptions.Item>
          <Descriptions.Item label="Penerima">{data.penerima || "—"}</Descriptions.Item>
          <Descriptions.Item label="Jasa Pengiriman">{data.jasa_pengiriman || "—"}</Descriptions.Item>
          <Descriptions.Item label="Nomor Resi">{data.nomor_resi || "—"}</Descriptions.Item>
        </Descriptions>
      </section>

      <Divider className="my-4" />

      {/* ── Dokumen ── */}
      <section>
        <Title level={5} className="text-slate-700 mb-3 text-sm">
          Dokumen Klaim
        </Title>
        {docFiles.length === 0 ? (
          <Text className="text-slate-400 text-sm italic">Tidak ada dokumen.</Text>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {docFiles.map((f) => (
              <div
                key={f.key}
                className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
              >
                <FileTextOutlined className="text-red-400 text-sm flex-shrink-0" />
                <div className="min-w-0">
                  <Text className="text-xs text-slate-500 block">{f.label}</Text>
                  <Text className="text-xs font-mono text-slate-700 truncate block max-w-[200px]">
                    {data[f.key]}
                  </Text>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Perihal Klaim ── */}
      {data.perihal_klaim && (
        <>
          <Divider className="my-4" />
          <section>
            <Title level={5} className="text-slate-700 mb-2 text-sm">
              Perihal Klaim
            </Title>
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              <Text className="text-sm text-slate-700 whitespace-pre-line">
                {data.perihal_klaim}
              </Text>
            </div>
          </section>
        </>
      )}

      {/* ── Notes ── */}
      {data.noted && (
        <>
          <Divider className="my-4" />
          <section>
            <Title level={5} className="text-slate-700 mb-2 text-sm">
              Catatan
            </Title>
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
              <Text className="text-sm text-slate-600 whitespace-pre-line">
                {data.noted}
              </Text>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function TimelineTab({ data }) {
  const details = data?.details || [];

  const columns = [
    {
      title: "No",
      key: "no",
      width: 48,
      align: "center",
      render: (_, __, idx) => (
        <Text className="text-slate-400 text-xs font-bold">{idx + 1}</Text>
      ),
    },
    {
      title: "Tanggal Proses",
      dataIndex: "tgl_proses",
      key: "tgl_proses",
      width: 130,
      render: (val) => (
        <Text className="text-xs font-medium text-slate-700">
          {val ? renderDate(val) : "—"}
        </Text>
      ),
    },
    {
      title: "Nama Proses",
      dataIndex: "nama",
      key: "nama",
      width: 200,
      render: (text, row) => (
        <div className="flex items-center gap-2">
          {text?.toLowerCase().includes("submit") || text?.toLowerCase().includes("payment") ? (
            <CheckCircleOutlined className="text-green-500 text-sm flex-shrink-0" />
          ) : text?.toLowerCase().includes("plan") ? (
            <ClockCircleOutlined className="text-amber-500 text-sm flex-shrink-0" />
          ) : (
            <SyncOutlined className="text-blue-400 text-sm flex-shrink-0" />
          )}
          <Text className="text-xs font-semibold text-slate-700">{text || "—"}</Text>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "sts",
      key: "sts",
      width: 150,
      render: (text) => (
        <Tag className="rounded-full text-xs">{text || "—"}</Tag>
      ),
    },
    {
      title: "Region ID",
      dataIndex: "region_id",
      key: "region_id",
      width: 100,
      align: "center",
      render: (text) => (
        <Text className="text-xs text-slate-500">{text || "—"}</Text>
      ),
    },
  ];

  return (
    <div>
      {details.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <HistoryOutlined className="text-slate-200 text-4xl" />
          <Text className="text-slate-400 text-sm">Belum ada riwayat proses.</Text>
        </div>
      ) : (
        <Table
          dataSource={details}
          columns={columns}
          rowKey="audit_klaim_id"
          pagination={false}
          size="middle"
          className="[&_.ant-table]:rounded-xl [&_.ant-table]:overflow-hidden"
        />
      )}
    </div>
  );
}

function LogSubmitTab({ data }) {
  const logs = data?.logSubmit || [];
  const [expandedRows, setExpandedRows] = useState([]);

  const toggleRow = (id) => {
    setExpandedRows((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id],
    );
  };

  const isExpanded = (id) => expandedRows.includes(id);

  const baseColumns = [
    {
      title: "",
      key: "expand",
      width: 48,
      align: "center",
      render: (_, row) => (
        <Button
          type="primary"
          size="small"
          icon={isExpanded(row.submit_klaim_id) ? <DownOutlined /> : <RightOutlined />}
          onClick={() => toggleRow(row.submit_klaim_id)}
          className="rounded-lg flex items-center justify-center"
          style={{
            backgroundColor: isExpanded(row.submit_klaim_id) ? "#1aac32" : "#1aac32",
            borderColor: "#1aac32",
            color: "#ffffff",
          }}
        />
      ),
    },
    {
      title: "No",
      key: "no",
      width: 48,
      align: "center",
      render: (_, __, idx) => (
        <Text className="text-slate-400 text-xs font-bold">{idx + 1}</Text>
      ),
    },
    {
      title: "Tanggal Submit",
      dataIndex: "created",
      key: "created",
      width: 160,
      render: (val) => (
        <Text className="text-xs font-medium text-slate-700">
          {val ? renderDate(val) : "—"}
        </Text>
      ),
    },
    {
      title: "Nomor Klaim",
      dataIndex: "nomor_klaim",
      key: "nomor_klaim",
      ellipsis: true,
      render: (text) => (
        <Tooltip title={text}>
          <Text className="text-xs font-mono text-slate-700">{text || "—"}</Text>
        </Tooltip>
      ),
    },
  ];

  const expandedRowRender = (row) => {
    const baseName = row.nomor_klaim
      ? row.nomor_klaim.replace(/[^a-zA-Z0-9]/g, "_")
      : "submit";

    return (
      <div className="space-y-4 pl-2 pr-2 pb-2">
        {/* ── Log Header ── */}
        {row.log_header && (
          <section>
            <div className="flex items-center justify-between mb-1">
              <Text className="text-xs font-bold text-blue-600 uppercase tracking-wide">
                Log Header (Request)
              </Text>
              <Space size="small">
                <Tooltip title="Tutup">
                  <Button
                    size="small"
                    icon={<EyeOutlined />}
                    onClick={() => toggleRow(row.submit_klaim_id)}
                    className="rounded-lg text-xs"
                    style={{
                      backgroundColor: "#94a3b8",
                      borderColor: "#94a3b8",
                      color: "#ffffff",
                    }}
                  >
                    Tutup
                  </Button>
                </Tooltip>
                <Tooltip title="Download sebagai .txt">
                  <Button
                    size="small"
                    icon={<DownloadOutlined style={{ color: "#ffffff" }} />}
                    onClick={() =>
                      downloadLog(row.log_header, `log-header-${baseName}.txt`)
                    }
                    className="rounded-lg text-xs"
                    style={{
                      backgroundColor: "#1aac32",
                      borderColor: "#1aac32",
                      color: "#ffffff",
                    }}
                  >
                    Download .txt
                  </Button>
                </Tooltip>
              </Space>
            </div>
            <div className="bg-slate-900 rounded-xl p-4 max-h-48 overflow-auto">
              <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap break-all m-0 leading-relaxed">
                {row.log_header}
              </pre>
            </div>
          </section>
        )}

        {/* ── Log Detail ── */}
        {row.log_detail && (
          <section>
            <div className="flex items-center justify-between mb-1">
              <Text className="text-xs font-bold text-emerald-600 uppercase tracking-wide">
                Log Detail (Detail)
              </Text>
              <Tooltip title="Download sebagai .txt">
                <Button
                  size="small"
                  icon={<DownloadOutlined style={{ color: "#ffffff" }} />}
                  onClick={() =>
                    downloadLog(row.log_detail, `log-detail-${baseName}.txt`)
                  }
                  className="rounded-lg text-xs"
                  style={{
                    backgroundColor: "#1aac32",
                    borderColor: "#1aac32",
                    color: "#ffffff",
                  }}
                >
                  Download .txt
                </Button>
              </Tooltip>
            </div>
            <div className="bg-slate-900 rounded-xl p-4 max-h-64 overflow-auto">
              <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap break-all m-0 leading-relaxed">
                {row.log_detail}
              </pre>
            </div>
          </section>
        )}

        {/* ── Log Response ── */}
        {row.log_response && (
          <section>
            <div className="flex items-center justify-between mb-1">
              <Text className="text-xs font-bold text-amber-500 uppercase tracking-wide">
                Log Response (Return)
              </Text>
              <Tooltip title="Download sebagai .txt">
                <Button
                  size="small"
                  icon={<DownloadOutlined style={{ color: "#ffffff" }} />}
                  onClick={() =>
                    downloadLog(row.log_response, `log-response-${baseName}.txt`)
                  }
                  className="rounded-lg text-xs"
                  style={{
                    backgroundColor: "#1aac32",
                    borderColor: "#1aac32",
                    color: "#ffffff",
                  }}
                >
                  Download .txt
                </Button>
              </Tooltip>
            </div>
            <div className="bg-slate-900 rounded-xl p-4 max-h-64 overflow-auto">
              <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap break-all m-0 leading-relaxed">
                {row.log_response}
              </pre>
            </div>
          </section>
        )}
      </div>
    );
  };

  return (
    <div>
      {logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <FileTextOutlined className="text-slate-200 text-4xl" />
          <Text className="text-slate-400 text-sm">Belum ada log submit.</Text>
        </div>
      ) : (
        <>
          <Alert
            message={`${logs.length} log submit ditemukan`}
            description="Klik baris untuk melihat isi log · Gunakan tombol Download .txt untuk menyimpan."
            type="info"
            showIcon
            className="rounded-xl mb-4 [&_.ant-alert-info]:bg-blue-50/70 [&_.ant-alert-info]:border-blue-100"
          />
          <Table
            dataSource={logs}
            columns={baseColumns}
            rowKey="submit_klaim_id"
            expandable={{
              expandedRowRender,
              expandedRowKeys: expandedRows,
              showExpandColumn: false,
            }}
            pagination={false}
            size="middle"
            className="[&_.ant-table]:rounded-xl [&_.ant-table]:overflow-hidden"
          />
        </>
      )}
    </div>
  );
}

function LinesTab({ data }) {
  const lines = data?.lines || [];

  const columns = [
    {
      title: "No",
      key: "no",
      width: 48,
      align: "center",
      render: (_, __, idx) => (
        <Text className="text-slate-400 text-xs font-bold">{idx + 1}</Text>
      ),
    },
    {
      title: "Activity",
      dataIndex: "activity",
      key: "activity",
      width: 200,
      ellipsis: true,
      render: (text) => (
        <Tooltip title={text}>
          <Text className="text-xs font-medium text-slate-700">{text || "—"}</Text>
        </Tooltip>
      ),
    },
    {
      title: "Brand",
      dataIndex: "brand",
      key: "brand",
      width: 100,
      align: "center",
      render: (text) => (
        <Tag className="rounded-full text-xs">{text || "—"}</Tag>
      ),
    },
    {
      title: "Budget",
      dataIndex: "budget",
      key: "budget",
      width: 130,
      align: "right",
      render: (val) => (
        <Text className="text-xs font-medium">{renderCurrency(val)}</Text>
      ),
    },
    {
      title: "Total Klaim",
      dataIndex: "total_klaim",
      key: "total_klaim",
      width: 130,
      align: "right",
      render: (val) => (
        <Text className="text-xs font-medium">{renderCurrency(val)}</Text>
      ),
    },
    {
      title: "Outstanding Klaim",
      dataIndex: "outstanding_klaim",
      key: "outstanding_klaim",
      width: 140,
      align: "right",
      render: (val) => (
        <Text className="text-xs font-medium text-amber-600">
          {renderCurrency(val)}
        </Text>
      ),
    },
    {
      title: "Sales Amount",
      dataIndex: "sales_amount",
      key: "sales_amount",
      width: 120,
      align: "right",
      render: (val) => (
        <Text className="text-xs">{renderCurrency(val)}</Text>
      ),
    },
    {
      title: "Nomor Proposal",
      dataIndex: "nomor_proposal",
      key: "nomor_proposal",
      width: 180,
      ellipsis: true,
      render: (text) => (
        <Tooltip title={text}>
          <Text className="text-xs font-mono text-slate-600">{text || "—"}</Text>
        </Tooltip>
      ),
    },
    {
      title: "Branch",
      dataIndex: "branch_code",
      key: "branch_code",
      width: 120,
      render: (text) => <Text className="text-xs">{text || "—"}</Text>,
    },
    {
      title: "Divisi",
      dataIndex: "divisi",
      key: "divisi",
      width: 80,
      align: "center",
      render: (text) => <Tag className="rounded-full text-xs">{text || "—"}</Tag>,
    },
    {
      title: "Cost Center",
      dataIndex: "cost_center",
      key: "cost_center",
      width: 120,
      render: (text) => <Text className="text-xs font-mono">{text || "—"}</Text>,
    },
    {
      title: "Profit Center",
      dataIndex: "profit_center",
      key: "profit_center",
      width: 110,
      render: (text) => <Text className="text-xs font-mono">{text || "—"}</Text>,
    },
    {
      title: "Activity Code",
      dataIndex: "activity_code",
      key: "activity_code",
      width: 120,
      render: (text) => <Text className="text-xs font-mono">{text || "—"}</Text>,
    },
    {
      title: "Budget Year",
      dataIndex: "budget_year",
      key: "budget_year",
      width: 100,
      align: "center",
      render: (text) => <Text className="text-xs font-semibold">{text || "—"}</Text>,
    },
    {
      title: "Budget ID",
      dataIndex: "budget_id",
      key: "budget_id",
      width: 160,
      ellipsis: true,
      render: (text) => (
        <Tooltip title={text}>
          <Text className="text-xs font-mono text-slate-500">{text || "—"}</Text>
        </Tooltip>
      ),
    },
    {
      title: "Is Closed",
      dataIndex: "isclosed",
      key: "isclosed",
      width: 80,
      align: "center",
      render: (val) =>
        val === "Y" ? (
          <CheckCircleOutlined className="text-green-500" />
        ) : (
          <Text className="text-slate-300">—</Text>
        ),
    },
  ];

  return (
    <div>
      {lines.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <OrderedListOutlined className="text-slate-200 text-4xl" />
          <Text className="text-slate-400 text-sm">Belum ada baris budget.</Text>
        </div>
      ) : (
        <Table
          dataSource={lines}
          columns={columns}
          rowKey="klaim_detail_id"
          pagination={false}
          size="middle"
          scroll={{ x: 1600 }}
          className="[&_.ant-table]:rounded-xl [&_.ant-table]:overflow-hidden"
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Modal
// ─────────────────────────────────────────────────────────────────────────────

/**
 * KlaimDetailModal — Full detail view for a single klaim record.
 *
 * Tabs:
 * - Info        : Identitas, distributor, NPWP, nominal, invoice, pembayaran, dokumen
 * - Timeline    : Audit trail dari details[]
 * - Log Submit  : Submit log dari logSubmit[] + download XML (header & detail)
 * - Lines       : Budget lines dari lines[]
 *
 * @param {Object}   props
 * @param {boolean}  props.open
 * @param {string}   props.klaimId   - Klaim ID to fetch
 * @param {Function} props.onClose
 */
export function KlaimDetailModal({ open, klaimId, onClose }) {
  const { detail, isLoading } = useKlaimDetail({ klaimId: open ? klaimId : null });

  const items = [
    {
      key: "info",
      label: (
        <span className="flex items-center gap-1.5">
          <InfoCircleOutlined />
          Info Klaim
        </span>
      ),
      children: <InfoTab data={detail} />,
    },
    {
      key: "timeline",
      label: (
        <span className="flex items-center gap-1.5">
          <HistoryOutlined />
          Timeline
        </span>
      ),
      children: <TimelineTab data={detail} />,
    },
    {
      key: "log",
      label: (
        <span className="flex items-center gap-1.5">
          <FileTextOutlined />
          Log Submit
          {detail?.logSubmit?.length > 0 && (
            <Tag className="ml-1 rounded-full text-xs" color="blue">
              {detail.logSubmit.length}
            </Tag>
          )}
        </span>
      ),
      children: <LogSubmitTab data={detail} />,
    },
    {
      key: "lines",
      label: (
        <span className="flex items-center gap-1.5">
          <OrderedListOutlined />
          Lines
          {detail?.lines?.length > 0 && (
            <Tag className="ml-1 rounded-full text-xs" color="green">
              {detail.lines.length}
            </Tag>
          )}
        </span>
      ),
      children: <LinesTab data={detail} />,
    },
  ];

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={
        <div className="flex items-center gap-2 pb-3 text-base font-bold border-b border-slate-100 text-slate-800">
          <InfoCircleOutlined className="text-blue-500" />
          <span>Detail Klaim</span>
          {detail?.nomor_klaim && (
            <Text className="text-slate-400 font-normal text-sm ml-1">
              — {detail.nomor_klaim}
            </Text>
          )}
        </div>
      }
      footer={
        <div className="flex justify-end">
          <Button size="large" onClick={onClose} className="rounded-lg">
            Tutup
          </Button>
        </div>
      }
      width={960}
      destroyOnHidden
      className="[&_.ant-modal-content]:rounded-xl"
    >
      <div className="py-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Spin size="large" />
            <Text className="text-slate-400 text-sm">Memuat detail klaim...</Text>
          </div>
        ) : !detail ? (
          <Alert
            type="error"
            message="Data tidak ditemukan"
            description="Klaim dengan ID tersebut tidak ditemukan."
            showIcon
            className="rounded-xl"
          />
        ) : (
          <Tabs
            items={items}
            size="middle"
            className="[&_.ant-tabs-nav]:mb-4 [&_.ant-tabs-tab]:font-medium"
          />
        )}
      </div>
    </Modal>
  );
}
