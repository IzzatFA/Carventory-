import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatRupiah, getAuctionByCar, categoryColors } from '../lib/mockData';
import BidTimer from './BidTimer';
import { Gavel, Eye, Clock } from 'lucide-react';

export default function CarCard({ car, auction }) {
  const navigate = useNavigate();
  const auc = auction || getAuctionByCar(car.id);

  const statusBadge = () => {
    if (!auc) return <span className="badge badge-gray">Tidak Dilelang</span>;
    if (auc.status === 'active') return <span className="badge badge-success" style={{ gap: 6 }}><span className="live-dot" />Live</span>;
    if (auc.status === 'upcoming') return <span className="badge badge-info">Segera</span>;
    return <span className="badge badge-gray">Selesai</span>;
  };

  return (
    <div className="card animate-fade" style={{ cursor: 'pointer' }} onClick={() => navigate(`/cars/${car.id}`)}>
      <div style={{ position: 'relative' }}>
        <img
          src={car.image_url}
          alt={car.name}
          className="card-img"
          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600'; }}
        />
        <div style={{ position: 'absolute', top: 12, left: 12 }}>{statusBadge()}</div>
        {car.is_verified && (
          <div style={{ position: 'absolute', top: 12, right: 12 }}>
            <span className="badge badge-success">✓ Terverifikasi</span>
          </div>
        )}
      </div>
      <div className="card-body">
        <span className={`card-category cat-${car.category}`}>
          {car.category === 'penumpang' ? 'Penumpang' : car.category === 'mewah' ? 'Mewah' : 'Klasik'}
        </span>
        <div className="card-title">{car.name}</div>
        <div className="card-price">
          Harga Awal: <strong>{formatRupiah(car.initial_price)}</strong>
        </div>
        {auc && auc.status === 'active' && (
          <div style={{ marginTop: 8, padding: '8px 10px', background: 'rgba(249,115,22,0.08)', borderRadius: 8 }}>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 2 }}>Penawaran Tertinggi</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--orange)' }}>{formatRupiah(auc.current_highest_bid)}</div>
          </div>
        )}
      </div>
      <div className="card-footer">
        {auc && auc.status === 'active' ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text3)' }}>
            <Clock size={12} />
            <BidTimer endTime={auc.end_time} />
          </div>
        ) : (
          <span style={{ fontSize: 12, color: 'var(--text3)' }}>{auc?.status === 'upcoming' ? 'Segera dimulai' : 'Lelang berakhir'}</span>
        )}
        <button className="btn btn-primary btn-sm" onClick={(e) => { e.stopPropagation(); navigate(`/cars/${car.id}`); }}>
          <Eye size={13} /> Lihat
        </button>
      </div>
    </div>
  );
}
