import React, { createContext, useContext, useState } from 'react';
import { mockUsers } from '../lib/mockData';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState(mockUsers);

  const login = (email, password) => {
    // Demo: find user by email, ignore password hashing for mock
    const user = users.find((u) => u.email === email);
    if (!user) return { success: false, error: 'Email tidak ditemukan.' };
    if (user.is_suspended) return { success: false, error: 'Akun Anda telah ditangguhkan.' };
    setCurrentUser(user);
    return { success: true, user };
  };

  const register = (name, email, password, phone) => {
    const exists = users.find((u) => u.email === email);
    if (exists) return { success: false, error: 'Email sudah terdaftar.' };
    const newUser = {
      id: `usr-${Date.now()}`,
      name,
      email,
      password_hash: 'hashed_' + password,
      phone,
      role: 'user',
      is_verified: false,
      is_suspended: false,
      deposit_balance: 0,
      created_at: new Date().toISOString(),
    };
    setUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    return { success: true, user: newUser };
  };

  const logout = () => setCurrentUser(null);

  const updateUser = (updatedUser) => {
    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    if (currentUser?.id === updatedUser.id) setCurrentUser(updatedUser);
  };

  const topUp = (amount) => {
    if (!currentUser) return { success: false };
    const updated = { ...currentUser, deposit_balance: currentUser.deposit_balance + amount };
    updateUser(updated);
    return { success: true };
  };

  return (
    <AuthContext.Provider value={{ currentUser, users, login, register, logout, updateUser, topUp }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
