import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle, Gavel, Info, MapPin, ShieldCheck, ShoppingCart, TrendingUp } from 'lucide-react';
import { formatRupiah, categoryLabel } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { useAuction } from '../context/AuctionContext';
import BidTimer from '../components/BidTimer';
import './CarDetailPage.css';

export default function CarDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, buyNow } = useAuth();
  const { cars, auctions, getAuctionBids, placeBid, refreshData } = useAuction();

  const car = cars.find((c) => String(c.id) === id);
  const auction = auctions.find((a) => String(a.car_id) === id);
  const bids = auction ? getAuctionBids(auction.id) : [];
  const canViewPendingCar = currentUser && (
    currentUser.role === 'admin' || Number(car?.seller_id) === Number(currentUser.id)
  );

  const [bidAmount, setBidAmount] = useState('');
  const [bidError, setBidError] = useState('');
  const [bidSuccess, setBidSuccess] = useState('');
  const [buyNowMessage, setBuyNowMessage] = useState('');
  const [buyNowError, setBuyNowError] = useState('');
  const [buyNowLoading, setBuyNowLoading] = useState(false);

  if (!car || ((car.is_verified !== true && car.status !== 'active') && !canViewPendingCar)) {
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
  const minBid = auction ? (Number(auction.current_highest_bid) || initialPrice) + 500000 : initialPrice;
  const statusMap = {
    active: 'Lelang Aktif',
    upcoming: 'Segera Dibuka',
    ended: 'Lelang Berakhir',
  };
  const auctionStatus = auction ? statusMap[auction.status] : null;

  const handleBidChange = (event) => {
    setBidAmount(event.target.value.replace(/\D/g, ''));
    setBidError('');
    setBidSuccess('');
  };

  const handleBuyNow = async () => {
    setBuyNowError('');
    setBuyNowMessage('');

    if (!currentUser) {
      navigate('/login');
      return;
    }

    if (!hasBuyNowPrice) {
      setBuyNowError('Harga langsung beli belum tersedia.');
      return;
    }

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

    if (!result.success) {
      setBuyNowError(result.error);
      return;
    }

    setBuyNowMessage(`Pembelian berhasil! ${formatRupiah(buyNowPrice)} telah dikurangi dari saldo Anda.`);
    await refreshData();
  };

  const handleBidSubmit = async (event) => {
    event.preventDefault();
    setBidError('');
    setBidSuccess('');

    if (!auction || auction.status !== 'active') return;
    if (!currentUser) {
      navigate('/login');
      return;
    }
    if (currentUser.is_verified === false) {
      setBidError('Akun Anda belum diverifikasi admin.');
      return;
    }

    const amount = Number(bidAmount);
    if (!amount) {
      setBidError('Masukkan jumlah penawaran terlebih dahulu.');
      return;
    }
    if (amount < minBid) {
      setBidError(`Penawaran minimum adalah ${formatRupiah(minBid)}.`);
      return;
    }

    const result = await placeBid(auction.id, amount);
    if (!result.success) {
      setBidError(result.error);
      return;
    }

    setBidSuccess(`Penawaran ${formatRupiah(amount)} berhasil masuk.`);
    setBidAmount('');
  };

  const renderBuyNowSection = () => (
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
        disabled={!hasBuyNowPrice || buyNowLoading || car.status === 'sold'}
      >
        <ShoppingCart size={18} />
        {buyNowLoading ? 'Memproses...' : car.status === 'sold' ? 'Sudah Terjual' : currentUser ? 'Beli Sekarang' : 'Masuk untuk Membeli'}
      </button>
    </div>
  );

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
                src={car.image_url}
                alt={carName}
                className="detail-img"
                onError={(event) => {
                  event.currentTarget.src = 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=900';
                }}
              />
              <div className="detail-img-badges">
                <span className={`badge cat-${car.category}`}>{categoryLabel[car.category] || car.category}</span>
                {car.is_verified !== false && <span className="badge badge-success">Terverifikasi</span>}
                {auction?.status === 'active' && (
                  <span className="badge badge-success detail-live-badge">
                    <span className="live-dot" /> LIVE
                  </span>
                )}
              </div>
              <div className="detail-img-caption">
                <h1>{carName}</h1>
                <p>
                  <MapPin size={14} /> {car.location || 'Jakarta Barat'}
                </p>
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
            {auction ? (
              <>
                <div className="auction-status-line" data-status={auction.status}>
                  <span className="auction-status-dot" />
                  <span>{auctionStatus}</span>
                </div>

                {auction.status === 'active' && (
                  <div className="auction-timer-block">
                    <span>Lelang selesai dalam</span>
                    <BidTimer endTime={auction.end_time} />
                  </div>
                )}

                {auction.status === 'upcoming' && (
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
                  <span>{auction.status === 'ended' ? 'Harga akhir' : 'Bid paling besar'}</span>
                  <strong>{formatRupiah(auction.current_highest_bid)}</strong>
                </div>

                {auction.status === 'active' && (
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
                    <button className="btn btn-primary btn-lg detail-bid-button" type="submit">
                      <Gavel size={18} /> {currentUser ? 'Masukkan' : 'Masuk untuk Menawar'}
                    </button>
                  </form>
                )}

                {auction.status !== 'ended' && renderBuyNowSection()}

                {auction.status === 'ended' && (
                  <div className="auction-ended-note">Lelang kendaraan ini telah selesai.</div>
                )}
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
                      data-tone={
                        key === 'Status Verifikasi' && car.is_verified !== false ? 'success' : undefined
                      }
                    >
                      {value}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {auction?.status === 'ended' && (
              <div className="spec-section">
                <div className="spec-section-title">
                  <TrendingUp size={16} /> Hasil Lelang
                </div>
                <div className="spec-grid">
                  {[
                    ['Harga Awal', formatRupiah(initialPrice)],
                    ['Harga Akhir', formatRupiah(auction.current_highest_bid)],
                    [
                      'Tanggal Selesai',
                      new Date(auction.end_time).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      }),
                    ],
                    ['Status', 'Terjual'],
                  ].map(([key, value]) => (
                    <div className="spec-row" key={key}>
                      <div className="spec-key">{key}</div>
                      <div className="spec-val" data-tone={key === 'Harga Akhir' ? 'accent' : key === 'Status' ? 'success' : undefined}>
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
                    <span>{new Date(bid.bid_time || bid.timestamp).toLocaleTimeString('id-ID')}</span>
                  </div>
                  <b>{formatRupiah(bid.bid_amount || bid.bid_ammount)}</b>
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
