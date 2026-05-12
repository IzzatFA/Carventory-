import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatRupiah } from '../lib/mockData';
import CountdownTimer from './CountdownTimer';
import './CarCard.css';

export default function CarCard({ data }) {
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);

  if (!data) return null;

  const {
    id,
    namaMobil,
    hargaAwal,
    hargaTertinggi,
    waktuLelangSelesai,
    gambarMobil,
    lokasi,
    statusLelang
  } = data;

  const handleCardClick = () => {
    navigate(`/cars/${id}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick();
    }
  };

  return (
    <div
      className="card-horizontal clickable-card"
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label={`Lihat detail mobil ${namaMobil}`}
    >
      <div className="card-image-section">
        <img
          src={imgError ? 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600' : gambarMobil}
          alt={namaMobil}
          className="card-img-horizontal"
          onError={() => setImgError(true)}
        />
      </div>

      <div className="card-content-section">
        <h2 className="card-title-lg">{namaMobil}</h2>

        {statusLelang === 'active' && hargaTertinggi > 0 && (
          <div className="highest-bid-box-dark">
            <div className="highest-bid-label-dark">Penawaran Tertinggi</div>
            <div className="highest-bid-value-dark">{formatRupiah(hargaTertinggi)}</div>
          </div>
        )}

        <div className="card-price-lg">{formatRupiah(hargaAwal)}</div>

        {statusLelang === 'active' && waktuLelangSelesai && (
          <CountdownTimer endTime={waktuLelangSelesai} />
        )}

        {lokasi && (
          <div className="card-location">
            {lokasi}
          </div>
        )}
      </div>
    </div>
  );
}