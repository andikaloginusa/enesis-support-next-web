"use client";

import React from "react";
import PropTypes from "prop-types";
import { Card, Table, Input, Typography } from "antd";
import { SearchOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

/**
 * Generic Declarative DataTable Panel Component
 * A highly cohesive reusable template shell that manages grid tables, search debouncing inputs,
 * and header slot layouts. Completely isolated to enforce the Single Responsibility Principle.
 */
export const DataTablePanel = ({
  title,
  description,
  columns = [],
  dataSource = [],
  loading = false,
  rowKey = "id",
  pagination = {},
  searchProps = {},
  extraHeaderActions = null,
  scrollX = 1600,
}) => {
  return (
    <div className="space-y-6 max-w-full">
      {/* Main Declarative Content Panel */}
      <Card variant={"borderless"} className="shadow-sm bg-white">
        {/* Table & Header Controls Slot */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <Title level={4} className="m-0 text-slate-800 font-bold">
              {title}
            </Title>
            {description && <Text className="text-slate-400 text-xs">{description}</Text>}
          </div>
          
          <div className="flex items-center gap-3 flex-wrap md:flex-nowrap">
            {/* Search Input Controller */}
            {searchProps && searchProps.onChange && (
              <Input
                placeholder={searchProps.placeholder || "Cari data..."}
                prefix={<SearchOutlined className="text-slate-400" />}
                allowClear
                value={searchProps.value}
                onChange={(e) => searchProps.onChange(e.target.value)}
                className="w-full md:w-80 rounded-lg hover:border-[#1aac32] focus:border-[#1aac32]"
                size="large"
              />
            )}
            
            {/* Custom Extra Header Controls (e.g. Refresh, Export buttons) */}
            {extraHeaderActions}
          </div>
        </div>

        {/* Ant Design Dynamic Table */}
        <Table
          columns={columns}
          dataSource={dataSource}
          loading={loading}
          rowKey={rowKey}
          pagination={
            pagination
              ? {
                  total: pagination.total || 0,
                  pageSize: pagination.pageSize || 10,
                  current: pagination.current || 1,
                  showSizeChanger: true,
                  pageSizeOptions: ["10", "20", "50", "100"],
                  showTotal: (total, range) =>
                    `Menampilkan ${range[0]}-${range[1]} dari ${total} data`,
                  className: "pt-4",
                  ...pagination,
                }
              : false
          }
          onChange={(pag) => pagination.onChange && pagination.onChange(pag.current, pag.pageSize)}
          scroll={{ x: scrollX }}
          className="border border-slate-100 rounded-xl overflow-hidden [&_.ant-table-thead_th]:bg-[#f2f8f2] [&_.ant-table-thead_th]:text-slate-700 [&_.ant-table-thead_th]:font-bold"
        />
      </Card>
    </div>
  );
};

DataTablePanel.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  columns: PropTypes.array.isRequired,
  dataSource: PropTypes.array,
  loading: PropTypes.bool,
  rowKey: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  pagination: PropTypes.shape({
    total: PropTypes.number,
    pageSize: PropTypes.number,
    current: PropTypes.number,
    onChange: PropTypes.func,
  }),
  searchProps: PropTypes.shape({
    placeholder: PropTypes.string,
    value: PropTypes.string,
    onChange: PropTypes.func,
  }),
  extraHeaderActions: PropTypes.node,
  scrollX: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};
