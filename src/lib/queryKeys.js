/**
 * Query Key Factory
 *
 * Centralized, structured factory for all TanStack React Query cache keys.
 * Using a factory prevents scattered hardcoded string arrays and ensures
 * consistent, hierarchical cache invalidation (e.g., invalidate all FKR
 * queries by using `queryKeys.fkr.all()`).
 *
 * Pattern: Factory Method — each domain returns a structured key hierarchy.
 *
 * Usage:
 *   queryKey: queryKeys.fkr.list(params)
 *   queryClient.invalidateQueries({ queryKey: queryKeys.fkr.all() })
 *   queryClient.invalidateQueries({ queryKey: queryKeys.fkr.detail(fkrId) })
 */

export const queryKeys = {
  // ─────────────────────────────────────────────
  // FKR (Formulir Klaim Ritel)
  // ─────────────────────────────────────────────
  fkr: {
    /** Matches ALL fkr queries — use for broad invalidation */
    all: () => ["fkr"],
    /** Matches the fkr list with specific pagination/search params */
    list: (params) => ["fkr", "list", params],
    /** Matches a single fkr detail by ID */
    detail: (id) => ["fkr", "detail", id],
  },

  // ─────────────────────────────────────────────
  // Klaim (Proposal Klaim)
  // ─────────────────────────────────────────────
  klaim: {
    /** Matches ALL klaim queries */
    all: () => ["klaim"],
    /** Matches the klaim list with specific params */
    list: (params) => ["klaim", "list", params],
    /** Matches a single klaim detail by ID */
    detail: (id) => ["klaim", "detail", id],
    /** Matches klaim document reupload result */
    reupload: () => ["klaim", "reupload"],
  },

  // ─────────────────────────────────────────────
  // Klaim Internasional (eprop_internasional_klaim)
  // ─────────────────────────────────────────────
  klaimInternasional: {
    /** Matches ALL klaim internasional queries */
    all: () => ["klaim-internasional"],
    /** Matches the klaim internasional list with specific params */
    list: (params) => ["klaim-internasional", "list", params],
    /** Matches a single klaim internasional detail by ID */
    detail: (id) => ["klaim-internasional", "detail", id],
  },

  // ─────────────────────────────────────────────
  // Proposal
  // ─────────────────────────────────────────────
  proposal: {
    /** Matches ALL proposal queries */
    all: () => ["proposal"],
    /** Matches the proposal list with specific params */
    list: (params) => ["proposal", "list", params],
    /** Matches a single proposal detail by ID */
    detail: (id) => ["proposal", "detail", id],
    /** Fixed key for approval candidates list (API returns all without jabatan filter) */
    candidates: () => ["proposal", "candidates"],
    /** Matches the SAP mass upload result */
    sapMassUpload: () => ["proposal", "sap-mass-upload"],
  },

  // ─────────────────────────────────────────────
  // Proposal From SAP (proposal_from_sap)
  // ─────────────────────────────────────────────
  proposalFromSap: {
    /** Matches ALL proposal-from-sap queries */
    all: () => ["proposal-from-sap"],
    /** Matches the proposal_from_sap list with pagination/search/filter params */
    list: (params) => ["proposal-from-sap", "list", params],
    /** Matches the budget summary of a single kode e-prop SAP */
    budget: (kodeEpropSap) => ["proposal-from-sap", "budget", kodeEpropSap],
  },

  // ─────────────────────────────────────────────
  // Delivery Order (DO)
  // ─────────────────────────────────────────────
  deliveryOrder: {
    /** Matches ALL delivery order queries */
    all: () => ["delivery-order"],
    /** Matches the delivery order list with pagination/search params */
    list: (params) => ["delivery-order", "list", params],
    /** Matches a single delivery order detail by ID */
    detail: (id) => ["delivery-order", "detail", id],
    /** Matches the bundle-ready-to-invoice list for a given transporter */
    bundleReady: (params) => ["delivery-order", "bundle-ready", params],
  },

  // ─────────────────────────────────────────────
  // Transporter (master)
  // ─────────────────────────────────────────────
  transporter: {
    /** Matches ALL transporter queries */
    all: () => ["transporter"],
    /** Matches the transporter list with pagination/search params */
    list: (params) => ["transporter", "list", params],
  },

  // ─────────────────────────────────────────────
  // Driver (master)
  // ─────────────────────────────────────────────
  driver: {
    /** Matches ALL driver queries */
    all: () => ["driver"],
    /** Matches the driver list with search params */
    list: (params) => ["driver", "list", params],
  },

  // ─────────────────────────────────────────────
  // Submit Faktur (Support)
  // ─────────────────────────────────────────────
  submitFaktur: {
    /** Matches ALL submit faktur queries */
    all: () => ["submit-faktur"],
    /** Matches the submit faktur list with pagination/search/filter params */
    list: (params) => ["submit-faktur", "list", params],
    /** Matches a single submit faktur detail by id */
    detail: (id) => ["submit-faktur", "detail", id],
  },

  // ─────────────────────────────────────────────
  // Data Approval Direct Outlet (Support)
  // ─────────────────────────────────────────────
  dataApprovalDirectOutlet: {
    /** Matches ALL data approval direct outlet queries */
    all: () => ["data-approval-direct-outlet"],
    /** Matches the direct outlet list with pagination/search params */
    list: (params) => ["data-approval-direct-outlet", "list", params],
    /** Matches a single direct outlet detail by ID */
    detail: (id) => ["data-approval-direct-outlet", "detail", id],
  },

  // ─────────────────────────────────────────────
  // User Profile
  // ─────────────────────────────────────────────
  user: {
    /** Matches ALL user queries */
    all: () => ["user"],
    /** Matches a single user profile by user ID */
    profile: (userId) => ["user", "profile", userId],
  },

  // ─────────────────────────────────────────────
  // CMO (Customer Monthly Order)
  // ─────────────────────────────────────────────
  cmo: {
    /** Matches ALL cmo queries */
    all: () => ["cmo"],
    /** Matches the SAP-waiting CMO list with specific params */
    sapWaitingList: (params) => ["cmo", "sap-waiting-list", params],
  },

  // ─────────────────────────────────────────────
  // Partner Bank (r_partner_bank_key)
  // ─────────────────────────────────────────────
  partnerBank: {
    /** Matches ALL partner bank queries */
    all: () => ["partner-bank"],
    /** Matches the partner bank list with specific params */
    list: (params) => ["partner-bank", "list", params],
    /** Matches a single partner bank detail by ID */
    detail: (id) => ["partner-bank", "detail", id],
  },

  // ─────────────────────────────────────────────
  // Budget (Reversal Budget & Add/Move Budget)
  // ─────────────────────────────────────────────
  budget: {
    /** Matches ALL budget queries */
    all: () => ["budget"],
    /** Matches reversal headers list with pagination/search params */
    reversalHeaders: (params) => ["budget", "reversal-headers", params],
    /** Matches single reversal header detail by id */
    reversalHeaderDetail: (id) => ["budget", "reversal-header", id],
    /** Matches reversal success list by kodeProses and pagination */
    reversalSuccess: (params) => ["budget", "reversal-success", params],
    /** Matches reversal reject list by kodeProses and pagination */
    reversalReject: (params) => ["budget", "reversal-reject", params],
    /** Matches budget list with pagination and search filters */
    budgetList: (params) => ["budget", "budget-list", params],
  },
};
