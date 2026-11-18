/**
 * Bundle Ready — Local Response Cache
 *
 * Mempertahankan hasil terakhir endpoint bundle ready invoice di localStorage
 * supaya halaman bisa langsung menampilkan data (tanpa menunggu scan SAP yang
 * bisa memakan waktu hingga 60 detik) ketika pengguna membuka ulang halaman
 * atau melakukan hard refresh.
 *
 * Cache bersifat pelengkap: data yang tampil dari cache selalu diberi penanda
 * waktu pemeriksaan terakhir agar pengguna tidak salah mengira data sudah mutakhir.
 */

const STORAGE_KEY = "bundle_ready_cache_v1";
const LAST_TRANSPORTER_KEY = "bundle_ready_last_transporter";

/** Batas ukuran payload yang ditulis ke localStorage (≈2MB). */
const MAX_PAYLOAD_BYTES = 2 * 1024 * 1024;

/** Jumlah kombinasi (transporter + pencarian) yang disimpan. */
const MAX_CACHED_KEYS = 10;

const isBrowser = () => typeof window !== "undefined";

/**
 * Susun key cache dari kombinasi transporter + pencarian server.
 * @param {string} kodeTransporter
 * @param {string} searchText
 * @returns {string}
 */
export const buildBundleReadyCacheKey = (kodeTransporter, searchText = "") =>
  [
    String(kodeTransporter ?? "").trim().toUpperCase(),
    String(searchText ?? "").trim(),
  ].join("|");

/**
 * Baca hasil tersimpan untuk key tertentu.
 * @param {string} key
 * @returns {Object|null} { rows, message, total, savedAt } atau null
 */
export const readBundleReadyCache = (key) => {
  if (!isBrowser() || !key) return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const store = JSON.parse(raw);
    return store?.[key] ?? null;
  } catch {
    return null;
  }
};

/**
 * Simpan hasil terbaru ke cache lokal.
 * Payload yang terlalu besar dilewati agar tidak memblokir localStorage.
 *
 * @param {string} key
 * @param {Object} payload - { rows, message, total }
 */
export const writeBundleReadyCache = (key, payload) => {
  if (!isBrowser() || !key) return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const store = raw ? JSON.parse(raw) : {};

    store[key] = { ...payload, savedAt: Date.now() };

    // Buang key lama bila jumlahnya melebihi batas.
    const keys = Object.keys(store);
    if (keys.length > MAX_CACHED_KEYS) {
      keys
        .sort((a, b) => (store[a]?.savedAt ?? 0) - (store[b]?.savedAt ?? 0))
        .slice(0, keys.length - MAX_CACHED_KEYS)
        .forEach((oldKey) => delete store[oldKey]);
    }

    const serialized = JSON.stringify(store);
    if (serialized.length > MAX_PAYLOAD_BYTES) return;

    localStorage.setItem(STORAGE_KEY, serialized);
  } catch {
    /* cache lokal hanya bonus — kegagalan menulis tidak boleh mengganggu alur */
  }
};

/**
 * @returns {string} kode transporter terakhir yang dipakai pengguna
 */
export const getLastTransporterCode = () => {
  if (!isBrowser()) return "";
  try {
    return localStorage.getItem(LAST_TRANSPORTER_KEY) || "";
  } catch {
    return "";
  }
};

/**
 * @param {string} code - kode transporter
 */
export const setLastTransporterCode = (code) => {
  if (!isBrowser()) return;
  try {
    const value = String(code ?? "").trim();
    if (value) {
      localStorage.setItem(LAST_TRANSPORTER_KEY, value);
    } else {
      localStorage.removeItem(LAST_TRANSPORTER_KEY);
    }
  } catch {
    /* abaikan */
  }
};
