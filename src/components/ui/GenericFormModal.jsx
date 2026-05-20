"use client";

import React from "react";
import PropTypes from "prop-types";
import { Modal, Form, Input, Select, Typography } from "antd";

const { Text } = Typography;

/**
 * Generic Declarative Form Modal Component
 * Manages modal display, vertical form layout, field inputs mapping (including dropdown Selects),
 * and submission validation. Isolated to enforce the Single Responsibility Principle (SRP).
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
      okButtonProps={{
        size: "large",
        className: "rounded-lg",
        ...okButtonProps,
      }}
      cancelButtonProps={{
        size: "large",
        className: "rounded-lg",
        ...cancelButtonProps,
      }}
      className="rounded-xl overflow-hidden"
    >
      <div className="py-4">
        {description && (
          <Text className="block text-slate-500 text-sm mb-4 leading-relaxed">
            {description}
          </Text>
        )}
        <Form form={form} layout="vertical">
          {fields.map((field, idx) => (
            <Form.Item
              key={idx}
              name={field.name}
              label={field.label && <Text className="font-semibold text-slate-700">{field.label}</Text>}
              rules={field.rules}
            >
              {field.type === "textarea" ? (
                <Input.TextArea
                  placeholder={field.placeholder}
                  rows={field.rows || 4}
                  className="rounded-lg hover:border-[#1aac32] focus:border-[#1aac32]"
                />
              ) : field.type === "select" ? (
                <Select
                  placeholder={field.placeholder}
                  options={field.options || []}
                  className="w-full rounded-lg [&_.ant-select-selector]:rounded-lg"
                  size="large"
                  allowClear
                  showSearch
                  optionFilterProp="label"
                />
              ) : (
                <Input
                  type={field.type}
                  placeholder={field.placeholder}
                  className="rounded-lg hover:border-[#1aac32] focus:border-[#1aac32]"
                />
              )}
            </Form.Item>
          ))}
        </Form>
      </div>
    </Modal>
  );
};

GenericFormModal.propTypes = {
  title: PropTypes.node.isRequired,
  description: PropTypes.string,
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
      type: PropTypes.string.isRequired,
      placeholder: PropTypes.string,
      rules: PropTypes.array,
      rows: PropTypes.number,
      options: PropTypes.arrayOf(
        PropTypes.shape({
          label: PropTypes.node.isRequired,
          value: PropTypes.any.isRequired,
        })
      ),
    })
  ).isRequired,
};
