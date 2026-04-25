import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Gavel, ArrowLeft, AlertCircle, TrendingUp, Users } from 'lucide-react';
import { mockCars, mockAuctions, formatRupiah } from '../lib/mockData';
import { useAuth } from '../context/AuthContext';
import { useAuction } from '../context/AuctionContext';
import BidTimer from '../components/BidTimer';

export default function BiddingRoom() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { auctions, getAuctionBids, placeBid } = useAuction();

  const auction = auctions.find(a => a.id === id);
  const car = auction ? mockCars.find(c => c.id === auction.car_id) : null;
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

  if (!auction || !car) return (
    <div className="page"><div className="empty-state"><div className="empty-state-icon">❌</div><h3>Lelang tidak ditemukan</h3><button className="btn btn-primary" onClick={() => navigate('/auctions')}>Kembali</button></div></div>
  );

  const minBid = (auction.current_highest_bid || car.initial_price) + 500000;

  const handleBid = (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!currentUser) return setError('Anda harus login untuk menawar.');
    if (!currentUser.is_verified) return setError('Akun Anda belum diverifikasi admin.');
    if (auctionEnded) return setError('Waktu lelang telah habis.');
    const val = parseInt(amount.replace(/\D/g,''));
    if (!val) return setError('Masukkan jumlah penawaran yang valid.');
    setLoading(true);
    setTimeout(() => {
      const res = placeBid(auction.id, currentUser.id, car.id, val);
      setLoading(false);
      if (res.success) { setSuccess(`Penawaran Rp ${val.toLocaleString('id-ID')} berhasil!`); setAmount(''); }
      else setError(res.error);
    }, 600);
  };

  const quickBids = [minBid, minBid + 1000000, minBid + 5000000];

  return (
    <div className="page">
      <button className="btn btn-ghost btn-sm" style={{ marginBottom: 20 }} onClick={() => navigate(`/cars/${car.id}`)}>
        <ArrowLeft size={14} /> Detail Kendaraan
      </button>

      {/* Header */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20, marginBottom: 20, display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <img src={car.image_url} alt={car.name} style={{ width: 80, height: 60, borderRadius: 8, objectFit: 'cover' }} onError={e => { e.target.src='https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=200'; }} />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span className="live-dot" />
            <span style={{ fontSize: 12, color: 'var(--success)', fontWeight: 600 }}>LIVE AUCTION</span>
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 800 }}>{car.name}</h1>
        </div>
        <div style={{ textAlign: 'right' }}>
          <BidTimer endTime={auction.end_time} onEnd={() => setAuctionEnded(true)} />
        </div>
      </div>

      <div className="bids-grid">
        {/* Bid Feed */}
        <div>
          {/* Current price */}
          <div style={{ background: 'linear-gradient(135deg,rgba(249,115,22,0.15),rgba(249,115,22,0.05))', border: '1px solid rgba(249,115,22,0.3)', borderRadius: 'var(--radius-lg)', padding: 20, marginBottom: 20 }}>
            <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 6 }}>💰 Penawaran Tertinggi Saat Ini</div>
            <div style={{ fontSize: 36, fontWeight: 900, color: 'var(--orange)' }}>{formatRupiah(auction.current_highest_bid)}</div>
            <div style={{ fontSize: 13, color: 'var(--text3)', marginTop: 4 }}>
              Harga Awal: {formatRupiah(car.initial_price)} | {bids.length} penawaran
            </div>
          </div>

          {/* Bid History */}
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <TrendingUp size={16} style={{ color: 'var(--orange)' }} />
              <span style={{ fontWeight: 700 }}>Riwayat Penawaran</span>
              <span className="badge badge-orange">{bids.length}</span>
            </div>
            <div style={{ maxHeight: 320, overflowY: 'auto' }}>
              {bids.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text3)', fontSize: 13 }}>Belum ada penawaran. Jadilah yang pertama!</div>
              ) : bids.map((bid, i) => (
                <div key={bid.id} className="bid-item animate-fade">
                  <div className="bid-user">
                    <div className="bid-avatar" style={{ background: i === 0 ? 'var(--orange)' : 'var(--bg3)' }}>
                      {i === 0 ? '👑' : bid.user_id[4].toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>
                        {bid.user_id === currentUser?.id ? 'Anda' : `Penawar ${bid.user_id.slice(-3)}`}
                      </div>
                      <div className="bid-time">{new Date(bid.timestamp).toLocaleTimeString('id-ID')}</div>
                    </div>
                  </div>
                  <div>
                    <div className="bid-amount">{formatRupiah(bid.bid_amount)}</div>
                    {i === 0 && <div style={{ fontSize: 10, color: 'var(--success)', textAlign: 'right' }}>Tertinggi</div>}
                  </div>
                </div>
              ))}
              <div ref={bidsEndRef} />
            </div>
          </div>
        </div>

        {/* Bid Form */}
        <div>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 24, position: 'sticky', top: 80 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Ajukan Penawaran</h2>
            <p style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 20 }}>Minimum penawaran: <strong style={{ color: 'var(--orange)' }}>{formatRupiah(minBid)}</strong></p>

            {error && <div className="alert alert-error"><AlertCircle size={14} style={{ display: 'inline', marginRight: 6 }} />{error}</div>}
            {success && <div className="alert alert-success">✓ {success}</div>}
            {auctionEnded && <div className="alert alert-error">⏱ Waktu lelang telah habis!</div>}

            {/* Quick bid */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 8, fontWeight: 600 }}>Penawaran Cepat</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {quickBids.map((v, i) => (
                  <button key={i} className="btn btn-ghost" style={{ justifyContent: 'space-between', fontWeight: 700 }}
                    onClick={() => setAmount(String(v))} disabled={auctionEnded}>
                    <span>{i === 0 ? '⚡ Minimum' : i === 1 ? '🔥 +1 Juta' : '🚀 +5 Juta'}</span>
                    <span style={{ color: 'var(--orange)' }}>{formatRupiah(v)}</span>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleBid}>
              <div className="input-group">
                <label className="input-label">Jumlah Penawaran (Rp)</label>
                <input className="input" placeholder={`Min. ${minBid.toLocaleString('id-ID')}`}
                  value={amount ? parseInt(amount.replace(/\D/g,'')).toLocaleString('id-ID') : ''}
                  onChange={e => setAmount(e.target.value.replace(/\D/g,''))}
                  disabled={auctionEnded} />
              </div>
              <button className="btn btn-primary btn-lg" style={{ width: '100%' }} type="submit" disabled={loading || auctionEnded}>
                <Gavel size={18} /> {loading ? 'Memproses...' : 'Ajukan Penawaran'}
              </button>
            </form>

            {!currentUser && (
              <div style={{ marginTop: 16, padding: 14, background: 'rgba(249,115,22,0.08)', borderRadius: 10, textAlign: 'center' }}>
                <div style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 10 }}>Login untuk ikut lelang</div>
                <button className="btn btn-primary btn-sm" onClick={() => navigate('/login')}>Masuk</button>
              </div>
            )}

            {currentUser && (
              <div style={{ marginTop: 16, padding: 14, background: 'var(--glass)', borderRadius: 10, display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: 'var(--text3)' }}>Saldo Deposit</span>
                <span style={{ fontWeight: 700, color: 'var(--success)' }}>{formatRupiah(currentUser.deposit_balance)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
