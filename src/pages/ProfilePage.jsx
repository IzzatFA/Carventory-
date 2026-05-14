import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle,
  ClipboardList,
  Clock3,
  CreditCard,
  LogOut,
  Trophy,
  UserRound,
  XCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAuction } from '../context/AuctionContext';
import { formatRupiah } from '../lib/utils';
import api from '../lib/api';
import './ProfilePage.css';

export default function ProfilePage() {
  const { currentUser, logout } = useAuth();
  const { getUserBids, auctions } = useAuction();
  const navigate = useNavigate();
  const [recentTransactions, setRecentTransactions] = useState([]);

  useEffect(() => {
    if (currentUser) {
      api.get('/transactions/my')
        .then(res => setRecentTransactions(res.data.data || []))
        .catch(err => console.error('Failed to fetch transactions', err));
    }
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="profile-page">
        <div className="profile-login-required">
          <div className="empty-state">
            <div className="empty-state-icon">🔒</div>
            <h3>Login Diperlukan</h3>
            <button className="btn btn-primary" onClick={() => navigate('/login')}>
              Masuk
            </button>
          </div>
        </div>
      </div>
    );
  }

  const myBids = getUserBids(currentUser.id);

  const won = myBids.filter((bid) => {
    const auction = auctions.find((item) => item.id === bid.auction_id);
    return auction?.status === 'ended' && auction?.winner_id === currentUser.id;
  }).length;

  const displayName = currentUser.username || currentUser.name || 'User';
  const roleLabel = currentUser.role === 'admin'
    ? 'Admin'
    : currentUser.role === 'seller'
      ? 'Penjual'
      : 'Pengguna';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <main className="profile-page">
      <div className="profile-content">
        <h1 className="profile-heading">Profil</h1>

        <div className="profile-dashboard">
          <section className="profile-left-column">
            <div className="profile-identity-card">
              <div className="profile-identity-top">
                <div className="profile-avatar-large">
                  <UserRound size={58} />
                </div>

                <div className="profile-identity-body">
                  <h2>{displayName}</h2>
                  <a href={`mailto:${currentUser.email}`}>{currentUser.email}</a>
                  <p>{currentUser.phone || '+62 1236767'}</p>
                </div>
              </div>

              <div className="profile-status-row">
                <span className={`profile-pill verified`}>
                  {currentUser.is_verified !== false ? 'Terverifikasi' : 'Belum Verifikasi'}
                </span>

                <span className="profile-pill role">
                  {roleLabel}
                </span>
              </div>

              <button className="profile-edit-btn" type="button">
                Edit Profil
              </button>
            </div>

            <div className="profile-summary-grid">
              <div className="profile-summary-card">
                <ClipboardList className="profile-summary-icon" size={32} />
                <strong>{myBids.length}</strong>
                <span>Total Penawaran</span>
              </div>

              <div className="profile-summary-card">
                <Trophy className="profile-summary-icon trophy" size={34} />
                <strong className="success">{won}</strong>
                <span>Lelang Dimenangkan</span>
              </div>
            </div>

            <button className="profile-logout-btn" type="button" onClick={handleLogout}>
              <LogOut size={24} />
              Keluar
            </button>
          </section>

          <section className="profile-right-column">
            <div className="profile-balance-card">
              <span>Saldo Anda</span>
              <strong>{formatRupiah(currentUser.deposit_balance)}</strong>

              <button type="button" onClick={() => navigate('/topup')}>
                <CreditCard size={20} />
                Top Up
              </button>
            </div>

            <div className="profile-activity-card">
              <h2>Aktivitas Terkini</h2>

              {recentTransactions.length === 0 ? (
                <div className="profile-empty-activity">
                  <Clock3 size={72} strokeWidth={1.6} />
                  <p>
                    Belum ada
                    <br />
                    Aktivitas
                  </p>
                </div>
              ) : (
                <div className="profile-activity-list">
                  {recentTransactions.map((transaction) => {
                    const status = transaction.payment_status === 'paid'
                      ? { label: 'Berhasil', className: 'success', icon: CheckCircle }
                      : transaction.payment_status === 'failed'
                        ? { label: 'Gagal', className: 'danger', icon: XCircle }
                        : { label: 'Proses', className: 'warning', icon: Clock3 };
                    const StatusIcon = status.icon;

                    return (
                      <article className="profile-activity-item" key={transaction.id}>
                        <div className="profile-activity-icon">
                          <CreditCard size={20} />
                        </div>

                        <div className="profile-activity-body">
                          <div className="profile-activity-top">
                            <strong>Top Up Saldo</strong>
                            <span className={`profile-activity-status ${status.className}`}>
                              <StatusIcon size={12} />
                              {status.label}
                            </span>
                          </div>

                          <span className="profile-activity-amount">+{formatRupiah(transaction.amount)}</span>
                          <time dateTime={transaction.transaction_date || transaction.created_at}>
                            {new Date(transaction.transaction_date || transaction.created_at).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </time>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
