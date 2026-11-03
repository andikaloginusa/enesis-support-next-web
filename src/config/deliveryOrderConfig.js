/**
 * Delivery Order Configuration
 *
 * Mirrors the backend `STATUS_MAP` in
 * `apiesales/api/controllers/supports/DeliveryOrderSupportController.js`.
 * The backend derives the human-readable `status` column from that map, so the
 * code is the only thing the frontend may send — keep both in sync.
 */

/** Primary key column returned by the list/detail endpoints. */
export const DELIVERY_ORDER_ID_FIELD = "delivery_order_id";

/** Column holding the bundle number (the key used by the Excel update). */
export const DELIVERY_ORDER_BUNDLE_FIELD = "bundle_id";

/** Public path of the Excel template used for bulk status updates. */
export const DELIVERY_ORDER_TEMPLATE_URL =
  "/templates/delivery-order/update-status/template_ubah_status_bundle.xlsx";

/** Filename shown when the template is downloaded. */
export const DELIVERY_ORDER_TEMPLATE_FILENAME =
  "template_ubah_status_bundle.xlsx";

/**
 * Valid `kode_status` values with their Indonesian descriptions.
 *
 * `value` is the kode yang dikirim ke backend; `label` is the teks yang
 * ditampilkan ke user. Keduanya harus persis sama dengan `STATUS_MAP` di
 * `DeliveryOrderSupportController.js` — backend mencocokkan kolom `Status`
 * pada template Excel dengan teks itu (case-insensitive), dan dropdown pada
 * template juga berisi teks tersebut, bukan kode.
 */
export const DELIVERY_ORDER_STATUS_OPTIONS = [
  { value: "SPL", label: "Driver Telah Sampai lokasi" },
  { value: "FNS", label: "Finish" },
  { value: "PIC", label: "Picking barang" },
  { value: "PODDIST", label: "POD Distributor" },
  { value: "PODLOG", label: "POD Logistik" },
  { value: "PODTRANS", label: "POD Transporter" },
  { value: "OTW", label: "Proses Pengantaran" },
  { value: "SGE", label: "Sampai gudang Enesis" },
];

/**
 * Code → display label and tag colour.
 * `StatusBadge` cannot be used here — `resolveStatus()` does not know the DO
 * codes and would fall back to the raw uppercase value.
 */
export const DELIVERY_ORDER_STATUS_META = Object.freeze({
  CHG: { label: "Penggantian Driver", color: "purple" },
  SPL: { label: "Sudah Sampai Lokasi", color: "cyan" },
  FNS: { label: "Finish", color: "green" },
  PIC: { label: "Picking Barang", color: "blue" },
  PODDIST: { label: "POD Distributor", color: "gold" },
  PODLOG: { label: "POD Logistik", color: "orange" },
  PODTRANS: { label: "POD Transporter", color: "green" },
  OTW: { label: "Proses Pengantaran", color: "geekblue" },
  SGE: { label: "Sampai Gudang Enesis", color: "default" },
});

/**
 * Look up the display metadata for a status code.
 *
 * @param {string} kodeStatus - Raw `kode_status` value
 * @returns {{ label: string, color: string }}
 */
export const getDeliveryOrderStatusMeta = (kodeStatus) => {
  const key = String(kodeStatus || "").toUpperCase();
  return (
    DELIVERY_ORDER_STATUS_META[key] || {
      label: String(kodeStatus || "-").toUpperCase(),
      color: "default",
    }
  );
};

/**
 * Label lengkap untuk kode status — "POD Transporter (PODTRANS)".
 *
 * @param {string} kodeStatus - Raw `kode_status` value
 * @returns {string}
 */
export const getDeliveryOrderStatusLabel = (kodeStatus) => {
  const key = String(kodeStatus || "").toUpperCase();
  const option = DELIVERY_ORDER_STATUS_OPTIONS.find(
    (item) => item.value === key,
  );
  return option ? `${option.label} (${option.value})` : key || "-";
};

/**
 * Column definitions shared by the Excel template guide and the upload modal.
 * The backend matches Excel rows on `bundle_id`, never on `delivery_order_id`.
 */
export const DELIVERY_ORDER_TEMPLATE_COLUMNS = [
  {
    name: "Bundle",
    index: "A",
    type: "String",
    mandatory: true,
    description:
      "Nomor bundle (bundle_id) yang akan di-update. Semua Delivery Order di dalam bundle tersebut ikut diperbarui.",
    example: "82818, 83360, 83361",
  },
  {
    name: "Status",
    index: "B",
    type: "String",
    mandatory: true,
    description:
      'Status baru untuk bundle tersebut. Isi dengan teks status yang tersedia pada dropdown di template (mis. "Proses Pengantaran"), bukan kode singkatnya.',
    example: "Proses Pengantaran",
  },
];
