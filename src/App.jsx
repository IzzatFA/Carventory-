import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AuctionProvider } from './context/AuctionContext';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CatalogPage from './pages/CatalogPage';
import CarDetailPage from './pages/CarDetailPage';
import BiddingRoom from './pages/BiddingRoom';
import BidHistoryPage from './pages/BidHistoryPage';
import TopUpPage from './pages/TopUpPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboard from './pages/admin/AdminDashboard';
import ReviewCarPage from './pages/admin/ReviewCarPage';
import SellerDashboard from './pages/seller/SellerDashboard';
import AddCarPage from './pages/seller/AddCarPage';
import EditCarPage from './pages/seller/EditCarPage';

const AUTH_PATHS = ['/login', '/register'];

function AppLayout() {
  const location = useLocation();
  const isAuth = AUTH_PATHS.includes(location.pathname);
  if (isAuth) return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
    </Routes>
  );
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/auctions/:id" element={<BiddingRoom />} />
          <Route path="/cars/:id" element={<CarDetailPage />} />
          <Route path="/history" element={<BidHistoryPage />} />
          <Route path="/topup" element={<TopUpPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/seller" element={<SellerDashboard />} />
          <Route path="/seller/cars/add" element={<AddCarPage />} />
          <Route path="/seller/cars/:id/edit" element={<EditCarPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/review-cars/:id" element={<ReviewCarPage />} />
          <Route path="*" element={<div className="container" style={{padding:'60px 0',textAlign:'center'}}><h2>404 — Halaman tidak ditemukan</h2></div>} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AuctionProvider>
          <AppLayout />
        </AuctionProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
