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
  "/templates/delivery-order/update-status/template_bundle_status.xlsx";

/** Filename shown when the template is downloaded. */
export const DELIVERY_ORDER_TEMPLATE_FILENAME = "template_bundle_status.xlsx";

/**
 * Valid `kode_status` values with their Indonesian descriptions.
 * The backend accepts any casing but the description text comes from here.
 */
export const DELIVERY_ORDER_STATUS_OPTIONS = [
  { value: "CHG", label: "CHG", description: "Driver melakukan pergantian driver" },
  { value: "SPL", label: "SPL", description: "Driver Telah Sampai lokasi" },
  { value: "FNS", label: "FNS", description: "Finish" },
  { value: "PIC", label: "PIC", description: "Picking barang" },
  { value: "PODDIST", label: "PODDIST", description: "POD Distributor" },
  { value: "PODLOG", label: "PODLOG", description: "POD Logistik" },
  { value: "PODTRANS", label: "PODTRANS", description: "POD Transporter" },
  { value: "OTW", label: "OTW", description: "Proses Pengantaran" },
  { value: "SGE", label: "SGE", description: "Sampai gudang Enesis" },
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
 * Label shown in the status `<Select>` — "POD Transporter (PODTRANS)".
 *
 * @param {string} kodeStatus - Raw `kode_status` value
 * @returns {string}
 */
export const getDeliveryOrderStatusLabel = (kodeStatus) => {
  const key = String(kodeStatus || "").toUpperCase();
  const option = DELIVERY_ORDER_STATUS_OPTIONS.find((item) => item.value === key);
  return option ? `${option.description} (${option.value})` : key || "-";
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
    name: "Kode Status",
    index: "B",
    type: "String",
    mandatory: true,
    description:
      "Kode status baru untuk bundle tersebut. Gunakan salah satu kode yang tersedia pada dropdown di template.",
    example: "OTW, PODTRANS, FNS",
  },
];
