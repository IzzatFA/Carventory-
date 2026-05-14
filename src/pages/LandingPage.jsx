import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Zap, TrendingUp, ArrowRight, Star } from 'lucide-react';
import { useAuction } from '../context/AuctionContext';
import CarCard from '../components/CarCard';
import { useAuth } from '../context/AuthContext';
import './LandingPage.css';

const FEATURES_DATA = [
  { icon: Zap, title: 'Real-Time Bidding', desc: 'Update penawaran langsung tanpa perlu refresh', color: '#F97316' },
  { icon: ShieldCheck, title: 'Kendaraan Terverifikasi', desc: 'Nomor rangka & mesin diverifikasi resmi', color: '#22C55E' },
  { icon: TrendingUp, title: 'Transparan', desc: 'Riwayat penawaran terbuka untuk semua peserta', color: '#3B82F6' },
  { icon: Star, title: 'Terpercaya', desc: 'Sistem deposit aman dengan gateway terpercaya', color: '#8B5CF6' },
];

const getAuctionStatus = (auction) => {
  if (!auction) return 'inactive';

  const now = Date.now();
  const startTime = new Date(auction.start_time).getTime();
  const endTime = new Date(auction.end_time).getTime();
  const hasStartTime = !Number.isNaN(startTime);
  const hasEndTime = !Number.isNaN(endTime);

  if (hasStartTime && startTime > now) return 'upcoming';
  if (hasEndTime && endTime <= now) return 'ended';
  if (hasStartTime && hasEndTime) return 'active';

  return auction.status || 'active';
};

const mapToCardData = (car, auction) => {
  if (!car) return null;

  return {
    id: car.id,
    namaMobil: car.model ? `${car.brand} ${car.model}` : car.name,
    hargaAwal: car.starting_price || car.initial_price,
    hargaTertinggi: auction?.current_highest_bid || 0,
    waktuLelangSelesai: auction?.end_time,
    gambarMobil: car.image_url,
    lokasi: car.location || 'Jakarta',
    statusLelang: getAuctionStatus(auction)
  };
};

export default function LandingPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { cars, auctions } = useAuction();
  
  const publicCars = cars.filter((car) => car.is_verified === true || car.status === 'active');
  const active = auctions.filter((auction) => {
    const car = publicCars.find((item) => String(item.id) === String(auction.car_id));
    return getAuctionStatus(auction) === 'active' && car;
  });
  const trending = active.slice(0, 3);
  const heroCta = currentUser
    ? { label: 'Jelajahi Mobil', path: '/catalog' }
    : { label: 'Daftar Sekarang', path: '/register' };

  return (
    <div className="landing-container">
      {/* Hero Section */}
      <section className="hero-custom">
        <div className="hero-custom-inner">
          <div className="hero-custom-content">
            <h1 className="hero-custom-title">
              Temukan Mobil<br />Impian Anda<br />di <span>Carventory</span>
            </h1>

            <p className="hero-custom-desc">
              Carventory menghadirkan pengalaman lelang mobil yang transparan,
              real-time, dan terpercaya. Dari mobil penumpang, mewah, hingga
              klasik semua tersedia di satu platform.
            </p>

            <div className="hero-actions">
              <button className="btn-custom-primary" onClick={() => navigate(heroCta.path)}>
                {heroCta.label} <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-custom-section">
        <div className="features-custom-grid">
          {FEATURES_DATA.map((feature) => (
            <div key={feature.title} className="feature-custom-card">
              <div
                className="feature-custom-icon"
                style={{ backgroundColor: `${feature.color}22`, color: feature.color }}
              >
                {React.createElement(feature.icon, { size: 22 })}
              </div>

              <div className="feature-custom-text">
                <h3 className="feature-custom-title">{feature.title}</h3>
                <p className="feature-custom-desc">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trending Section */}
      {trending.length > 0 && (
        <section className="section section-no-pt landing-trending-section">
          <div className="section-header">
            <div>
              <h2 className="section-title">🔥 Lelang Trending</h2>
              <p className="section-subtitle">Lelang paling banyak diminati saat ini</p>
            </div>

            <button className="btn btn-outline btn-sm" onClick={() => navigate('/catalog')}>
              Lihat Semua <ArrowRight size={14} />
            </button>
          </div>

          <div className="trending-carousel">
            {trending.map(auc => {
              const car = publicCars.find(c => String(c.id) === String(auc.car_id));
              const cardData = mapToCardData(car, auc);

              return cardData ? <CarCard key={auc.id} data={cardData} /> : null;
            })}
          </div>
        </section>
      )}
    </div>
  );
}
