"use client";

import React, { useCallback, useEffect, useId, useRef } from "react";
import PropTypes from "prop-types";
import { App, Modal, Form, Input, Select, DatePicker, InputNumber, Switch, Upload, Typography } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import { BRAND_FOCUS_COLOR } from "@/utils/constants";
import { validateDocumentFile } from "@/utils/documentValidation";

const { Text } = Typography;

// ─────────────────────────────────────────────────────────────────────────────
// Constants — module-level to avoid Set recreation on every call
// ─────────────────────────────────────────────────────────────────────────────

/** Field types that should skip the standard input styling class. */
const SKIP_STYLE_TYPES = new Set(["select", "switch", "toggle", "upload"]);

/** Field types that use `checked` as valuePropName instead of `value`. */
const TOGGLE_TYPES = new Set(["switch", "toggle"]);

// ─────────────────────────────────────────────────────────────────────────────
// Field Schema Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns the Ant Design `valuePropName` for a given field type.
 *
 * @param {string} type - Field type string
 * @returns {"checked" | "value"}
 */
export function getFieldValuePropName(type) {
  return TOGGLE_TYPES.has(type) ? "checked" : "value";
}

/**
 * Returns the Ant Design `getValueFromEvent` normalizer for a given field type.
 * Toggle fields normalize to the boolean `checked` value directly.
 *
 * @param {string} type - Field type string
 * @returns {((checked: boolean) => boolean) | undefined}
 */
export function getFieldValueFromEvent(type) {
  if (TOGGLE_TYPES.has(type)) {
    return (checked) => checked;
  }
  return undefined;
}

// ─────────────────────────────────────────────────────────────────────────────
// Input Class Helper
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns the CSS class string for Ant Design inputs that need brand hover/focus.
 * Returns `undefined` for types that have their own custom styling (select, switch, etc.).
 *
 * @param {{ type: string }} field
 * @returns {string | undefined}
 */
