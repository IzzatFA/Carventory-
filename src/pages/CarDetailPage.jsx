import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, AlertCircle, Gavel, Info, MapPin, ShieldCheck, ShoppingCart, Trophy, TrendingUp } from 'lucide-react';
import { formatRupiah, categoryLabel } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { useAuction } from '../context/AuctionContext';
import BidTimer from '../components/BidTimer';
import './CarDetailPage.css';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=900';

// Derive auction status from timestamps (real-time, second-level accuracy)
function deriveAuctionStatus(auction, now) {
  if (!auction) return null;
  if (now > new Date(auction.end_time))   return 'ended';
  if (now < new Date(auction.start_time)) return 'upcoming';
  return 'active';
}

export default function CarDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, buyNow } = useAuth();

  // Baca state yang dikirim dari halaman riwayat
  const { fromHistory, kind: historyKind, won: fromWonBid } = location.state || {};
  const { cars, auctions, getAuctionBids, placeBid, refreshData } = useAuction();

  // Real-time clock — updates every second to react when auction ends/starts
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const car = cars.find((c) => String(c.id) === id);
  const auction = auctions.find((a) => String(a.car_id) === id);
  const bids = auction ? getAuctionBids(auction.id) : [];

  const canViewPendingCar = currentUser && (
    currentUser.role === 'admin' || Number(car?.seller_id) === Number(currentUser.id)
  );

  // Computed status: cek sold dulu, lalu derive dari waktu nyata
  const auctionStatus = useMemo(() => {
    if (car?.status === 'sold') return 'ended'; // Mobil terjual → lelang otomatis berakhir
    return deriveAuctionStatus(auction, now);
  }, [auction, car, now]);

  // Deteksi kepemilikan: pemenang lelang atau pembeli langsung
  const isAuctionWinner = Boolean(
    currentUser && auction && Number(auction.winner_id) === Number(currentUser.id)
  );
  const isFromWonBid = Boolean(fromHistory && historyKind === 'bid' && fromWonBid);
  const isBuyer      = Boolean(fromHistory && historyKind === 'purchase');
  const userOwnsThisCar = isAuctionWinner || isFromWonBid || isBuyer;

  const [bidAmount, setBidAmount] = useState('');
  const [bidError, setBidError] = useState('');
  const [bidSuccess, setBidSuccess] = useState('');
  const [buyNowMessage, setBuyNowMessage] = useState('');
  const [buyNowError, setBuyNowError] = useState('');
  const [buyNowLoading, setBuyNowLoading] = useState(false);
  const [bidLoading, setBidLoading] = useState(false);

  // Refresh auction data when the timer hits zero
  const handleAuctionEnd = async () => {
    await refreshData();
    setBidAmount('');
    setBidError('');
    setBidSuccess('');
  };

  if (!car || ((car.is_verified !== true && car.status !== 'active') && !canViewPendingCar && !userOwnsThisCar)) {
    return (
      <div className="page">
        <div className="empty-state">
          <AlertCircle size={46} className="car-detail-empty-icon" />
          <h3>Kendaraan tidak ditemukan</h3>
          <button className="btn btn-primary car-detail-empty-action" onClick={() => navigate('/catalog')}>
            Kembali ke Katalog
          </button>
        </div>
      </div>
    );
  }

  const carName = car.model ? `${car.brand} ${car.model}` : car.name;
  const initialPrice = car.starting_price || car.initial_price;
  const buyNowPrice = Number(car.buy_now_price || car.direct_buy_price || 0);
  const hasBuyNowPrice = buyNowPrice > 0;
  const minBid = auction
    ? (Number(auction.current_highest_bid) || Number(initialPrice)) + 500000
    : Number(initialPrice);

  const statusLabels = {
    active: 'Lelang Aktif',
    upcoming: 'Segera Dibuka',
    ended: 'Lelang Berakhir',
  };

  const handleBidChange = (event) => {
    setBidAmount(event.target.value.replace(/\D/g, ''));
    setBidError('');
    setBidSuccess('');
  };

  const handleBuyNow = async () => {
    setBuyNowError('');
    setBuyNowMessage('');

    if (!currentUser) { navigate('/login'); return; }
    if (!hasBuyNowPrice) { setBuyNowError('Harga langsung beli belum tersedia.'); return; }

    const userBalance = Number(currentUser.deposit_balance) || 0;
    if (userBalance < buyNowPrice) {
      setBuyNowError(
        `Saldo tidak cukup. Saldo Anda: ${formatRupiah(userBalance)}, dibutuhkan: ${formatRupiah(buyNowPrice)}.`
      );
      return;
    }

    setBuyNowLoading(true);
    const result = await buyNow(car.id);
    setBuyNowLoading(false);

    if (!result.success) { setBuyNowError(result.error); return; }

    setBuyNowMessage(`Pembelian berhasil! ${formatRupiah(buyNowPrice)} telah dikurangi dari saldo Anda.`);
    await refreshData();
  };

  const handleBidSubmit = async (event) => {
    event.preventDefault();
    setBidError('');
    setBidSuccess('');

    // Guard: hanya bisa bid saat status aktif (real-time)
    if (auctionStatus !== 'active') return;
    if (!currentUser) { navigate('/login'); return; }

    const amount = Number(bidAmount);
    if (amount <= 0) { setBidError('Masukkan jumlah penawaran terlebih dahulu.'); return; }
    if (amount < minBid) { setBidError(`Penawaran minimum adalah ${formatRupiah(minBid)}.`); return; }

    setBidLoading(true);
    const result = await placeBid(auction.id, amount);
    setBidLoading(false);

    if (!result.success) { setBidError(result.error); return; }

    setBidSuccess(`Penawaran ${formatRupiah(amount)} berhasil masuk.`);
    setBidAmount('');
  };

  // Render buy-now card — hanya tampil jika tidak ada lelang aktif/upcoming dan bukan pemilik
  const renderBuyNowSection = () => {
    if (userOwnsThisCar) return null; // Pemilik tidak perlu beli lagi
    const isSold = car.status === 'sold';
    // Sembunyikan beli langsung ketika lelang sedang aktif atau akan datang
    if (auctionStatus === 'active' || auctionStatus === 'upcoming') return null;

    return (
      <div className="buy-now-card">
        <div>
          <span>Harga Langsung Beli</span>
          <strong>{hasBuyNowPrice ? formatRupiah(buyNowPrice) : 'Belum tersedia'}</strong>
        </div>
        {buyNowError && (
          <div className="alert alert-error detail-bid-alert">
            <AlertCircle size={14} /> {buyNowError}
          </div>
        )}
        {buyNowMessage && <div className="alert alert-success detail-bid-alert">{buyNowMessage}</div>}
        <button
          className="btn btn-primary btn-lg detail-buy-now-button"
          type="button"
          onClick={handleBuyNow}
          disabled={!hasBuyNowPrice || buyNowLoading || isSold}
        >
          <ShoppingCart size={18} />
          {buyNowLoading ? 'Memproses...' : isSold ? 'Sudah Terjual' : currentUser ? 'Beli Sekarang' : 'Masuk untuk Membeli'}
        </button>
      </div>
    );
  };

  return (
    <div className="car-detail-page">
      <div className="car-detail-topbar">
        <div className="container car-detail-topbar-inner">
          <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)}>
            <ArrowLeft size={14} /> Kembali
          </button>
        </div>
      </div>

      <section className="detail-hero">
        <div className="detail-hero-inner">
          <div className="detail-showcase">
            <div className="detail-img-wrap">
              <img
                src={car.image_url || FALLBACK_IMAGE}
                alt={carName}
                className="detail-img"
                onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }}
              />
              <div className="detail-img-badges">
                <span className={`badge cat-${car.category}`}>{categoryLabel[car.category] || car.category}</span>
                {car.is_verified !== false && <span className="badge badge-success">Terverifikasi</span>}
                {/* LIVE badge hanya tampil ketika lelang benar-benar aktif berdasarkan waktu */}
                {auctionStatus === 'active' && (
                  <span className="badge badge-success detail-live-badge">
                    <span className="live-dot" /> LIVE
                  </span>
                )}
                {car.status === 'sold' && (
                  <span className="badge badge-danger">Terjual</span>
                )}
              </div>
              <div className="detail-img-caption">
                <h1>{carName}</h1>
                <p><MapPin size={14} /> {car.location || 'Jakarta Barat'}</p>
              </div>
            </div>

            <div className="detail-highlight-grid">
              <div className="detail-highlight-card">
                <span>Kategori</span>
                <strong>{categoryLabel[car.category] || car.category}</strong>
              </div>
              <div className="detail-highlight-card">
                <span>Harga Awal</span>
                <strong>{formatRupiah(initialPrice)}</strong>
              </div>
              <div className="detail-highlight-card">
                <span>Status</span>
                <strong>{car.is_verified !== false ? 'Terverifikasi' : 'Pending'}</strong>
              </div>
            </div>
          </div>

          <aside className="auction-panel" aria-label="Panel lelang">
            {/* Banner pemenang / pembeli — tampil di atas segalanya */}
            {userOwnsThisCar && (
              <div className={`ownership-banner ${isAuctionWinner || isFromWonBid ? 'ownership-banner--won' : 'ownership-banner--bought'}`}>
                <div className="ownership-banner-icon">
                  {(isAuctionWinner || isFromWonBid)
                    ? <Trophy size={22} />
                    : <ShoppingCart size={22} />}
                </div>
                <div className="ownership-banner-body">
                  <strong>
                    {(isAuctionWinner || isFromWonBid)
                      ? 'Selamat, Anda Memenangkan Lelang!'
                      : 'Anda Telah Membeli Kendaraan Ini'}
                  </strong>
                  <span>
                    {(isAuctionWinner || isFromWonBid)
                      ? 'Kendaraan ini berhasil Anda menangkan melalui lelang.'
                      : 'Pembelian langsung berhasil. Kendaraan kini milik Anda.'}
                  </span>
                </div>
              </div>
            )}

            {auction ? (
              <>
                <div className="auction-status-line" data-status={auctionStatus}>
                  <span className="auction-status-dot" />
                  <span>{statusLabels[auctionStatus] ?? 'Memuat...'}</span>
                </div>

                {/* Timer hanya saat aktif */}
                {auctionStatus === 'active' && (
                  <div className="auction-timer-block">
                    <span>Lelang selesai dalam</span>
                    <BidTimer endTime={auction.end_time} onEnd={handleAuctionEnd} />
                  </div>
                )}

                {/* Jadwal mulai untuk upcoming */}
                {auctionStatus === 'upcoming' && (
                  <div className="auction-meta-card">
                    <span>Jadwal Mulai</span>
                    <strong>{new Date(auction.start_time).toLocaleString('id-ID')}</strong>
                  </div>
                )}

                <div className="auction-bid-summary">
                  <span>Harga awal</span>
                  <strong className="auction-starting-price">{formatRupiah(initialPrice)}</strong>
                </div>

                <div className="auction-bid-summary">
                  <span>{auctionStatus === 'ended' ? 'Harga akhir' : 'Bid tertinggi saat ini'}</span>
                  <strong>{formatRupiah(auction.current_highest_bid)}</strong>
                </div>

                {/* Form bid — hanya saat aktif berdasarkan waktu nyata */}
                {auctionStatus === 'active' && (
                  <form className="detail-bid-form" onSubmit={handleBidSubmit}>
                    <label htmlFor="detailBidAmount">Tambah Bid</label>
                    <input
                      id="detailBidAmount"
                      value={bidAmount ? Number(bidAmount).toLocaleString('id-ID') : ''}
                      onChange={handleBidChange}
                      placeholder={`Min. ${minBid.toLocaleString('id-ID')}`}
                      inputMode="numeric"
                    />
                    {bidError && (
                      <div className="alert alert-error detail-bid-alert">
                        <AlertCircle size={14} /> {bidError}
                      </div>
                    )}
                    {bidSuccess && <div className="alert alert-success detail-bid-alert">{bidSuccess}</div>}
                    <button
                      className="btn btn-primary btn-lg detail-bid-button"
                      type="submit"
                      disabled={bidLoading}
                    >
                      <Gavel size={18} />
                      {bidLoading ? 'Memproses...' : currentUser ? 'Masukkan' : 'Masuk untuk Menawar'}
                    </button>
                  </form>
                )}

                {/* Pesan selesai saat ended */}
                {auctionStatus === 'ended' && (
                  <div className="auction-ended-note">Lelang kendaraan ini telah selesai.</div>
                )}

                {renderBuyNowSection()}
              </>
            ) : (
              <>
                <div className="auction-empty-note">Belum ada jadwal lelang untuk kendaraan ini.</div>
                <div className="auction-bid-summary">
                  <span>Harga awal</span>
                  <strong className="auction-starting-price">{formatRupiah(initialPrice)}</strong>
                </div>
                {renderBuyNowSection()}
              </>
            )}
          </aside>
        </div>
      </section>

      <section className="detail-body">
        <div className="detail-info-grid">
          <div className="detail-info-stack">
            <div className="spec-section">
              <div className="spec-section-title">
                <Info size={16} /> Deskripsi Kendaraan
              </div>
              <p className="spec-description">{car.description}</p>
            </div>

            <div className="spec-section spec-section-verification">
              <div className="spec-section-title">
                <ShieldCheck size={16} /> Data Verifikasi Kendaraan
              </div>
              <div className="verification-grid">
                {[
                  ['No. Rangka (Chassis)', car.chassis_number || car.car_id || 'N/A'],
                  ['No. Mesin', car.engine_number || 'N/A'],
                ].map(([key, value]) => (
                  <div className="verification-card" key={key}>
                    <div>{key}</div>
                    <strong>{value}</strong>
                  </div>
                ))}
              </div>
              <div className="verification-note">
                <ShieldCheck size={16} />
                <span>Dokumen dan nomor kendaraan telah diverifikasi oleh Tim CarVentory.</span>
              </div>
            </div>
          </div>

          <div className="detail-info-stack">
            <div className="spec-section">
              <div className="spec-section-title">
                <Info size={16} /> Informasi Umum
              </div>
              <div className="spec-grid">
                {[
                  ['Nama Kendaraan', carName],
                  ['Kategori', categoryLabel[car.category] || car.category],
                  ['Lokasi', car.location || 'Jakarta'],
                  ['Harga Awal', formatRupiah(initialPrice)],
                  ['Status Verifikasi', car.is_verified !== false ? 'Terverifikasi' : 'Belum Verifikasi'],
                ].map(([key, value]) => (
                  <div className="spec-row" key={key}>
                    <div className="spec-key">{key}</div>
                    <div
                      className="spec-val"
                      data-tone={key === 'Status Verifikasi' && car.is_verified !== false ? 'success' : undefined}
                    >
                      {value}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hasil lelang — hanya tampil saat ended */}
            {auctionStatus === 'ended' && auction && (
              <div className="spec-section">
                <div className="spec-section-title">
                  <TrendingUp size={16} /> Hasil Lelang
                </div>
                <div className="spec-grid">
                  {[
                    ['Harga Awal', formatRupiah(initialPrice)],
                    ['Harga Akhir', formatRupiah(auction.current_highest_bid)],
                    ['Tanggal Selesai', new Date(auction.end_time).toLocaleDateString('id-ID', {
                      day: 'numeric', month: 'long', year: 'numeric',
                    })],
                    ['Status', car.status === 'sold' ? 'Terjual' : 'Belum Ada Pemenang'],
                  ].map(([key, value]) => (
                    <div className="spec-row" key={key}>
                      <div className="spec-key">{key}</div>
                      <div className="spec-val" data-tone={
                        key === 'Harga Akhir' ? 'accent' :
                        key === 'Status' && car.status === 'sold' ? 'success' : undefined
                      }>
                        {value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="activity-section">
          <div className="activity-section-title">Aktivitas Terkini</div>
          {bids.length > 0 ? (
            <div className="activity-list">
              {bids.slice(0, 4).map((bid, index) => (
                <div className="activity-item" key={bid.id}>
                  <div>
                    <strong>{index === 0 ? 'Penawaran tertinggi' : 'Penawaran masuk'}</strong>
                    <span>{new Date(bid.bid_time).toLocaleTimeString('id-ID')}</span>
                  </div>
                  <b>{formatRupiah(bid.bid_amount)}</b>
                </div>
              ))}
            </div>
          ) : (
            <p className="activity-empty">Belum ada aktivitas penawaran.</p>
          )}
        </div>
      </section>
    </div>
  );
}
