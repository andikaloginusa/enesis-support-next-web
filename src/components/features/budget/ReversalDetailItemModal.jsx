"use client";

import React from "react";
import PropTypes from "prop-types";
import { Modal, Descriptions, Typography, Tag } from "antd";
import { renderCurrency, renderDate } from "@/components/ui";

const { Text } = Typography;

/**
 * ReversalDetailItemModal
 *
 * Popup to show itemized details for either a Success reversal item or a Reject reversal item.
 */
export function ReversalDetailItemModal({
  open,
  onClose,
  data = null,
  type = "success", // "success" | "reject"
}) {
  if (!data) return null;

  const isSuccess = type === "success";

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 text-slate-800 font-semibold text-base">
          <span>{isSuccess ? "Detail Reversal Berhasil" : "Detail Reversal Ditolak (Reject)"}</span>
          <Tag color={isSuccess ? "success" : "error"}>
            {isSuccess ? "SUCCESS" : "REJECT"}
          </Tag>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnHidden
      width={isSuccess ? 520 : 640}
    >
      <div className="py-3">
        {isSuccess ? (
          <Descriptions
            bordered
            column={1}
            size="small"
            className="rounded-xl overflow-hidden"
          >
            <Descriptions.Item label="Budget ID">
              <Text className="font-mono font-semibold text-slate-700">
                {data.proposal_budget_id || "-"}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Dibuat Oleh">
              <Text className="font-semibold text-slate-700">
                {data.reverse_by || "-"}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Jumlah Reverse">
              <span className="font-bold text-emerald-600">
                {renderCurrency(data.reverse_amount)}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Tanggal Pengiriman">
              {renderDate(data.created_date)}
            </Descriptions.Item>
          </Descriptions>
        ) : (
          <Descriptions
            bordered
            column={{ xxl: 2, xl: 2, lg: 2, md: 2, sm: 1, xs: 1 }}
            size="small"
            className="rounded-xl overflow-hidden"
          >
            <Descriptions.Item label="Nomor Proposal" span={2}>
              <Text className="font-mono font-bold text-slate-800">
                {data.nomor_proposal || "-"}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Activity Code">
              <Text className="font-medium text-slate-700">
                {data.activity_code || "-"}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Periode">
              <Text className="text-slate-700">{data.periode || "-"}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Branch">
              <Text className="text-slate-700">{data.branch || "-"}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Brand">
              <Text className="text-slate-700">{data.brand || "-"}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Budget Awal">
              {renderCurrency(data.budget_awal)}
            </Descriptions.Item>
            <Descriptions.Item label="Klaim Distributor">
              {renderCurrency(data.nominal_klaim_distributor)}
            </Descriptions.Item>
            <Descriptions.Item label="Klaim Manual">
              {renderCurrency(data.nominal_klaim_manual)}
            </Descriptions.Item>
            <Descriptions.Item label="Klaim PO">
              {renderCurrency(data.nominal_klaim_po)}
            </Descriptions.Item>
            <Descriptions.Item label="Plan Reversal">
              {renderCurrency(data.plan_reversal)}
            </Descriptions.Item>
            <Descriptions.Item label="Sisa Budget">
              {renderCurrency(data.sisa_budget)}
            </Descriptions.Item>
            <Descriptions.Item label="Hasil Reversal" span={2}>
              <span className="font-bold text-rose-600 text-base">
                {renderCurrency(data.hasil_reversal)}
              </span>
            </Descriptions.Item>
          </Descriptions>
        )}
      </div>
    </Modal>
  );
}

ReversalDetailItemModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  data: PropTypes.object,
  type: PropTypes.oneOf(["success", "reject"]),
};
