import { api } from "./api";

/**
 * Higher-order factory function to instantiate User Profile Services.
 * Allows custom API client injection for testing or isolation.
 * Consistent with the Factory Pattern used across all service modules.
 *
 * @param {Object} apiInstance - Lightweight fetch client wrapper
 * @returns {Object} Exposed service methods
 */
export const UserProfileServices = (apiInstance) => {
  /**
   * Fetch a user's profile data by user ID.
   * @param {string} userId - The user's unique identifier (m_user_id)
   */
  const getUserProfile = (userId) => apiInstance.get(`user/profile/${userId}`);

  /**
   * Update a user's profile fields.
   * @param {string} userId - The user's unique identifier (m_user_id)
   * @param {Object} data - Fields to update (e.g., { name, email, bio, role })
   */
  const updateUserProfile = (userId, data) =>
    apiInstance.put(`user/profile/${userId}`, data);

  return {
    getUserProfile,
    updateUserProfile,
  };
};

/**
 * Pre-configured singleton instance of User Profile Services
 * bound to the standard authorized API client.
 */
export const userService = UserProfileServices(api);
