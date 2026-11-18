import { api } from "./api";

/**
 * Driver Services — data master driver & perubahan transporter driver.
 *
 * Catatan kontrak (dari backend):
 * - `GET support/driver/get` mengembalikan array driver (maksimal 10 baris per
 *   request — backend memakai `SELECT TOP 10`) dan mendukung `searchText`.
 * - `PUT support/driver/update/transporter` mengubah `m_transporter_id` pada
 *   tabel `driver` dan membutuhkan `m_user_id` dari user yang sedang login.
 */
export const DriverServices = (apiInstance) => {
  /**
   * Fetch daftar driver.
   * GET /support/driver/get
   *
   * @param {Object} params - { searchText }
   */
  const getList = (params) => apiInstance.get("support/driver/get", params);

  /**
   * Ubah transporter milik seorang driver.
   * PUT /support/driver/update/transporter
   *
   * @param {Object} data - { m_driver_id, m_transporter_id, m_user_id }
   */
  const updateTransporter = (data) =>
    apiInstance.put("support/driver/update/transporter", data);

  return { getList, updateTransporter };
};

/** Pre-configured singleton instance bound to the standard authorized API client. */
export const driverService = DriverServices(api);
