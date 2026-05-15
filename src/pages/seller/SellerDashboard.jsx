import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, CheckCircle, Clock3, Edit, LockKeyhole, Plus, Trash2, XCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAuction } from '../../context/AuctionContext';
import { formatRupiah } from '../../lib/utils';
import api from '../../lib/api';
import './SellerDashboard.css';

const PAGE_SIZE = 15;

const statusCopy = {
  pending: { label: 'Menunggu', className: 'badge-warning', icon: Clock3 },
  active: { label: 'Aktif', className: 'badge-success', icon: CheckCircle },
  sold: { label: 'Terjual', className: 'badge-gray', icon: CheckCircle },
  rejected: { label: 'Ditolak', className: 'badge-danger', icon: XCircle },
};

export default function SellerDashboard() {
  const { currentUser } = useAuth();
  const { cars, refreshData } = useAuction();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const isSellerAreaAllowed = currentUser?.role === 'seller' || currentUser?.role === 'admin';

  const sellerCars = useMemo(() => {
    if (!currentUser) return [];
    return cars.filter((car) => Number(car.seller_id) === Number(currentUser.id));
  }, [cars, currentUser]);

  const totalPages = Math.max(1, Math.ceil(sellerCars.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedCars = sellerCars.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

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

  const showMessage = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(''), 2500);
  };

  const handleDelete = async (car) => {
    const confirmed = window.confirm(`Hapus ${car.brand} ${car.model}?`);
    if (!confirmed) return;

    try {
      setError('');
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

      {error && <div className="alert alert-error">{error}</div>}

      <section className="seller-panel seller-list-panel">
        <div className="seller-panel-header seller-table-header">
          <div>
            <h2>Kendaraan Saya</h2>
            <span className="seller-table-sub">{sellerCars.length} unit terdaftar</span>
          </div>
          <button className="btn btn-primary" type="button" onClick={() => navigate('/seller/cars/add')}>
            <Plus size={15} />
            Tambah Kendaraan
          </button>
        </div>

        {sellerCars.length === 0 ? (
          <div className="empty-state seller-empty">
            <Car size={54} strokeWidth={1.5} />
            <h3>Belum Ada Kendaraan</h3>
            <p>Tambahkan kendaraan pertama untuk mulai masuk proses listing.</p>
          </div>
        ) : (
          <>
            <div className="seller-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Gambar</th>
                    <th>Kendaraan</th>
                    <th>Harga Awal</th>
                    <th>Harga Langsung Beli</th>
                    <th>Status</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedCars.map((car) => {
                    const status = statusCopy[car.status] || statusCopy.pending;
                    const StatusIcon = status.icon;
                    const carName = car.model ? `${car.brand} ${car.model}` : car.name;

                    return (
                      <tr key={car.id}>
                        <td>
                          {car.image_url ? (
                            <img className="seller-car-thumb" src={car.image_url} alt={carName} />
                          ) : (
                            <div className="seller-car-thumb placeholder">
                              <Car size={18} />
                            </div>
                          )}
                        </td>
                        <td>
                          <strong>{carName}</strong>
                          <small className="seller-car-meta">{car.year} {car.car_id ? `- ${car.car_id}` : ''}</small>
                        </td>
                        <td className="seller-price">{formatRupiah(car.starting_price)}</td>
                        <td className="seller-price muted">{car.buy_now_price ? formatRupiah(car.buy_now_price) : '-'}</td>
                        <td>
                          <span className={`badge ${status.className}`}>
                            <StatusIcon size={12} />
                            {status.label}
                          </span>
                        </td>
                        <td>
                          <div className="seller-actions">
                            <button className="btn btn-ghost btn-sm" type="button" onClick={() => navigate(`/seller/cars/${car.id}/edit`)}>
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

            <div className="seller-pagination">
              <button
                className="btn btn-ghost btn-sm"
                type="button"
                disabled={currentPage === 1}
                onClick={() => setPage((value) => Math.max(1, value - 1))}
              >
                Sebelumnya
              </button>
              <span>Halaman {currentPage} dari {totalPages}</span>
              <button
                className="btn btn-ghost btn-sm"
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
              >
                Berikutnya
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
