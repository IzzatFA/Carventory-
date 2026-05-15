import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ban, ShieldCheck, ShieldOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAuction } from '../../context/AuctionContext';
import { formatRupiah, categoryLabel } from '../../lib/utils';
import api from '../../lib/api';
import './AdminDashboard.css';

const tabs = [
  ['overview', 'Overview'],
  ['pending', 'Pending'],
  ['cars', 'Kendaraan'],
  ['users', 'Pengguna'],
  ['auctions', 'Lelang'],
];

const PAGE_SIZE = 15;

const getPagedRows = (rows, page) => {
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;

  return {
    currentPage,
    totalPages,
    rows: rows.slice(start, start + PAGE_SIZE),
  };
};

function AdminPagination({ currentPage, totalPages, onPageChange }) {
  return (
    <div className="admin-pagination">
      <button
        className="btn btn-ghost btn-sm"
        type="button"
        disabled={currentPage === 1}
        onClick={() => onPageChange((value) => Math.max(1, value - 1))}
      >
        Sebelumnya
      </button>
      <span>Halaman {currentPage} dari {totalPages}</span>
      <button
        className="btn btn-ghost btn-sm"
        type="button"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange((value) => Math.min(totalPages, value + 1))}
      >
        Berikutnya
      </button>
    </div>
  );
}

