"use client";

import React from "react";
import PropTypes from "prop-types";
import { App, Modal, Form, Input, Select, DatePicker, InputNumber, Switch, Upload, Typography } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import { BRAND_FOCUS_COLOR } from "@/utils/constants";
import { validateDocumentFile } from "@/utils/documentValidation";

const { Text } = Typography;

// ─────────────────────────────────────────────────────────────────────────────
// Field Renderer — pure, no side effects
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Renders the correct input component based on field type.
 * Each type maps to one Ant Design component with consistent styling.
 */
export function FieldRenderer({ field, value, onChange }) {
  // Use CSS variable — Tailwind arbitrary values (e.g. border-[var(--brand)]) are valid
  // but runtime template interpolation like `border-[${BRAND_FOCUS_COLOR}]` breaks PurgeCSS.
  // Solution: use a CSS variable defined via style prop instead of a Tailwind class.
  const brandStyle = { "--brand": BRAND_FOCUS_COLOR };
  const { notification } = App.useApp();

  const inputClassName = (field) =>
    field.type !== "select" && field.type !== "switch" && field.type !== "toggle"
      ? "rounded-lg hover:border-[var(--brand)] focus:border-[var(--brand)] focus:ring-1 focus:ring-[var(--brand)] transition-colors"
      : undefined;

  switch (field.type) {
    case "textarea":
      return (
        <Input.TextArea
          placeholder={field.placeholder}
          rows={field.rows || 4}
          disabled={field.disabled}
          readOnly={field.readOnly}
          maxLength={field.maxLength}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={brandStyle}
          className={inputClassName(field)}
        />
      );

    case "select":
      return (
        <Select
          placeholder={field.placeholder}
          options={field.options || []}
          disabled={field.disabled}
          value={value}
          onChange={onChange}
          className="w-full rounded-lg [&_.ant-select-selector]:rounded-lg"
          size="large"
          allowClear
          showSearch
          optionFilterProp="label"
        />
      );

    case "date":
    case "datepicker":
      return (
        <DatePicker
          placeholder={field.placeholder}
          value={value}
          onChange={onChange}
          disabled={field.disabled}
          size="large"
          style={{ width: "100%" }}
          className="w-full rounded-lg"
        />
      );

    case "number":
      return (
        <InputNumber
          placeholder={field.placeholder}
          value={value}
          onChange={onChange}
          disabled={field.disabled}
          min={field.min}
          max={field.max}
          precision={field.precision}
          size="large"
          style={{ width: "100%" }}
          className="w-full rounded-lg"
        />
      );

    case "password":
      return (
        <Input.Password
          placeholder={field.placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={field.disabled}
          readOnly={field.readOnly}
          size="large"
          className="rounded-lg [&_.ant-input]:rounded-lg"
        />
      );

    case "switch":
    case "toggle":
      return (
        <Switch
          checked={value}
          onChange={onChange}
          disabled={field.disabled}
          checkedChildren={field.checkedChildren}
          unCheckedChildren={field.unCheckedChildren}
        />
      );

    case "upload": {
      const fileList = Array.isArray(value) ? value : [];
      return (
        <Upload.Dragger
          accept={field.accept}
          multiple={false}
          maxCount={1}
          fileList={fileList}
          beforeUpload={(file) => {
            // Resolve the document type at the moment of upload, not from a
            // captured prop — captures go stale when the user picks the type
            // and the file in rapid succession.
            const type = typeof field.getDocumentType === "function"
              ? field.getDocumentType()
              : field.documentType;
            const result = validateDocumentFile(file, type);
            if (!result.ok) {
              notification.error({ title: "File tidak valid", description: result.message });
              return Upload.LIST_IGNORE;
            }
            return false; // Hold file in form — actual upload happens on form submit
          }}
          onChange={(info) => {
            const next = info.fileList.slice(-1); // keep only the latest file
            onChange(next);
            if (field.onFileChange) field.onFileChange(next);
          }}
          onRemove={() => {
            onChange([]);
            if (field.onFileChange) field.onFileChange([]);
            return true;
          }}
          disabled={field.disabled}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined className="text-emerald-600" />
          </p>
          <p className="ant-upload-text font-semibold text-slate-700">
            {field.placeholder || "Klik atau seret file ke sini untuk unggah"}
          </p>
          <p className="ant-upload-hint text-slate-400 text-xs">
            {field.hint || "Pastikan format dan ukuran file sesuai ketentuan."}
          </p>
        </Upload.Dragger>
      );
    }

    default:
      return (
        <Input
          type={field.type || "text"}
          placeholder={field.placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={field.disabled}
          readOnly={field.readOnly}
          maxLength={field.maxLength}
          style={brandStyle}
          className={inputClassName(field)}
        />
      );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generic Declarative Form Modal Component
 *
 * Manages modal display, vertical form layout, and field input mapping.
 * Field schema drives rendering — adding a new field type only requires
 * updating FieldRenderer, not this component.
 *
 * @example
 * <GenericFormModal
 *   title="Reject Item"
 *   open={isOpen}
 *   form={rejectForm}
 *   onOk={handleSubmit}
 *   onCancel={handleClose}
 *   fields={[
 *     { name: "reason", label: "Alasan", type: "textarea", rules: [{ required: true }] },
 *     { name: "nik", label: "NIK", type: "number" },
 *   ]}
 * />
 */
export const GenericFormModal = ({
  title,
  description,
  open,
  onOk,
  onCancel,
  confirmLoading = false,
  okText = "Submit",
  cancelText = "Batal",
  okButtonProps = {},
  cancelButtonProps = {},
  form,
  fields = [],
}) => {
  return (
    <Modal
      title={
        <div className="text-slate-800 font-bold text-lg border-b border-slate-100 pb-3">
          {title}
        </div>
      }
      open={open}
      onOk={onOk}
      confirmLoading={confirmLoading}
      onCancel={onCancel}
      okText={okText}
      cancelText={cancelText}
      okButtonProps={{ size: "large", className: "rounded-lg", ...okButtonProps }}
      cancelButtonProps={{ size: "large", className: "rounded-lg", ...cancelButtonProps }}
      className="rounded-xl overflow-hidden"
    >
      <div className="py-4">
        {description && (
          <Text className="block text-slate-500 text-sm mb-4 leading-relaxed">
            {description}
          </Text>
        )}
        <Form form={form} layout="vertical">
          {fields.map((field) => (
            <Form.Item
              key={field.name} // Stable key — field.name is unique and required
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
};

GenericFormModal.propTypes = {
  title: PropTypes.node.isRequired,
  description: PropTypes.node,
  open: PropTypes.bool.isRequired,
  onOk: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  confirmLoading: PropTypes.bool,
  okText: PropTypes.string,
  cancelText: PropTypes.string,
  okButtonProps: PropTypes.object,
  cancelButtonProps: PropTypes.object,
  form: PropTypes.object.isRequired,
  fields: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.oneOfType([PropTypes.string, PropTypes.array]).isRequired,
      label: PropTypes.node,
      type: PropTypes.string,
      placeholder: PropTypes.string,
      rules: PropTypes.array,
      rows: PropTypes.number,
      options: PropTypes.arrayOf(
        PropTypes.shape({ label: PropTypes.node.isRequired, value: PropTypes.any.isRequired })
      ),
      disabled: PropTypes.bool,
      readOnly: PropTypes.bool,
      maxLength: PropTypes.number,
      min: PropTypes.number,
      max: PropTypes.number,
      precision: PropTypes.number,
      extra: PropTypes.node,
      checkedChildren: PropTypes.node,
      unCheckedChildren: PropTypes.node,
      // Upload-specific
      accept: PropTypes.string,
      documentType: PropTypes.string,
      getDocumentType: PropTypes.func,
      hint: PropTypes.node,
      onFileChange: PropTypes.func,
    })
  ).isRequired,
};
