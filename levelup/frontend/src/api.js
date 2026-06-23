import axios from 'axios';

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
  (err) => {
    const isAuthRoute = err.config?.url?.startsWith('/auth/');
    const isSilent = err.config?._skipToast;
    const status = err.response?.status;

    if ((status === 401 || status === 422) && !isAuthRoute) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.setItem('toast_message', 'Session expired. Please sign in again.');
      window.location.href = '/login';
      return Promise.reject(err);
    }

    if (!isSilent) {
      let errMsg = 'An unexpected error occurred';
      if (err.response?.data) {
        errMsg = err.response.data.description ?? err.response.data.msg ?? err.response.data.error ?? errMsg;
      } else if (err.message) {
        errMsg = err.message;
      }
      
      window.dispatchEvent(
        new CustomEvent('app-toast', {
          detail: { message: errMsg, type: 'error' },
        })
      );
    }

    return Promise.reject(err);
  }
);

export default api;
