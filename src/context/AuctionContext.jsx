import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import api from '../lib/api';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const AuctionContext = createContext(null);
const SOCKET_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace('/api', '')
  : 'http://localhost:6767';

export const AuctionProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [auctions, setAuctions] = useState([]);
  const [cars, setCars] = useState([]);
  const [bids, setBids] = useState([]);

  const fetchData = useCallback(async () => {
    try {
      const [carsRes, auctionsRes] = await Promise.all([
        api.get('/cars'),
        api.get('/auctions'),
      ]);
      setCars(carsRes.data.data || []);
      setAuctions(auctionsRes.data.data || []);
    } catch (err) {
      console.error('Failed to fetch data', err);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Socket — hanya konek saat user sudah login, cleanup saat logout/user berganti
  useEffect(() => {
    if (!currentUser) return;

    const token = localStorage.getItem('token');
    const newSocket = io(SOCKET_URL, {
      auth: { token: token || '' },
      reconnectionAttempts: 5,
    });

    newSocket.on('new_bid', (data) => {
      // Validasi payload sebelum update state
      if (!data || !data.auction_id || !data.bid_amount) {
        console.warn('Invalid new_bid payload:', data);
        return;
      }
      setBids((prev) => [data, ...prev]);
      setAuctions((prev) =>
        prev.map((a) =>
          a.id === data.auction_id
            ? { ...a, current_highest_bid: data.bid_amount }
            : a
        )
      );
    });

    newSocket.on('connect_error', (err) => {
      console.warn('Socket connection error:', err.message);
    });

    return () => {
      newSocket.off('new_bid');
      newSocket.disconnect();
    };
  }, [currentUser?.id]); // Reconnect hanya saat user ID berubah (login/logout)

  const placeBid = useCallback(async (auctionId, bidAmount) => {
    try {
      const res = await api.post('/bids', { auction_id: auctionId, bid_amount: bidAmount });
      return { success: true, bid: res.data.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Gagal melakukan penawaran.' };
    }
  }, []);

  const getAuctionBids = useCallback(
    (auctionId) =>
      bids
        .filter((b) => b.auction_id === auctionId)
        .sort((a, b) => new Date(b.bid_time) - new Date(a.bid_time)),
    [bids]
  );

  const getUserBids = useCallback(
    (userId) =>
      bids
        .filter((b) => b.user_id === userId)
        .sort((a, b) => new Date(b.bid_time) - new Date(a.bid_time)),
    [bids]
  );

  // Cars yang layak ditampilkan di katalog publik (tanpa sold & unverified)
  const publicCars = useMemo(
    () => cars.filter((c) => c.status !== 'sold' && c.is_verified !== false),
    [cars]
  );

  return (
    <AuctionContext.Provider
      value={{
        cars,
        publicCars,
        setCars,
        auctions,
        bids,
        placeBid,
        getUserBids,
        getAuctionBids,
        refreshData: fetchData,
      }}
    >
      {children}
    </AuctionContext.Provider>
  );
};

export const useAuction = () => useContext(AuctionContext);
