import axios from 'axios';

// All requests go to /api (proxied to the backend). The JWT is attached automatically.
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // only the login token, never app data
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Turns any axios error into a simple message string.
export const errorMessage = (err) => err.response?.data?.message || 'Cannot reach the server. Is the backend running?';

export default api;
