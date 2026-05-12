import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Check, CreditCard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatRupiah } from '../lib/mockData';
import './TopUpPage.css';

const QUICK_AMOUNTS = [1000000, 2500000, 5000000, 10000000];

const TOPUP_METHODS = [
  { id: 'balance', name: 'Saldo Anda', icon: '💳' },
  { id: 'atm', name: 'ATM', icon: '🏧' },
  { id: 'mobile-banking', name: 'Mobile Banking', icon: '📱' },
  { id: 'e-wallet', name: 'E-Wallet', icon: '👛' },
];

export default function TopUpPage() {
  const { currentUser, topUp } = useAuth();
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [selectedAmount, setSelectedAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  if (!currentUser) {
    return (
      <div className="topup-page">
        <div className="empty-state topup-login-required">
          <div className="empty-state-icon">🔒</div>
          <h3>Login Diperlukan</h3>
          <button className="btn btn-primary" type="button" onClick={() => navigate('/login')}>
            Masuk
          </button>
        </div>
      </div>
    );
  }

  const topUpAmount = parseInt((selectedAmount || amount).replace(/\D/g, ''), 10) || 0;
  const methodName = TOPUP_METHODS.find((method) => method.id === selectedMethod)?.name;

  const handleConfirm = () => {
    if (!topUpAmount || topUpAmount < 10000 || !selectedMethod) return;
    setStep(2);
  };

  const handlePay = () => {
    setLoading(true);
    setTimeout(() => {
      topUp(topUpAmount);
      setLoading(false);
      setStep(3);
    }, 900);
  };

  if (step === 3) {
    return (
      <main className="topup-page">
        <section className="topup-result-card">
          <div className="topup-result-icon">✅</div>
          <h1>Top Up Berhasil!</h1>
          <p>Saldo Anda telah bertambah sebesar</p>
          <strong>{formatRupiah(topUpAmount)}</strong>

          <div className="topup-result-balance">
            <span>Saldo Terbaru</span>
            <b>{formatRupiah(currentUser.deposit_balance)}</b>
          </div>

          <div className="topup-result-actions">
            <button
              className="topup-primary-button"
              type="button"
              onClick={() => {
                setStep(1);
                setAmount('');
                setSelectedAmount('');
                setSelectedMethod('');
              }}
            >
              Top Up Lagi
            </button>
            <button className="topup-secondary-button" type="button" onClick={() => navigate('/profile')}>
              Profil
            </button>
          </div>
        </section>
      </main>
    );
  }

  if (step === 2) {
    return (
      <main className="topup-page">
        <section className="topup-confirm-card">
          <h1>Konfirmasi Pembayaran</h1>

          <div className="topup-confirm-list">
            <div>
              <span>Jumlah Top Up</span>
              <strong>{formatRupiah(topUpAmount)}</strong>
            </div>
            <div>
              <span>Metode Pembayaran</span>
              <strong>{methodName}</strong>
            </div>
            <div>
              <span>Status</span>
              <strong>Menunggu Pembayaran</strong>
            </div>
          </div>

          <div className="topup-demo-note">
            <AlertCircle size={16} />
            <span>Dalam demo ini, pembayaran akan langsung dikonfirmasi.</span>
          </div>

          <div className="topup-confirm-actions">
            <button className="topup-secondary-button" type="button" onClick={() => setStep(1)}>
              Batal
            </button>
            <button className="topup-primary-button" type="button" onClick={handlePay} disabled={loading}>
              {loading ? 'Memproses...' : 'Konfirmasi Bayar'}
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="topup-page">
      <section className="topup-shell">
        <div className="topup-heading">
          <h1>Top Up</h1>
          <p>Tambah saldo untuk memudahkan transaksi</p>
        </div>

        <div className="topup-balance-card">
          <span>Saldo Anda</span>
          <strong>{formatRupiah(currentUser.deposit_balance)}</strong>
        </div>

        <div className="topup-section-label">Pilih Metode Top up</div>

        <div className="topup-method-grid">
          {TOPUP_METHODS.map((method) => (
            <button
              className={`topup-method-card ${selectedMethod === method.id ? 'selected' : ''}`}
              type="button"
              key={method.id}
              onClick={() => setSelectedMethod(method.id)}
            >
              <span className="topup-method-icon">{method.icon}</span>
              <span>{method.name}</span>
              {selectedMethod === method.id && <Check className="topup-method-check" size={22} />}
            </button>
          ))}
        </div>

        <div className="topup-amount-panel">
          <div>
            <h2>Pilih Nominal</h2>
            <p>Minimum top up Rp 10.000</p>
          </div>

          <div className="topup-amount-grid">
            {QUICK_AMOUNTS.map((value) => (
              <button
                className={`topup-amount-chip ${selectedAmount === String(value) ? 'selected' : ''}`}
                type="button"
                key={value}
                onClick={() => {
                  setSelectedAmount(String(value));
                  setAmount('');
                }}
              >
                {formatRupiah(value)}
              </button>
            ))}
          </div>

          <label className="topup-custom-amount">
            <span>Nominal Lain</span>
            <input
              inputMode="numeric"
              placeholder="Contoh: 3000000"
              value={amount}
              onChange={(event) => {
                setAmount(event.target.value.replace(/\D/g, ''));
                setSelectedAmount('');
              }}
            />
          </label>

          <button
            className="topup-pay-button"
            type="button"
            onClick={handleConfirm}
            disabled={!topUpAmount || topUpAmount < 10000 || !selectedMethod}
          >
            <CreditCard size={20} />
            Lanjutkan Pembayaran
          </button>
        </div>
      </section>
    </main>
  );
}
