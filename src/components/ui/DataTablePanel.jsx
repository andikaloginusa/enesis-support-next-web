"use client";

import React from "react";
import PropTypes from "prop-types";
import { Card, Table, Input, Typography } from "antd";
import { SearchOutlined, ReloadOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

/**
 * Enhanced Declarative DataTable Panel Component
 *
 * A reusable shell that manages:
 * - Panel header with title, description, and optional subtitle badge
 * - Search input with debouncing handled by parent
 * - Extra header actions slot (filters, buttons, etc.)
 * - Ant Design Table with consistent modern styling
 *
 * Usage:
 *   <DataTablePanel
 *     title="Proposal Support"
 *     description="Kelola pengajuan proposal..."
 *     columns={columns}
 *     dataSource={list}
 *     loading={isLoading}
 *     rowKey="id"
 *     pagination={{ total, pageSize, current, onChange }}
 *     searchProps={{ placeholder, value, onChange }}
 *     extraHeaderActions={<Button>Export</Button>}
 *   />
 */
export const DataTablePanel = ({
  title,
  description,
  subtitle,           // Optional badge/count next to title
  subtitleVariant,    // "count" | "badge" | "success" | "warning" | "error"
  columns = [],
  dataSource = [],
  loading = false,
  rowKey = "id",
  pagination = {},
  searchProps = {},
  extraHeaderActions = null,
  scrollX = 1600,
  emptyText = "Tidak ada data yang cocok dengan pencarian Anda.",
}) => {
  const subtitleColorMap = {
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    error: "bg-rose-50 text-rose-700 border-rose-200",
    info: "bg-blue-50 text-blue-700 border-blue-200",
    count: "bg-slate-100 text-slate-600 border-slate-200",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };

  return (
    <div className="space-y-5 max-w-full">
      {/* ── Panel Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 flex-wrap">
            <Title
              level={4}
              className="m-0 text-slate-800 font-bold text-lg tracking-tight"
            >
              {title}
            </Title>
            {subtitle !== undefined && (
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                  subtitleColorMap[subtitleVariant] ||
                  subtitleColorMap.count
                }`}
              >
                {subtitleVariant === "count" ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mr-1.5 inline-block" />
                    {subtitle.toLocaleString("id-ID")} item
                  </>
                ) : (
                  subtitle
                )}
              </span>
            )}
          </div>
          {description && (
            <Text className="text-slate-400 text-xs leading-relaxed">
              {description}
            </Text>
          )}
        </div>
      </div>

      {/* ── Controls Bar ── */}
      <Card
        variant="bordered"
        className="shadow-sm border-slate-200 rounded-2xl overflow-hidden"
        styles={{ body: { padding: "20px 24px" } }}
      >
        {/* Search + Actions Row */}
        <div className="flex items-center gap-3 flex-wrap mb-0">
          {searchProps && searchProps.onChange && (
            <Input
              placeholder={searchProps.placeholder || "Cari data..."}
              prefix={<SearchOutlined className="text-slate-400" />}
              allowClear
              value={searchProps.value}
              onChange={(e) => searchProps.onChange(e.target.value)}
              className="w-80 max-w-full rounded-xl border-slate-200 hover:border-emerald-400 focus:border-emerald-500 transition-colors"
              size="middle"
            />
          )}
          <div className="flex-1" />
          {extraHeaderActions}
        </div>

        {/* ── Table ── */}
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
                    `Menampilkan ${range[0]}–${range[1]} dari ${total.toLocaleString("id-ID")} data`,
                  className: "pt-4",
                  ...pagination,
                }
              : false
          }
          onChange={(pag) =>
            pagination.onChange &&
            pagination.onChange(pag.current, pag.pageSize)
          }
          scroll={{ x: scrollX }}
          locale={{
            emptyText: (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center">
                  <SearchOutlined className="text-slate-300 text-2xl" />
                </div>
                <p className="text-slate-400 text-sm font-medium">{emptyText}</p>
              </div>
            ),
          }}
          className="mt-4 border border-slate-100 rounded-xl overflow-hidden
            [&_.ant-table]:overflow-auto
            [&_.ant-table-thead>tr>th]:!bg-slate-50
            [&_.ant-table-thead>tr>th]:!text-slate-600
            [&_.ant-table-thead>tr>th]:!font-bold
            [&_.ant-table-thead>tr>th]:!text-xs
            [&_.ant-table-thead>tr>th]:!uppercase
            [&_.ant-table-thead>tr>th]:!tracking-wider
            [&_.ant-table-thead>tr>th]:!border-b-2
            [&_.ant-table-thead>tr>th]:!border-slate-200
            [&_.ant-table-thead>tr>th:first-child]:!rounded-tl-xl
            [&_.ant-table-thead>tr>th:last-child]:!rounded-tr-xl
            [&_.ant-table-tbody>tr>td]:!bg-white
            [&_.ant-table-tbody>tr>td]:!border-b
            [&_.ant-table-tbody>tr>td]:!border-slate-100
            [&_.ant-table-tbody>tr:hover>td]:!bg-[#f0fdf4]
            [&_.ant-table-tbody>tr>td.ant-table-cell-row-hover]:!bg-[#f0fdf4]
            [&_.ant-table-tbody>tr:hover>td]:!transition-colors
            [&_.ant-table-cell-fix-left]:!bg-white
            [&_.ant-table-cell-fix-right]:!bg-white
            [&_.ant-table-cell-fix-left]:!z-[2]
            [&_.ant-table-cell-fix-right]:!z-[2]
            [&_.ant-table-thead_.ant-table-cell-fix-left]:!bg-slate-50
            [&_.ant-table-thead_.ant-table-cell-fix-right]:!bg-slate-50
            [&_.ant-table-thead_.ant-table-cell-fix-left]:!z-[3]
            [&_.ant-table-thead_.ant-table-cell-fix-right]:!z-[3]
            [&_.ant-table-tbody>tr:hover_.ant-table-cell-fix-left]:!bg-[#f0fdf4]
            [&_.ant-table-tbody>tr:hover_.ant-table-cell-fix-right]:!bg-[#f0fdf4]
            [&_.ant-table-tbody>tr>td.ant-table-cell-row-hover.ant-table-cell-fix-left]:!bg-[#f0fdf4]
            [&_.ant-table-tbody>tr>td.ant-table-cell-row-hover.ant-table-cell-fix-right]:!bg-[#f0fdf4]
            [&_.ant-table-cell-fix-right-first]:!border-l
            [&_.ant-table-cell-fix-right-first]:!border-slate-200
            [&_.ant-table-cell-fix-left-last]:!border-r
            [&_.ant-table-cell-fix-left-last]:!border-slate-200
            [&_.ant-table-wrapper]:overflow-auto
            [&_.ant-pagination]:mb-0
            [&_.ant-pagination-options]:gap-2"
        />
      </Card>
    </div>
  );
};

DataTablePanel.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  subtitle: PropTypes.node,
  subtitleVariant: PropTypes.oneOf([
    "count",
    "badge",
    "success",
    "warning",
    "error",
    "info",
  ]),
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
  emptyText: PropTypes.string,
};
