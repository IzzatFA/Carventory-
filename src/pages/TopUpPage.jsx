import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Banknote, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { mockTransactions, formatRupiah } from '../lib/mockData';

const QUICK_AMOUNTS = [1000000, 2500000, 5000000, 10000000, 25000000, 50000000];

const GATEWAYS = [
  { id: 'bca', name: 'BCA Virtual Account', icon: '🏦' },
  { id: 'mandiri', name: 'Mandiri VA', icon: '🏛️' },
  { id: 'bni', name: 'BNI VA', icon: '🏢' },
  { id: 'gopay', name: 'GoPay', icon: '💚' },
  { id: 'ovo', name: 'OVO', icon: '💜' },
];

export default function TopUpPage() {
  const { currentUser, topUp } = useAuth();
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [selected, setSelected] = useState('');
  const [gateway, setGateway] = useState('');
  const [step, setStep] = useState(1); // 1=form, 2=confirm, 3=success
  const [loading, setLoading] = useState(false);

  if (!currentUser) return (
    <div className="page"><div className="empty-state"><div className="empty-state-icon">🔒</div><h3>Login Diperlukan</h3><button className="btn btn-primary" onClick={() => navigate('/login')}>Masuk</button></div></div>
  );

  const myTrx = mockTransactions.filter(t => t.user_id === currentUser.id);
  const numAmount = parseInt((selected || amount).replace(/\D/g,'')) || 0;

  const handleConfirm = () => {
    if (!numAmount || numAmount < 10000) return;
    if (!gateway) return;
    setStep(2);
  };

  const handlePay = () => {
    setLoading(true);
    setTimeout(() => {
      topUp(numAmount);
      setLoading(false);
      setStep(3);
    }, 1500);
  };

  if (step === 3) return (
    <div className="page">
      <div style={{ maxWidth: 440, margin: '60px auto', textAlign: 'center' }}>
        <div style={{ fontSize: 72, marginBottom: 16 }}>✅</div>
        <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>Top Up Berhasil!</h2>
        <p style={{ color: 'var(--text3)', marginBottom: 8 }}>Saldo Anda telah bertambah sebesar</p>
        <div style={{ fontSize: 32, fontWeight: 900, color: 'var(--success)', marginBottom: 24 }}>{formatRupiah(numAmount)}</div>
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: 16, marginBottom: 24 }}>
          <div style={{ fontSize: 13, color: 'var(--text3)' }}>Saldo Terbaru</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--orange)' }}>{formatRupiah(currentUser.deposit_balance)}</div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => { setStep(1); setAmount(''); setSelected(''); }}>Top Up Lagi</button>
          <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => navigate('/auctions')}>Lelang</button>
        </div>
      </div>
    </div>
  );

  if (step === 2) return (
    <div className="page">
      <div style={{ maxWidth: 440, margin: '40px auto' }}>
        <div className="modal">
          <div className="modal-header"><span className="modal-title">Konfirmasi Pembayaran</span></div>
          <div className="modal-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[['Jumlah Top Up', formatRupiah(numAmount)], ['Metode Pembayaran', GATEWAYS.find(g=>g.id===gateway)?.name], ['Status', 'Menunggu Pembayaran']].map(([k,v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)', fontSize: 14 }}>
                  <span style={{ color: 'var(--text3)' }}>{k}</span>
                  <span style={{ fontWeight: 600 }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 16, padding: 14, background: 'rgba(249,115,22,0.08)', borderRadius: 10, fontSize: 13, color: 'var(--text3)' }}>
              <AlertCircle size={14} style={{ display: 'inline', marginRight: 6, color: 'var(--orange)' }} />
              Dalam demo ini, pembayaran akan langsung dikonfirmasi.
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-ghost" onClick={() => setStep(1)}>Batal</button>
            <button className="btn btn-primary" onClick={handlePay} disabled={loading}>
              {loading ? '⏳ Memproses...' : '✓ Konfirmasi Bayar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Top Up Deposit</h1>
        <p className="page-sub">Tambah saldo deposit untuk mengikuti lelang</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }}>
        <div>
          {/* Balance card */}
          <div style={{ background: 'linear-gradient(135deg,#1a0500,#2d1200)', border: '1px solid rgba(249,115,22,0.3)', borderRadius: 'var(--radius-lg)', padding: 24, marginBottom: 20 }}>
            <div style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 6 }}>Saldo Deposit Anda</div>
            <div style={{ fontSize: 36, fontWeight: 900, color: 'var(--orange)' }}>{formatRupiah(currentUser.deposit_balance)}</div>
          </div>

          {/* Quick amounts */}
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 24, marginBottom: 20 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Pilih Nominal</h3>
            <div className="topup-options">
              {QUICK_AMOUNTS.map(v => (
                <div key={v} className={`topup-option ${selected === String(v) ? 'selected' : ''}`} onClick={() => { setSelected(String(v)); setAmount(''); }}>
                  {formatRupiah(v)}
                </div>
              ))}
            </div>
            <div style={{ marginTop: 12 }}>
              <label className="input-label">Atau masukkan nominal lain (min. Rp 10.000)</label>
              <input className="input" placeholder="Contoh: 3000000" value={amount}
                onChange={e => { setAmount(e.target.value.replace(/\D/g,'')); setSelected(''); }} />
            </div>
          </div>

          {/* Gateway */}
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 24 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Metode Pembayaran</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {GATEWAYS.map(g => (
                <div key={g.id} onClick={() => setGateway(g.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', border: `1px solid ${gateway===g.id ? 'var(--orange)' : 'var(--border)'}`, borderRadius: 10, cursor: 'pointer', background: gateway===g.id ? 'rgba(249,115,22,0.08)' : 'transparent', transition: 'all 0.2s' }}>
                  <span style={{ fontSize: 22 }}>{g.icon}</span>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{g.name}</span>
                  {gateway === g.id && <span style={{ marginLeft: 'auto', color: 'var(--orange)' }}>✓</span>}
                </div>
              ))}
            </div>
            <button className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 20 }} onClick={handleConfirm}
              disabled={!numAmount || numAmount < 10000 || !gateway}>
              <CreditCard size={18} /> Lanjutkan Pembayaran
            </button>
          </div>
        </div>

        {/* Transaction history */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Riwayat Transaksi</h3>
          {myTrx.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text3)', fontSize: 13, padding: 20 }}>Belum ada transaksi</div>
          ) : myTrx.map(trx => (
            <div key={trx.id} style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--success)' }}>+{formatRupiah(trx.amount)}</span>
                {trx.status === 'paid' ? <span className="badge badge-success"><CheckCircle size={10} /> Berhasil</span>
                  : trx.status === 'failed' ? <span className="badge badge-danger"><XCircle size={10} /> Gagal</span>
                  : <span className="badge badge-warning"><Clock size={10} /> Proses</span>}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text3)' }}>{new Date(trx.created_at).toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric' })}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
