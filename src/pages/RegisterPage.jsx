import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserRound, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './RegisterPage.css';

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [loadingRole, setLoadingRole] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const set = (key) => (e) => {
    setForm((current) => ({ ...current, [key]: e.target.value }));
  };

  const handleSubmit = (role) => async (e) => {
    e.preventDefault();
    setError('');

    if (form.password.length < 8) {
      setError('Password minimal 8 karakter.');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Konfirmasi password tidak sama.');
      return;
    }

    setLoadingRole(role);

    try {
      const res = await register(form.name, form.email, form.password, role);
      setLoadingRole('');
      if (res.success) {
        navigate('/');
      } else {
        setError(res.error);
      }
    } catch {
      setLoadingRole('');
      setError('Registrasi gagal. Silakan coba lagi.');
    }
  };

  return (
    <div className="register-page">
      <div className="register-shell">
        <section className="register-brand-panel" aria-label="Carventory">
          <div className="register-logo-mark" aria-hidden="true" />
          <div className="register-brand-name">CARVENTORY</div>
        </section>

        <section className="register-form-panel">
          <div className="register-card">
            <h1 className="register-title">Daftar</h1>

            {error && <div className="alert alert-error register-alert">{error}</div>}

            <form className="register-form">
              <div className="register-input-group">
                <UserRound size={15} className="register-input-icon" />
                <input
                  className="register-input"
                  placeholder="Username"
                  value={form.name}
                  onChange={set('name')}
                  aria-label="Username"
                  required
                />
              </div>

              <div className="register-input-group">
                <Mail size={15} className="register-input-icon" />
                <input
                  className="register-input"
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={set('email')}
                  aria-label="Email"
                  required
                />
              </div>

              <div className="register-input-group">
                <Lock size={15} className="register-input-icon" />
                <input
                  className="register-input register-password-input"
                  type={show ? 'text' : 'password'}
                  placeholder="Password"
                  value={form.password}
                  onChange={set('password')}
                  aria-label="Password"
                  required
                />
                <button
                  type="button"
                  className="register-password-toggle"
                  onClick={() => setShow((value) => !value)}
                  aria-label={show ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                  {show ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>

              <div className="register-input-group">
                <Lock size={15} className="register-input-icon" />
                <input
                  className="register-input register-password-input"
                  type={show ? 'text' : 'password'}
                  placeholder="Konfirmasi Password"
                  value={form.confirmPassword}
                  onChange={set('confirmPassword')}
                  aria-label="Konfirmasi Password"
                  required
                />
              </div>

              <button
                className="register-submit"
                type="submit"
                disabled={Boolean(loadingRole)}
                onClick={handleSubmit('user')}
              >
                {loadingRole === 'user' ? 'Memproses...' : 'Daftar sebagai Pembeli'}
              </button>

              <div className="register-divider">
                <span>ATAU</span>
              </div>

              <button
                className="register-submit"
                type="submit"
                disabled={Boolean(loadingRole)}
                onClick={handleSubmit('seller')}
              >
                {loadingRole === 'seller' ? 'Memproses...' : 'Daftar sebagai Penjual'}
              </button>
            </form>

            <p className="register-login-text">
              Sudah punya akun?{' '}
              <button
                type="button"
                className="register-login-link"
                onClick={() => navigate('/login')}
              >
                Masuk sekarang
              </button>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