const inputClassName = (field) => {
  if (SKIP_STYLE_TYPES.has(field.type)) return undefined;
  return (
    "rounded-lg hover:border-[var(--brand)] focus:border-[var(--brand)] " +
    "focus:ring-1 focus:ring-[var(--brand)] transition-colors"
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// FieldRenderer
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Renders the correct Ant Design input based on field type.
 * Each type maps to one component with consistent brand-aware styling.
 *
 * Callers pass `notification` as a prop so this component stays free of
 * context reads — reducing the number of App.Provider subscribers in the tree.
 *
 * @param {Object}  props
 * @param {Object}  props.field        - Field schema definition
 * @param {unknown} props.value        - Current field value
 * @param {Function} props.onChange    - Called with the new value
 * @param {Object}  [props.notification] - Ant App notification API (optional)
 */
export function FieldRenderer({ field, value, onChange, notification }) {
  const brandStyle = { "--brand": BRAND_FOCUS_COLOR };
  const uploadId = useId();

  const handleBeforeUpload = useCallback(
    (file) => {
      if (!notification) return Upload.LIST_IGNORE;

      const type =
        typeof field.getDocumentType === "function"
          ? field.getDocumentType()
          : field.documentType;

      const result = validateDocumentFile(file, type);
      if (!result.ok) {
        notification.error({
          title: "File tidak valid",
          description: result.message,
          key: uploadId,
        });
        return Upload.LIST_IGNORE;
      }

      onChange?.(file);
      return false; // hold — actual upload happens on form submit
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [field, notification, onChange, uploadId],
  );

  const handleRemove = useCallback(() => {
    onChange?.([]);
    field.onFileChange?.([]);
    return true;
  }, [field, onChange]);

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
          beforeUpload={handleBeforeUpload}
          onRemove={handleRemove}
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

FieldRenderer.propTypes = {
  field: PropTypes.shape({
    type: PropTypes.string.isRequired,
    placeholder: PropTypes.string,
    rows: PropTypes.number,
    disabled: PropTypes.bool,
    readOnly: PropTypes.bool,
    maxLength: PropTypes.number,
    options: PropTypes.array,
    min: PropTypes.number,
    max: PropTypes.number,
    precision: PropTypes.number,
    checkedChildren: PropTypes.node,
    unCheckedChildren: PropTypes.node,
    accept: PropTypes.string,
    documentType: PropTypes.string,
    getDocumentType: PropTypes.func,
    hint: PropTypes.node,
    onFileChange: PropTypes.func,
  }).isRequired,
  value: PropTypes.any,
  onChange: PropTypes.func,
  notification: PropTypes.object,
};

// ─────────────────────────────────────────────────────────────────────────────
// GenericFormModal
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generic Declarative Form Modal Component
 *
 * Renders a modal form driven entirely by a `fields` schema array.
 * The modal auto-resets its form state each time it opens to guarantee
 * a clean slate on every open.
 *
 * @example
 * // ── Define fields schema (can be stored in a separate file) ──
 * const REJECT_FIELDS = [
 *   { name: "reason", label: "Alasan Penolakan", type: "textarea",
 *     rules: [{ required: true, message: "Alasan wajib diisi." }] },
 * ];
 *
 * // ── Use the modal ──
 * <GenericFormModal
 *   title="Tolak Item"
 *   description="Mohon isi alasan penolakan."
 *   open={isOpen}
 *   form={rejectForm}
 *   onOk={handleSubmit}
 *   onCancel={handleClose}
 *   fields={REJECT_FIELDS}
 * />
 *
 * @param {Object}  props
 * @param {React.ReactNode} props.title
 * @param {React.ReactNode} [props.description]
 * @param {boolean} props.open
 * @param {Function} props.onOk
 * @param {Function} props.onCancel
 * @param {boolean} [props.confirmLoading]
 * @param {string} [props.okText]
 * @param {string} [props.cancelText]
 * @param {Object} [props.okButtonProps]
 * @param {Object} [props.cancelButtonProps]
 * @param {Object} props.form - Ant Design Form instance
 * @param {Object[]} props.fields - Field schema array
 *
 * @typedef {Object} FieldSchema
 * @property {string|string[]} name - Form field name (unique key)
 * @property {React.ReactNode} [label] - Field label text
 * @property {"textarea"|"select"|"date"|"datepicker"|"number"|"password"|"switch"|"toggle"|"upload"|"text"} type - Input type
 * @property {string} [placeholder]
 * @property {Array} [rules] - Ant Design validation rules
 * @property {Array<{label: React.ReactNode, value: any}>} [options] - Select options
 * @property {boolean} [disabled]
 * @property {boolean} [readOnly]
 * @property {number} [maxLength]
 * @property {number} [min]
 * @property {number} [max]
 * @property {number} [precision]
 * @property {React.ReactNode} [extra]
 * @property {React.ReactNode} [checkedChildren]
 * @property {React.ReactNode} [unCheckedChildren]
 * @property {string} [accept] - Upload accepted file types
 * @property {string} [documentType] - Document type for file validation
 * @property {Function} [getDocumentType] - Dynamic document type getter
 * @property {React.ReactNode} [hint] - Upload hint text
 * @property {Function} [onFileChange] - Called when upload file changes
 */
export function GenericFormModal({
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
}) {
  const { notification } = App.useApp();
  const firstRenderRef = useRef(true);

  // ── Reset form state every time modal opens ──────────────────────────────────
  useEffect(() => {
    if (open) {
      // Skip reset on initial mount (form already has its own defaultValues)
      if (firstRenderRef.current) {
        firstRenderRef.current = false;
        return;
      }
      form.resetFields();
    }
  }, [open, form]);

  // ── Stable per-field renderers ──────────────────────────────────────────────
  const renderField = useCallback(
    (field) => (
      <FieldRenderer
        key={field.name}
        field={field}
        notification={notification}
      />
    ),
    [notification],
  );

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
      okButtonProps={{
        size: "large",
        className: "rounded-lg font-medium",
        ...okButtonProps,
      }}
      cancelButtonProps={{
        size: "large",
        className: "rounded-lg",
        ...cancelButtonProps,
      }}
      className="[&_.ant-modal-content]:rounded-xl"
      destroyOnHidden
    >
      <div className="py-4 space-y-4">
        {description && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
            <Text className="text-slate-500 text-sm leading-relaxed">
              {description}
            </Text>
          </div>
        )}

        <Form
          form={form}
          layout="vertical"
          style={{ "--brand": BRAND_FOCUS_COLOR }}
          destroyOnHidden
        >
          {fields.map((field) => (
            <Form.Item
              key={field.name}
              name={field.name}
              label={
                field.label ? (
                  <Text className="font-semibold text-slate-700">{field.label}</Text>
                ) : null
              }
              valuePropName={getFieldValuePropName(field.type)}
              getValueFromEvent={getFieldValueFromEvent(field.type)}
              rules={field.rules}
              extra={field.extra}
            >
              {renderField(field)}
            </Form.Item>
          ))}
        </Form>
      </div>
    </Modal>
  );
}

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
      accept: PropTypes.string,
      documentType: PropTypes.string,
      getDocumentType: PropTypes.func,
      hint: PropTypes.node,
      onFileChange: PropTypes.func,
    })
  ).isRequired,
};
