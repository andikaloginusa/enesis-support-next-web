"use client";

import React, {
  useCallback,
  useRef,
  useState,
  useEffect,
  useId,
} from "react";
import PropTypes from "prop-types";
import {
  Modal,
  Form,
  Select,
  Input,
  Upload,
  Button,
  Alert,
  Badge,
  Divider,
  App,
} from "antd";
import {
  CloudUploadOutlined,
  FileExcelOutlined,
  WarningFilled,
  CloseCircleFilled,
  CheckCircleFilled,
  InboxOutlined,
  FileDoneOutlined,
  ExclamationCircleFilled,
} from "@ant-design/icons";

// ─────────────────────────────────────────────────────────────────────────────
// Constants & Configuration
// ─────────────────────────────────────────────────────────────────────────────

const UPDATE_TYPE_OPTIONS = [
  { label: "Update Budget",   value: "BUDGET"   },
  { label: "Update End Date",  value: "END_DATE"  },
];

const PARAMETER_WHERE_OPTIONS = [
  { label: "Berdasarkan WBS Number",    value: "WBS_NUMBER"       },
  { label: "Berdasarkan Kode Eprop SAP", value: "KODE_EPROP_SAP"  },
];

const ALLOWED_EXTS = [".xlsx", ".xls"];
const ALLOWED_MIMES = [
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
];
const MAX_SIZE_MB = 50;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

// ─────────────────────────────────────────────────────────────────────────────
// Pure File Validation (extracted for testability & reuse)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Validate an Excel file for SAP Proposal mass upload.
 * @param {File | null | undefined} file
 * @returns {{ ok: true } | { ok: false, message: string }}
 */
export function validateExcelFile(file) {
  if (!file) {
    return { ok: false, message: "File tidak ditemukan." };
  }

  const ext = file.name.lastIndexOf(".") < 0
    ? ""
    : file.name.slice(file.name.lastIndexOf(".")).toLowerCase();

  if (!ALLOWED_EXTS.includes(ext)) {
    return {
      ok: false,
      message: `Format file tidak didukung. Hanya ${ALLOWED_EXTS.join(", ")} yang diterima.`,
    };
  }

  if (!ALLOWED_MIMES.includes(file.type) && file.type !== "application/octet-stream") {
    return { ok: false, message: "Format file tidak valid." };
  }

  if (file.size > MAX_SIZE_BYTES) {
    return {
      ok: false,
      message: `Ukuran file melebihi batas maksimum (${MAX_SIZE_MB} MB).`,
    };
  }

  return { ok: true };
}

// ─────────────────────────────────────────────────────────────────────────────
// Reusable ExcelUploadField
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Standalone drag-and-drop Excel upload field.
 * - Prevents auto-upload (holds file until parent submits)
 * - Shows inline error via Ant Design Form.Item
 * - Reusable — import from this file for other upload modals
 *
 * @param {Object}   props
 * @param {string}   [props.placeholder]
 * @param {string}   [props.hint]
 * @param {File|null} [props.value]
 * @param {Function} [props.onChange]  - called with File | null
 * @param {string}   [props.error]    - error message to display
 */
