import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShieldCheck, Gavel, ArrowLeft, AlertCircle, Cpu, Info, Wrench, TrendingUp } from 'lucide-react';
import { mockCars, mockAuctions, formatRupiah, categoryLabel } from '../lib/mockData';
import { useAuth } from '../context/AuthContext';
import BidTimer from '../components/BidTimer';

export default function CarDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const car = mockCars.find(c => c.id === id);
  const auction = mockAuctions.find(a => a.car_id === id);

  if (!car) return (
    <div className="page"><div className="empty-state"><div className="empty-state-icon">❌</div><h3>Kendaraan tidak ditemukan</h3><button className="btn btn-primary" style={{marginTop:16}} onClick={() => navigate('/catalog')}>Kembali ke Katalog</button></div></div>
  );

  const statusMap = { active: { label: 'Lelang Aktif', color: 'var(--success)' }, upcoming: { label: 'Segera Dibuka', color: 'var(--info)' }, ended: { label: 'Lelang Berakhir', color: 'var(--text3)' } };
  const st = auction ? statusMap[auction.status] : null;

  return (
    <div>
      {/* ── Breadcrumb ── */}
      <div style={{ background: 'var(--bg2)', borderBottom: '1px solid var(--border)' }}>
        <div className="container" style={{ padding: '12px 24px' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)}>
            <ArrowLeft size={14} /> Kembali
          </button>
        </div>
      </div>

      {/* ── Hero: Image + Auction Panel ── */}
      <div className="detail-hero">
        <div className="detail-hero-inner">
          {/* Image */}
          <div className="detail-img-wrap">
            <img src={car.image_url} alt={car.name} className="detail-img"
              onError={e => { e.target.src = 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800'; }} />
            <div className="detail-img-badges">
              <span className={`badge cat-${car.category}`}>{categoryLabel[car.category]}</span>
              {car.is_verified && <span className="badge badge-success">✓ Terverifikasi</span>}
              {auction?.status === 'active' && (
                <span className="badge badge-success" style={{ gap: 6 }}><span className="live-dot" />LIVE</span>
              )}
            </div>
          </div>

          {/* Auction Panel */}
          <div className="auction-panel">
            <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 16, lineHeight: 1.3 }}>{car.name}</h1>

            {/* Price block */}
            <div style={{ background: 'linear-gradient(135deg,rgba(249,115,22,.12),rgba(249,115,22,.04))', border: '1px solid rgba(249,115,22,.25)', borderRadius: 14, padding: 20, marginBottom: 20 }}>
              <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 4 }}>Harga Awal</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text2)', marginBottom: 12 }}>{formatRupiah(car.initial_price)}</div>
              {auction && (
                <>
                  <div style={{ height: 1, background: 'rgba(249,115,22,.2)', marginBottom: 12 }} />
                  <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 4 }}>
                    {auction.status === 'ended' ? 'Harga Akhir' : 'Penawaran Tertinggi'}
                  </div>
                  <div style={{ fontSize: 30, fontWeight: 900, color: 'var(--orange)' }}>{formatRupiah(auction.current_highest_bid)}</div>
                </>
              )}
            </div>

            {/* Status + Timer */}
            {auction && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: st?.color, animation: auction.status === 'active' ? 'pulse 1.5s infinite' : 'none' }} />
                  <span style={{ fontWeight: 700, color: st?.color }}>{st?.label}</span>
                </div>
                {auction.status === 'active' && (
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 8 }}>⏱ Sisa Waktu Lelang</div>
                    <BidTimer endTime={auction.end_time} />
                  </div>
                )}
                {auction.status === 'upcoming' && (
                  <div style={{ fontSize: 13, color: 'var(--text3)' }}>Mulai: {new Date(auction.start_time).toLocaleString('id-ID')}</div>
                )}
              </div>
            )}

            {/* CTA */}
            {auction?.status === 'active' ? (
              currentUser?.is_verified ? (
                <button className="btn btn-primary btn-lg" style={{ width: '100%', fontSize: 16 }} onClick={() => navigate(`/auctions/${auction.id}`)}>
                  <Gavel size={20} /> Ikut Lelang Sekarang
                </button>
              ) : !currentUser ? (
                <div>
                  <div className="alert alert-error" style={{ marginBottom: 12 }}>
                    <AlertCircle size={14} /> Login untuk mengikuti lelang
                  </div>
                  <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => navigate('/login')}>Masuk</button>
                </div>
              ) : (
                <div className="alert alert-error"><AlertCircle size={14} /> Akun belum diverifikasi admin</div>
              )
            ) : auction?.status === 'ended' ? (
              <div style={{ textAlign: 'center', padding: '8px 0' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🏆</div>
                <div style={{ fontWeight: 700 }}>Lelang Telah Berakhir</div>
              </div>
            ) : !auction ? (
              <div style={{ textAlign: 'center', padding: '8px 0', color: 'var(--text3)', fontSize: 13 }}>Belum ada jadwal lelang</div>
            ) : null}
          </div>
        </div>
      </div>

      {/* ── Body: Specs + Sticky panel placeholder ── */}
      <div className="detail-body">
        <div>
          {/* Description */}
          <div className="spec-section">
            <div className="spec-section-title"><Info size={16} /> Deskripsi Kendaraan</div>
            <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.75 }}>{car.description}</p>
          </div>

          {/* General specs */}
          <div className="spec-section">
            <div className="spec-section-title"><Info size={16} /> Informasi Umum</div>
            <div className="spec-grid">
              {[
                ['Nama Kendaraan', car.name],
                ['Kategori', categoryLabel[car.category]],
                ['Harga Awal', formatRupiah(car.initial_price)],
                ['Status Verifikasi', car.is_verified ? '✓ Terverifikasi' : 'Belum Verifikasi'],
              ].map(([k, v]) => (
                <div className="spec-row" key={k} style={{ paddingRight: 20 }}>
                  <div className="spec-key">{k}</div>
                  <div className="spec-val" style={{ color: k === 'Harga Awal' ? 'var(--orange)' : k === 'Status Verifikasi' && car.is_verified ? 'var(--success)' : undefined }}>{v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Technical / Verification */}
          <div className="spec-section" style={{ background: 'rgba(34,197,94,.03)', borderColor: 'rgba(34,197,94,.2)' }}>
            <div className="spec-section-title" style={{ color: 'var(--success)' }}>
              <ShieldCheck size={16} /> Data Verifikasi Kendaraan
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              {[
                ['No. Rangka (Chassis)', car.chassis_number],
                ['No. Mesin', car.engine_number],
              ].map(([k, v]) => (
                <div key={k} style={{ background: 'rgba(34,197,94,.06)', border: '1px solid rgba(34,197,94,.15)', borderRadius: 10, padding: 14 }}>
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 6, fontWeight: 600 }}>{k}</div>
                  <div style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 700, letterSpacing: .5, wordBreak: 'break-all' }}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'rgba(34,197,94,.08)', borderRadius: 10 }}>
              <ShieldCheck size={16} style={{ color: 'var(--success)' }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--success)' }}>Dokumen dan nomor kendaraan telah diverifikasi oleh Tim CarVentory</span>
            </div>
          </div>

          {/* Auction history if ended */}
          {auction?.status === 'ended' && (
            <div className="spec-section">
              <div className="spec-section-title"><TrendingUp size={16} /> Hasil Lelang</div>
              <div className="spec-grid">
                {[
                  ['Harga Awal', formatRupiah(car.initial_price)],
                  ['Harga Akhir', formatRupiah(auction.current_highest_bid)],
                  ['Tanggal Selesai', new Date(auction.end_time).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })],
                  ['Status', 'Terjual'],
                ].map(([k, v]) => (
                  <div className="spec-row" key={k} style={{ paddingRight: 20 }}>
                    <div className="spec-key">{k}</div>
                    <div className="spec-val" style={{ color: k === 'Harga Akhir' ? 'var(--orange)' : k === 'Status' ? 'var(--success)' : undefined }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: repeat auction panel for scroll context (desktop) */}
        <div>
          {auction?.status === 'active' && (
            <div className="auction-panel">
              <div style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 16 }}>Lelang ini sedang berlangsung</div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 6 }}>Penawaran Tertinggi</div>
                <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--orange)' }}>{formatRupiah(auction.current_highest_bid)}</div>
              </div>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 8 }}>⏱ Sisa Waktu</div>
                <BidTimer endTime={auction.end_time} />
              </div>
              {currentUser?.is_verified ? (
                <button className="btn btn-primary btn-lg" style={{ width: '100%' }} onClick={() => navigate(`/auctions/${auction.id}`)}>
                  <Gavel size={18} /> Tawar Sekarang
                </button>
              ) : (
                <button className="btn btn-primary btn-lg" style={{ width: '100%' }} onClick={() => navigate('/login')}>
                  Masuk untuk Menawar
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
