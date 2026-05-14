import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertCircle, ArrowLeft, CheckCircle, Info, MapPin, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAuction } from '../../context/AuctionContext';
import { categoryLabel, formatRupiah } from '../../lib/utils';
import api from '../../lib/api';
import './ReviewCarPage.css';

export default function ReviewCarPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { cars, refreshData } = useAuction();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const car = cars.find((item) => String(item.id) === id);

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="page">
        <div className="empty-state">
          <AlertCircle size={46} className="car-detail-empty-icon" />
          <h3>Akses Admin Diperlukan</h3>
          <button className="btn btn-primary car-detail-empty-action" onClick={() => navigate('/admin')}>
            Kembali
          </button>
        </div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="page">
        <div className="empty-state">
          <AlertCircle size={46} className="car-detail-empty-icon" />
          <h3>Kendaraan tidak ditemukan</h3>
          <button className="btn btn-primary car-detail-empty-action" onClick={() => navigate('/admin')}>
            Kembali ke Admin
          </button>
        </div>
      </div>
    );
  }

  const carName = car.model ? `${car.brand} ${car.model}` : car.name;
  const initialPrice = car.starting_price || car.initial_price;

  const handleVerify = async () => {
    setSaving(true);
    setError('');

    try {
      await api.put(`/cars/${car.id}`, {
        is_verified: true,
        status: 'active',
      });
      await refreshData();
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memverifikasi kendaraan.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="car-detail-page review-car-page">
      <div className="car-detail-topbar">
        <div className="container car-detail-topbar-inner">
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/admin')}>
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
                <span className={`badge cat-${car.category || 'penumpang'}`}>
                  {categoryLabel[car.category] || car.category || 'Penumpang'}
                </span>
              </div>
              <div className="detail-img-caption">
                <h1>{carName}</h1>
                <p>
                  <MapPin size={14} /> {car.location || 'Jakarta'}
                </p>
              </div>
            </div>

          </div>

          <aside className="auction-panel review-panel" aria-label="Panel review">
            <div className="auction-status-line" data-status="upcoming">
              <span className="auction-status-dot" />
              <span>Review Kendaraan</span>
            </div>

            <div className="auction-meta-card">
              <span>Status Saat Ini</span>
              <strong>{car.is_verified === true ? 'Terverifikasi' : 'Belum Diverifikasi'}</strong>
            </div>

            <div className="review-action-copy">
              Periksa data kendaraan, nomor rangka, nomor mesin, gambar, dan deskripsi sebelum menyetujui listing.
            </div>

            {error && (
              <div className="alert alert-error review-alert">
                <AlertCircle size={14} /> {error}
              </div>
            )}

            <button className="btn btn-primary btn-lg review-verify-button" type="button" onClick={handleVerify} disabled={saving}>
              <CheckCircle size={18} />
              {saving ? 'Memverifikasi...' : 'Verifikasi Kendaraan'}
            </button>
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
              <p className="spec-description">{car.description || 'Belum ada deskripsi.'}</p>
            </div>

            <div className="spec-section spec-section-verification review-verification-section">
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
                  ['Kategori', categoryLabel[car.category] || car.category || 'Penumpang'],
                  ['Lokasi', car.location || 'Jakarta'],
                  ['Harga Awal', formatRupiah(initialPrice)],
                  ['Status Verifikasi', car.is_verified === true ? 'Terverifikasi' : 'Belum Verifikasi'],
                ].map(([key, value]) => (
                  <div className="spec-row" key={key}>
                    <div className="spec-key">{key}</div>
                    <div
                      className="spec-val"
                      data-tone={key === 'Harga Awal' ? 'accent' : undefined}
                    >
                      {value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
