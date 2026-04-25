import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Phone, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) return setError('Password minimal 6 karakter.');
    setLoading(true);
    setTimeout(() => {
      const res = register(form.name, form.email, form.password, form.phone);
      setLoading(false);
      if (res.success) navigate('/');
      else setError(res.error);
    }, 800);
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: 72, marginBottom: 16 }}>🚗</div>
          <div style={{ fontSize: 32, fontWeight: 900, color: 'var(--orange)', marginBottom: 8 }}>CarVentory</div>
          <div style={{ fontSize: 16, color: 'var(--text2)', lineHeight: 1.6, maxWidth: 280 }}>
            Daftar sekarang dan mulai pengalaman lelang mobil digital terbaik!
          </div>
          <div style={{ marginTop: 32, padding: 20, background: 'rgba(249,115,22,0.1)', borderRadius: 12, border: '1px solid rgba(249,115,22,0.2)' }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text2)', marginBottom: 8 }}>Keuntungan Mendaftar</div>
            {['✓ Akses ke semua lelang aktif', '✓ Notifikasi real-time', '✓ Riwayat penawaran tersimpan', '✓ Sistem deposit aman'].map(t => (
              <div key={t} style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 4 }}>{t}</div>
            ))}
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <h1 className="auth-title">Buat Akun Baru</h1>
          <p className="auth-sub">Isi data diri Anda untuk mulai</p>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label className="input-label">Nama Lengkap</label>
              <div className="input-icon-wrap">
                <User size={16} className="input-icon" />
                <input className="input" placeholder="Nama Lengkap" value={form.name} onChange={set('name')} required />
              </div>
            </div>
            <div className="input-group">
              <label className="input-label">Email</label>
              <div className="input-icon-wrap">
                <Mail size={16} className="input-icon" />
                <input className="input" type="email" placeholder="email@example.com" value={form.email} onChange={set('email')} required />
              </div>
            </div>
            <div className="input-group">
              <label className="input-label">Nomor HP</label>
              <div className="input-icon-wrap">
                <Phone size={16} className="input-icon" />
                <input className="input" type="tel" placeholder="08xxxxxxxxxx" value={form.phone} onChange={set('phone')} required />
              </div>
            </div>
            <div className="input-group">
              <label className="input-label">Password</label>
              <div className="input-icon-wrap" style={{ position: 'relative' }}>
                <Lock size={16} className="input-icon" />
                <input className="input" type={show ? 'text' : 'password'} placeholder="Minimal 6 karakter" value={form.password} onChange={set('password')} required style={{ paddingRight: 40 }} />
                <button type="button" onClick={() => setShow(v => !v)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer' }}>
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 16, lineHeight: 1.5 }}>
              Dengan mendaftar, Anda menyetujui <span style={{ color: 'var(--orange)' }}>Syarat & Ketentuan</span> dan <span style={{ color: 'var(--orange)' }}>Kebijakan Privasi</span> CarVentory.
            </div>
            <button className="btn btn-primary" style={{ width: '100%' }} type="submit" disabled={loading}>
              {loading ? '⏳ Memproses...' : 'Daftar Sekarang'}
            </button>
          </form>

          <div className="auth-divider">atau</div>
          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text3)' }}>
            Sudah punya akun?{' '}
            <span className="auth-link" onClick={() => navigate('/login')}>Masuk</span>
          </p>
        </div>
      </div>
    </div>
  );
}
