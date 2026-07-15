import axios from 'axios';
import { triggerToast } from './context/ToastContext.jsx';

const api = axios.create({
  baseURL: 'http://127.0.0.1:5000/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;
    const isAuthRoute = originalRequest?.url?.startsWith('/auth/');
    const isSilent = originalRequest?._skipToast;
    const status = err.response?.status;

    if ((status === 401 || status === 422) && !isAuthRoute && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          // Request a new access token using the refresh token as Bearer authorization.
          // Note we bypass the normal request interceptor which adds the regular token.
          const { data } = await axios.post(
            'http://127.0.0.1:5000/api/v1/auth/refresh',
            {},
            {
              headers: { Authorization: `Bearer ${refreshToken}` },
            }
          );
          
          localStorage.setItem('token', data.access_token);
          localStorage.setItem('access_token', data.access_token);
          originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
          return api(originalRequest);
        } catch (refreshErr) {
          // If refresh request fails, log out the user
          localStorage.removeItem('token');
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          sessionStorage.setItem('toast_message', 'Session expired. Please sign in again.');
          window.location.href = '/login';
          return Promise.reject(refreshErr);
        }
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        sessionStorage.setItem('toast_message', 'Session expired. Please sign in again.');
        window.location.href = '/login';
        return Promise.reject(err);
      }
    }

    if (!isSilent) {
      let errMsg = 'An unexpected error occurred';
      if (err.response?.data) {
        errMsg = err.response.data.description ?? err.response.data.msg ?? err.response.data.error ?? err.response.data.message ?? errMsg;
      } else if (err.message) {
        errMsg = err.message;
      }
      
      triggerToast(errMsg, 'error');
    }

    return Promise.reject(err);
  }
);

export default api;
