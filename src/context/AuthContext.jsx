import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMe = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setCurrentUser(res.data.data);
        } catch (err) {
          console.error('Failed to fetch user', err);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };
    fetchMe();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const { user, token } = res.data.data;
      localStorage.setItem('token', token);
      setCurrentUser(user);
      return { success: true, user };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Login failed' };
    }
  };

  const register = async (username, email, password, role = 'user') => {
    try {
      // Buat akun
      await api.post('/auth/register', { username, email, password, role });
      // Auto-login setelah register berhasil agar sidebar langsung tampilkan nama user
      const loginResult = await login(email, password);
      if (loginResult.success) {
        return { success: true, user: loginResult.user };
      }
      // Login gagal tapi register berhasil — arahkan ke halaman login
      return { success: false, error: 'Akun berhasil dibuat, silakan login.' };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Registrasi gagal' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
  };

  const refreshUser = async () => {
    try {
      const meRes = await api.get('/auth/me');
      setCurrentUser(meRes.data.data);
    } catch (err) {
      console.error('Failed to refresh user', err);
    }
  };

  const topUp = async (amount) => {
    if (!currentUser) return { success: false };
    try {
      const res = await api.post('/transactions/topup', { amount });
      await refreshUser();
      return { success: true, data: res.data.data };
    } catch (err) {
      const response = err.response?.data;
      return {
        success: false,
        error: response?.errors?.[0]?.message || response?.message || 'Top up failed',
      };
    }
  };

  const buyNow = async (carId) => {
    if (!currentUser) return { success: false, error: 'Silakan login terlebih dahulu' };
    try {
      const res = await api.post('/transactions/buy-now', { car_id: carId });
      await refreshUser();
      return { success: true, data: res.data.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Gagal melakukan pembelian' };
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, register, logout, topUp, buyNow, refreshUser, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
