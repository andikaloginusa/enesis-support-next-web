"use client";

import React from "react";
import { Button, Modal, Typography } from "antd";
import { FileTextOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { InfoField } from "@/components/ui";
import {
  DATA_APPROVAL_DIRECT_OUTLET_ID_FIELD,
  DIRECT_OUTLET_KODE_VENDOR_FIELD,
  DIRECT_OUTLET_NAMA_KAM_FIELD,
  DIRECT_OUTLET_NIK_KAM_FIELD,
} from "@/config/dataApprovalDirectOutletConfig";

const { Text } = Typography;

/**
 * DirectOutletDetailModal — Tampilan cepat data approval direct outlet.
 *
 * Modal ini **tidak** memanggil API: isinya hanya field yang sudah ada di
 * baris tabel. Untuk data lengkap dari server, gunakan tombol
 * "Buka Halaman Detail".
 *
 * @param {Object}   props
 * @param {boolean}  props.open
 * @param {Object}   props.record - Baris tabel yang dipilih
 * @param {Function} props.onClose
 * @param {Function} props.onOpenDetailPage
 */
export function DirectOutletDetailModal({
  open,
  record,
  onClose,
  onOpenDetailPage,
}) {
  const row = record || {};

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={
        <div className="flex items-center gap-2 pb-3 text-base font-bold border-b border-slate-100 text-slate-800">
          <InfoCircleOutlined className="text-blue-500" />
          <span>Detail Data Approval Direct Outlet</span>
          {row[DIRECT_OUTLET_KODE_VENDOR_FIELD] ? (
            <Text className="text-slate-400 font-normal text-sm ml-1">
              — {row[DIRECT_OUTLET_KODE_VENDOR_FIELD]}
            </Text>
          ) : null}
        </div>
      }
      footer={
        <div className="flex justify-end gap-2">
          <Button size="large" onClick={onClose} className="rounded-lg">
            Tutup
          </Button>
          <Button
            type="primary"
            size="large"
            icon={<FileTextOutlined />}
            onClick={onOpenDetailPage}
            className="rounded-lg"
          >
            Buka Halaman Detail
          </Button>
        </div>
      }
      width={640}
      destroyOnHidden
      className="[&_.ant-modal-content]:rounded-xl"
    >
      <div className="py-4 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
        <InfoField
          label="Kode Vendor"
          value={row[DIRECT_OUTLET_KODE_VENDOR_FIELD]}
          mono
        />
        <InfoField
          label="NIK KAM"
          value={row[DIRECT_OUTLET_NIK_KAM_FIELD]}
          mono
        />
        <InfoField
          label="Nama KAM"
          value={row[DIRECT_OUTLET_NAMA_KAM_FIELD]}
          className="sm:col-span-2"
        />
        <InfoField
          label="ID"
          value={row[DATA_APPROVAL_DIRECT_OUTLET_ID_FIELD]}
          mono
          className="sm:col-span-2"
        />
      </div>
    </Modal>
  );
}
