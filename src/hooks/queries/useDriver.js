import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { driverService } from "@services/driver.service";
import { queryKeys } from "@/lib/queryKeys";
import { assertApiSuccess } from "@/utils/errorHelpers";
import { NOTIF_MESSAGES } from "@/utils/constants";
import { useNotify, NOTIF_DURATION_MEDIUM } from "@/utils/notify";
import { getUserId } from "@/utils/storage";

/**
 * useDriver — Data master driver + perubahan transporter driver.
 *
 * Backend `GET support/driver/get` memakai `SELECT TOP 10`, jadi satu request
 * hanya mengembalikan maksimal 10 baris dan tidak mendukung paging.
 * Karena itu:
 * - `searchText` dipakai untuk mempersempit di sisi server (dicocokkan ke
 *   kode / nama / KTP / SIM / HP / transporter).
 * - `limit` dikirim sebagai parameter pagination umum; bila backend mengabaikannya
 *   tidak masalah karena data tetap dipaginasi di sisi klien.
 *
 * @param {Object}   [options]
 * @param {string}   [options.searchText] - Kata kunci pencarian driver
 * @param {boolean}  [options.enabled]    - Aktif/nonaktifkan query
 */
export const useDriver = ({ searchText = "", enabled = true } = {}) => {
  const queryClient = useQueryClient();
  const { notifySuccess, notifyError } = useNotify();

  const cleanSearch = searchText?.trim() || "";
  const params = {
    currentPage: 1,
    pageSize: 50,
    ...(cleanSearch ? { searchText: cleanSearch } : {}),
  };

  // Query: daftar driver
  const {
    data: listData,
    isLoading: isListLoading,
    isFetching: isListFetching,
    refetch: refetchList,
  } = useQuery({
    queryKey: queryKeys.driver.list(params),
    queryFn: async () => {
      const response = await driverService.getList(params);

      assertApiSuccess(response, NOTIF_MESSAGES.FETCH_DRIVER_ERROR);
      return response.data;
    },
    enabled,
    placeholderData: (prev) => prev,
  });

  // Mutation: ubah transporter milik driver
  const updateTransporterMutation = useMutation({
    mutationFn: async ({ m_driver_id, m_transporter_id }) => {
      const response = await driverService.updateTransporter({
        m_driver_id,
        m_transporter_id,
        m_user_id: getUserId(),
      });

      assertApiSuccess(response, NOTIF_MESSAGES.UPDATE_DRIVER_TRANSPORTER_ERROR);
      return response;
    },
    onSuccess: (response) => {
      notifySuccess(
        NOTIF_MESSAGES.UPDATE_DRIVER_TRANSPORTER_SUCCESS,
        response?.data?.message || "Transporter driver berhasil diperbarui.",
        NOTIF_DURATION_MEDIUM,
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.driver.all() });
    },
    onError: (err) => {
      notifyError(
        NOTIF_MESSAGES.UPDATE_DRIVER_TRANSPORTER_ERROR,
        err.message || NOTIF_MESSAGES.UPDATE_DRIVER_TRANSPORTER_ERROR,
        NOTIF_DURATION_MEDIUM,
      );
    },
  });

  // Envelope Sails: array payload → `results`, object payload → `result`.
  const driverList = listData?.results ?? listData?.result ?? [];

  return {
    driverList: Array.isArray(driverList) ? driverList : [],
    isListFetching: isListLoading || isListFetching,
    refetchList,

    updateDriverTransporter: updateTransporterMutation.mutateAsync,
    isUpdatingDriverTransporter: updateTransporterMutation.isPending,
  };
};
