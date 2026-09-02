/**
 * Document Validation — Frontend allow-list enforcement for FKR uploads.
 *
 * Mirrors the BE `reUploadDocoumentFkr` validation logic so users see the
 * exact same error messages before a network round-trip. Pure functions,
 * no React imports — safe to use in any layer.
 */
import {
  getAllowedExtensionsFor,
  getAllowedMimesFor,
} from "@/config/fkrDocumentTypes";

/**
 * Extract the lowercase, dot-prefixed extension from a filename.
 * Returns empty string when no extension is present.
 */
export function getFileExtension(filename) {
  if (!filename || typeof filename !== "string") return "";
  const idx = filename.lastIndexOf(".");
  return idx < 0 ? "" : filename.slice(idx).toLowerCase();
}

/**
 * Validate a File against the allowlist for a given document type.
 *
 * Returns `{ ok: true }` when valid, otherwise `{ ok: false, message }`
 * with a message that intentionally matches the BE error string so the
 * user experience is consistent regardless of where the file was rejected.
 *
 * Tolerates `application/octet-stream` (mimics BE behavior for cURL/Postman
 * uploads) as long as the extension is in the allowlist.
 *
 * @param {File} file - The candidate file
 * @param {string} type - One of the FKR document-type keys
 * @returns {{ ok: boolean, message?: string }}
 */
export function validateDocumentFile(file, type) {
  if (!file) return { ok: false, message: "File tidak ditemukan." };
  if (!type) return { ok: false, message: "Tipe dokumen wajib dipilih." };

  const ext = getFileExtension(file.name);
  const mime = file.type || "application/octet-stream";

  const allowedExts = getAllowedExtensionsFor(type);
  const allowedMimes = getAllowedMimesFor(type);

  if (!allowedExts.includes(ext)) {
    return {
      ok: false,
      message: `Tipe file salah. Harus ${allowedExts.join(" atau ")}, yang Anda upload ${ext || "(tanpa ekstensi)"}`,
    };
  }

  const validMime = allowedMimes.includes(mime) || mime === "application/octet-stream";
  if (!validMime) {
    return { ok: false, message: "Format file tidak valid atau ekstensi diubah manual." };
  }

  return { ok: true };
}