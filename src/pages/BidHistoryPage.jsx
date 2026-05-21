import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAuction } from '../context/AuctionContext';
import { formatRupiah } from '../lib/utils';
import api from '../lib/api';
import {
  AlertCircle,
  Clock,
  Gavel,
  Loader2,
  ShoppingCart,
  TrendingDown,
  Trophy,
} from 'lucide-react';

const TAB_ALL = 'all';
const TAB_BIDS = 'bids';
const TAB_PURCHASES = 'purchases';

const BID_STATUS = {
  won: { label: 'Menang', className: 'badge-success', icon: Trophy },
  ongoing: { label: 'Berlangsung', className: 'badge-warning', icon: Loader2 },
  lost: { label: 'Kalah', className: 'badge-danger', icon: TrendingDown },
};

function getBidStatus(bid, userId) {
  const auc = bid.auction;
  if (!auc) return 'ongoing';
  // Gunakan end_time sebagai fallback jika kolom status belum ada di DB
  const isEnded = auc.status === 'ended' ||
    (auc.end_time && new Date(auc.end_time) < new Date());
  
  if (isEnded) {
    if (auc.winner_id && Number(auc.winner_id) === Number(userId)) return 'won';
    // Jika lelang sudah selesai, dan belum ada winner, kita cek apakah bid ini adalah bid tertinggi.
    if (!auc.winner_id && Number(bid.bid_amount) === Number(auc.current_highest_bid)) return 'won';
    return 'lost';
  }
  return 'ongoing';
}

function CarThumb({ car }) {
  if (!car) return <span style={{ color: 'var(--text3)', fontSize: 12 }}>—</span>;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      {car.image_url && (
        <img
          src={car.image_url}
          alt={`${car.brand} ${car.model}`}
          style={{ width: 48, height: 36, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }}
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
      )}
      <div>
        <div style={{ fontWeight: 600, fontSize: 13 }}>
          {[car.brand, car.model].filter(Boolean).join(' ') || '—'}
        </div>
        {car.year && <div style={{ fontSize: 11, color: 'var(--text3)' }}>{car.year}</div>}
      </div>
    </div>
  );
}

