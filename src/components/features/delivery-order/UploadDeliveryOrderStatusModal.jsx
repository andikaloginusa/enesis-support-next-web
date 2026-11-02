"use client";

import React, { useState } from "react";
import { Alert, Button, Modal, Table, Typography } from "antd";
import { DownloadOutlined, UploadOutlined } from "@ant-design/icons";
import { ExcelUploadField } from "@/components/ui/ExcelUpload";
import {
  DELIVERY_ORDER_TEMPLATE_COLUMNS,
  DELIVERY_ORDER_TEMPLATE_FILENAME,
  DELIVERY_ORDER_TEMPLATE_URL,
} from "@/config/deliveryOrderConfig";

const { Text } = Typography;

/**
 * UploadDeliveryOrderStatusModal — Update status DO massal dari file Excel.
 *
 * Baris Excel dicocokkan ke `bundle_id` (bukan `delivery_order_id`), dan
 * prosesnya all-or-nothing: bila satu baris invalid, tidak ada DO yang
 * ter-update dan backend mengembalikan daftar baris bermasalah.
 *
 * @param {Object}   props
 * @param {boolean}  props.open
 * @param {Function} props.onCancel
 * @param {Function} props.onSubmit - Callback dengan `{ file }`
 * @param {boolean}  props.confirmLoading
 * @param {Array}    props.errorDetails - Daftar `{ bundle_id, reason }` dari kegagalan
 */
export function UploadDeliveryOrderStatusModal({
  open,
  onCancel,
  onSubmit,
  confirmLoading = false,
  errorDetails = [],
}) {
  const [file, setFile] = useState(null);

  const handleCancel = () => {
    setFile(null);
    onCancel?.();
  };

  const handleOk = () => {
    if (!file) {
      return;
    }
    onSubmit?.({ file });
  };

  const errorRows = (Array.isArray(errorDetails) ? errorDetails : []).map(
    (item, index) => ({
      key: `${item?.bundle_id ?? "row"}-${index}`,
      bundle_id: item?.bundle_id,
      reason: item?.reason,
    }),
  );

  return (
    <Modal
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={confirmLoading}
      okText="Upload Sekarang"
      cancelText="Batal"
      okButtonProps={{
        size: "large",
        disabled: !file,
        className:
          "bg-emerald-600 hover:bg-emerald-700 border-emerald-700 rounded-lg font-medium",
      }}
      cancelButtonProps={{ size: "large", className: "rounded-lg" }}
      title={
        <div className="flex items-center gap-2 pb-3 text-base font-bold border-b border-slate-100 text-slate-800">
          <UploadOutlined className="text-emerald-600" />
          <span>Upload Update Status Delivery Order</span>
        </div>
      }
      width={720}
      destroyOnHidden
      className="[&_.ant-modal-content]:rounded-xl"
    >
      <div className="py-4 space-y-4">
        {/* Download template */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 flex items-center justify-between gap-4">
          <div>
            <Text className="block font-semibold text-slate-700 text-sm">
              Template Update Status Delivery Order
            </Text>
            <Text className="text-slate-400 text-xs">
              Gunakan template resmi agar format kolom sesuai dengan backend.
            </Text>
          </div>
          <a
            href={DELIVERY_ORDER_TEMPLATE_URL}
            download={DELIVERY_ORDER_TEMPLATE_FILENAME}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              type="default"
              icon={<DownloadOutlined />}
              size="small"
              className="border-emerald-500 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-600"
            >
              Download Template
            </Button>
          </a>
        </div>

        <Text className="block text-slate-500 text-sm leading-relaxed">
          Unggah file Excel berisi daftar bundle dan kode status baru. Baris
          dicocokkan ke <span className="font-mono font-semibold">bundle_id</span>,
          sehingga semua Delivery Order di dalam bundle tersebut ikut
          diperbarui. Proses bersifat all-or-nothing: jika satu baris tidak
          valid, tidak ada data yang diperbarui.
        </Text>

        {/* Panduan kolom */}
        <div className="rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-4 py-2 bg-slate-50 border-b border-slate-200">
            <Text className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Kolom Template
            </Text>
          </div>
          <div className="divide-y divide-slate-100">
            {DELIVERY_ORDER_TEMPLATE_COLUMNS.map((column) => (
              <div
                key={column.name}
                className="px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:gap-4"
              >
                <div className="sm:w-52 flex-shrink-0">
                  <Text className="font-semibold text-slate-700 text-sm">
                    {column.name}
                  </Text>
                  <Text className="text-xs text-slate-400 font-mono ml-2">
                    Kolom {column.index}
                  </Text>
                </div>
                <Text className="text-xs text-slate-500 flex-1">
                  {column.description}
                </Text>
              </div>
            ))}
          </div>
        </div>

        <ExcelUploadField
          value={file}
          onChange={setFile}
          placeholder="Klik atau tarik file Excel ke sini"
        />

        {errorRows.length > 0 && (
          <Alert
            type="error"
            showIcon
            message="Upload ditolak — tidak ada data yang diperbarui"
            description={
              <div className="mt-2">
                <Text className="block text-xs mb-2">
                  Backend menolak seluruh baris karena ada data yang tidak valid:
                </Text>
                <Table
                  size="small"
                  rowKey="key"
                  pagination={false}
                  dataSource={errorRows}
                  columns={[
                    {
                      title: "Bundle",
                      dataIndex: "bundle_id",
                      key: "bundle_id",
                      width: 160,
                      render: (text) => (
                        <span className="font-mono text-xs">{text || "-"}</span>
                      ),
                    },
                    {
                      title: "Alasan",
                      dataIndex: "reason",
                      key: "reason",
                      render: (text) => <span className="text-xs">{text || "-"}</span>,
                    },
                  ]}
                />
              </div>
            }
          />
        )}
      </div>
    </Modal>
  );
}
