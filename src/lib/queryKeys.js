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
};
