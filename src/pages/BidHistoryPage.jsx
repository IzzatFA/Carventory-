import { useCallback, useEffect, useState } from 'react';
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
import './BidHistoryPage.css';

const TAB_ALL = 'all';
const TAB_BIDS = 'bids';
const TAB_PURCHASES = 'purchases';

const BID_STATUS = {
  won: { label: 'Menang', className: 'badge-success', icon: Trophy },
  ongoing: { label: 'Berlangsung', className: 'badge-warning', icon: Loader2 },
  lost: { label: 'Kalah', className: 'badge-danger', icon: TrendingDown },
};

function getBidStatus(bid, userId) {
  const auction = bid.auction;
  if (!auction) return 'ongoing';

  const isEnded =
    auction.status === 'ended' ||
    (auction.end_time && new Date(auction.end_time) < new Date());

  if (isEnded && Number(auction.winner_id) === Number(userId)) return 'won';
  if (isEnded) return 'lost';
  return 'ongoing';
}

function CarThumb({ car }) {
  if (!car) return <span className="history-car-empty">-</span>;

  return (
    <div className="history-car-thumb">
      {car.image_url && (
        <img
          className="history-car-image"
          src={car.image_url}
          alt={`${car.brand} ${car.model}`}
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      )}
      <div>
        <div className="history-car-name">
          {[car.brand, car.model].filter(Boolean).join(' ') || '-'}
        </div>
        {car.year && <div className="history-car-year">{car.year}</div>}
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
  const [warning, setWarning] = useState('');

  const fetchAll = useCallback(async () => {
    if (!currentUser) return;

    setLoading(true);
    setError('');
    setWarning('');

    try {
      const [bidsRes, purchasesRes] = await Promise.allSettled([
        api.get(`/bids/user/${currentUser.id}`, { params: { limit: 50 } }),
        api.get('/transactions/my', { params: { type: 'buy_now', limit: 50 } }),
      ]);

      const failed = [];

      if (bidsRes.status === 'fulfilled') {
        setBids(bidsRes.value.data.data || []);
      } else {
        setBids([]);
        failed.push('penawaran');
      }

      if (purchasesRes.status === 'fulfilled') {
        setPurchases(purchasesRes.value.data.data || []);
      } else {
        setPurchases([]);
        failed.push('pembelian langsung');
      }

      if (failed.length === 2) {
        setError('Gagal memuat riwayat. Silakan coba lagi.');
      } else if (failed.length === 1) {
        setWarning(`Riwayat ${failed[0]} belum bisa dimuat.`);
      }
    } catch {
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
      <div className="page history-page">
        <div className="empty-state">
          <div className="empty-state-icon">🔒</div>
          <h3>Login Diperlukan</h3>
          <button className="btn btn-primary" onClick={() => navigate('/login')}>
            Masuk
          </button>
        </div>
      </div>
    );
  }

  const allItems = [
    ...bids.map((bid) => ({ ...bid, _kind: 'bid', _date: new Date(bid.bid_time) })),
    ...purchases.map((purchase) => ({
      ...purchase,
      _kind: 'purchase',
      _date: new Date(purchase.created_at || purchase.transaction_date),
    })),
  ].sort((a, b) => b._date - a._date);

  const displayItems =
    tab === TAB_BIDS
      ? allItems.filter((item) => item._kind === 'bid')
      : tab === TAB_PURCHASES
        ? allItems.filter((item) => item._kind === 'purchase')
        : allItems;

  const wonCount = bids.filter((bid) => getBidStatus(bid, currentUser.id) === 'won').length;
  const ongoingCount = bids.filter((bid) => getBidStatus(bid, currentUser.id) === 'ongoing').length;

  const stats = [
    { label: 'Total Penawaran', value: bids.length, tone: 'orange', icon: '📋' },
    { label: 'Menang Lelang', value: wonCount, tone: 'success', icon: '🏆' },
    { label: 'Sedang Berlangsung', value: ongoingCount, tone: 'warning', icon: '⏳' },
    { label: 'Pembelian Langsung', value: purchases.length, tone: 'info', icon: '🛒' },
  ];

  return (
    <div className="page history-page">
      <div className="page-header">
        <h1 className="page-title">Riwayat Aktivitas</h1>
        <p className="page-sub">Riwayat penawaran dan pembelian kendaraan Anda</p>
      </div>

      <div className="stats-grid history-stats">
        {stats.map(({ label, value, tone, icon }) => (
          <div className="stat-card history-stat-card" key={label}>
            <div className="history-stat-icon">{icon}</div>
            <div className={`stat-value history-stat-value history-stat-value-${tone}`}>
              {value}
            </div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>

      <div className="history-tabs">
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

      {warning && !loading && !error && (
        <div className="alert history-alert-warning">
          <AlertCircle size={16} /> {warning}
          <button className="btn btn-sm btn-ghost history-alert-action" onClick={fetchAll}>
            Coba Lagi
          </button>
        </div>
      )}

      {loading ? (
        <div className="history-loading" role="status" aria-live="polite">
          <div className="history-loader">
            <span className="history-loader-ring" />
            <Loader2 size={34} className="history-loader-icon" />
          </div>
          <p>
            Memuat riwayat<span className="history-loading-dots" />
          </p>
        </div>
      ) : error ? (
        <div className="alert alert-error history-alert">
          <AlertCircle size={16} /> {error}
          <button className="btn btn-sm btn-ghost history-alert-action" onClick={fetchAll}>
            Coba Lagi
          </button>
        </div>
      ) : displayItems.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <h3>Belum Ada Riwayat</h3>
          <p className="history-empty-copy">Mulai menawar atau beli kendaraan di katalog</p>
          <button className="btn btn-primary" onClick={() => navigate('/catalog')}>
            Lihat Katalog
          </button>
        </div>
      ) : (
        <div className="table-wrap history-table-wrap">
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
                  const { label, className, icon: Icon } =
                    BID_STATUS[status] || BID_STATUS.ongoing;
                  const auctionId = item.auction?.id;

                  return (
                    <tr key={`bid-${item.id}`}>
                      <td>
                        <CarThumb car={car} />
                      </td>
                      <td>
                        <span className="badge history-kind-badge">
                          <Gavel size={11} /> Penawaran
                        </span>
                      </td>
                      <td className="history-amount history-amount-bid">
                        {formatRupiah(item.bid_amount)}
                      </td>
                      <td className="history-time-cell">
                        <div className="history-time">
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

                const carFromCtx = item.car_id
                  ? cars.find((car) => String(car.id) === String(item.car_id))
                  : null;
                const car = item.car || item.auction?.car || carFromCtx;

                return (
                  <tr key={`purchase-${item.id}`}>
                    <td>
                      <CarThumb car={car} />
                    </td>
                    <td>
                      <span className="badge badge-info history-kind-badge">
                        <ShoppingCart size={11} /> Beli Langsung
                      </span>
                    </td>
                    <td className="history-amount history-amount-purchase">
                      {formatRupiah(item.amount)}
                    </td>
                    <td className="history-time-cell">
                      <div className="history-time">
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
