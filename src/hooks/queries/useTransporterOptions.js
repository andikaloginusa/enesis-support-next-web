import { useQuery } from "@tanstack/react-query";
import { transporterService } from "@services/transporter.service";
import { queryKeys } from "@/lib/queryKeys";
import { assertApiSuccess } from "@/utils/errorHelpers";
import { NOTIF_MESSAGES } from "@/utils/constants";
import { useDebounce } from "@/hooks/useDebounce";

/**
 * useTransporterOptions — daftar transporter sebagai opsi input "Kode Transporter".
 *
 * Data master transporter jarang berubah, sehingga cache dibuat panjang:
 * - `staleTime` 30 menit → pindah halaman tidak memicu request ulang
 * - `gcTime` 60 menit → data tetap tersedia di cache walau sempat tidak dipakai
 *
 * @param {Object}   [options]
 * @param {string}   [options.searchText] - Pencarian `nama` atau `kode` transporter
 * @param {number}   [options.pageSize]  - Jumlah opsi per request (default 20)
 * @param {boolean}  [options.enabled]    - Aktif/nonaktifkan query
 */
export const useTransporterOptions = ({
  searchText = "",
  pageSize = 20,
  enabled = true,
} = {}) => {
  // Debounce di dalam hook supaya semua pemakai mendapat perilaku yang sama.
  const debouncedSearch = useDebounce(searchText, 300);
  const cleanSearch = debouncedSearch?.trim() || "";
  const params = {
    currentPage: 1,
    pageSize,
    ...(cleanSearch ? { searchText: cleanSearch } : {}),
  };

  const { data, isFetching, error } = useQuery({
    queryKey: queryKeys.transporter.list(params),
    queryFn: async () => {
      const response = await transporterService.getList(params);

      assertApiSuccess(response, NOTIF_MESSAGES.FETCH_TRANSPORTER_ERROR);

      // Envelope Sails bisa menaruh array di `result`, `results`, atau `data`.
      const payload = response.data;
      const candidate =
        payload?.result ?? payload?.results ?? payload?.data;
      const rows = Array.isArray(candidate)
        ? candidate
        : Array.isArray(candidate?.data)
          ? candidate.data
          : [];

      return rows;
    },
    enabled,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    placeholderData: (prev) => prev,
  });

  return {
    options: data ?? [],
    isFetching,
    error,
  };
};
