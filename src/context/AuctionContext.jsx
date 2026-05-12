import React, { createContext, useContext, useState, useCallback } from 'react';
import { mockAuctions, mockBids, mockNotifications } from '../lib/mockData';

const AuctionContext = createContext(null);

export const AuctionProvider = ({ children }) => {
  const [auctions, setAuctions] = useState(mockAuctions);
  const [bids, setBids] = useState(mockBids);
  const [notifications, setNotifications] = useState(mockNotifications);

  // Simulate real-time: place a bid
  const placeBid = useCallback((auctionId, userId, carId, bidAmount, availableBalance = Infinity) => {
    const auction = auctions.find((a) => a.id === auctionId);
    if (!auction) return { success: false, error: 'Lelang tidak ditemukan.' };
    if (auction.status !== 'active') return { success: false, error: 'Lelang sudah berakhir atau belum dimulai.' };
    if (new Date() >= new Date(auction.end_time)) return { success: false, error: 'Waktu lelang telah habis.' };
    if (bidAmount > availableBalance) return { success: false, error: 'Maaf tapi saldo anda tidak cukup' };
    if (bidAmount <= (auction.current_highest_bid || auction.initial_price)) {
      return { success: false, error: `Penawaran harus lebih tinggi dari ${auction.current_highest_bid?.toLocaleString('id-ID')}.` };
    }

    const newBid = {
      id: `bid-${Date.now()}`,
      auction_id: auctionId,
      user_id: userId,
      car_id: carId,
      bid_amount: bidAmount,
      timestamp: new Date().toISOString(),
      status: 'active',
    };

    setBids((prev) => [newBid, ...prev]);
    setAuctions((prev) =>
      prev.map((a) =>
        a.id === auctionId ? { ...a, current_highest_bid: bidAmount, winner_id: userId } : a
      )
    );

    // Notify outbid user
    const prevHighBid = bids.find(
      (b) => b.auction_id === auctionId && b.bid_amount === auction.current_highest_bid
    );
    if (prevHighBid && prevHighBid.user_id !== userId) {
      const notif = {
        id: `notif-${Date.now()}`,
        user_id: prevHighBid.user_id,
        title: 'Penawaran Anda Terlampaui',
        message: `Penawaran Anda telah dilampaui oleh penawaran baru sebesar Rp ${bidAmount.toLocaleString('id-ID')}.`,
        is_read: false,
        created_at: new Date().toISOString(),
      };
      setNotifications((prev) => [notif, ...prev]);
    }

    return { success: true, bid: newBid };
  }, [auctions, bids]);

  const markNotificationRead = useCallback((notifId) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, is_read: true } : n))
    );
  }, []);

  const getUserBids = useCallback((userId) =>
    bids.filter((b) => b.user_id === userId).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)),
    [bids]
  );

  const getAuctionBids = useCallback((auctionId) =>
    bids.filter((b) => b.auction_id === auctionId).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)),
    [bids]
  );

  const getUserNotifications = useCallback((userId) =>
    notifications.filter((n) => n.user_id === userId).sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
    [notifications]
  );

  // Admin: add car
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
      value={{ auctions, bids, notifications, placeBid, getUserBids, getAuctionBids, getUserNotifications, markNotificationRead, addAuction, endAuction }}
    >
      {children}
    </AuctionContext.Provider>
  );
};

export const useAuction = () => useContext(AuctionContext);
