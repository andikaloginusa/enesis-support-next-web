/**
 * FKR Document Types — Frontend mirror of backend DOC_CONFIG.
 *
 * Single source of truth on the FE for the 8 FKR document types.
 * Each entry mirrors the BE allowlist (allowedExts / allowedMimes) so the FE
 * can validate uploads BEFORE hitting the network — the resulting error
 * messages are identical to what the BE would have returned.
 *
 * If the BE adds/renames a document type, update this file. The shape is
 * intentionally minimal (display label + ext/mime allowlist) — anything
 * storage/folder-specific stays on the BE.
 *
 * @see backend `reUploadDocoumentFkr` action and its DOC_CONFIG constant.
 */
export const FKR_DOCUMENT_TYPES = {
  dok_ba: {
    label: "BA Logistik",
    allowedExts: [".pdf"],
    allowedMimes: ["application/pdf"],
  },
  dok_ba_kembali: {
    label: "BA Pengembalian",
    allowedExts: [".pdf"],
    allowedMimes: ["application/pdf"],
  },
  dok_surat_jalan: {
    label: "Surat Jalan",
    allowedExts: [".pdf"],
    allowedMimes: ["application/pdf"],
  },
  dok_bukti_foto: {
    label: "Bukti Foto",
    allowedExts: [".pdf"],
    allowedMimes: ["application/pdf"],
  },
  dok_nrp_dtb: {
    label: "NRP DTB",
    allowedExts: [".pdf"],
    allowedMimes: ["application/pdf"],
  },
  dok_cn: {
    label: "CN (Credit Note)",
    allowedExts: [".pdf"],
    allowedMimes: ["application/pdf"],
  },
  dok_iom: {
    label: "File IOM",
    allowedExts: [".pdf"],
    allowedMimes: ["application/pdf"],
  },
  dok_do: {
    label: "List DO (Excel)",
    allowedExts: [".xls", ".xlsx"],
    allowedMimes: [
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ],
  },
};

/** Select options derived from the registry — order is fixed for UI stability. */
export const FKR_DOCUMENT_TYPE_OPTIONS = Object.entries(FKR_DOCUMENT_TYPES).map(
  ([value, meta]) => ({ value, label: meta.label })
);

/** Returns the allow-listed file extensions for a document type (lowercase, dot-prefixed). */
export function getAllowedExtensionsFor(type) {
  return FKR_DOCUMENT_TYPES[type]?.allowedExts ?? [];
}

/** Returns the allow-listed MIME types for a document type. */
export function getAllowedMimesFor(type) {
  return FKR_DOCUMENT_TYPES[type]?.allowedMimes ?? [];
}

/** Builds the `accept` attribute string for an `<input type="file">` / Ant `Upload`. */
export function buildAcceptAttrFor(type) {
  return [...getAllowedMimesFor(type), ...getAllowedExtensionsFor(type)].join(",");
}