export function ExcelUploadField({
  value = null,
  onChange,
  error,
  placeholder = "Klik atau tarik file Excel ke sini",
  hint = `Format: ${ALLOWED_EXTS.join(", ")} · Maks. ${MAX_SIZE_MB} MB`,
}) {
  const { notification } = App.useApp();
  const fieldId = useId();
  const internalFile = value;

  const handleBeforeUpload = useCallback(
    (file) => {
      const result = validateExcelFile(file);
      if (!result.ok) {
        notification.error({
          title: "File tidak valid",
          description: result.message,
          key: fieldId,
        });
        return Upload.LIST_IGNORE;
      }
      onChange?.(file);
      return false; // hold — no auto-upload
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onChange, notification],
  );

  const handleRemove = useCallback(() => {
    onChange?.(null);
    return false; // prevent Ant Upload's default removal
  }, [onChange]);

  return (
    <div>
      <Upload.Dragger
        accept={ALLOWED_EXTS.join(",")}
        maxCount={1}
        fileList={internalFile ? [{ uid: "-1", name: internalFile.name, status: "done" }] : []}
        beforeUpload={handleBeforeUpload}
        onRemove={handleRemove}
        showUploadList={{
          showRemoveIcon: true,
          removeIcon: (
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-red-50 hover:bg-red-100 transition-colors">
              <CloseCircleFilled className="text-red-400 text-xs" />
            </span>
          ),
        }}
        itemRender={(_origin, file) => (
          <div className="flex items-center gap-3 w-full px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl my-2">
            <FileExcelOutlined className="text-emerald-600 text-lg flex-shrink-0" />
            <span className="text-emerald-700 text-sm font-medium truncate flex-1">
              {file.name}
            </span>
            <span className="text-emerald-400 text-xs flex-shrink-0">
              {(internalFile?.size / 1024).toFixed(0)} KB
            </span>
          </div>
        )}
        className="[&_.ant-upload-drag]:border-dashed [&_.ant-upload-drag]:border-slate-200 [&_.ant-upload-drag:hover]:border-blue-400 [&_.ant-upload-drag]:rounded-xl [&_.ant-upload-drag]:bg-slate-50/60 [&_.ant-upload-drag]:py-6 [&_.ant-upload-drag]:transition-colors [&_.ant-upload-drag:hover]:bg-blue-50/50"
      >
        <p className="ant-upload-drag-icon mb-3">
          <InboxOutlined className="text-blue-400 text-3xl" />
        </p>
        <p className="ant-upload-text font-medium text-slate-600 text-sm">
          {placeholder}
        </p>
        <p className="ant-upload-hint text-slate-400 text-xs mt-1">
          {hint}
        </p>
      </Upload.Dragger>

      {error && (
        <p className="text-red-500 text-xs mt-1.5 pl-1">{error}</p>
      )}
    </div>
  );
}

ExcelUploadField.propTypes = {
  value: PropTypes.instanceOf(File),
  onChange: PropTypes.func,
  error: PropTypes.string,
  placeholder: PropTypes.string,
  hint: PropTypes.string,
};

// ─────────────────────────────────────────────────────────────────────────────
// SapUploadResultModal — shows partial failure detail
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Result detail modal rendered after a SAP mass upload.
 *
 * Shows:
 * - Summary alert (warning) if partial failures exist
 * - Count badge per failure type
 * - Scrollable list of affected WBS / kode entries
 * - Empty state (all clean) if no failures
 *
 * This modal is decoupled from the main form — the parent passes the
 * structured error data after the mutation resolves.
 *
 * @param {Object|null} props.data   - `{ message, data_duplikat: string[], data_not_found: string[] }`
 * @param {Function}    props.onClose
 */
