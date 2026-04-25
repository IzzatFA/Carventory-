import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Phone, Mail, ShieldCheck, ShieldOff, CreditCard, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAuction } from '../context/AuctionContext';
import { formatRupiah } from '../lib/mockData';

export default function ProfilePage() {
  const { currentUser, logout } = useAuth();
  const { getUserBids, auctions } = useAuction();
  const navigate = useNavigate();

  if (!currentUser) return (
    <div className="page"><div className="empty-state"><div className="empty-state-icon">🔒</div><h3>Login Diperlukan</h3><button className="btn btn-primary" onClick={() => navigate('/login')}>Masuk</button></div></div>
  );

  const myBids = getUserBids(currentUser.id);
  const won = myBids.filter(b => { const a = auctions.find(x=>x.id===b.auction_id); return a?.status==='ended' && a?.winner_id===currentUser.id; }).length;

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Profil Saya</h1>
        <p className="page-sub">Kelola informasi akun Anda</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Profile card */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg,var(--orange),#ef4444)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, fontWeight: 800 }}>
              {currentUser.name[0]}
            </div>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>{currentUser.name}</h2>
              <div style={{ display: 'flex', gap: 8 }}>
                {currentUser.is_verified
                  ? <span className="badge badge-success"><ShieldCheck size={10} /> Terverifikasi</span>
                  : <span className="badge badge-warning"><ShieldOff size={10} /> Belum Verifikasi</span>}
                <span className="badge badge-orange">{currentUser.role === 'admin' ? '👑 Admin' : '👤 User'}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {[
              { icon: Mail, label: 'Email', value: currentUser.email },
              { icon: Phone, label: 'Nomor HP', value: currentUser.phone || '-' },
              { icon: User, label: 'Role', value: currentUser.role === 'admin' ? 'Administrator' : 'Pengguna' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="spec-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text3)' }}>
                  <Icon size={14} />{label}
                </div>
                <span style={{ fontWeight: 600 }}>{value}</span>
              </div>
            ))}
            <div className="spec-row" style={{ borderBottom: 'none' }}>
              <span style={{ color: 'var(--text3)' }}>Bergabung Sejak</span>
              <span style={{ fontWeight: 600 }}>{new Date(currentUser.created_at).toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric' })}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => navigate('/topup')}>
              <CreditCard size={16} /> Top Up
            </button>
            <button className="btn btn-danger btn-sm" onClick={() => { logout(); navigate('/'); }}>
              <LogOut size={16} /> Keluar
            </button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: 'linear-gradient(135deg,rgba(249,115,22,0.15),rgba(249,115,22,0.05))', border: '1px solid rgba(249,115,22,0.3)', borderRadius: 'var(--radius-lg)', padding: 24 }}>
            <div style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 6 }}>💰 Saldo Deposit</div>
            <div style={{ fontSize: 32, fontWeight: 900, color: 'var(--orange)' }}>{formatRupiah(currentUser.deposit_balance)}</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {[
              { label: 'Total Penawaran', value: myBids.length, color: 'var(--orange)', emoji: '📋' },
              { label: 'Lelang Dimenangkan', value: won, color: 'var(--success)', emoji: '🏆' },
            ].map(({ label, value, color, emoji }) => (
              <div key={label} className="stat-card">
                <div style={{ fontSize: 28 }}>{emoji}</div>
                <div className="stat-value" style={{ color }}>{value}</div>
                <div className="stat-label">{label}</div>
              </div>
            ))}
          </div>

          {!currentUser.is_verified && (
            <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 'var(--radius-lg)', padding: 20 }}>
              <div style={{ fontWeight: 700, marginBottom: 6, color: 'var(--warning)' }}>⚠️ Akun Belum Diverifikasi</div>
              <div style={{ fontSize: 13, color: 'var(--text3)', lineHeight: 1.5 }}>
                Akun Anda perlu diverifikasi oleh admin sebelum dapat mengikuti lelang. Hubungi admin CarVentory.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
