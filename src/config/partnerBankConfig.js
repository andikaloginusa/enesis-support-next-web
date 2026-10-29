/**
 * Partner Bank Configuration — Field names and row → form mapping.
 *
 * The backend stores the API's `kode_cabang` in the `kode_vendor` column and
 * exposes the primary key as `r_partner_bank_key_id`. Both live here so the
 * mapping is defined in one place instead of at every call site.
 */

/** Primary key column returned by the list/detail endpoints. */
export const PARTNER_BANK_ID_FIELD = "r_partner_bank_key_id";

/** Column holding the branch/vendor code (API name: `kode_cabang`). */
export const PARTNER_BANK_CODE_FIELD = "kode_vendor";

/**
 * Map a partner bank row from the API into the form/request field names.
 *
 * @param {Object} row - A row from the list or detail endpoint
 * @returns {Object} { kode_cabang, bank_key, bank_account, part_bank_key, reference_details, account_holder }
 */
export const toPartnerBankFormValues = (row) => ({
  kode_cabang: row?.[PARTNER_BANK_CODE_FIELD] ?? "",
  bank_key: row?.bank_key ?? "",
  bank_account: row?.bank_account ?? "",
  part_bank_key: row?.part_bank_key ?? "",
  reference_details: row?.reference_details ?? "",
  account_holder: row?.account_holder ?? "",
});
