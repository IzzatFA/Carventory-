import axios from 'axios';

// Konfigurasi base URL dari Backend Express kita
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:6767/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor untuk menyisipkan token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
