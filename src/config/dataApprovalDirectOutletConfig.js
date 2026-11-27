/**
 * Data Approval Direct Outlet Configuration
 *
 * Field names dan label untuk modul Data Approval Support > Direct Outlet.
 *
 * Backend (`support/data-approval-direct-outlet`) memakai envelope yang
 * berbeda dari modul lain di repo ini, sehingga pemetaan response dilakukan di
 * `data-approval-direct-outlet.service.js`, bukan di layer ini.
 */

/** Primary key column returned by the list/detail endpoints. */
export const DATA_APPROVAL_DIRECT_OUTLET_ID_FIELD =
  "data_approval_direct_outlet_id";

/** Kolom kode vendor. */
export const DIRECT_OUTLET_KODE_VENDOR_FIELD = "kode_vendor";

/** Kolom nama outlet. */
export const DIRECT_OUTLET_NAMA_OUTLET_FIELD = "nama_outlet";

/** Kolom nama perusahaan. */
export const DIRECT_OUTLET_NAMA_PT_FIELD = "nama_pt";

/** Kolom payment. */
export const DIRECT_OUTLET_PAYMENT_FIELD = "payment";

/** Kolom NIK KAM — satu-satunya field yang bisa di-update. */
export const DIRECT_OUTLET_NIK_KAM_FIELD = "nik_kam";

/** Kolom nama KAM. */
export const DIRECT_OUTLET_NAMA_KAM_FIELD = "nama_kam";

/**
 * Field yang ditampilkan pada tabel dan halaman detail.
 *
 * Sesuai catatan: isi detail hanya mengikuti data yang ada di tabel/baris.
 */
export const DIRECT_OUTLET_DISPLAY_FIELDS = [
  DIRECT_OUTLET_KODE_VENDOR_FIELD,
  DIRECT_OUTLET_NAMA_OUTLET_FIELD,
  DIRECT_OUTLET_NAMA_PT_FIELD,
  DIRECT_OUTLET_PAYMENT_FIELD,
  DIRECT_OUTLET_NIK_KAM_FIELD,
  DIRECT_OUTLET_NAMA_KAM_FIELD,
];

/**
 * Label field untuk ditampilkan pada section "Field lainnya" di halaman detail.
 * Key adalah nama field pada response API.
 */
export const DIRECT_OUTLET_FIELD_LABELS = {
  [DATA_APPROVAL_DIRECT_OUTLET_ID_FIELD]: "ID Data Approval Direct Outlet",
  [DIRECT_OUTLET_KODE_VENDOR_FIELD]: "Kode Vendor",
  [DIRECT_OUTLET_NAMA_OUTLET_FIELD]: "Nama Outlet",
  [DIRECT_OUTLET_NAMA_PT_FIELD]: "Nama PT",
  [DIRECT_OUTLET_PAYMENT_FIELD]: "Payment",
  [DIRECT_OUTLET_NIK_KAM_FIELD]: "NIK KAM",
  [DIRECT_OUTLET_NAMA_KAM_FIELD]: "Nama KAM",
};
