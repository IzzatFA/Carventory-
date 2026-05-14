import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserRound, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './LoginPage.css';

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

    try {
      const res = await login(email, password);
      setLoading(false);
      if (res.success) {
        navigate(res.user?.role === 'seller' ? '/seller' : '/');
      } else {
        setError(res.error);
      }
    } catch {
      setLoading(false);
      setError('Login gagal. Silakan coba lagi.');
    }
  };

  return (
    <div className="login-page">
      <div className="login-shell">
        <section className="login-brand-panel" aria-label="Carventory">
          <div className="login-logo-mark" aria-hidden="true" />
          <div className="login-brand-name">CARVENTORY</div>
        </section>

        <section className="login-form-panel">
          <div className="login-card">
            <h1 className="login-title">Login</h1>

            {error && <div className="alert alert-error login-alert">{error}</div>}

            <form onSubmit={handleSubmit} className="login-form">
              <div className="login-input-group">
                <UserRound size={15} className="login-input-icon" />
                <input
                  className="login-input"
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-label="Email"
                  required
                />
              </div>

              <div className="login-input-group">
                <Lock size={15} className="login-input-icon" />
                <input
                  className="login-input login-password-input"
                  type={show ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-label="Password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShow((value) => !value)}
                  aria-label={show ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                  {show ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>

              <button className="login-submit" type="submit" disabled={loading}>
                {loading ? 'Memproses...' : 'Login'}
              </button>
            </form>

            <p className="login-register-text">
              Tidak punya akun?{' '}
              <button
                type="button"
                className="login-register-link"
                onClick={() => navigate('/register')}
              >
                Daftar sekarang
              </button>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