export function SapUploadResultModal({ data, onClose }) {
  const isOpen = data !== null;

  const duplikatList = data?.data_duplikat ?? [];
  const notFoundList = data?.data_not_found ?? [];
  const hasDuplikat = duplikatList.length > 0;
  const hasNotFound = notFoundList.length > 0;

  // Auto-dismiss the "no issues" state after 3s
  useEffect(() => {
    if (isOpen && !hasDuplikat && !hasNotFound) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, hasDuplikat, hasNotFound, onClose]);

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 text-slate-800 font-bold text-base">
          <FileDoneOutlined className="text-blue-500" />
          <span>Hasil Proses Upload</span>
        </div>
      }
      open={isOpen}
      onCancel={onClose}
      footer={
        <div className="flex justify-end gap-2">
          <Button onClick={onClose} size="large" className="rounded-lg">
            Tutup
          </Button>
        </div>
      }
      width={560}
      destroyOnHidden
      className="[&_.ant-modal-content]:rounded-xl [&_.ant-modal-header]:!pb-0"
    >
      {isOpen && (
        <div className="space-y-4 py-2">

          {/* ── Summary banner ── */}
          {(hasDuplikat || hasNotFound) ? (
            <Alert
              type="warning"
              icon={<ExclamationCircleFilled className="text-amber-500" />}
              message={
                <span className="font-medium">
                  {hasDuplikat && hasNotFound
                    ? `Terdapat ${duplikatList.length + notFoundList.length} data bermasalah`
                    : hasDuplikat
                    ? `Terdapat ${duplikatList.length} data duplikat`
                    : `Terdapat ${notFoundList.length} data tidak ditemukan`}
                </span>
              }
              description={<span className="text-amber-700 text-xs">{data.message}</span>}
              showIcon
              className="[&_.ant-alert-warning]:border-amber-200 [&_.ant-alert-warning]:bg-amber-50/80 [&_.ant-alert-message]:text-amber-800"
            />
          ) : (
            <Alert
              type="success"
              icon={<CheckCircleFilled className="text-emerald-500" />}
              message="Semua data berhasil diproses"
              description={<span className="text-emerald-600 text-xs">{data.message}</span>}
              showIcon
              className="[&_.ant-alert-success]:border-emerald-200 [&_.ant-alert-success]:bg-emerald-50/80"
            />
          )}

          <Divider className="!my-3" />

          {/* ── Duplikat list ── */}
          {hasDuplikat && (
            <section>
              <div className="flex items-center gap-2 mb-2">
                <Badge count={duplikatList.length} color="orange" overflowCount={9999} />
                <h4 className="text-slate-700 font-semibold text-sm m-0">
                  Data WBS_NUMBER Duplikat
                </h4>
              </div>
              <p className="text-slate-500 text-xs mb-2 -mt-1">
                Data di bawah ini ditemukan duplikat dan tidak diproses.
              </p>
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 max-h-44 overflow-y-auto">
                <ul className="space-y-1">
                  {duplikatList.map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs">
                      <WarningFilled className="text-orange-400 text-xs flex-shrink-0" />
                      <code className="text-orange-800 font-mono bg-orange-100 px-2 py-0.5 rounded">
                        {item}
                      </code>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}

          {/* ── Not Found list ── */}
          {hasNotFound && (
            <section>
              <div className="flex items-center gap-2 mb-2">
                <Badge count={notFoundList.length} color="red" overflowCount={9999} />
                <h4 className="text-slate-700 font-semibold text-sm m-0">
                  Data Tidak Ditemukan
                </h4>
              </div>
              <p className="text-slate-500 text-xs mb-2 -mt-1">
                Data di bawah ini tidak ditemukan di sistem dan dilewati.
              </p>
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 max-h-44 overflow-y-auto">
                <ul className="space-y-1">
                  {notFoundList.map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs">
                      <CloseCircleFilled className="text-red-400 text-xs flex-shrink-0" />
                      <code className="text-red-800 font-mono bg-red-100 px-2 py-0.5 rounded">
                        {item}
                      </code>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}

          {/* ── All clean ── */}
          {!hasDuplikat && !hasNotFound && (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
                <CheckCircleFilled className="text-emerald-500 text-xl" />
              </div>
              <p className="text-emerald-700 font-medium text-sm m-0">
                Proses upload berhasil tanpa kendala
              </p>
              <p className="text-slate-400 text-xs m-0">
                Modal ini akan otomatis ditutup
              </p>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}

SapUploadResultModal.propTypes = {
  data: PropTypes.shape({
    message: PropTypes.string,
    data_duplikat: PropTypes.arrayOf(PropTypes.string),
    data_not_found: PropTypes.arrayOf(PropTypes.string),
  }),
  onClose: PropTypes.func.isRequired,
};

// ─────────────────────────────────────────────────────────────────────────────
// MassUpdateProposalSapModal — main form modal
// ─────────────────────────────────────────────────────────────────────────────

/**
 * MassUpdateProposalSapModal
 *
 * Form modal for uploading a SAP Proposal mass-update Excel file.
 *
 * @param {Object}   props
 * @param {boolean}  props.open
 * @param {Function} props.onClose
 * @param {Function} props.onSubmit   - async fn({ file, meta }) — called with validated data
 * @param {boolean}  [props.isUploading]
 */
export function MassUpdateProposalSapModal({
  open,
  onClose,
  onSubmit,
  isUploading = false,
}) {
  const [form] = Form.useForm();
  const selectedFileRef = useRef(null);
  const [fileError, setFileError] = useState("");
  const [resultData, setResultData] = useState(null);

  // Reset on close — always fresh state when reopened
  useEffect(() => {
    if (!open) {
      form.resetFields();
      selectedFileRef.current = null;
      setFileError("");
      setResultData(null);
    }
  }, [open, form]);

  // ── File selection (uses ref to avoid stale closure) ──────────────────────
  const handleFileChange = useCallback((file) => {
    selectedFileRef.current = file;
    setFileError("");
  }, []);

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleOk = async () => {
    const values = await form.validateFields();

    if (!selectedFileRef.current) {
      setFileError("Silakan pilih file Excel terlebih dahulu.");
      return;
    }

    const payload = {
      file: selectedFileRef.current,
      meta: {
        reason:                  values.reason?.trim() ?? "",
        update_type:             values.update_type,
        parameter_where_type:   values.parameter_where_type,
      },
    };

    try {
      await onSubmit(payload);
      onClose();
    } catch (err) {
      // Capture partial-failure payload so the result modal can render
      if (err && typeof err === "object" && err.hasPartialFailure) {
        setResultData({
          message:       err.message,
          data_duplikat:  err.data_duplikat  ?? [],
          data_not_found: err.data_not_found ?? [],
        });
        onClose();
      }
      // Full error → hook's notifyError handles it; do nothing here.
    }
  };

  return (
    <>
      <Modal
        title={
          <div className="flex items-center gap-2 text-slate-800 font-bold text-base pb-3 border-b border-slate-100">
            <CloudUploadOutlined className="text-blue-500" />
            <span>Mass Update Proposal from SAP</span>
          </div>
        }
        open={open}
        onCancel={onClose}
        onOk={handleOk}
        confirmLoading={isUploading}
        okText={isUploading ? "Mengunggah…" : "Upload & Update"}
        cancelText="Batal"
        destroyOnHidden
        width={520}
        okButtonProps={{
          disabled: isUploading,
          size: "large",
          className:
            "bg-blue-600 hover:!bg-blue-700 border-blue-600 rounded-lg font-medium",
        }}
        cancelButtonProps={{ size: "large", className: "rounded-lg" }}
        className="[&_.ant-modal-content]:rounded-xl [&_.ant-modal-header]:!pb-0"
      >
        <div className="py-4 space-y-5">

          {/* ── Description card ── */}
          <div className="bg-blue-50/70 border border-blue-100 rounded-xl px-4 py-3">
            <p className="text-slate-600 text-sm leading-relaxed m-0">
              Unggah file Excel berisi data proposal yang ingin diperbarui
              secara massal. Pastikan tipe update dan parameter pencarian sudah
              sesuai sebelum mengunggah.
            </p>
          </div>

          {/* ── Form fields ── */}
          <Form
            form={form}
            layout="vertical"
            requiredMark={false}
            className="[&_.ant-form-item-label>label]:font-semibold [&_.ant-form-item-label>label]:text-slate-700"
          >
            {/* Update Type */}
            <Form.Item
              name="update_type"
              label="Pilih Tipe Update"
              rules={[{ required: true, message: "Tipe update wajib dipilih." }]}
            >
              <Select
                placeholder="-- Pilih Tipe Update --"
                options={UPDATE_TYPE_OPTIONS}
                size="large"
                className="[&_.ant-select-selector]:rounded-lg [&_.ant-select-selector]:border-slate-200 [&_.ant-select-selector:hover]:border-blue-400 [&_.ant-select-focused_.ant-select-selector]:!border-blue-500 [&_.ant-select-focused_.ant-select-selector]:!shadow-none"
              />
            </Form.Item>

            {/* Parameter Where */}
            <Form.Item
              name="parameter_where_type"
              label="Pilih Parameter Pencarian"
              rules={[{ required: true, message: "Parameter pencarian wajib dipilih." }]}
            >
              <Select
                placeholder="-- Pilih Parameter Pencarian --"
                options={PARAMETER_WHERE_OPTIONS}
                size="large"
                className="[&_.ant-select-selector]:rounded-lg [&_.ant-select-selector]:border-slate-200 [&_.ant-select-selector:hover]:border-blue-400 [&_.ant-select-focused_.ant-select-selector]:!border-blue-500 [&_.ant-select-focused_.ant-select-selector]:!shadow-none"
              />
            </Form.Item>

            {/* Reason */}
            <Form.Item
              name="reason"
              label="Alasan / Reason"
              rules={[
                { required: true, message: "Alasan wajib diisi." },
                {
                  validator: (_, value) =>
                    value?.trim()
                      ? Promise.resolve()
                      : Promise.reject(new Error("Alasan tidak boleh kosong.")),
                },
              ]}
            >
              <Input.TextArea
                rows={3}
                placeholder="Contoh: Koreksi budget sesuai data realokasi SAP Q3 2024"
                maxLength={500}
                showCount
                className="rounded-lg [&_.ant-input]:resize-none"
              />
            </Form.Item>

            {/* File Upload */}
            <Form.Item
              label="File Excel"
              required
            >
              <ExcelUploadField
                value={selectedFileRef.current}
                onChange={handleFileChange}
                error={fileError}
              />
            </Form.Item>
          </Form>
        </div>
      </Modal>

      {/* Result detail modal (fires after form modal closes) */}
      <SapUploadResultModal
        data={resultData}
        onClose={() => setResultData(null)}
      />
    </>
  );
}

MassUpdateProposalSapModal.propTypes = {
  open:        PropTypes.bool.isRequired,
  onClose:     PropTypes.func.isRequired,
  onSubmit:    PropTypes.func.isRequired,
  isUploading: PropTypes.bool,
};