export default function BidHistoryPage() {
  const { currentUser } = useAuth();
  const { cars } = useAuction();
  const navigate = useNavigate();

  const [tab, setTab] = useState(TAB_ALL);
  const [bids, setBids] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAll = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    setError('');
    try {
      const [bidsRes, purchasesRes] = await Promise.all([
        api.get(`/bids/user/${currentUser.id}`, { params: { limit: 50 } }),
        api.get('/transactions/my', { params: { type: 'buy_now', limit: 50 } }),
      ]);
      setBids(bidsRes.data.data || []);
      setPurchases(purchasesRes.data.data || []);
    } catch (err) {
      setError('Gagal memuat riwayat. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  if (!currentUser) {
    return (
      <div className="page">
        <div className="empty-state">
          <div className="empty-state-icon">🔒</div>
          <h3>Login Diperlukan</h3>
          <button className="btn btn-primary" onClick={() => navigate('/login')}>Masuk</button>
        </div>
      </div>
    );
  }

  // Gabungkan dan urutkan berdasarkan tanggal terbaru
  const allItems = [
    ...bids.map((b) => ({ ...b, _kind: 'bid', _date: new Date(b.bid_time) })),
    ...purchases.map((p) => ({ ...p, _kind: 'purchase', _date: new Date(p.created_at || p.transaction_date) })),
  ].sort((a, b) => b._date - a._date);

  const displayItems =
    tab === TAB_BIDS ? allItems.filter((i) => i._kind === 'bid') :
    tab === TAB_PURCHASES ? allItems.filter((i) => i._kind === 'purchase') :
    allItems;

  const wonCount = bids.filter((b) => getBidStatus(b, currentUser.id) === 'won').length;
  const ongoingCount = bids.filter((b) => getBidStatus(b, currentUser.id) === 'ongoing').length;

  const stats = [
    { label: 'Total Penawaran', value: bids.length, color: 'var(--orange)', icon: '📋' },
    { label: 'Menang Lelang', value: wonCount, color: 'var(--success)', icon: '🏆' },
    { label: 'Sedang Berlangsung', value: ongoingCount, color: 'var(--warning)', icon: '⏳' },
    { label: 'Pembelian Langsung', value: purchases.length, color: 'var(--primary)', icon: '🛒' },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Riwayat Aktivitas</h1>
        <p className="page-sub">Riwayat penawaran dan pembelian kendaraan Anda</p>
      </div>

      {/* Statistik */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        {stats.map(({ label, value, color, icon }) => (
          <div className="stat-card" key={label}>
            <div style={{ fontSize: 24 }}>{icon}</div>
            <div className="stat-value" style={{ color }}>{value}</div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>

      {/* Tab filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[
          { key: TAB_ALL, label: `Semua (${allItems.length})` },
          { key: TAB_BIDS, label: `Penawaran (${bids.length})` },
          { key: TAB_PURCHASES, label: `Beli Langsung (${purchases.length})` },
        ].map(({ key, label }) => (
          <button
            key={key}
            className={`btn btn-sm ${tab === key ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Konten */}
      {loading ? (
        <div className="empty-state">
          <Loader2 size={40} className="spin" />
          <p>Memuat riwayat...</p>
        </div>
      ) : error ? (
        <div className="alert alert-error" style={{ marginBottom: 16 }}>
          <AlertCircle size={16} /> {error}
          <button className="btn btn-sm btn-ghost" onClick={fetchAll} style={{ marginLeft: 12 }}>
            Coba Lagi
          </button>
        </div>
      ) : displayItems.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <h3>Belum Ada Riwayat</h3>
          <p style={{ marginBottom: 20 }}>Mulai menawar atau beli kendaraan di katalog</p>
          <button className="btn btn-primary" onClick={() => navigate('/catalog')}>
            Lihat Katalog
          </button>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Kendaraan</th>
                <th>Jenis</th>
                <th>Jumlah</th>
                <th>Waktu</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {displayItems.map((item) => {
                if (item._kind === 'bid') {
                  const car = item.auction?.car;
                  const status = getBidStatus(item, currentUser.id);
                  const { label, className, icon: Icon } = BID_STATUS[status] || BID_STATUS.ongoing;
                  const auctionId = item.auction?.id;

                  return (
                    <tr key={`bid-${item.id}`}>
                      <td><CarThumb car={car} /></td>
                      <td>
                        <span className="badge" style={{ gap: 4 }}>
                          <Gavel size={11} /> Penawaran
                        </span>
                      </td>
                      <td style={{ fontWeight: 700, color: 'var(--orange)' }}>
                        {formatRupiah(item.bid_amount)}
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--text3)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Clock size={12} />
                          {new Date(item.bid_time).toLocaleString('id-ID')}
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${className}`}>
                          <Icon size={10} /> {label}
                        </span>
                      </td>
                      <td>
                        {item.auction?.status === 'active' && auctionId && (
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => navigate(`/auctions/${auctionId}`)}
                          >
                            Lihat Lelang
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                }

                // purchase (buy_now) — coba dari response, fallback ke AuctionContext cars via car_id
                const carFromCtx = item.car_id
                  ? cars.find((c) => String(c.id) === String(item.car_id))
                  : null;
                const car = item.car || item.auction?.car || carFromCtx;
                return (
                  <tr key={`purchase-${item.id}`}>
                    <td><CarThumb car={car} /></td>
                    <td>
                      <span className="badge badge-primary" style={{ gap: 4 }}>
                        <ShoppingCart size={11} /> Beli Langsung
                      </span>
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--success)' }}>
                      {formatRupiah(item.amount)}
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text3)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={12} />
                        {new Date(item.created_at || item.transaction_date).toLocaleString('id-ID')}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-success">✓ Berhasil</span>
                    </td>
                    <td />
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
