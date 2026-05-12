import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle, Gavel, Info, MapPin, ShieldCheck, TrendingUp } from 'lucide-react';
import { mockCars, formatRupiah, categoryLabel } from '../lib/mockData';
import { useAuth } from '../context/AuthContext';
import { useAuction } from '../context/AuctionContext';
import BidTimer from '../components/BidTimer';
import './CarDetailPage.css';

export default function CarDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { auctions, getAuctionBids, placeBid } = useAuction();

  const car = mockCars.find((c) => c.id === id);
  const auction = auctions.find((a) => a.car_id === id);
  const bids = auction ? getAuctionBids(auction.id) : [];

  const [bidAmount, setBidAmount] = useState('');
  const [bidError, setBidError] = useState('');
  const [bidSuccess, setBidSuccess] = useState('');

  if (!car) {
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

  const minBid = auction ? (auction.current_highest_bid || car.initial_price) + 500000 : car.initial_price;
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

  const handleBidSubmit = (event) => {
    event.preventDefault();
    setBidError('');
    setBidSuccess('');

    if (!auction || auction.status !== 'active') return;
    if (!currentUser) {
      navigate('/login');
      return;
    }
    if (!currentUser.is_verified) {
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

    const result = placeBid(auction.id, currentUser.id, car.id, amount, currentUser.deposit_balance);
    if (!result.success) {
      setBidError(result.error);
      return;
    }

    setBidSuccess(`Penawaran ${formatRupiah(amount)} berhasil masuk.`);
    setBidAmount('');
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
                src={car.image_url}
                alt={car.name}
                className="detail-img"
                onError={(event) => {
                  event.currentTarget.src = 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=900';
                }}
              />
              <div className="detail-img-badges">
                <span className={`badge cat-${car.category}`}>{categoryLabel[car.category]}</span>
                {car.is_verified && <span className="badge badge-success">Terverifikasi</span>}
                {auction?.status === 'active' && (
                  <span className="badge badge-success detail-live-badge">
                    <span className="live-dot" /> LIVE
                  </span>
                )}
              </div>
              <div className="detail-img-caption">
                <h1>{car.name}</h1>
                <p>
                  <MapPin size={14} /> {car.location}
                </p>
              </div>
            </div>

            <div className="detail-highlight-grid">
              <div className="detail-highlight-card">
                <span>Kategori</span>
                <strong>{categoryLabel[car.category]}</strong>
              </div>
              <div className="detail-highlight-card">
                <span>Harga Awal</span>
                <strong>{formatRupiah(car.initial_price)}</strong>
              </div>
              <div className="detail-highlight-card">
                <span>Status</span>
                <strong>{car.is_verified ? 'Terverifikasi' : 'Pending'}</strong>
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

                {auction.status === 'ended' && (
                  <div className="auction-ended-note">Lelang kendaraan ini telah selesai.</div>
                )}
              </>
            ) : (
              <div className="auction-empty-note">Belum ada jadwal lelang untuk kendaraan ini.</div>
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
                  ['No. Rangka (Chassis)', car.chassis_number],
                  ['No. Mesin', car.engine_number],
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
                  ['Nama Kendaraan', car.name],
                  ['Kategori', categoryLabel[car.category]],
                  ['Lokasi', car.location],
                  ['Harga Awal', formatRupiah(car.initial_price)],
                  ['Status Verifikasi', car.is_verified ? 'Terverifikasi' : 'Belum Verifikasi'],
                ].map(([key, value]) => (
                  <div className="spec-row" key={key}>
                    <div className="spec-key">{key}</div>
                    <div
                      className="spec-val"
                      data-tone={
                        key === 'Harga Awal' ? 'accent' : key === 'Status Verifikasi' && car.is_verified ? 'success' : undefined
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
                    ['Harga Awal', formatRupiah(car.initial_price)],
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
                    <span>{new Date(bid.timestamp).toLocaleTimeString('id-ID')}</span>
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
