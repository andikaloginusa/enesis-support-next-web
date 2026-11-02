"use client";

import React from "react";
import { Button, Modal, Tag, Typography } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import { InfoField } from "@/components/ui";
import { renderDateTime } from "@/components/ui/ColumnRenderers";
import {
  DELIVERY_ORDER_BUNDLE_FIELD,
  DELIVERY_ORDER_ID_FIELD,
  getDeliveryOrderStatusLabel,
  getDeliveryOrderStatusMeta,
} from "@/config/deliveryOrderConfig";

const { Text } = Typography;

/**
 * DeliveryOrderDetailModal — Ringkasan detail satu Delivery Order.
 *
 * Data diambil dari baris tabel (tidak fetch ulang) sesuai keputusan desain;
 * tombol "Lihat Lebih Detail" navigating ke halaman `/delivery-order/[id]`
 * yang memanggil endpoint get-by-id.
 *
 * @param {Object}   props
 * @param {boolean}  props.open
 * @param {Object}   props.deliveryOrder - Baris tabel yang dipilih
 * @param {Function} props.onClose
 * @param {Function} props.onViewMore - Callback dengan delivery_order_id
 */
export function DeliveryOrderDetailModal({
  open,
  deliveryOrder,
  onClose,
  onViewMore,
}) {
  const row = deliveryOrder || {};
  const statusMeta = getDeliveryOrderStatusMeta(row.kode_status);
  const deliveryOrderId = row[DELIVERY_ORDER_ID_FIELD];

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={
        <div className="flex items-center gap-2 pb-3 text-base font-bold border-b border-slate-100 text-slate-800">
          <InfoCircleOutlined className="text-blue-500" />
          <span>Detail Delivery Order</span>
          {row[DELIVERY_ORDER_BUNDLE_FIELD] && (
            <Text className="text-slate-400 font-normal text-sm ml-1">
              — Bundle {row[DELIVERY_ORDER_BUNDLE_FIELD]}
            </Text>
          )}
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
            disabled={!deliveryOrderId}
            onClick={() => onViewMore?.(deliveryOrderId)}
            className="rounded-lg"
          >
            Lihat Lebih Detail
          </Button>
        </div>
      }
      width={780}
      destroyOnHidden
      className="[&_.ant-modal-content]:rounded-xl"
    >
      <div className="py-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
          <InfoField
            label="Bundle ID"
            value={row[DELIVERY_ORDER_BUNDLE_FIELD]}
            mono
          />
          <InfoField label="Console Number" value={row.console_number} mono />
          <InfoField label="Nomor DO" value={row.nomor_do} mono />
          <InfoField label="Nomor SO" value={row.nomor_so} mono />
          <InfoField label="Kode Status" value={row.kode_status} mono />
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Status
            </span>
            <div>
              {row.status ? (
                <Tag color={statusMeta.color}>
                  {row.status} ({row.kode_status || "-"})
                </Tag>
              ) : (
                <span className="text-slate-300 italic text-xs">
                  Tidak tersedia
                </span>
              )}
            </div>
          </div>
          <InfoField label="Distributor" value={row.m_distributor_id} mono />
          <InfoField label="Transporter" value={row.m_transporter_id} mono />
          <InfoField label="Tujuan" value={row.tujuan} />
          <InfoField label="Route" value={row.route} />
          <InfoField
            label="Tanggal POD Transporter"
            value={renderDateTime(row.tanggal_pod_transporter)}
          />
          <InfoField label="Dibuat" value={renderDateTime(row.created)} />
          <InfoField label="Diperbarui" value={renderDateTime(row.updated)} />
          <InfoField label="Delivery Order ID" value={deliveryOrderId} mono />
        </div>

        {row.kode_status && (
          <div className="mt-6 rounded-xl bg-slate-50 border border-slate-200 px-4 py-3">
            <Text className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Keterangan Kode Status
            </Text>
            <Text className="block text-sm font-semibold text-slate-700 mt-1">
              {getDeliveryOrderStatusLabel(row.kode_status)}
            </Text>
          </div>
        )}
      </div>
    </Modal>
  );
}
