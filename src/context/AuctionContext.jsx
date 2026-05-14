import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import api from '../lib/api';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const AuctionContext = createContext(null);
const SOCKET_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:6767';

export const AuctionProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [auctions, setAuctions] = useState([]);
  const [cars, setCars] = useState([]);
  const [bids, setBids] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [socket, setSocket] = useState(null);

  const fetchData = async () => {
    try {
      const [carsRes, auctionsRes] = await Promise.all([
        api.get('/cars'),
        api.get('/auctions')
      ]);
      setCars(carsRes.data.data || []);
      setAuctions(auctionsRes.data.data || []);
    } catch (err) {
      console.error('Failed to fetch data', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.on('new_bid', (data) => {
      setBids((prev) => [data.bid, ...prev]);
      setAuctions((prev) =>
        prev.map((a) =>
          a.id === data.auctionId ? { ...a, current_highest_bid: data.bid.bid_ammount } : a
        )
      );
    });

    return () => newSocket.close();
  }, []);

  // Place bid through API
  const placeBid = useCallback(async (auctionId, bidAmount) => {
    try {
      const res = await api.post(`/bids`, { auctionId, bidAmount });
      return { success: true, bid: res.data.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Gagal melakukan penawaran.' };
    }
  }, []);

  const markNotificationRead = useCallback((notifId) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, is_read: true } : n))
    );
  }, []);

  const getUserBids = useCallback((userId) =>
    bids.filter((b) => b.user_id === userId).sort((a, b) => new Date(b.bid_time) - new Date(a.bid_time)),
    [bids]
  );

  const getAuctionBids = useCallback((auctionId) =>
    bids.filter((b) => b.auction_id === auctionId).sort((a, b) => new Date(b.bid_time) - new Date(a.bid_time)),
    [bids]
  );

  const getUserNotifications = useCallback((userId) =>
    notifications.filter((n) => n.user_id === userId).sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
    [notifications]
  );

  const addAuction = useCallback((auction) => {
    setAuctions((prev) => [...prev, auction]);
  }, []);

  const endAuction = useCallback((auctionId) => {
    setAuctions((prev) =>
      prev.map((a) => (a.id === auctionId ? { ...a, status: 'ended' } : a))
    );
  }, []);

  return (
    <AuctionContext.Provider
      value={{ cars, auctions, bids, notifications, placeBid, getUserBids, getAuctionBids, getUserNotifications, markNotificationRead, addAuction, endAuction, refreshData: fetchData }}
    >
      {children}
    </AuctionContext.Provider>
  );
};

export const useAuction = () => useContext(AuctionContext);
