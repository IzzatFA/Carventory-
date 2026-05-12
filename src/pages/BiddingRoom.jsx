import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Gavel, ArrowLeft, AlertCircle, TrendingUp } from 'lucide-react';
import { mockCars, formatRupiah } from '../lib/mockData';
import { useAuth } from '../context/AuthContext';
import { useAuction } from '../context/AuctionContext';
import BidTimer from '../components/BidTimer';
import './BiddingRoom.css';

export default function BiddingRoom() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { auctions, getAuctionBids, placeBid } = useAuction();

  const auction = auctions.find((a) => a.id === id);
  const car = auction ? mockCars.find((c) => c.id === auction.car_id) : null;
  const bids = getAuctionBids(id);

  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [auctionEnded, setAuctionEnded] = useState(false);
  const bidsEndRef = useRef(null);

  useEffect(() => {
    bidsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [bids]);

  if (!auction || !car) {
    return (
      <div className="page">
        <div className="empty-state">
          <AlertCircle size={46} className="bidding-empty-icon" />
          <h3>Lelang tidak ditemukan</h3>
          <button className="btn btn-primary" onClick={() => navigate('/auctions')}>
            Kembali
          </button>
        </div>
      </div>
    );
  }

  const minBid = (auction.current_highest_bid || car.initial_price) + 500000;
  const quickBids = [minBid, minBid + 1000000, minBid + 5000000];

  const handleBid = (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!currentUser) return setError('Anda harus login untuk menawar.');
    if (!currentUser.is_verified) return setError('Akun Anda belum diverifikasi admin.');
    if (auctionEnded) return setError('Waktu lelang telah habis.');

    const bidValue = Number(amount.replace(/\D/g, ''));
    if (!bidValue) return setError('Masukkan jumlah penawaran yang valid.');
    if (bidValue < minBid) return setError(`Minimum penawaran adalah ${formatRupiah(minBid)}.`);
    if (bidValue > currentUser.deposit_balance) return setError('Maaf tapi saldo anda tidak cukup');

    setLoading(true);
    setTimeout(() => {
      const res = placeBid(auction.id, currentUser.id, car.id, bidValue, currentUser.deposit_balance);
      setLoading(false);
      if (res.success) {
        setSuccess(`Penawaran ${formatRupiah(bidValue)} berhasil!`);
        setAmount('');
      } else {
        setError(res.error);
      }
    }, 600);
  };

  return (
    <div className="page bidding-room-page">
      <button className="btn btn-ghost btn-sm bidding-back-button" onClick={() => navigate(`/cars/${car.id}`)}>
        <ArrowLeft size={14} /> Detail Kendaraan
      </button>

      <header className="bidding-header">
        <img
          src={car.image_url}
          alt={car.name}
          className="bidding-header-img"
          onError={(event) => {
            event.currentTarget.src = 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=200';
          }}
        />
        <div className="bidding-header-content">
          <div className="bidding-live-label">
            <span className="live-dot" />
            <span>LIVE AUCTION</span>
          </div>
          <h1>{car.name}</h1>
        </div>
        <div className="bidding-header-timer">
          <BidTimer endTime={auction.end_time} onEnd={() => setAuctionEnded(true)} />
        </div>
      </header>

      <div className="bids-grid">
        <div className="bidding-main">
          <section className="bidding-current-card">
            <div className="bidding-card-eyebrow">Penawaran Tertinggi Saat Ini</div>
            <div className="bidding-current-price">{formatRupiah(auction.current_highest_bid)}</div>
            <div className="bidding-current-meta">
              Harga Awal: {formatRupiah(car.initial_price)} | {bids.length} penawaran
            </div>
          </section>

          <section className="bidding-history-card">
            <div className="bidding-section-title">
              <TrendingUp size={16} />
              <span>Riwayat Penawaran</span>
              <span className="badge badge-orange">{bids.length}</span>
            </div>

            <div className="bidding-history-list">
              {bids.length === 0 ? (
                <div className="bidding-empty-history">Belum ada penawaran. Jadilah yang pertama!</div>
              ) : (
                bids.map((bid, index) => (
                  <div key={bid.id} className="bid-item animate-fade">
                    <div className="bid-user">
                      <div className="bid-avatar" data-rank={index === 0 ? 'highest' : 'normal'}>
                        {index === 0 ? '1' : bid.user_id[4].toUpperCase()}
                      </div>
                      <div>
                        <div className="bid-user-name">
                          {bid.user_id === currentUser?.id ? 'Anda' : `Penawar ${bid.user_id.slice(-3)}`}
                        </div>
                        <div className="bid-time">{new Date(bid.timestamp).toLocaleTimeString('id-ID')}</div>
                      </div>
                    </div>
                    <div className="bid-value-wrap">
                      <div className="bid-amount">{formatRupiah(bid.bid_amount)}</div>
                      {index === 0 && <div className="bid-rank-label">Tertinggi</div>}
                    </div>
                  </div>
                ))
              )}
              <div ref={bidsEndRef} />
            </div>
          </section>
        </div>

        <aside className="bidding-sidebar">
          <div className="bidding-form-card">
            <h2>Ajukan Penawaran</h2>
            <p>
              Minimum penawaran: <strong>{formatRupiah(minBid)}</strong>
            </p>

            {error && (
              <div className="alert alert-error">
                <AlertCircle size={14} />
                {error}
              </div>
            )}
            {success && <div className="alert alert-success">{success}</div>}
            {auctionEnded && <div className="alert alert-error">Waktu lelang telah habis!</div>}

            <div className="quick-bid">
              <div className="quick-bid-title">Penawaran Cepat</div>
              <div className="quick-bid-list">
                {quickBids.map((value, index) => (
                  <button
                    key={value}
                    className="btn btn-ghost quick-bid-button"
                    onClick={() => setAmount(String(value))}
                    disabled={auctionEnded}
                  >
                    <span>{index === 0 ? 'Minimum' : index === 1 ? '+1 Juta' : '+5 Juta'}</span>
                    <span>{formatRupiah(value)}</span>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleBid}>
              <div className="input-group">
                <label className="input-label">Jumlah Penawaran (Rp)</label>
                <input
                  className="input"
                  placeholder={`Min. ${minBid.toLocaleString('id-ID')}`}
                  value={amount ? Number(amount.replace(/\D/g, '')).toLocaleString('id-ID') : ''}
                  onChange={(event) => setAmount(event.target.value.replace(/\D/g, ''))}
                  disabled={auctionEnded}
                  inputMode="numeric"
                />
              </div>
              <button className="btn btn-primary btn-lg bidding-submit-button" type="submit" disabled={loading || auctionEnded}>
                <Gavel size={18} /> {loading ? 'Memproses...' : 'Ajukan Penawaran'}
              </button>
            </form>

            {!currentUser && (
              <div className="bidding-login-box">
                <div>Login untuk ikut lelang</div>
                <button className="btn btn-primary btn-sm" onClick={() => navigate('/login')}>
                  Masuk
                </button>
              </div>
            )}

            {currentUser && (
              <div className="bidding-balance-box">
                <span>Saldo Deposit</span>
                <strong>{formatRupiah(currentUser.deposit_balance)}</strong>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
