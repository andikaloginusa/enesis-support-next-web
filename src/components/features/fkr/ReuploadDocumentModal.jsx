"use client";

import React, { useMemo, useState } from "react";
import { Form, Modal, Typography } from "antd";
import { BRAND_FOCUS_COLOR } from "@/utils/constants";
import { FieldRenderer } from "@/components/ui/GenericFormModal";
import {
  FKR_DOCUMENT_TYPE_OPTIONS,
  FKR_DOCUMENT_TYPES,
  buildAcceptAttrFor,
} from "@/config/fkrDocumentTypes";

const { Text } = Typography;

/**
 * ReuploadDocumentModal — Replaces a single FKR document.
 *
 * Lives as its own component (instead of a thin wrapper over
 * GenericFormModal) because the upload field needs:
 *   - The Form.useForm() instance and the <Form> element to share a lifecycle
 *     (avoids the "form instance not connected" warning).
 *   - `document_type` and `document` fields to share state: changing the type
 *     must clear any previously picked file because the accept-list changes.
 *
 * Despite not using GenericFormModal, it reuses the same FieldRenderer so
 * each input still gets the same styling and validation as everywhere else.
 *
 * @param {Object}   props
 * @param {boolean}  props.open
 * @param {Function} props.onCancel
 * @param {Function} props.onSubmit  - Called with { fkr_id, document_type, file }
 * @param {boolean}  props.confirmLoading
 * @param {string}   props.fkrId
 * @param {string}   props.fkrNo
 */
export function ReuploadDocumentModal({
  open,
  onCancel,
  onSubmit,
  confirmLoading = false,
  fkrId,
  fkrNo,
}) {
  const [form] = Form.useForm();
  const [selectedType, setSelectedType] = useState(null);

  const acceptAttr = useMemo(
    () => (selectedType ? buildAcceptAttrFor(selectedType) : ""),
    [selectedType],
  );

  const selectedTypeMeta = selectedType ? FKR_DOCUMENT_TYPES[selectedType] : null;
  const acceptHint = selectedTypeMeta
    ? `Format yang diterima: ${selectedTypeMeta.allowedExts.join(", ")} (maks. 50 MB)`
    : "Pilih tipe dokumen untuk melihat format yang diterima.";

  const handleCancel = () => {
    form.resetFields();
    setSelectedType(null);
    onCancel();
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const fileObj = values.document?.[0]?.originFileObj;
      if (!fileObj) {
        form.setFields([{ name: "document", errors: ["Unggah file dokumen!"] }]);
        return;
      }
      await onSubmit({
        fkr_id: fkrId,
        document_type: values.document_type,
        file: fileObj,
      });
    } catch {
      /* validation errors surfaced inline by Ant Design */
    }
  };

  const fields = [
    {
      name: "document_type",
      label: "Tipe Dokumen",
      type: "select",
      placeholder: "Pilih tipe dokumen yang akan di-re-upload",
      options: FKR_DOCUMENT_TYPE_OPTIONS,
      rules: [{ required: true, message: "Tipe dokumen wajib dipilih!" }],
      onChange: (value) => {
        setSelectedType(value);
        form.setFieldsValue({ document: [] });
      },
    },
    {
      name: "document",
      label: "File Dokumen",
      type: "upload",
      accept: acceptAttr,
      // Read the document type live from form state at the moment the file
      // is dropped — captured props can go stale between select change and
      // file pick in the same render cycle.
      getDocumentType: () => form.getFieldValue("document_type"),
      placeholder: "Klik atau seret file ke sini",
      hint: acceptHint,
      rules: [{ required: true, message: "Unggah file dokumen terlebih dahulu!" }],
    },
  ];

  return (
    <Modal
      title={
        <div className="text-slate-800 font-bold text-lg border-b border-slate-100 pb-3">
          Re-Upload Dokumen FKR
        </div>
      }
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={confirmLoading}
      okText="Upload Sekarang"
      cancelText="Batal"
      okButtonProps={{
        size: "large",
        className: "bg-emerald-600 hover:bg-emerald-700 border-emerald-600 rounded-lg",
      }}
      cancelButtonProps={{ size: "large", className: "rounded-lg" }}
      className="rounded-xl overflow-hidden"
      destroyOnHidden
    >
      <div className="py-4">
        <Text className="block text-slate-500 text-sm mb-4 leading-relaxed">
          {fkrNo ? (
            <span>
              Mengganti dokumen untuk FKR nomor{" "}
              <Text strong className="text-slate-800">{fkrNo}</Text>.
              Pilih tipe dokumen dan unggah file baru sebagai pengganti.
            </span>
          ) : (
            "Pilih tipe dokumen dan unggah file baru sebagai pengganti."
          )}
        </Text>

        <Form
          form={form}
          layout="vertical"
          // CSS variable trick — see GenericFormModal for the explanation.
          style={{ "--brand": BRAND_FOCUS_COLOR }}
        >
          {fields.map((field) => (
            <Form.Item
              key={field.name}
              name={field.name}
              label={
                field.label && (
                  <Text className="font-semibold text-slate-700">{field.label}</Text>
                )
              }
              valuePropName={field.type === "switch" || field.type === "toggle" ? "checked" : "value"}
              getValueFromEvent={
                field.type === "switch" || field.type === "toggle"
                  ? (checked) => checked
                  : undefined
              }
              rules={field.rules}
              extra={field.extra}
            >
              <FieldRenderer field={field} />
            </Form.Item>
          ))}
        </Form>
      </div>
    </Modal>
  );
}