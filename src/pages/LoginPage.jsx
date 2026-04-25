import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Gavel } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setTimeout(() => {
      const res = login(email, password);
      setLoading(false);
      if (res.success) navigate('/');
      else setError(res.error);
    }, 800);
  };

  const demoLogin = (type) => {
    if (type === 'user') { setEmail('budi@example.com'); setPassword('password123'); }
    else { setEmail('admin@carventory.id'); setPassword('adminpass'); }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: 72, marginBottom: 16 }}>🚗</div>
          <div style={{ fontSize: 32, fontWeight: 900, color: 'var(--orange)', marginBottom: 8 }}>CarVentory</div>
          <div style={{ fontSize: 16, color: 'var(--text2)', lineHeight: 1.6, maxWidth: 280 }}>
            Platform Lelang Mobil Digital Terpercaya #1 di Indonesia
          </div>
          <div style={{ display: 'flex', gap: 20, justifyContent: 'center', marginTop: 40 }}>
            {[['500+','Mobil'],['12K+','Pengguna'],['98%','Kepuasan']].map(([n,l]) => (
              <div key={l} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--orange)' }}>{n}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <h1 className="auth-title">Selamat Datang 👋</h1>
          <p className="auth-sub">Masuk ke akun CarVentory Anda</p>

          {error && <div className="alert alert-error">{error}</div>}

          {/* Demo shortcuts */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            <button className="btn btn-ghost btn-sm" style={{ flex: 1, fontSize: 11 }} onClick={() => demoLogin('user')}>
              Demo User
            </button>
            <button className="btn btn-ghost btn-sm" style={{ flex: 1, fontSize: 11 }} onClick={() => demoLogin('admin')}>
              Demo Admin
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label className="input-label">Email</label>
              <div className="input-icon-wrap">
                <Mail size={16} className="input-icon" />
                <input className="input" type="email" placeholder="email@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
            </div>
            <div className="input-group">
              <label className="input-label">Password</label>
              <div className="input-icon-wrap" style={{ position: 'relative' }}>
                <Lock size={16} className="input-icon" />
                <input className="input" type={show ? 'text' : 'password'} placeholder="Password Anda" value={password} onChange={e => setPassword(e.target.value)} required style={{ paddingRight: 40 }} />
                <button type="button" onClick={() => setShow(v => !v)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer' }}>
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button className="btn btn-primary" style={{ width: '100%', marginTop: 8 }} type="submit" disabled={loading}>
              {loading ? '⏳ Memproses...' : 'Masuk'}
            </button>
          </form>

          <div className="auth-divider">atau</div>
          <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text3)' }}>
            Belum punya akun?{' '}
            <span className="auth-link" onClick={() => navigate('/register')}>Daftar Sekarang</span>
          </p>
        </div>
      </div>
    </div>
  );
}
