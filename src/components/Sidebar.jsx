import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home, Car, Clock, User, CreditCard, LayoutDashboard,
  Bell, LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAuction } from '../context/AuctionContext';

const NAV_ITEMS = [
  { icon: Home, label: 'Beranda', path: '/', roles: ['all'] },
  { icon: Car, label: 'Katalog Mobil', path: '/catalog', roles: ['all'] },
];

const USER_NAV = [
  { icon: Clock, label: 'Riwayat Bid', path: '/history', roles: ['user', 'admin'] },
  { icon: CreditCard, label: 'Top Up', path: '/topup', roles: ['user', 'admin'] },
  { icon: User, label: 'Profil', path: '/profile', roles: ['user', 'admin'] },
];

const ADMIN_NAV = [
  { icon: LayoutDashboard, label: 'Dashboard Admin', path: '/admin', roles: ['admin'] },
];

export default function Sidebar() {
  const { currentUser, logout } = useAuth();
  const { getUserNotifications, markNotificationRead } = useAuction();
  const navigate = useNavigate();
  const location = useLocation();
  const [showNotif, setShowNotif] = useState(false);
  const notifRef = useRef(null);

  const notifs = currentUser ? getUserNotifications(currentUser.id) : [];
  const unread = notifs.filter(n => !n.is_read).length;

  useEffect(() => {
    const handle = (e) => { if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false); };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  const go = (path) => navigate(path);
  const isActive = (path) => location.pathname === path || (path !== '/' && location.pathname.startsWith(path));

  const formatBalance = (n) => 'Rp ' + (n / 1000000).toFixed(1) + 'jt';

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo" style={{ cursor: 'pointer' }} onClick={() => go('/')}>
        <div className="sidebar-logo-icon">🚗</div>
        <div className="sidebar-logo-text">CarVentory</div>
        <div className="sidebar-logo-sub">Platform Lelang Mobil</div>
      </div>

      {/* Main Nav */}
      <nav className="sidebar-nav">
        <div className="nav-section-title"><span>Menu Utama</span></div>
        {NAV_ITEMS.map(({ icon: Icon, label, path }) => (
          <button key={path} className={`nav-item ${isActive(path) ? 'active' : ''}`} onClick={() => go(path)}>
            <Icon size={18} />
            <span>{label}</span>
          </button>
        ))}

        {currentUser && (
          <>
            <div className="nav-section-title" style={{ marginTop: 8 }}><span>Akun Saya</span></div>
            {USER_NAV.map(({ icon: Icon, label, path }) => (
              <button key={path} className={`nav-item ${isActive(path) ? 'active' : ''}`} onClick={() => go(path)}>
                <Icon size={18} />
                <span>{label}</span>
              </button>
            ))}
          </>
        )}

        {currentUser?.role === 'admin' && (
          <>
            <div className="nav-section-title" style={{ marginTop: 8 }}><span>Administrasi</span></div>
            {ADMIN_NAV.map(({ icon: Icon, label, path }) => (
              <button key={path} className={`nav-item ${isActive(path) ? 'active' : ''}`} onClick={() => go(path)}>
                <Icon size={18} />
                <span>{label}</span>
              </button>
            ))}
          </>
        )}
      </nav>

      {/* Bottom */}
      <div className="sidebar-bottom">
        {currentUser ? (
          <>
            {/* Notification */}
            <div ref={notifRef} style={{ position: 'relative', marginBottom: 8 }}>
              <button
                className={`nav-item ${showNotif ? 'active' : ''}`}
                style={{ width: '100%' }}
                onClick={() => setShowNotif(v => !v)}
              >
                <Bell size={18} />
                <span>Notifikasi</span>
                {unread > 0 && (
                  <span style={{
                    marginLeft: 'auto', background: 'var(--orange)', color: '#fff',
                    fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 10,
                    minWidth: 18, textAlign: 'center',
                  }}>
                    {unread}
                  </span>
                )}
              </button>

              {showNotif && (
                <div
                  className="notif-dropdown animate-fade"
                  style={{
                    /* Muncul ke KANAN sidebar, bukan ke kiri/atas */
                    position: 'fixed',
                    left: 'var(--sidebar-w)',
                    bottom: 16,
                    top: 'auto',
                    right: 'auto',
                    width: 360,
                    maxHeight: '70vh',
                    overflowY: 'auto',
                  }}
                >
                  {/* Header */}
                  <div className="notif-dropdown-header" style={{ position: 'sticky', top: 0, background: 'var(--bg2)', zIndex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Bell size={15} style={{ color: 'var(--orange)' }} />
                      <span style={{ fontWeight: 700, fontSize: 14 }}>Notifikasi</span>
                      {unread > 0 && (
                        <span style={{
                          background: 'var(--orange)', color: '#fff',
                          fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 10,
                        }}>{unread} baru</span>
                      )}
                    </div>
                    {unread > 0 && (
                      <button
                        onClick={() => notifs.forEach(n => !n.is_read && markNotificationRead(n.id))}
                        style={{ fontSize: 11, color: 'var(--orange)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                      >
                        Tandai Semua Dibaca
                      </button>
                    )}
                  </div>

                  {/* Items */}
                  {notifs.length === 0 ? (
                    <div style={{ padding: '32px 20px', textAlign: 'center' }}>
                      <div style={{ fontSize: 36, marginBottom: 8 }}>🔔</div>
                      <div style={{ color: 'var(--text3)', fontSize: 13 }}>Tidak ada notifikasi</div>
                    </div>
                  ) : notifs.slice(0, 8).map(n => (
                    <div
                      key={n.id}
                      className={`notif-item ${!n.is_read ? 'unread' : ''}`}
                      onClick={() => markNotificationRead(n.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                        <div style={{
                          width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                          background: !n.is_read ? 'rgba(249,115,22,0.15)' : 'var(--bg3)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
                        }}>
                          {n.title.includes('Menang') ? '🏆' : n.title.includes('Terlampaui') ? '⚡' : '🔔'}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className="notif-item-title" style={{ color: !n.is_read ? 'var(--text)' : 'var(--text2)' }}>
                            {n.title}
                          </div>
                          <div className="notif-item-msg">{n.message}</div>
                          <div className="notif-item-time">
                            {new Date(n.created_at).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                        {!n.is_read && (
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--orange)', flexShrink: 0, marginTop: 4 }} />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* User card */}
            <div className="user-card" onClick={() => go('/profile')} style={{ cursor: 'pointer' }}>
              <div className="user-avatar">{currentUser.name[0]}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="user-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentUser.name}</div>
                <div className="user-role">{currentUser.role === 'admin' ? '👑 Admin' : '👤 User'}</div>
                <div className="user-balance">{formatBalance(currentUser.deposit_balance)}</div>
              </div>
            </div>
            <button className="nav-item" style={{ color: 'var(--danger)', width: '100%' }} onClick={logout}>
              <LogOut size={18} />
              <span>Keluar</span>
            </button>
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => go('/login')}>Masuk</button>
            <button className="btn btn-outline" style={{ width: '100%' }} onClick={() => go('/register')}>Daftar</button>
          </div>
        )}
      </div>
    </aside>
  );
}
