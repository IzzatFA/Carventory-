import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Gavel, Clock, TrendingUp } from 'lucide-react';
import { mockCars, mockAuctions, formatRupiah } from '../lib/mockData';
import BidTimer from '../components/BidTimer';

export default function AuctionsPage() {
  const navigate = useNavigate();
  const active = mockAuctions.filter(a => a.status === 'active');
  const upcoming = mockAuctions.filter(a => a.status === 'upcoming');
  const ended = mockAuctions.filter(a => a.status === 'ended');

  const AucRow = ({ auc }) => {
    const car = mockCars.find(c => c.id === auc.car_id);
    if (!car) return null;
    return (
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 16, display: 'flex', gap: 16, alignItems: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
        onClick={() => navigate(auc.status === 'active' ? `/auctions/${auc.id}` : `/cars/${car.id}`)}
        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--orange)'}
        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
        <img src={car.image_url} alt={car.name} style={{ width: 100, height: 70, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }}
          onError={e => { e.target.src = 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=200'; }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            {auc.status === 'active' && <><span className="live-dot" /><span style={{ fontSize: 11, color: 'var(--success)', fontWeight: 600 }}>LIVE</span></>}
            <span className={`badge cat-${car.category}`}>{car.category}</span>
          </div>
          <div style={{ fontWeight: 700, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{car.name}</div>
          <div style={{ fontSize: 13, color: 'var(--text3)' }}>Harga Awal: {formatRupiah(car.initial_price)}</div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--orange)', marginBottom: 6 }}>{formatRupiah(auc.current_highest_bid)}</div>
          {auc.status === 'active' && <BidTimer endTime={auc.end_time} />}
          {auc.status === 'upcoming' && <span style={{ fontSize: 12, color: 'var(--info)' }}>Segera</span>}
          {auc.status === 'ended' && <span className="badge badge-gray">Selesai</span>}
        </div>
        {auc.status === 'active' && (
          <button className="btn btn-primary btn-sm" onClick={e => { e.stopPropagation(); navigate(`/auctions/${auc.id}`); }}>
            <Gavel size={13} /> Tawar
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Semua Lelang</h1>
        <p className="page-sub">Pantau dan ikuti lelang kendaraan real-time</p>
      </div>

      <div className="stats-grid">
        {[
          { label: 'Lelang Aktif', value: active.length, color: 'var(--success)', icon: '🔴' },
          { label: 'Segera Dimulai', value: upcoming.length, color: 'var(--info)', icon: '⏰' },
          { label: 'Selesai', value: ended.length, color: 'var(--text3)', icon: '✅' },
        ].map(({ label, value, color, icon }) => (
          <div className="stat-card" key={label}>
            <div style={{ fontSize: 24 }}>{icon}</div>
            <div className="stat-value" style={{ color }}>{value}</div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>

      {active.length > 0 && (
        <div className="section" style={{ paddingLeft: 0, paddingRight: 0 }}>
          <div className="section-header">
            <h2 className="section-title">🔴 Lelang Aktif</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {active.map(a => <AucRow key={a.id} auc={a} />)}
          </div>
        </div>
      )}

      {upcoming.length > 0 && (
        <div className="section" style={{ paddingLeft: 0, paddingRight: 0 }}>
          <div className="section-header">
            <h2 className="section-title">⏰ Segera Dimulai</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {upcoming.map(a => <AucRow key={a.id} auc={a} />)}
          </div>
        </div>
      )}

      {ended.length > 0 && (
        <div className="section" style={{ paddingLeft: 0, paddingRight: 0 }}>
          <div className="section-header">
            <h2 className="section-title">✅ Lelang Selesai</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {ended.map(a => <AucRow key={a.id} auc={a} />)}
          </div>
        </div>
      )}
    </div>
  );
}
