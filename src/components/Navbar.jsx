import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  Car,
  Clock,
  CreditCard,
  User,
  LayoutDashboard,
  LogOut,
  Store,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

import './NavBar.css';

const NAV_LINKS = [
  { icon: Home, label: 'Beranda', path: '/' },
  { icon: Car, label: 'Katalog', path: '/catalog' },
];

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) =>
    location.pathname === path || (path !== '/' && location.pathname.startsWith(path));

  const go = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const displayName = currentUser?.username || currentUser?.name || 'User';
  const roleLabel = currentUser?.role === 'seller'
    ? 'Penjual'
    : currentUser?.role === 'admin'
      ? 'Admin'
      : 'Pengguna';

  return (
    <aside className="navbar-sidebar">
      <div className="navbar-sidebar-inner">
        {/* Logo */}
        <button className="sidebar-logo" onClick={() => go('/')}>
          <img className="sidebar-logo-image" src="/Logo.svg" alt="Carventory" />
        </button>

        {/* User / Auth */}
        <div className="sidebar-user-section">
          {currentUser ? (
            <button className="sidebar-user-btn" onClick={() => go('/profile')}>
              <div className="sidebar-avatar">
                {displayName[0] || 'U'}
              </div>
              <div className="sidebar-user-text">
                <span>{displayName.split(' ')[0]}</span>
                <small>{roleLabel}</small>
              </div>
            </button>
          ) : (
            <button className="sidebar-user-btn" onClick={() => go('/login')}>
              <User className="sidebar-user-icon" size={34} />
              <div className="sidebar-user-text">
                <span>Login/</span>
                <span>Register</span>
              </div>
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {NAV_LINKS.map(({ icon: Icon, label, path }) => (
            <button
              key={path}
              className={`sidebar-nav-item ${isActive(path) ? 'active' : ''}`}
              onClick={() => go(path)}
            >
              <Icon size={31} strokeWidth={2.4} />
              <span>{label}</span>
            </button>
          ))}

          {currentUser && (
            <>
              <button
                className={`sidebar-nav-item ${isActive('/topup') ? 'active' : ''}`}
                onClick={() => go('/topup')}
              >
                <CreditCard size={31} strokeWidth={2.4} />
                <span>Top Up</span>
              </button>

              <button
                className={`sidebar-nav-item ${isActive('/history') ? 'active' : ''}`}
                onClick={() => go('/history')}
              >
                <Clock size={31} strokeWidth={2.4} />
                <span>Riwayat</span>
              </button>

              {currentUser.role === 'admin' && (
                <button
                  className={`sidebar-nav-item ${isActive('/admin') ? 'active' : ''}`}
                  onClick={() => go('/admin')}
                >
                  <LayoutDashboard size={31} strokeWidth={2.4} />
                  <span>Admin</span>
                </button>
              )}

              {(currentUser.role === 'seller' || currentUser.role === 'admin') && (
                <button
                  className={`sidebar-nav-item ${isActive('/seller') ? 'active' : ''}`}
                  onClick={() => go('/seller')}
                >
                  <Store size={31} strokeWidth={2.4} />
                  <span>Penjual</span>
                </button>
              )}
            </>
          )}

          {!currentUser && (
            <>
              <button
                className={`sidebar-nav-item ${isActive('/topup') ? 'active' : ''}`}
                onClick={() => go('/topup')}
              >
                <CreditCard size={31} strokeWidth={2.4} />
                <span>Top Up</span>
              </button>

              <button
                className={`sidebar-nav-item ${isActive('/history') ? 'active' : ''}`}
                onClick={() => go('/history')}
              >
                <Clock size={31} strokeWidth={2.4} />
                <span>Riwayat</span>
              </button>
            </>
          )}
        </nav>

        {/* Bottom logout kalau sudah login */}
        {currentUser && (
          <div className="sidebar-bottom">
            <button className="sidebar-nav-item sidebar-logout" onClick={handleLogout}>
              <LogOut size={28} strokeWidth={2.4} />
              <span>Keluar</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
