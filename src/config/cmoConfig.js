/**
 * CMO Support Configuration — Static options, labels, and display helpers.
 * Centralized here so they can be imported wherever CMO UI components are used.
 */

/** Template type options for replaceTemplate endpoint. */
export const CMO_TIPE_TEMPLATE_OPTIONS = [
  { value: "CMO", label: "Template CMO" },
  { value: "ADD_PO", label: "Template Add PO" },
];

/** Kategori (order type) options for search filter. */
export const CMO_KATEGORI_OPTIONS = [
  { value: "CMO", label: "CMO" },
  { value: "ADDPO", label: "ADD PO" },
];

/** Week number options (1-5) for regenerateCOrder endpoint. */
export const CMO_WEEK_OPTIONS = Array.from({ length: 5 }, (_, i) => ({
  value: String(i + 1),
  label: `Minggu ke-${i + 1}`,
}));

/** Action options for rejectOrKillCMO endpoint. */
export const CMO_ACTION_OPTIONS = [
  { value: "reject", label: "Reject CMO" },
  { value: "kill", label: "Kill CMO" },
];

/** Indonesian month options for filter inputs. */
export const CMO_BULAN_OPTIONS = [
  { value: "1", label: "Januari" },
  { value: "2", label: "Februari" },
  { value: "3", label: "Maret" },
  { value: "4", label: "April" },
  { value: "5", label: "Mei" },
  { value: "6", label: "Juni" },
  { value: "7", label: "Juli" },
  { value: "8", label: "Agustus" },
  { value: "9", label: "September" },
  { value: "10", label: "Oktober" },
  { value: "11", label: "November" },
  { value: "12", label: "Desember" },
];

/** Current year options — current year minus 1 through current year plus 1. */
export const CMO_TAHUN_OPTIONS = (() => {
  const currentYear = new Date().getFullYear();
  return [
    { value: String(currentYear - 1), label: String(currentYear - 1) },
    { value: String(currentYear), label: String(currentYear) },
    { value: String(currentYear + 1), label: String(currentYear + 1) },
  ];
})();

/** Month number → 3-letter Indonesian abbreviation map. */
export const CMO_BULAN_ABBREV = {
  1: "JAN",
  2: "FEB",
  3: "MAR",
  4: "APR",
  5: "MEI",
  6: "JUN",
  7: "JUL",
  8: "AGU",
  9: "SEP",
  10: "OKT",
  11: "NOV",
  12: "DES",
};

/**
 * Build the searchText payload string from selected filter values.
 * Format: "YYYY/KATEGORI/MONTH_ABBREV"
 *
 * @param {string} tahun  - Year value (e.g. "2026")
 * @param {string} kategori - Category value (e.g. "CMO")
 * @param {string} bulan  - Month number string (e.g. "1")
 * @returns {string} e.g. "2026/CMO/JAN"
 */
export const buildSearchText = (tahun, kategori, bulan) => {
  if (!tahun || !kategori || !bulan) return "";
  const abbrev = CMO_BULAN_ABBREV[parseInt(bulan, 10)];
  return `${tahun}/${kategori}/${abbrev || ""}`;
};
