import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Gavel, ShieldCheck, Zap, TrendingUp, ArrowRight, Star, Clock } from 'lucide-react';
import { mockCars, mockAuctions, formatRupiah } from '../lib/mockData';
import CarCard from '../components/CarCard';

export default function LandingPage() {
  const navigate = useNavigate();
  const active = mockAuctions.filter(a => a.status === 'active');
  const trending = active.slice(0, 3);

  return (
    <div>
      {/* ── Hero ── */}
      <div className="hero">
        <div className="hero-inner">
          <div>
            <div className="hero-tag"><Zap size={12} /> Platform Lelang Mobil #1 di Indonesia</div>
            <h1 className="hero-title">Temukan Mobil<br /><span>Impian Anda</span><br />di Lelang Digital</h1>
            <p className="hero-desc">CarVentory menghadirkan pengalaman lelang mobil yang transparan, real-time, dan terpercaya. Dari mobil penumpang, mewah, hingga klasik.</p>
            <div className="hero-actions">
              <button className="btn btn-primary btn-lg" onClick={() => navigate('/catalog')}>
                <Gavel size={18} /> Mulai Lelang <ArrowRight size={16} />
              </button>
              <button className="btn btn-ghost btn-lg" onClick={() => navigate('/register')}>Daftar Gratis</button>
            </div>
            <div className="hero-stats">
              {[['500+','Mobil Dilelang'],['12K+','Pengguna Aktif'],['98%','Kepuasan']].map(([n,l]) => (
                <div key={l}><div className="hero-stat-num">{n}</div><div className="hero-stat-label">{l}</div></div>
              ))}
            </div>
          </div>
          <div className="hero-visual">
            <img src="https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800" alt="Luxury car" />
            <div className="hero-visual-overlay">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 2 }}>Penawaran Tertinggi</div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--orange)' }}>Rp 7.600.000.000</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span className="live-dot" />
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--success)' }}>LIVE</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Features ── */}
      <div className="section">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 16 }}>
          {[
            { icon: Zap, title: 'Real-Time Bidding', desc: 'Update penawaran langsung tanpa perlu refresh', color: '#F97316' },
            { icon: ShieldCheck, title: 'Kendaraan Terverifikasi', desc: 'Nomor rangka & mesin diverifikasi resmi', color: '#22C55E' },
            { icon: TrendingUp, title: 'Transparan', desc: 'Riwayat penawaran terbuka untuk semua peserta', color: '#3B82F6' },
            { icon: Star, title: 'Terpercaya', desc: 'Sistem deposit aman dengan gateway terpercaya', color: '#8B5CF6' },
          ].map(({ icon: Icon, title, desc, color }) => (
            <div key={title} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 22 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                <Icon size={22} style={{ color }} />
              </div>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>{title}</div>
              <div style={{ fontSize: 13, color: 'var(--text3)', lineHeight: 1.55 }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Trending ── */}
      {trending.length > 0 && (
        <div className="section" style={{ paddingTop: 0 }}>
          <div className="section-header">
            <div>
              <h2 className="section-title">🔥 Lelang Trending</h2>
              <p style={{ fontSize: 13, color: 'var(--text3)', marginTop: 4 }}>Lelang paling banyak diminati saat ini</p>
            </div>
            <button className="btn btn-outline btn-sm" onClick={() => navigate('/auctions')}>Lihat Semua <ArrowRight size={14} /></button>
          </div>
          <div className="cars-grid">
            {trending.map(auc => {
              const car = mockCars.find(c => c.id === auc.car_id);
              return car ? <CarCard key={auc.id} car={car} auction={auc} /> : null;
            })}
          </div>
        </div>
      )}

      {/* ── Categories ── */}
      <div className="section" style={{ paddingTop: 0 }}>
        <div className="section-header"><h2 className="section-title">Kategori Kendaraan</h2></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 16 }}>
          {[
            { cat: 'penumpang', label: 'Penumpang', emoji: '🚗', desc: 'SUV, MPV, Sedan', color: '#3B82F6', count: mockCars.filter(c=>c.category==='penumpang').length },
            { cat: 'mewah', label: 'Mewah', emoji: '🏎️', desc: 'Supercar & Luxury', color: '#8B5CF6', count: mockCars.filter(c=>c.category==='mewah').length },
            { cat: 'klasik', label: 'Klasik', emoji: '🚕', desc: 'Vintage & Classic', color: '#F59E0B', count: mockCars.filter(c=>c.category==='klasik').length },
          ].map(({ cat, label, emoji, desc, color, count }) => (
            <div key={cat} onClick={() => navigate(`/catalog?category=${cat}`)}
              style={{ background: `linear-gradient(135deg,${color}18,var(--bg2))`, border: `1px solid ${color}33`, borderRadius: 'var(--radius-lg)', padding: '28px 24px', cursor: 'pointer', transition: 'transform .2s' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseLeave={e => e.currentTarget.style.transform = ''}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>{emoji}</div>
              <div style={{ fontWeight: 800, fontSize: 20, marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 14 }}>{desc}</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 14, color, fontWeight: 700 }}>{count} Kendaraan</span>
                <ArrowRight size={16} style={{ color }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── CTA Banner ── */}
      <div className="section" style={{ paddingTop: 0 }}>
        <div style={{ background: 'linear-gradient(135deg,rgba(249,115,22,.15),rgba(249,115,22,.05))', border: '1px solid rgba(249,115,22,.25)', borderRadius: 'var(--radius-lg)', padding: '48px 40px', textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🚀</div>
          <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 10 }}>Siap Mengikuti Lelang?</h2>
          <p style={{ color: 'var(--text3)', marginBottom: 24, fontSize: 15 }}>Daftar sekarang, top-up deposit, dan mulai tawar kendaraan impian Anda</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/register')}><Zap size={18}/> Daftar Sekarang</button>
            <button className="btn btn-ghost btn-lg" onClick={() => navigate('/catalog')}>Lihat Katalog</button>
          </div>
        </div>
      </div>
    </div>
  );
}
