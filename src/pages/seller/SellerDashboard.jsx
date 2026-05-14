import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, CheckCircle, Clock3, Edit, LockKeyhole, Plus, Save, Trash2, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAuction } from '../../context/AuctionContext';
import { formatRupiah } from '../../lib/utils';
import api from '../../lib/api';
import './SellerDashboard.css';

const emptyForm = {
  car_id: '',
  brand: '',
  model: '',
  year: '',
  starting_price: '',
  description: '',
};

const statusCopy = {
  pending: { label: 'Menunggu', className: 'badge-warning', icon: Clock3 },
  active: { label: 'Aktif', className: 'badge-success', icon: CheckCircle },
  sold: { label: 'Terjual', className: 'badge-gray', icon: CheckCircle },
};

export default function SellerDashboard() {
  const { currentUser } = useAuth();
  const { cars, refreshData } = useAuction();
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [editingCar, setEditingCar] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const isSellerAreaAllowed = currentUser?.role === 'seller' || currentUser?.role === 'admin';

  const sellerCars = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'admin') return cars;
    return cars.filter((car) => Number(car.seller_id) === Number(currentUser.id));
  }, [cars, currentUser]);

  const stats = useMemo(() => ({
    total: sellerCars.length,
    pending: sellerCars.filter((car) => car.status === 'pending').length,
    active: sellerCars.filter((car) => car.status === 'active').length,
    sold: sellerCars.filter((car) => car.status === 'sold').length,
  }), [sellerCars]);

  if (!currentUser || !isSellerAreaAllowed) {
    return (
      <div className="page">
        <div className="empty-state">
          <LockKeyhole size={54} strokeWidth={1.5} />
          <h3>Akses Penjual Diperlukan</h3>
          <p>Masuk sebagai seller untuk menambahkan dan mengelola kendaraan.</p>
          <button className="btn btn-primary" type="button" onClick={() => navigate('/login')}>
            Masuk
          </button>
        </div>
      </div>
    );
  }

  const setField = (key) => (event) => {
    setForm((current) => ({ ...current, [key]: event.target.value }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingCar(null);
    setError('');
  };

  const showMessage = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(''), 2500);
  };

  const handleEdit = (car) => {
    setEditingCar(car);
    setForm({
      car_id: car.car_id || '',
      brand: car.brand || '',
      model: car.model || '',
      year: car.year || '',
      starting_price: car.starting_price || '',
      description: car.description || '',
    });
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');

    const payload = {
      car_id: form.car_id || undefined,
      brand: form.brand.trim(),
      model: form.model.trim(),
      year: Number(form.year),
      starting_price: Number(form.starting_price),
      description: form.description.trim() || undefined,
    };

    try {
      if (editingCar) {
        await api.put(`/cars/${editingCar.id}`, payload);
        showMessage('Kendaraan berhasil diperbarui.');
      } else {
        await api.post('/cars', payload);
        showMessage('Kendaraan berhasil ditambahkan. Status awal: menunggu.');
      }

      await refreshData();
      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menyimpan kendaraan.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (car) => {
    const confirmed = window.confirm(`Hapus ${car.brand} ${car.model}?`);
    if (!confirmed) return;

    try {
      await api.delete(`/cars/${car.id}`);
      await refreshData();
      showMessage('Kendaraan berhasil dihapus.');
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menghapus kendaraan.');
    }
  };

  return (
    <div className="page seller-page">
      <div className="seller-header">
        <div>
          <h1 className="page-title">Dashboard Seller</h1>
          <p className="page-sub">Kelola kendaraan yang akan masuk ke katalog lelang.</p>
        </div>
        {message && <div className="alert alert-success">{message}</div>}
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <Car size={28} />
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Kendaraan</div>
        </div>
        <div className="stat-card">
          <Clock3 size={28} />
          <div className="stat-value" style={{ color: 'var(--warning)' }}>{stats.pending}</div>
          <div className="stat-label">Menunggu</div>
        </div>
        <div className="stat-card">
          <CheckCircle size={28} />
          <div className="stat-value" style={{ color: 'var(--success)' }}>{stats.active}</div>
          <div className="stat-label">Aktif</div>
        </div>
        <div className="stat-card">
          <CheckCircle size={28} />
          <div className="stat-value" style={{ color: 'var(--text3)' }}>{stats.sold}</div>
          <div className="stat-label">Terjual</div>
        </div>
      </div>

      <div className="seller-layout">
        <section className="seller-panel">
          <div className="seller-panel-header">
            <h2>{editingCar ? 'Edit Kendaraan' : 'Tambah Kendaraan'}</h2>
            {editingCar && (
              <button className="btn btn-ghost btn-sm" type="button" onClick={resetForm}>
                <X size={14} />
                Batal
              </button>
            )}
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <form className="seller-form" onSubmit={handleSubmit}>
            <div className="seller-form-grid">
              <label>
                <span className="input-label">Kode Mobil</span>
                <input className="input" value={form.car_id} onChange={setField('car_id')} placeholder="CV-001" />
              </label>
              <label>
                <span className="input-label">Brand</span>
                <input className="input" value={form.brand} onChange={setField('brand')} placeholder="Toyota" required />
              </label>
              <label>
                <span className="input-label">Model</span>
                <input className="input" value={form.model} onChange={setField('model')} placeholder="Supra" required />
              </label>
              <label>
                <span className="input-label">Tahun</span>
                <input className="input" type="number" min="1900" value={form.year} onChange={setField('year')} required />
              </label>
              <label>
                <span className="input-label">Harga Awal</span>
                <input className="input" type="number" min="1" value={form.starting_price} onChange={setField('starting_price')} required />
              </label>
            </div>

            <label>
              <span className="input-label">Deskripsi</span>
              <textarea
                className="input seller-textarea"
                value={form.description}
                onChange={setField('description')}
                placeholder="Kondisi, catatan servis, kelengkapan dokumen..."
              />
            </label>

            <button className="btn btn-primary" type="submit" disabled={saving}>
              {editingCar ? <Save size={16} /> : <Plus size={16} />}
              {saving ? 'Menyimpan...' : editingCar ? 'Simpan Perubahan' : 'Tambah Kendaraan'}
            </button>
          </form>
        </section>

        <section className="seller-panel">
          <div className="seller-panel-header">
            <h2>Kendaraan Saya</h2>
            <span className="badge badge-orange">{sellerCars.length} unit</span>
          </div>

          {sellerCars.length === 0 ? (
            <div className="empty-state seller-empty">
              <Car size={54} strokeWidth={1.5} />
              <h3>Belum Ada Kendaraan</h3>
              <p>Tambahkan kendaraan pertama untuk mulai masuk proses listing.</p>
            </div>
          ) : (
            <div className="seller-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Kendaraan</th>
                    <th>Harga Awal</th>
                    <th>Status</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {sellerCars.map((car) => {
                    const status = statusCopy[car.status] || statusCopy.pending;
                    const StatusIcon = status.icon;

                    return (
                      <tr key={car.id}>
                        <td>
                          <strong>{car.brand} {car.model}</strong>
                          <small className="seller-car-meta">{car.year} {car.car_id ? `- ${car.car_id}` : ''}</small>
                        </td>
                        <td className="seller-price">{formatRupiah(car.starting_price)}</td>
                        <td>
                          <span className={`badge ${status.className}`}>
                            <StatusIcon size={12} />
                            {status.label}
                          </span>
                        </td>
                        <td>
                          <div className="seller-actions">
                            <button className="btn btn-ghost btn-sm" type="button" onClick={() => handleEdit(car)}>
                              <Edit size={13} />
                              Edit
                            </button>
                            <button className="btn btn-danger btn-sm" type="button" onClick={() => handleDelete(car)}>
                              <Trash2 size={13} />
                              Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
