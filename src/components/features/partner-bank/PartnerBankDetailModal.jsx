"use client";

import React from "react";
import { Alert, Button, Modal, Spin, Typography } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import { usePartnerBankDetail } from "@/hooks/queries/usePartnerBankDetail";
import { InfoField } from "@/components/ui";
import { renderDateTime } from "@/components/ui/ColumnRenderers";
import {
  PARTNER_BANK_ID_FIELD,
  toPartnerBankFormValues,
} from "@/config/partnerBankConfig";

const { Text } = Typography;

/**
 * PartnerBankDetailModal — Full detail view for a single partner bank record.
 *
 * Fetches the record through GET /partner-bank/:id and renders every field
 * returned by the backend.
 *
 * @param {Object}   props
 * @param {boolean}  props.open
 * @param {string}   props.partnerBankId - Partner bank ID to fetch
 * @param {Function} props.onClose
 */
export function PartnerBankDetailModal({ open, partnerBankId, onClose }) {
  const { detail: partnerBankDetail, isLoading: isDetailLoading } =
    usePartnerBankDetail({ partnerBankId: open ? partnerBankId : null });

  const values = toPartnerBankFormValues(partnerBankDetail);
  const id = partnerBankDetail?.[PARTNER_BANK_ID_FIELD];

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={
        <div className="flex items-center gap-2 pb-3 text-base font-bold border-b border-slate-100 text-slate-800">
          <InfoCircleOutlined className="text-blue-500" />
          <span>Detail Partner Bank</span>
          {partnerBankDetail?.account_holder && (
            <Text className="text-slate-400 font-normal text-sm ml-1">
              — {partnerBankDetail.account_holder}
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
      width={760}
      destroyOnHidden
      className="[&_.ant-modal-content]:rounded-xl"
    >
      <div className="py-4">
        {isDetailLoading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Spin size="large" />
            <Text className="text-slate-400 text-sm">
              Memuat detail partner bank...
            </Text>
          </div>
        ) : !partnerBankDetail ? (
          <Alert
            type="error"
            message="Data tidak ditemukan"
            description="Partner bank dengan ID tersebut tidak ditemukan."
            showIcon
            className="rounded-xl"
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
            <InfoField label="Kode Cabang" value={values.kode_cabang} mono />
            <InfoField label="Bank Key" value={values.bank_key} mono />
            <InfoField
              label="Nomor Rekening"
              value={values.bank_account}
              mono
            />
            <InfoField label="Part Bank Key" value={values.part_bank_key} mono />
            <InfoField
              label="Referensi"
              value={values.reference_details}
              className="sm:col-span-2"
            />
            <InfoField
              label="Nama Pemegang Rekening"
              value={values.account_holder}
              className="sm:col-span-2"
              large
            />
            <InfoField label="ID" value={id} mono />
            <InfoField
              label="Terakhir Diperbarui"
              value={renderDateTime(partnerBankDetail.updated)}
            />
            <InfoField
              label="Dibuat"
              value={renderDateTime(partnerBankDetail.created)}
            />
            <InfoField label="Diperbarui Oleh" value={partnerBankDetail.updatedby} />
          </div>
        )}
      </div>
    </Modal>
  );
}
