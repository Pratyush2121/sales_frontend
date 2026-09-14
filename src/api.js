import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL,
});

// Attach bearer token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('sitemaster_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('sitemaster_refresh_token');
      if (refreshToken) {
        try {
          const res = await axios.post(`${baseURL}/auth/refresh`, { refreshToken });
          localStorage.setItem('sitemaster_token', res.data.token);
          localStorage.setItem('sitemaster_refresh_token', res.data.refreshToken);
          api.defaults.headers.common.Authorization = `Bearer ${res.data.token}`;
          return api(originalRequest);
        } catch (refreshErr) {
          localStorage.removeItem('sitemaster_token');
          localStorage.removeItem('sitemaster_refresh_token');
          localStorage.removeItem('sitemaster_user');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
