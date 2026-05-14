import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAuction } from '../context/AuctionContext';
import { formatRupiah } from '../lib/utils';
import { Clock, Trophy, TrendingDown, Loader } from 'lucide-react';

export default function BidHistoryPage() {
  const { currentUser } = useAuth();
  const { cars, auctions, getUserBids } = useAuction();
  const navigate = useNavigate();

  if (!currentUser) return (
    <div className="page"><div className="empty-state"><div className="empty-state-icon">🔒</div><h3>Login Diperlukan</h3><button className="btn btn-primary" onClick={() => navigate('/login')}>Masuk</button></div></div>
  );

  const myBids = getUserBids(currentUser.id);

  const getBidStatus = (bid) => {
    const auc = auctions.find(a => a.id === bid.auction_id);
    if (!auc) return 'unknown';
    if (auc.status === 'active') return 'ongoing';
    if (auc.winner_id === currentUser.id && auc.status === 'ended') return 'won';
    return 'lost';
  };

  const statusBadge = (status) => {
    if (status === 'won') return <span className="badge badge-success"><Trophy size={10} /> Menang</span>;
    if (status === 'ongoing') return <span className="badge badge-warning"><Loader size={10} /> Berlangsung</span>;
    if (status === 'lost') return <span className="badge badge-danger"><TrendingDown size={10} /> Kalah</span>;
    return <span className="badge badge-gray">-</span>;
  };

  const won = myBids.filter(b => getBidStatus(b) === 'won').length;
  const ongoing = myBids.filter(b => getBidStatus(b) === 'ongoing').length;

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Riwayat Penawaran</h1>
        <p className="page-sub">Semua penawaran yang pernah Anda ajukan</p>
      </div>

      <div className="stats-grid" style={{ marginBottom: 24 }}>
        {[
          { label: 'Total Penawaran', value: myBids.length, color: 'var(--orange)', icon: '📋' },
          { label: 'Menang', value: won, color: 'var(--success)', icon: '🏆' },
          { label: 'Berlangsung', value: ongoing, color: 'var(--warning)', icon: '⏳' },
          { label: 'Kalah', value: myBids.length - won - ongoing, color: 'var(--danger)', icon: '📉' },
        ].map(({ label, value, color, icon }) => (
          <div className="stat-card" key={label}>
            <div style={{ fontSize: 24 }}>{icon}</div>
            <div className="stat-value" style={{ color }}>{value}</div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>

      {myBids.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <h3>Belum Ada Riwayat Penawaran</h3>
          <p style={{ marginBottom: 20 }}>Mulai menawar di lelang aktif</p>
          <button className="btn btn-primary" onClick={() => navigate('/auctions')}>Lihat Lelang</button>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Kendaraan</th>
                <th>Jumlah Penawaran</th>
                <th>Waktu</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {myBids.map(bid => {
                const auc = auctions.find(a => a.id === bid.auction_id);
                // Depending on the backend output, bid.auction.car might be available, otherwise fallback
                const car = bid.auction?.car || cars.find(c => String(c.id) === String(auc?.car_id));
                const status = getBidStatus(bid);
                const carName = car?.model ? `${car.brand} ${car.model}` : car?.name;
                
                return (
                  <tr key={bid.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {car && <img src={car.image_url} alt={carName} style={{ width: 44, height: 34, borderRadius: 6, objectFit: 'cover' }} onError={e=>{e.target.style.display='none'}} />}
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{carName || '-'}</div>
                          <div style={{ fontSize: 11, color: 'var(--text3)' }}>#{String(bid.auction_id).slice(-6)}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--orange)' }}>{formatRupiah(bid.bid_amount || bid.bid_ammount)}</td>
                    <td style={{ fontSize: 12, color: 'var(--text3)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={12} /> {new Date(bid.bid_time || bid.timestamp).toLocaleString('id-ID')}
                      </div>
                    </td>
                    <td>{statusBadge(status)}</td>
                    <td>
                      {auc && auc.status === 'active' && (
                        <button className="btn btn-primary btn-sm" onClick={() => navigate(`/auctions/${auc.id}`)}>Lihat Lelang</button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
