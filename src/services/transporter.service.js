import { api } from "./api";

/**
 * Transporter Services — daftar transporter (kode + nama).
 *
 * Dipakai sebagai sumber opsi pada input "Kode Transporter" di halaman
 * Bundle Ready Invoice. Kode pada `m_transporter` sama dengan username user
 * ber-role TRANSPORTER, jadi nilainya bisa langsung dipakai sebagai
 * `kode_transporter` pada endpoint bundle ready.
 */
export const TransporterServices = (apiInstance) => {
  /**
   * Fetch daftar transporter.
   * GET /support/transporter
   *
   * `searchText` mencocokkan `nama` ATAU `kode` transporter.
   *
   * @param {Object} params - { currentPage, pageSize, searchText }
   */
  const getList = (params) => apiInstance.get("support/transporter", params);

  return { getList };
};

/** Pre-configured singleton instance bound to the standard authorized API client. */
export const transporterService = TransporterServices(api);
