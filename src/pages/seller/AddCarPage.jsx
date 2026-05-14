import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft, ImagePlus, Save } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAuction } from '../../context/AuctionContext';
import { formatRupiah } from '../../lib/utils';
import api from '../../lib/api';
import './AddCarPage.css';

const emptyForm = {
  brand: '',
  model: '',
  year: '',
  category: 'penumpang',
  location: '',
  chassis_number: '',
  engine_number: '',
  starting_price: '',
  buy_now_price: '',
  description: '',
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

export default function AddCarPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { refreshData } = useAuction();
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  if (!currentUser || (currentUser.role !== 'seller' && currentUser.role !== 'admin')) {
    return (
      <div className="page">
        <div className="empty-state">
          <AlertCircle size={46} className="car-detail-empty-icon" />
          <h3>Akses Penjual Diperlukan</h3>
          <button className="btn btn-primary car-detail-empty-action" onClick={() => navigate('/login')}>
            Masuk
          </button>
        </div>
      </div>
    );
  }

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
      category: form.category,
      location: form.location.trim(),
      chassis_number: form.chassis_number,
      engine_number: form.engine_number,
      starting_price: form.starting_price,
      buy_now_price: form.buy_now_price,
      description: form.description.trim(),
    }).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        payload.append(key, value);
      }
    });

    if (imageFile) {
      payload.append('image', imageFile);
    }

    try {
      await api.post('/cars', payload);
      await refreshData();
      navigate('/seller');
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menambahkan kendaraan.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="car-detail-page edit-car-page add-car-page">
      <div className="car-detail-topbar">
        <div className="container car-detail-topbar-inner">
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/seller')}>
            <ArrowLeft size={14} /> Kembali
          </button>
        </div>
      </div>

      <div className="edit-page-heading">
        <h1>Tambah Kendaraan</h1>
      </div>

      <section className="detail-body edit-form-body add-form-body">
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
                <input type="file" accept="image/*" onChange={handleImageChange} />
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
                  <input className="input" inputMode="numeric" value={formatRupiahInput(form.starting_price)} onChange={setPriceField('starting_price')} required />
                </label>

                <label>
                  <span className="input-label">Harga Langsung Beli</span>
                  <input className="input" inputMode="numeric" value={formatRupiahInput(form.buy_now_price)} onChange={setPriceField('buy_now_price')} />
                </label>
              </section>
            </div>
          </div>

          <button className="btn btn-primary edit-save-button" type="submit" disabled={saving}>
            <Save size={16} />
            {saving ? 'Menyimpan...' : 'Tambah Kendaraan'}
          </button>
        </form>
      </section>
    </div>
  );
}
