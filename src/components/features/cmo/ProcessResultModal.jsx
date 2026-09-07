"use client";

import React from "react";
import { Modal, Table, Typography, Descriptions } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";

const { Text, Title } = Typography;

/**
 * ProcessResultModal — Display success/error details for batch operations.
 *
 * Reusable component for showing the result of regenerateCOrder, processSapCMO,
 * and processSapCOrder operations. Renders:
 *   - A summary banner (success count / error count)
 *   - Two collapsible sections: Success list + Error list
 *
 * @param {Object}   props
 * @param {boolean}  props.open
 * @param {Function} props.onCancel
 * @param {string}   props.title        - Modal title
 * @param {string}   props.description - Subtitle/description text
 * @param {Array}    props.successList - Array of { cmo_id, nomor_cmo } or similar
 * @param {Array}    props.errorList   - Array of { cmo_id, nomor_cmo, message }
 * @param {number}   props.successCount
 * @param {number}   props.errorCount
 * @param {string}   [props.idField="cmo_id"]     - Key name for the ID field
 * @param {string}   [props.nameField="nomor_cmo"] - Key name for the name/number field
 */
export function ProcessResultModal({
  open,
  onCancel,
  title = "Hasil Proses",
  description,
  successList = [],
  errorList = [],
  successCount,
  errorCount,
  idField = "cmo_id",
  nameField = "nomor_cmo",
}) {
  const hasErrors = errorList.length > 0;
  const hasSuccess = successList.length > 0;

  const successColumns = [
    {
      title: "No",
      key: "no",
      width: 60,
      align: "center",
      render: (_, __, idx) => idx + 1,
    },
    {
      title: nameField === "nomor_cmo" ? "Nomor CMO" : "ID",
      key: "id",
      render: (_, row) => (
        <Text className="font-mono text-xs font-semibold text-slate-700">
          {row[nameField] || row[idField] || "—"}
        </Text>
      ),
    },
  ];

  const errorColumns = [
    {
      title: "No",
      key: "no",
      width: 60,
      align: "center",
      render: (_, __, idx) => idx + 1,
    },
    {
      title: nameField === "nomor_cmo" ? "Nomor CMO" : "ID",
      key: "id",
      render: (_, row) => (
        <Text className="font-mono text-xs font-semibold text-slate-700">
          {row[nameField] || row[idField] || "—"}
        </Text>
      ),
    },
    {
      title: "Alasan / Pesan",
      key: "message",
      render: (_, row) => (
        <Text className="text-rose-600 text-xs">{row.message || "—"}</Text>
      ),
    },
  ];

  return (
    <Modal
      title={
        <div className="text-slate-800 font-bold text-lg border-b border-slate-100 pb-3">
          {title}
        </div>
      }
      open={open}
      onCancel={onCancel}
      footer={null}
      width={720}
      className="rounded-xl overflow-hidden"
    >
      <div className="py-4 space-y-5">
        {/* Summary Banner */}
        <div className="flex items-center gap-3 flex-wrap">
          {typeof successCount === "number" && (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2">
              <CheckCircleOutlined className="text-emerald-600" />
              <Text className="font-bold text-emerald-700 text-sm">
                Berhasil: {successCount}
              </Text>
            </div>
          )}
          {typeof errorCount === "number" && (
            <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 rounded-lg px-4 py-2">
              <CloseCircleOutlined className="text-rose-600" />
              <Text className="font-bold text-rose-700 text-sm">
                Gagal: {errorCount}
              </Text>
            </div>
          )}
        </div>

        {description && (
          <Text className="block text-slate-500 text-sm leading-relaxed">
            {description}
          </Text>
        )}

        {/* Success List */}
        {hasSuccess && (
          <div>
            <Title level={5} className="text-emerald-700 mb-3 flex items-center gap-2">
              <CheckCircleOutlined />
              Daftar Berhasil
            </Title>
            <Table
              columns={successColumns}
              dataSource={successList}
              rowKey={idField}
              pagination={{ pageSize: 10, size: "small" }}
              size="small"
              className="border border-emerald-100 rounded-lg overflow-hidden [&_.ant-table]:text-xs"
            />
          </div>
        )}

        {/* Error List */}
        {hasErrors && (
          <div>
            <Title level={5} className="text-rose-700 mb-3 flex items-center gap-2">
              <CloseCircleOutlined />
              Daftar Gagal
            </Title>
            <Table
              columns={errorColumns}
              dataSource={errorList}
              rowKey={idField}
              pagination={{ pageSize: 10, size: "small" }}
              size="small"
              className="border border-rose-100 rounded-lg overflow-hidden [&_.ant-table]:text-xs"
            />
          </div>
        )}

        {!hasSuccess && !hasErrors && (
          <div className="text-center py-8">
            <Text className="text-slate-400">Tidak ada data hasil yang bisa ditampilkan.</Text>
          </div>
        )}
      </div>
    </Modal>
  );
}
