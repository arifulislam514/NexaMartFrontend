import apiClient from './apiClient';

/**
 * Admin Service
 * Specialized API calls for NexaMart Marketplace Administrators.
 * Strictly adheres to backend endpoints and permissions.
 */
export const adminService = {
  /**
   * Get paginated and filtered list of sellers/vendors
   * @param {Object} [params] - { status: 'pending'|'approved'|'suspended', search: string, page: number }
   */
  getSellers: async (params = {}) => {
    const response = await apiClient.get('/admin/sellers/', { params });
    return response.data;
  },

  /**
   * Get single seller detail by ID
   * @param {string|number} id
   */
  getSeller: async (id) => {
    const response = await apiClient.get(`/admin/sellers/${id}/`);
    return response.data;
  },

  /**
   * Approve a pending seller application
   * @param {string|number} id
   */
  approveSeller: async (id) => {
    const response = await apiClient.post(`/admin/sellers/${id}/approve/`);
    return response.data;
  },

  /**
   * Suspend an active seller
   * @param {string|number} id
   */
  suspendSeller: async (id) => {
    const response = await apiClient.post(`/admin/sellers/${id}/suspend/`);
    return response.data;
  },

  /**
   * Update seller profile or commission rate
   * @param {string|number} id
   * @param {Object} data - e.g. { commission_rate: 12.50, status: 'approved' }
   */
  updateSeller: async (id, data) => {
    const response = await apiClient.patch(`/admin/sellers/${id}/`, data);
    return response.data;
  },

  /**
   * Delete or deregister a seller
   * @param {string|number} id
   */
  deleteSeller: async (id) => {
    const response = await apiClient.delete(`/admin/sellers/${id}/`);
    return response.data;
  },
};

export default adminService;
