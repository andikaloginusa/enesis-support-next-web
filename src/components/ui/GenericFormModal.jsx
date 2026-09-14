"use client";

import React from "react";
import PropTypes from "prop-types";
import { App, Modal, Form, Input, Select, DatePicker, InputNumber, Switch, Upload, Typography } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import { BRAND_FOCUS_COLOR } from "@/utils/constants";
import { validateDocumentFile } from "@/utils/documentValidation";

const { Text } = Typography;

// ─────────────────────────────────────────────────────────────────────────────
// Shared Input Class Helper
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns the CSS class string for Ant Design inputs that need brand hover/focus.
 * Excludes select, switch, toggle, and upload types.
 *
 * @param {{ type: string }} field
 * @returns {string | undefined}
 */
const inputClassName = (field) => {
  const skipTypes = new Set(["select", "switch", "toggle", "upload"]);
  if (skipTypes.has(field.type)) return undefined;
  return "rounded-lg hover:border-[var(--brand)] focus:border-[var(--brand)] focus:ring-1 focus:ring-[var(--brand)] transition-colors";
};

// ─────────────────────────────────────────────────────────────────────────────
// Field Renderer
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Renders the correct Ant Design input based on field type.
 * Each type maps to one component with consistent brand-aware styling.
 *
 * @param {Object} props
 * @param {Object}  props.field   - Field schema definition
 * @param {unknown} props.value   - Current field value
 * @param {Function} props.onChange - Called with the new value
 */
function FieldRenderer({ field, value, onChange }) {
  const brandStyle = { "--brand": BRAND_FOCUS_COLOR };
  const { notification } = App.useApp();

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
          className="w-full [&_.ant-select-selector]:rounded-lg"
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
            // Resolve document type at the moment of upload — avoids stale closures
            // when the user picks a type and then picks a file in quick succession.
            const type =
              typeof field.getDocumentType === "function"
                ? field.getDocumentType()
                : field.documentType;
            const result = validateDocumentFile(file, type);
            if (!result.ok) {
              notification.error({
                title: "File tidak valid",
                description: result.message,
              });
              return Upload.LIST_IGNORE;
            }
            return false; // hold — actual upload happens on form submit
          }}
          onChange={(info) => {
            const next = info.fileList.slice(-1); // keep only latest file
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
            <InboxOutlined className="text-emerald-600 text-2xl" />
          </p>
          <p className="ant-upload-text font-semibold text-slate-700 text-sm">
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
 * Renders a modal form driven entirely by a `fields` schema array.
 * Adding a new field type only requires updating `FieldRenderer`.
 *
 * @example
 * <GenericFormModal
 *   title="Reject Item"
 *   description="Mohon isi alasan penolakan."
 *   open={isOpen}
 *   form={rejectForm}
 *   onOk={handleSubmit}
 *   onCancel={handleClose}
 *   fields={[
 *     { name: "reason", label: "Alasan", type: "textarea", rules: [{ required: true }] },
 *     { name: "nik",   label: "NIK",    type: "number" },
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
        <div className="text-slate-800 font-bold text-base pb-3 border-b border-slate-100">
          {title}
        </div>
      }
      open={open}
      onOk={onOk}
      confirmLoading={confirmLoading}
      onCancel={onCancel}
      okText={okText}
      cancelText={cancelText}
      okButtonProps={{ size: "large", className: "rounded-lg font-medium", ...okButtonProps }}
      cancelButtonProps={{ size: "large", className: "rounded-lg", ...cancelButtonProps }}
      className="[&_.ant-modal-content]:rounded-xl"
      destroyOnHidden
    >
      <div className="py-4 space-y-4">
        {description && (
          <Text className="text-slate-500 text-sm leading-relaxed block">
            {description}
          </Text>
        )}

        <Form
          form={form}
          layout="vertical"
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
              valuePropName={
                field.type === "switch" || field.type === "toggle"
                  ? "checked"
                  : "value"
              }
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
