import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home, Car, Gavel, Clock, CreditCard, User,
  LayoutDashboard, Bell, LogOut, Menu, X, ChevronDown, Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAuction } from '../context/AuctionContext';
import { formatRupiah } from '../lib/mockData';

const NAV_LINKS = [
  { icon: Home,  label: 'Beranda',      path: '/' },
  { icon: Car,   label: 'Katalog',      path: '/catalog' },
  { icon: Gavel, label: 'Lelang Aktif', path: '/auctions' },
];

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const { getUserNotifications, markNotificationRead } = useAuction();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [showNotif,  setShowNotif]  = useState(false);
  const [showUser,   setShowUser]   = useState(false);

  const notifRef = useRef(null);
  const userRef  = useRef(null);

  const notifs = currentUser ? getUserNotifications(currentUser.id) : [];
  const unread = notifs.filter(n => !n.is_read).length;

  /* close dropdowns on outside click */
  useEffect(() => {
    const h = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false);
      if (userRef.current  && !userRef.current.contains(e.target))  setShowUser(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  /* close mobile menu on route change */
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const isActive = (p) => location.pathname === p || (p !== '/' && location.pathname.startsWith(p));
  const go = (p) => { navigate(p); setMobileOpen(false); };

  const markAll = () => notifs.forEach(n => !n.is_read && markNotificationRead(n.id));

  return (
    <>
      <header className="navbar">
        <div className="navbar-inner">

          {/* ── Logo ── */}
          <div className="navbar-logo" onClick={() => go('/')}>
            <div className="navbar-logo-icon">🚗</div>
            <span className="navbar-logo-text">CarVentory</span>
          </div>

          {/* ── Desktop nav links ── */}
          <nav className="navbar-links">
            {NAV_LINKS.map(({ icon: Icon, label, path }) => (
              <button
                key={path}
                className={`navbar-link ${isActive(path) ? 'active' : ''}`}
                onClick={() => go(path)}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
            {currentUser && (
              <>
                <button className={`navbar-link ${isActive('/history') ? 'active' : ''}`} onClick={() => go('/history')}>
                  <Clock size={15} /> Riwayat
                </button>
                {currentUser.role === 'admin' && (
                  <button className={`navbar-link ${isActive('/admin') ? 'active' : ''}`} onClick={() => go('/admin')}>
                    <LayoutDashboard size={15} /> Admin
                  </button>
                )}
              </>
            )}
          </nav>

          {/* ── Right actions ── */}
          <div className="navbar-actions">

            {currentUser ? (
              <>
                {/* Balance pill */}
                <div className="navbar-balance" onClick={() => go('/topup')}>
                  <CreditCard size={13} />
                  <span>{formatRupiah(currentUser.deposit_balance)}</span>
                </div>

                {/* Notification bell */}
                <div ref={notifRef} style={{ position: 'relative' }}>
                  <button
                    className={`navbar-icon-btn ${showNotif ? 'active' : ''}`}
                    onClick={() => { setShowNotif(v => !v); setShowUser(false); }}
                    aria-label="Notifikasi"
                  >
                    <Bell size={18} />
                    {unread > 0 && <span className="notif-dot">{unread}</span>}
                  </button>

                  {showNotif && (
                    <div className="nb-dropdown nb-notif animate-fade">
                      <div className="nb-dropdown-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Bell size={14} style={{ color: 'var(--orange)' }} />
                          <span style={{ fontWeight: 700 }}>Notifikasi</span>
                          {unread > 0 && <span className="badge badge-orange">{unread} baru</span>}
                        </div>
                        {unread > 0 && (
                          <button className="nb-text-btn" onClick={markAll}>Tandai Semua Dibaca</button>
                        )}
                      </div>
                      <div className="nb-dropdown-body">
                        {notifs.length === 0 ? (
                          <div className="nb-empty">
                            <div style={{ fontSize: 32 }}>🔔</div>
                            <p>Tidak ada notifikasi</p>
                          </div>
                        ) : notifs.slice(0, 8).map(n => (
                          <div
                            key={n.id}
                            className={`nb-notif-item ${!n.is_read ? 'unread' : ''}`}
                            onClick={() => markNotificationRead(n.id)}
                          >
                            <div className="nb-notif-icon">
                              {n.title.includes('Menang') ? '🏆' : n.title.includes('Terlampaui') ? '⚡' : '🔔'}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div className="nb-notif-title">{n.title}</div>
                              <div className="nb-notif-msg">{n.message}</div>
                              <div className="nb-notif-time">
                                {new Date(n.created_at).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                            {!n.is_read && <div className="nb-unread-dot" />}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* User avatar dropdown */}
                <div ref={userRef} style={{ position: 'relative' }}>
                  <button
                    className={`navbar-avatar-btn ${showUser ? 'active' : ''}`}
                    onClick={() => { setShowUser(v => !v); setShowNotif(false); }}
                  >
                    <div className="navbar-avatar">{currentUser.name[0]}</div>
                    <span className="navbar-username">{currentUser.name.split(' ')[0]}</span>
                    <ChevronDown size={14} style={{ opacity: 0.6, transition: 'transform 0.2s', transform: showUser ? 'rotate(180deg)' : '' }} />
                  </button>

                  {showUser && (
                    <div className="nb-dropdown nb-user animate-fade">
                      <div className="nb-user-header">
                        <div className="nb-user-avatar">{currentUser.name[0]}</div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 14 }}>{currentUser.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--text3)' }}>{currentUser.email}</div>
                          {currentUser.is_verified
                            ? <span className="badge badge-success" style={{ fontSize: 10, marginTop: 4, display: 'inline-flex' }}>✓ Terverifikasi</span>
                            : <span className="badge badge-warning" style={{ fontSize: 10, marginTop: 4, display: 'inline-flex' }}>Belum Verifikasi</span>}
                        </div>
                      </div>
                      {[
                        { icon: User,          label: 'Profil Saya',  path: '/profile' },
                        { icon: CreditCard,    label: 'Top Up Saldo', path: '/topup' },
                        { icon: Clock,         label: 'Riwayat Bid',  path: '/history' },
                      ].map(({ icon: Icon, label, path }) => (
                        <button key={path} className="nb-user-item" onClick={() => { go(path); setShowUser(false); }}>
                          <Icon size={15} style={{ color: 'var(--text3)' }} />
                          {label}
                        </button>
                      ))}
                      {currentUser.role === 'admin' && (
                        <button className="nb-user-item" onClick={() => { go('/admin'); setShowUser(false); }}>
                          <LayoutDashboard size={15} style={{ color: 'var(--orange)' }} />
                          Dashboard Admin
                        </button>
                      )}
                      <div style={{ borderTop: '1px solid var(--border)', margin: '4px 0' }} />
                      <button className="nb-user-item danger" onClick={() => { logout(); setShowUser(false); navigate('/'); }}>
                        <LogOut size={15} />
                        Keluar
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="navbar-auth">
                <button className="btn btn-ghost btn-sm" onClick={() => go('/login')}>Masuk</button>
                <button className="btn btn-primary btn-sm" onClick={() => go('/register')}>
                  <Zap size={13} /> Daftar
                </button>
              </div>
            )}

            {/* Hamburger */}
            <button className="navbar-hamburger" onClick={() => setMobileOpen(v => !v)} aria-label="Menu">
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* ── Mobile drawer ── */}
        {mobileOpen && (
          <div className="mobile-drawer animate-fade">
            {NAV_LINKS.map(({ icon: Icon, label, path }) => (
              <button key={path} className={`mobile-nav-item ${isActive(path) ? 'active' : ''}`} onClick={() => go(path)}>
                <Icon size={16} /> {label}
              </button>
            ))}
            {currentUser && (
              <>
                <div className="mobile-divider" />
                <button className="mobile-nav-item" onClick={() => go('/history')}><Clock size={16} /> Riwayat Bid</button>
                <button className="mobile-nav-item" onClick={() => go('/topup')}><CreditCard size={16} /> Top Up</button>
                <button className="mobile-nav-item" onClick={() => go('/profile')}><User size={16} /> Profil</button>
                {currentUser.role === 'admin' && (
                  <button className="mobile-nav-item" onClick={() => go('/admin')}><LayoutDashboard size={16} /> Admin</button>
                )}
                <div className="mobile-divider" />
                <div style={{ padding: '10px 16px', fontSize: 13, color: 'var(--text3)' }}>
                  Saldo: <strong style={{ color: 'var(--success)' }}>{formatRupiah(currentUser.deposit_balance)}</strong>
                </div>
                <button className="mobile-nav-item danger" onClick={() => { logout(); navigate('/'); setMobileOpen(false); }}>
                  <LogOut size={16} /> Keluar
                </button>
              </>
            )}
            {!currentUser && (
              <>
                <div className="mobile-divider" />
                <div style={{ padding: '12px 16px', display: 'flex', gap: 10 }}>
                  <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => go('/login')}>Masuk</button>
                  <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => go('/register')}>Daftar</button>
                </div>
              </>
            )}
          </div>
        )}
      </header>
    </>
  );
}
