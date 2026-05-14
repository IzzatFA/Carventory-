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
      const res = await api.post('/auth/register', { username, email, password, role });
      return { success: true, user: res.data.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Registration failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
  };

  const topUp = async (amount) => {
    if (!currentUser) return { success: false };
    try {
      // Assuming a transaction endpoint exists, but we'll adapt to what backend provides
      const res = await api.post('/transactions/topup', { amount });
      // update local user state or refetch /me
      const meRes = await api.get('/auth/me');
      setCurrentUser(meRes.data.data);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Top up failed' };
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, register, logout, topUp, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
