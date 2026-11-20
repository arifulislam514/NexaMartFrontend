import axios from 'axios';
import {
  API_BASE_URL,
  STORAGE_KEYS,
  AUTH_HEADER_PREFIX,
  API_ENDPOINTS,
} from '../utils/constants';

// Create Axios client instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Flag and queue to handle multiple concurrent 401 requests during token refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * Request Interceptor:
 * Automatically attaches Authorization header with 'JWT <token>' prefix
 * as specified in API_DOCUMENTATION.md (NOT 'Bearer').
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (token) {
      config.headers.Authorization = `${AUTH_HEADER_PREFIX} ${token}`;
    }

    // Let the browser set Content-Type with boundary if data is FormData
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response Interceptor:
 * Automatically intercepts 401 Unauthorized errors and attempts to refresh the access token.
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if error response exists and is 401
    const isUnauthorized = error.response?.status === 401;

    // Avoid infinite loop if the 401 request was itself the refresh endpoint or login endpoint
    const isAuthEndpoint =
      originalRequest?.url?.includes(API_ENDPOINTS.AUTH.REFRESH) ||
      originalRequest?.url?.includes(API_ENDPOINTS.AUTH.LOGIN);

    if (isUnauthorized && !originalRequest?._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        // If refresh is already in progress, enqueue this request until resolved
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `${AUTH_HEADER_PREFIX} ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

      if (refreshToken) {
        try {
          // Use clean axios call directly so it doesn't trigger apiClient interceptors
          const refreshUrl = `${API_BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`;
          const res = await axios.post(refreshUrl, {
            refresh: refreshToken,
          });

          const newAccessToken = res.data.access;
          localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, newAccessToken);

          // Update header on apiClient defaults and the original failed request
          apiClient.defaults.headers.common.Authorization = `${AUTH_HEADER_PREFIX} ${newAccessToken}`;
          originalRequest.headers.Authorization = `${AUTH_HEADER_PREFIX} ${newAccessToken}`;

          processQueue(null, newAccessToken);
          return apiClient(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);

          // Refresh token expired or invalid -> Clear auth storage
          localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
          localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
          localStorage.removeItem(STORAGE_KEYS.USER);

          // Redirect to login if in a browser window environment
          if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }

          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      } else {
        // No refresh token available -> Clear any stale access token
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