export default function AdminDashboard() {
  const { currentUser } = useAuth();
  const { cars, auctions } = useAuction();
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [overviewCarsPage, setOverviewCarsPage] = useState(1);
  const [pendingPage, setPendingPage] = useState(1);
  const [carsPage, setCarsPage] = useState(1);
  const [usersPage, setUsersPage] = useState(1);
  const [auctionsPage, setAuctionsPage] = useState(1);

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'admin') return;

    api.get('/users')
      .then((res) => setUsers(res.data.data || []))
      .catch((err) => console.error('Failed to fetch users', err));
  }, [currentUser]);

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="page">
        <div className="empty-state">
          <div className="empty-state-icon">Locked</div>
          <h3>Akses Admin Diperlukan</h3>
          <button className="btn btn-primary" type="button" onClick={() => navigate('/')}>
            Kembali
          </button>
        </div>
      </div>
    );
  }

  const activeAuctions = auctions.filter((auction) => auction.status === 'active').length;
  const verifiedUsers = users.filter((user) => user.is_verified !== false && user.role !== 'admin').length;
  const regularUsers = users.filter((user) => user.role !== 'admin');
  const pendingCars = cars.filter((car) => car.status === 'pending' || (car.is_verified === false && car.status !== 'rejected'));
  const latestCars = cars.slice().reverse();
  const latestCarsPage = getPagedRows(latestCars, overviewCarsPage);
  const pendingCarsPage = getPagedRows(pendingCars, pendingPage);
  const allCarsPage = getPagedRows(cars, carsPage);
  const regularUsersPage = getPagedRows(regularUsers, usersPage);
  const auctionsListPage = getPagedRows(auctions, auctionsPage);

  const toggleVerify = (user) => {
    setUsers((prev) => prev.map((item) =>
      item.id === user.id ? { ...item, is_verified: !item.is_verified } : item
    ));
  };

  const toggleSuspend = (user) => {
    setUsers((prev) => prev.map((item) =>
      item.id === user.id ? { ...item, is_suspended: !item.is_suspended } : item
    ));
  };

  return (
    <div className="page admin-page">
      <div className="admin-header">
        <div>
          <h1 className="page-title">Dashboard Admin</h1>
          <p className="page-sub">Pantau sistem CarVentory dan kelola data utama.</p>
        </div>
        <button className="btn btn-primary" type="button" onClick={() => navigate('/seller')}>
          Kelola Kendaraan
        </button>
      </div>

      <div className="stats-grid">
        {[
          { label: 'Total Kendaraan', value: cars.length, color: 'var(--orange)' },
          { label: 'Pending Review', value: pendingCars.length, color: 'var(--danger)' },
          { label: 'Lelang Aktif', value: activeAuctions, color: 'var(--success)' },
          { label: 'User Terverifikasi', value: verifiedUsers, color: 'var(--info)' },
        ].map(({ label, value, color }) => (
          <div className="stat-card" key={label}>
            <div className="stat-value" style={{ color }}>{value}</div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>

      <div className="admin-tabs">
        {tabs.map(([id, label]) => (
          <button
            key={id}
            className={`admin-tab ${tab === id ? 'active' : ''}`}
            type="button"
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="admin-overview-grid">
          <section className="admin-panel">
            <h2>Kendaraan Terbaru</h2>
            {latestCars.length === 0 ? (
              <div className="admin-empty-cell">Belum ada kendaraan.</div>
            ) : (
              <>
                {latestCarsPage.rows.map((car) => (
                  <article className="admin-list-item" key={car.id}>
                    {car.image_url && <img className="admin-car-thumb" src={car.image_url} alt="" />}
                    <div className="admin-list-body">
                      <strong>{car.model ? `${car.brand} ${car.model}` : car.name}</strong>
                      <span>{formatRupiah(car.starting_price || car.initial_price)}</span>
                    </div>
                    <span className={`badge cat-${car.category || 'penumpang'}`}>
                      {categoryLabel[car.category] || car.category || 'Penumpang'}
                    </span>
                  </article>
                ))}
                <AdminPagination
                  currentPage={latestCarsPage.currentPage}
                  totalPages={latestCarsPage.totalPages}
                  onPageChange={setOverviewCarsPage}
                />
              </>
            )}
          </section>

          <section className="admin-panel">
            <h2>Status Lelang</h2>
            {[
              ['Aktif', auctions.filter((auction) => auction.status === 'active').length, 'var(--success)'],
              ['Segera', auctions.filter((auction) => auction.status === 'upcoming').length, 'var(--info)'],
              ['Selesai', auctions.filter((auction) => auction.status === 'ended').length, 'var(--text3)'],
            ].map(([label, count, color]) => (
              <div className="admin-status-row" key={label}>
                <span>{label}</span>
                <strong style={{ color }}>{count}</strong>
              </div>
            ))}
          </section>
        </div>
      )}

      {tab === 'pending' && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Kendaraan</th>
                <th>Kategori</th>
                <th>Harga Awal</th>
                <th>No. Rangka</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {pendingCars.length === 0 ? (
                <tr>
                  <td colSpan="6" className="admin-empty-cell">Tidak ada kendaraan pending.</td>
                </tr>
              ) : pendingCarsPage.rows.map((car) => (
                <tr key={car.id}>
                  <td>
                    <div className="admin-table-car">
                      {car.image_url && <img src={car.image_url} alt="" />}
                      <span>{car.model ? `${car.brand} ${car.model}` : car.name}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge cat-${car.category || 'penumpang'}`}>
                      {categoryLabel[car.category] || car.category || 'Penumpang'}
                    </span>
                  </td>
                  <td className="admin-price">{formatRupiah(car.starting_price || car.initial_price)}</td>
                  <td className="admin-mono">{car.chassis_number || car.car_id || '-'}</td>
                  <td>
                    <span className="badge badge-warning">Pending</span>
                  </td>
                  <td>
                    <button
                      className="btn btn-primary btn-sm"
                      type="button"
                      onClick={() => navigate(`/admin/review-cars/${car.id}`)}
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {pendingCars.length > 0 && (
            <AdminPagination
              currentPage={pendingCarsPage.currentPage}
              totalPages={pendingCarsPage.totalPages}
              onPageChange={setPendingPage}
            />
          )}
        </div>
      )}

      {tab === 'cars' && (
        <div>
          <div className="admin-section-actions">
            <button className="btn btn-primary" type="button" onClick={() => navigate('/seller')}>
              Tambah di Menu Penjual
            </button>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Kendaraan</th>
                  <th>Kategori</th>
                  <th>Harga Awal</th>
                  <th>No. Rangka</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {allCarsPage.rows.map((car) => (
                  <tr key={car.id}>
                    <td>
                      <div className="admin-table-car">
                        {car.image_url && <img src={car.image_url} alt="" />}
                        <span>{car.model ? `${car.brand} ${car.model}` : car.name}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge cat-${car.category || 'penumpang'}`}>
                        {categoryLabel[car.category] || car.category || 'Penumpang'}
                      </span>
                    </td>
                    <td className="admin-price">{formatRupiah(car.starting_price || car.initial_price)}</td>
                    <td className="admin-mono">{car.chassis_number || '-'}</td>
                    <td>
                      {car.status === 'rejected' ? (
                        <span className="badge badge-danger">Ditolak</span>
                      ) : car.is_verified !== false ? (
                        <span className="badge badge-success">Terverifikasi</span>
                      ) : (
                        <span className="badge badge-warning">Belum</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {cars.length > 0 && (
              <AdminPagination
                currentPage={allCarsPage.currentPage}
                totalPages={allCarsPage.totalPages}
                onPageChange={setCarsPage}
              />
            )}
          </div>
        </div>
      )}

      {tab === 'users' && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Pengguna</th>
                <th>Email</th>
                <th>Nomor HP</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {regularUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="admin-empty-cell">Belum ada pengguna.</td>
                </tr>
              ) : regularUsersPage.rows.map((user) => (
                <tr key={user.id}>
                  <td className="admin-user-name">{user.username || user.name}</td>
                  <td className="admin-muted">{user.email}</td>
                  <td>{user.phone || '-'}</td>
                  <td>
                    <div className="admin-badge-row">
                      {user.is_verified !== false
                        ? <span className="badge badge-success">Terverifikasi</span>
                        : <span className="badge badge-warning">Belum Verifikasi</span>}
                      {user.is_suspended && <span className="badge badge-danger">Ditangguhkan</span>}
                    </div>
                  </td>
                  <td>
                    <div className="admin-actions">
                      <button
                        className={`btn btn-sm ${user.is_verified !== false ? 'btn-ghost' : 'btn-success'}`}
                        type="button"
                        onClick={() => toggleVerify(user)}
                      >
                        {user.is_verified !== false
                          ? <><ShieldOff size={12} /> Batal</>
                          : <><ShieldCheck size={12} /> Verifikasi</>}
                      </button>
                      <button
                        className={`btn btn-sm ${user.is_suspended ? 'btn-ghost' : 'btn-danger'}`}
                        type="button"
                        onClick={() => toggleSuspend(user)}
                      >
                        <Ban size={12} /> {user.is_suspended ? 'Aktifkan' : 'Tangguhkan'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {regularUsers.length > 0 && (
            <AdminPagination
              currentPage={regularUsersPage.currentPage}
              totalPages={regularUsersPage.totalPages}
              onPageChange={setUsersPage}
            />
          )}
        </div>
      )}

      {tab === 'auctions' && (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Kendaraan</th>
                <th>Penawaran Tertinggi</th>
                <th>Status</th>
                <th>Berakhir</th>
              </tr>
            </thead>
            <tbody>
              {auctions.length === 0 ? (
                <tr>
                  <td colSpan="4" className="admin-empty-cell">Belum ada lelang.</td>
                </tr>
              ) : auctionsListPage.rows.map((auction) => {
                const car = cars.find((item) => String(item.id) === String(auction.car_id));
                const carName = car ? (car.model ? `${car.brand} ${car.model}` : car.name) : '-';

                return (
                  <tr key={auction.id}>
                    <td className="admin-user-name">{carName}</td>
                    <td className="admin-price">{formatRupiah(auction.current_highest_bid)}</td>
                    <td>
                      {auction.status === 'active' && <span className="badge badge-success">Aktif</span>}
                      {auction.status === 'upcoming' && <span className="badge badge-info">Segera</span>}
                      {auction.status === 'ended' && <span className="badge badge-gray">Selesai</span>}
                    </td>
                    <td className="admin-muted">{new Date(auction.end_time).toLocaleString('id-ID')}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {auctions.length > 0 && (
            <AdminPagination
              currentPage={auctionsListPage.currentPage}
              totalPages={auctionsListPage.totalPages}
              onPageChange={setAuctionsPage}
            />
          )}
        </div>
      )}
    </div>
  );
}
