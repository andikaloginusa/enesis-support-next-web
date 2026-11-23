/**
 * Submit Faktur Configuration
 *
 * Master data untuk modul Submit Faktur Support.
 *
 * `SUBMIT_FAKTUR_STATUS_OPTIONS` memetakan `kode_status` ke teks `status`
 * yang disimpan pada tabel `c_invoice`. Pasangan ini mengikuti alur transaksi
 * di backend `apiesales/api/controllers/transactions/SubmitFakturController.js`
 * (mis. `kode_status='WT1'` ditulis bersama `status='Transporter Sent Doc'`),
 * sedangkan `SubmitFakturSupportController.js` memakai kode yang sama untuk
 * menyusun `audit_submit_faktur`.
 *
 * Catatan: label di sini adalah teks yang dikirim ke backend sebagai kolom
 * `status`, jadi keduanya harus selalu dikirim berpasangan.
 */

/** Primary key column returned by the list endpoint. */
export const SUBMIT_FAKTUR_ID_FIELD = "c_invoice_id";

/**
 * Status alur invoice — pasangan `kode_status` + teks `status` yang benar-benar
 * ditulis backend saat invoice berpindah tahap.
 *
 * `value` = kode yang dikirim pada field `kode_status`,
 * `label` = teks yang dikirim pada field `status`.
 */
export const SUBMIT_FAKTUR_STATUS_OPTIONS = [
  { value: "DR", label: "Transporter Submit Billing" },
  { value: "APL", label: "1st verification by Logistic Staff" },
  { value: "APLHF", label: "1st verification by Accounting Staff" },
  { value: "WT1", label: "Transporter Sent Doc" },
  { value: "WT2", label: "Received Doc. By Logistic Staff" },
  { value: "WT3", label: "2nd verification by Logistic Staff" },
  { value: "WT4", label: "2nd verification by Logistic Head" },
  { value: "WT5", label: "Received Doc. By Accounting" },
  { value: "WT6", label: "2nd verification by Accounting Staff" },
  { value: "WT8", label: "Payment Completed" },
  { value: "APF", label: "Approved" },
];

/**
 * Status penolakan — backend tetap menyimpan `kode_status` seperti ini pada
 * `audit_submit_faktur`, dan wajib disertai `reason_reject`.
 */
export const SUBMIT_FAKTUR_REJECT_OPTIONS = [
  { value: "RJL", label: "Reject" },
  { value: "RJF", label: "Reject" },
];

/**
 * Status manual dari tim IT Support (di luar alur otomatis backend).
 *
 * Dipakai untuk koreksi status invoice, contoh: menyetujui atau menolak
 * invoice secara manual dengan alasan.
 */
export const SUBMIT_FAKTUR_MANUAL_OPTIONS = [
  { value: "APPLOG", label: "Approved Logistik" },
  { value: "REJLOG", label: "Rejected Logistik" },
];

/**
 * Seluruh opsi status untuk dropdown (alur + penolakan + manual).
 */
export const SUBMIT_FAKTUR_ALL_STATUS_OPTIONS = [
  ...SUBMIT_FAKTUR_STATUS_OPTIONS,
  ...SUBMIT_FAKTUR_REJECT_OPTIONS,
  ...SUBMIT_FAKTUR_MANUAL_OPTIONS,
];

/**
 * Warna tag untuk `kode_status` pada tabel.
 */
export const SUBMIT_FAKTUR_STATUS_META = Object.freeze({
  DR: { color: "default" },
  APL: { color: "blue" },
  APLHF: { color: "cyan" },
  WT1: { color: "geekblue" },
  WT2: { color: "cyan" },
  WT3: { color: "purple" },
  WT4: { color: "magenta" },
  WT5: { color: "gold" },
  WT6: { color: "orange" },
  WT8: { color: "green" },
  APF: { color: "green" },
  RJL: { color: "red" },
  RJF: { color: "red" },
  APPLOG: { color: "green" },
  REJLOG: { color: "red" },
});

/**
 * Look up the tag metadata for a status code.
 *
 * @param {string} kodeStatus - Raw `kode_status` value
 * @returns {{ color: string }}
 */
export const getSubmitFakturStatusMeta = (kodeStatus) => {
  const key = String(kodeStatus || "").toUpperCase();
  return SUBMIT_FAKTUR_STATUS_META[key] ?? { color: "default" };
};

/**
 * Look up the status text for a `kode_status`.
 *
 * @param {string} kodeStatus - Raw `kode_status` value
 * @returns {string}
 */
export const getSubmitFakturStatusLabel = (kodeStatus) => {
  const key = String(kodeStatus || "").toUpperCase();
  const option = SUBMIT_FAKTUR_ALL_STATUS_OPTIONS.find(
    (item) => item.value === key,
  );
  return option ? option.label : key || "-";
};

/**
 * Status penolakan wajib disertai alasan (`reason_reject`).
 *
 * Backend memakai awalan `RJ` untuk kode penolakan (RJL, RJF, REJLOG).
 */
export const isRejectStatus = (kodeStatus) =>
  String(kodeStatus || "").toUpperCase().startsWith("RJ");

/**
 * Master payment term (`r_payment_term`).
 *
 * Backend tidak menyediakan endpoint untuk master ini — `r_payment_term` hanya
 * dipakai di `SubmitFakturSupportController.js` untuk validasi kode saat
 * update. Pola kodenya `Z` + nomor hari zero-padded 3 digit (`Z000` = Cash,
 * `Z001` = 1 hari, ... `Z150` = 150 hari), dengan nama
 * `<hari> Days Credit` (2 digit untuk hari < 10).
 *
 * Backend hanya memvalidasi `kode`, jadi yang wajib benar adalah `value`.
 */
export const SUBMIT_FAKTUR_PAYMENT_TERM_OPTIONS = [
  { value: "Z000", label: "Z000 - Cash", days: 0 },
  ...Array.from({ length: 150 }, (_, index) => {
    const days = index + 1;
    const kode = `Z${String(days).padStart(3, "0")}`;
    return {
      value: kode,
      label: `${kode} - ${String(days).padStart(2, "0")} Days Credit`,
      days,
    };
  }),
];
