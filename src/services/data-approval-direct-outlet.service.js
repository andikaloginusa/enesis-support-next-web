import { api } from "./api";

/** Primary key yang ada pada setiap baris approval direct outlet. */
const ROW_ID_FIELD = "data_approval_direct_outlet_id";

/**
 * Jalur pada payload response yang mungkin memuat array baris.
 *
 * Endpoint ini memakai envelope yang berbeda dari modul lain di repo ini:
 * `result` bisa berupa array langsung, atau objek yang membungkus array pada
 * key `data`. Semua jalur dicoba berurutan.
 */
const ROW_PATHS = [
  ["result"],
  ["data", "result"],
  ["result", "data"],
  ["data", "data"],
  ["data", "result", "data"],
];

/** Jalur pada payload response yang mungkin memuat total baris. */
const TOTAL_PATHS = [
  ["meta", "count"],
  ["data", "meta", "count"],
  ["result", "meta", "count"],
  ["result", "data", "meta", "count"],
  ["data", "data", "meta", "count"],
  ["data", "result", "meta", "count"],
];

/**
 * Ambil nilai pada sebuah jalur object.
 *
 * @param {Object} payload - Body response
 * @param {string[]} path - Nama key, diurutkan dari luar ke dalam
 * @returns {*}
 */
const readPath = (payload, path) =>
  path.reduce((value, key) => value?.[key], payload);

/**
 * Cari array pertama pada payload yang isinya baris approval direct outlet
 * (setiap elemennya punya primary key).
 *
 * Dipakai sebagai fallback ketika jalur eksplisit tidak cocok. Kalau tidak ada
 * array yang memuat primary key, array objek pertama yang ditemukan dipakai
 * sebagai cadangan terakhir.
 *
 * @param {*} node
 * @param {number} [depth]
 * @returns {Array|null}
 */
const findRowArray = (node, depth = 0) => {
  if (!node || typeof node !== "object" || depth > 5) return null;

  if (Array.isArray(node)) {
    const [first] = node;
    return first && typeof first === "object" && !Array.isArray(first)
      ? node
      : null;
  }

  for (const value of Object.values(node)) {
    const found = findRowArray(value, depth + 1);
    if (found) return found;
  }

  return null;
};

/**
 * Cari total baris pertama pada payload (objek meta dengan key `count`).
 * Array tidak ditelusuri supaya `count` milik baris data tidak terpakai.
 *
 * @param {*} node
 * @param {number} [depth]
 * @returns {number|null}
 */
const findTotal = (node, depth = 0) => {
  if (!node || typeof node !== "object" || depth > 5) return null;
  if (Array.isArray(node)) return null;
  if (typeof node.count === "number") return node.count;

  for (const value of Object.values(node)) {
    const found = findTotal(value, depth + 1);
    if (found !== null) return found;
  }

  return null;
};

/**
 * Ambil array baris dari response endpoint list.
 *
 * @param {Object} payload - Body response (`response.data`)
 * @returns {Array}
 */
export const extractOutletRows = (payload) => {
  for (const path of ROW_PATHS) {
    const value = readPath(payload, path);
    if (Array.isArray(value)) return value;
  }

  return findRowArray(payload) ?? [];
};

/**
 * Ambil total baris dari response endpoint list.
 *
 * @param {Object} payload - Body response (`response.data`)
 * @returns {number}
 */
export const extractOutletTotal = (payload) => {
  for (const path of TOTAL_PATHS) {
    const value = readPath(payload, path);
    if (typeof value === "number") return value;
  }

  return findTotal(payload) ?? 0;
};

/**
 * Ambil objek detail dari response endpoint detail.
 *
 * @param {Object} payload - Body response (`response.data`)
 * @returns {Object|null}
 */
export const extractOutletDetail = (payload) => {
  const paths = [
    ["data", "data"],
    ["data", "result"],
    ["result", "data"],
    ["data"],
    ["result"],
  ];

  const candidates = [];

  for (const path of paths) {
    const value = readPath(payload, path);
    if (value && typeof value === "object" && !Array.isArray(value)) {
      if (ROW_ID_FIELD in value) return value;
      candidates.push(value);
    }
  }

  return candidates[0] ?? null;
};

/**
 * Data Approval Direct Outlet Services — Factory pattern matching existing
 * service modules.
 *
 * @param {Object} apiInstance - Lightweight fetch client wrapper
 * @returns {Object} Exposed service methods
 */
export const DataApprovalDirectOutletServices = (apiInstance) => {
  /**
   * Fetch a paginated direct outlet approval list.
   * GET /support/data-approval-direct-outlet/get/list?page=&limit=&search=
   *
   * @param {Object} params - { page, limit, search }
   */
  const getList = (params) =>
    apiInstance.get("support/data-approval-direct-outlet/get/list", params);

  /**
   * Fetch a single direct outlet approval record.
   * GET /support/data-approval-direct-outlet/get/detail?data_approval_direct_outlet_id=
   *
   * @param {string} id - data_approval_direct_outlet_id (UUID)
   */
  const getDetail = (id) =>
    apiInstance.get("support/data-approval-direct-outlet/get/detail", {
      data_approval_direct_outlet_id: id,
    });

  /**
   * Update the NIK KAM of a direct outlet approval record.
   * PUT /support/data-approval-direct-outlet/update/nik-kam
   *
   * @param {Object} data - { data_approval_direct_outlet_id, nik_kam }
   */
  const updateNikKam = (data) =>
    apiInstance.put("support/data-approval-direct-outlet/update/nik-kam", data);

  return {
    getList,
    getDetail,
    updateNikKam,
  };
};

/** Pre-configured singleton instance bound to the standard authorized API client. */
export const dataApprovalDirectOutletService =
  DataApprovalDirectOutletServices(api);
