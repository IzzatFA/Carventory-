import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal } from 'lucide-react';
import { mockCars, mockAuctions } from '../lib/mockData';
import CarCard from '../components/CarCard';

const CATS = [
  { id: 'all', label: 'Semua' },
  { id: 'penumpang', label: 'Penumpang' },
  { id: 'mewah', label: 'Mewah' },
  { id: 'klasik', label: 'Klasik' },
];

export default function CatalogPage() {
  const [params] = useSearchParams();
  const [cat, setCat] = useState(params.get('category') || 'all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('name');

  useEffect(() => { const c = params.get('category'); if (c) setCat(c); }, [params]);

  const filtered = mockCars
    .filter(c => cat === 'all' || c.category === cat)
    .filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === 'price_asc') return a.initial_price - b.initial_price;
      if (sort === 'price_desc') return b.initial_price - a.initial_price;
      return a.name.localeCompare(b.name);
    });

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Katalog Kendaraan</h1>
        <p className="page-sub">Temukan kendaraan pilihan Anda dari berbagai kategori</p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 20, flexWrap: 'wrap' }}>
        <div className="filter-tabs">
          {CATS.map(c => (
            <button key={c.id} className={`filter-tab ${cat === c.id ? 'active' : ''}`} onClick={() => setCat(c.id)}>
              {c.label}
            </button>
          ))}
        </div>
        <div style={{ flex: 1, minWidth: 200 }} className="search-bar">
          <Search size={16} className="search-icon" />
          <input className="input" placeholder="Cari kendaraan..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <SlidersHorizontal size={16} style={{ color: 'var(--text3)' }} />
          <select className="input" style={{ width: 'auto' }} value={sort} onChange={e => setSort(e.target.value)}>
            <option value="name">Nama A-Z</option>
            <option value="price_asc">Harga Terendah</option>
            <option value="price_desc">Harga Tertinggi</option>
          </select>
        </div>
      </div>

      {/* Results */}
      <div style={{ color: 'var(--text3)', fontSize: 13, marginBottom: 16 }}>
        Menampilkan <strong style={{ color: 'var(--text)' }}>{filtered.length}</strong> kendaraan
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
            const auction = mockAuctions.find(a => a.car_id === car.id);
            return <CarCard key={car.id} car={car} auction={auction} />;
          })}
        </div>
      )}
    </div>
  );
}
