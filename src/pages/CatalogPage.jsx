import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal } from 'lucide-react';
import { useAuction } from '../context/AuctionContext';
import CarCard from '../components/CarCard';
import './CatalogPage.css';

const CATS = [
  { id: 'all', label: 'Semua' },
  { id: 'penumpang', label: 'Penumpang' },
  { id: 'mewah', label: 'Mewah' },
  { id: 'klasik', label: 'Klasik' },
];

const getAuctionStatus = (auction) => {
  if (!auction) return 'upcoming';

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
    lokasi: car.location || 'Jakarta Barat',
    statusLelang: getAuctionStatus(auction),
  };
};

export default function CatalogPage() {
  const [params] = useSearchParams();
  const [cat, setCat] = useState(params.get('category') || 'all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('name');
  
  const { cars, auctions } = useAuction();

  useEffect(() => {
    const c = params.get('category');
    if (c) setCat(c);
  }, [params]);

  const filtered = useMemo(() => {
    return cars
      .filter(car => car.status !== 'sold')
      .filter(car => car.is_verified === true || car.status === 'active')
      .filter(car => {
        const auction = auctions.find(a => String(a.car_id) === String(car.id));
        return getAuctionStatus(auction) !== 'ended';
      })
      .filter(car => cat === 'all' || car.category === cat)
      .filter(car => {
        const carName = car.model ? `${car.brand} ${car.model}` : car.name;
        return carName?.toLowerCase().includes(search.toLowerCase());
      })
      .sort((a, b) => {
        const priceA = a.starting_price || a.initial_price;
        const priceB = b.starting_price || b.initial_price;
        const nameA = a.model ? `${a.brand} ${a.model}` : a.name;
        const nameB = b.model ? `${b.brand} ${b.model}` : b.name;
        
        if (sort === 'price_asc') return priceA - priceB;
        if (sort === 'price_desc') return priceB - priceA;
        return nameA?.localeCompare(nameB);
      });
  }, [cars, auctions, cat, search, sort]);

  return (
    <div className="page catalog-page">
      <div className="catalog-page-inner">
        <div className="page-header catalog-header">
          <h1 className="page-title">Katalog Kendaraan</h1>
          <p className="page-title">Temukan kendaraan pilihan Anda dari berbagai kategori</p>
        </div>

        <div className="filter-container">
          <div className="filter-tabs">
            {CATS.map(c => (
              <button
                key={c.id}
                className={`filter-tab ${cat === c.id ? 'active' : ''}`}
                onClick={() => setCat(c.id)}
              >
                {c.label}
              </button>
            ))}
          </div>

          <div className="search-bar">
            <Search size={16} className="search-icon" />
            <input
              className="input search-input"
              placeholder="Cari kendaraan..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="sort-container">
            <SlidersHorizontal size={16} className="sort-icon" />
            <select
              className="input sort-select"
              value={sort}
              onChange={e => setSort(e.target.value)}
            >
              <option value="name">Nama A-Z</option>
              <option value="price_asc">Harga Terendah</option>
              <option value="price_desc">Harga Tertinggi</option>
            </select>
          </div>
        </div>

        <div className="results-info">
          Menampilkan <strong>{filtered.length}</strong> kendaraan
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🚗</div>
            <h3>Kendaraan Tidak Ditemukan</h3>
            <p>Coba ubah filter atau kata kunci pencarian</p>
          </div>
        ) : (
          <div className="cars-grid">
            {filtered.map(car => {
              const auction = auctions.find(a => String(a.car_id) === String(car.id));
              const cardData = mapToCardData(car, auction);

              return cardData ? <CarCard key={car.id} data={cardData} /> : null;
            })}
          </div>
        )}
      </div>
    </div>
  );
}
