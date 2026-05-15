import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertCircle, ArrowLeft, ImagePlus, RotateCcw, Save, ShieldCheck, XCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAuction } from '../../context/AuctionContext';
import { categoryLabel, formatRupiah } from '../../lib/utils';
import api from '../../lib/api';
import './EditCarPage.css';

const emptyForm = {
  brand: '',
  model: '',
  year: '',
  chassis_number: '',
  engine_number: '',
  starting_price: '',
  buy_now_price: '',
  image_url: '',
  location: '',
  description: '',
  category: 'penumpang',
};

const categories = [
  { value: 'penumpang', label: 'Penumpang' },
  { value: 'mewah', label: 'Mewah' },
  { value: 'klasik', label: 'Klasik' },
];

const onlyDigits = (value) => String(value || '').replace(/\D/g, '');

const formatRupiahInput = (value) => {
  const digits = onlyDigits(value);
  return digits ? formatRupiah(Number(digits)) : '';
};

export default function EditCarPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { cars, refreshData } = useAuction();
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [resubmitting, setResubmitting] = useState(false);
  const [error, setError] = useState('');

  const car = cars.find((item) => String(item.id) === id);
  const canEdit = currentUser && car && (
    currentUser.role === 'admin' || Number(car.seller_id) === Number(currentUser.id)
  );

  useEffect(() => {
    if (!car) return;

    setForm({
      brand: car.brand || '',
      model: car.model || '',
      year: car.year || '',
      chassis_number: car.chassis_number || '',
      engine_number: car.engine_number || '',
      starting_price: onlyDigits(car.starting_price),
      buy_now_price: onlyDigits(car.buy_now_price || car.direct_buy_price || car.final_price),
      image_url: car.image_url || '',
      location: car.location || '',
      description: car.description || '',
      category: car.category || 'penumpang',
    });
  }, [car]);

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  if (!currentUser) {
    return (
      <div className="page">
        <div className="empty-state">
          <AlertCircle size={46} className="car-detail-empty-icon" />
          <h3>Login Diperlukan</h3>
          <button className="btn btn-primary car-detail-empty-action" onClick={() => navigate('/login')}>
            Masuk
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
          <button className="btn btn-primary car-detail-empty-action" onClick={() => navigate('/seller')}>
            Kembali ke Seller
          </button>
        </div>
      </div>
    );
  }

  if (!canEdit) {
    return (
      <div className="page">
        <div className="empty-state">
          <AlertCircle size={46} className="car-detail-empty-icon" />
          <h3>Akses Ditolak</h3>
          <p>Kendaraan ini bukan milik akun seller yang sedang login.</p>
          <button className="btn btn-primary car-detail-empty-action" onClick={() => navigate('/seller')}>
            Kembali
          </button>
        </div>
      </div>
    );
  }

  const carName = car.model ? `${car.brand} ${car.model}` : car.name;
  const isVerified = car.is_verified === true;
  const isRejected = car.status === 'rejected';
  const statusTone = isRejected ? 'rejected' : isVerified ? 'active' : 'upcoming';
  const statusLabel = isRejected ? 'Ditolak' : isVerified ? 'Sudah Diverifikasi' : 'Belum Diverifikasi';
  const statusCopy = isRejected
    ? 'Listing ini ditolak admin. Perbaiki data kendaraan, lalu ajukan kembali untuk masuk antrean review.'
    : isVerified
      ? 'Kendaraan ini sudah diverifikasi oleh admin dan dapat tampil sebagai listing aktif.'
      : 'Kendaraan masih menunggu review admin. Perubahan data dapat membuat admin perlu mengecek ulang.';

  const setField = (key) => (event) => {
    setForm((current) => ({ ...current, [key]: event.target.value }));
  };

  const setPriceField = (key) => (event) => {
    setForm((current) => ({ ...current, [key]: onlyDigits(event.target.value) }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0] || null;
    setImageFile(file);

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setImagePreview(file ? URL.createObjectURL(file) : '');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');

    const payload = new FormData();
    Object.entries({
      brand: form.brand.trim(),
      model: form.model.trim(),
      year: form.year,
      chassis_number: form.chassis_number,
      engine_number: form.engine_number,
      starting_price: form.starting_price,
      buy_now_price: form.buy_now_price,
      location: form.location.trim(),
      description: form.description.trim(),
      category: form.category,
    }).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        payload.append(key, value);
      }
    });

    if (imageFile) {
      payload.append('image', imageFile);
    }

    try {
      await api.put(`/cars/${car.id}`, payload);
      await refreshData();
      navigate('/seller');
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menyimpan perubahan kendaraan.');
    } finally {
      setSaving(false);
    }
  };

  const handleResubmit = async () => {
    setResubmitting(true);
    setError('');

    try {
      await api.put(`/cars/${car.id}`, { status: 'pending' });
      await refreshData();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengajukan ulang kendaraan.');
    } finally {
      setResubmitting(false);
    }
  };

  return (
    <div className="car-detail-page edit-car-page">
      <div className="car-detail-topbar">
        <div className="container car-detail-topbar-inner">
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/seller')}>
            <ArrowLeft size={14} /> Kembali
          </button>
        </div>
      </div>

      <div className="edit-page-heading">
        <h1>Edit Kendaraan</h1>
      </div>

      <section className="detail-hero">
        <div className="detail-hero-inner">
          <div className="detail-showcase">
            <div className="detail-img-wrap">
              <img
                src={imagePreview || form.image_url || car.image_url}
                alt={carName}
                className="detail-img"
                onError={(event) => {
                  event.currentTarget.src = 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=900';
                }}
              />
              <div className="detail-img-badges">
                <span className={`badge cat-${form.category || 'penumpang'}`}>
                  {categoryLabel[form.category] || form.category || 'Penumpang'}
                </span>
              </div>
              <div className="detail-img-caption">
                <h1>{form.brand && form.model ? `${form.brand} ${form.model}` : carName}</h1>
              </div>
            </div>

          </div>

          <aside className="auction-panel edit-status-panel" aria-label="Status verifikasi">
            <div className="auction-status-line" data-status={statusTone}>
              <span className="auction-status-dot" />
              <span>Status Kendaraan</span>
            </div>

            <div className="auction-meta-card">
              <span>Verifikasi Admin</span>
              <strong>{statusLabel}</strong>
            </div>

            <div className="edit-status-copy">
              {statusCopy}
            </div>

            <div className={`edit-status-badge ${isRejected ? 'rejected' : isVerified ? 'verified' : 'pending'}`}>
              {isRejected ? <XCircle size={18} /> : <ShieldCheck size={18} />}
              {isRejected ? 'Ditolak Admin' : isVerified ? 'Terverifikasi' : 'Menunggu Verifikasi'}
            </div>

            {isRejected && (
              <button
                className="btn btn-primary edit-resubmit-button"
                type="button"
                onClick={handleResubmit}
                disabled={resubmitting || saving}
              >
                <RotateCcw size={16} />
                {resubmitting ? 'Mengajukan...' : 'Ajukan Kembali'}
              </button>
            )}
          </aside>
        </div>
      </section>

      <section className="detail-body edit-form-body">
        <form className="edit-car-form" onSubmit={handleSubmit}>
          {error && (
            <div className="alert alert-error">
              <AlertCircle size={14} /> {error}
            </div>
          )}

          <div className="edit-form-fields">
            <section className="edit-form-section edit-image-section">
              <h3>Gambar Kendaraan</h3>
              <label className="edit-image-upload">
                {imagePreview ? (
                  <img className="edit-upload-preview" src={imagePreview} alt="Preview gambar kendaraan" />
                ) : (
                  <ImagePlus size={54} strokeWidth={1.8} />
                )}
                <span>{imageFile ? imageFile.name : 'Pilih gambar untuk bucket car-images'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </label>
            </section>

            <section className="edit-form-section">
              <h3>Informasi Kendaraan</h3>
              <div className="edit-input-grid three">
                <label>
                  <span className="input-label">Merk</span>
                  <input className="input" value={form.brand} onChange={setField('brand')} required />
                </label>

                <label>
                  <span className="input-label">Model</span>
                  <input className="input" value={form.model} onChange={setField('model')} required />
                </label>

                <label>
                  <span className="input-label">Tahun</span>
                  <input className="input" type="number" min="1900" value={form.year} onChange={setField('year')} required />
                </label>

                <label>
                  <span className="input-label">Kategori</span>
                  <select className="input" value={form.category} onChange={setField('category')}>
                    {categories.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  <span className="input-label">Lokasi</span>
                  <input className="input" value={form.location} onChange={setField('location')} />
                </label>

                <label>
                  <span className="input-label">No. Rangka</span>
                  <input className="input" value={form.chassis_number} onChange={setField('chassis_number')} />
                </label>

                <label>
                  <span className="input-label">No. Mesin</span>
                  <input className="input" value={form.engine_number} onChange={setField('engine_number')} />
                </label>
              </div>
            </section>

            <div className="edit-section-pair">
              <section className="edit-form-section">
                <h3>Spesifikasi Kendaraan</h3>
                <label>
                  <span className="input-label">Deskripsi</span>
                  <textarea className="input edit-textarea" value={form.description} onChange={setField('description')} />
                </label>
              </section>

              <section className="edit-form-section edit-price-section">
                <h3>Harga Kendaraan</h3>
                <label>
                  <span className="input-label">Harga Awal</span>
                  <input
                    className="input"
                    inputMode="numeric"
                    value={formatRupiahInput(form.starting_price)}
                    onChange={setPriceField('starting_price')}
                    required
                  />
                </label>

                <label>
                  <span className="input-label">Harga Langsung Beli</span>
                  <input
                    className="input"
                    inputMode="numeric"
                    value={formatRupiahInput(form.buy_now_price)}
                    onChange={setPriceField('buy_now_price')}
                  />
                </label>
              </section>
            </div>
          </div>

          <button className="btn btn-primary edit-save-button" type="submit" disabled={saving}>
            <Save size={16} />
            {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </form>
      </section>
    </div>
  );
}
