const supabase = require('../config/database');
const ApiError = require('../utils/ApiError');
const { emitNewBid } = require('../websocket');

const bidService = {
  async placeBid(userId, auctionId, bidAmount) {
    // 1. Get auction details
    const { data: auction } = await supabase
      .from('auction')
      .select('*, car:cars(seller_id)')
      .eq('id', auctionId)
      .single();

    if (!auction) throw ApiError.notFound('Auction not found');

    const now = new Date();
    const startTime = new Date(auction.start_time);
    const endTime = new Date(auction.end_time);

    // 2. Validate auction state
    if (now < startTime) throw ApiError.badRequest('Auction has not started yet');
    if (now > endTime) throw ApiError.badRequest('Auction has ended');
    
    // 3. Validate user is not seller
    if (auction.car.seller_id === userId) {
      throw ApiError.forbidden('Seller cannot bid on their own car');
    }

    // 4. Validate bid amount
    if (bidAmount <= auction.current_highest_bid) {
      throw ApiError.badRequest(`Bid must be higher than current highest bid (${auction.current_highest_bid})`);
    }

    // 5. Place bid & update auction highest bid (using a transaction-like approach or sequential if no RPC)
    const { data: newBid, error: bidError } = await supabase
      .from('bid')
      .insert([{
        auction_id: auctionId,
        user_id: userId,
        bid_amount: bidAmount,
        bid_time: new Date().toISOString()
      }])
      .select('*, user:users(id, username)')
      .single();

    if (bidError) throw ApiError.internal('Failed to place bid');

    const { error: auctionUpdateError } = await supabase
      .from('auction')
      .update({ current_highest_bid: bidAmount })
      .eq('id', auctionId);

    if (auctionUpdateError) {
      // Rollback: delete the bid we just inserted since auction state is inconsistent
      await supabase.from('bid').delete().eq('id', newBid.id);
      throw ApiError.internal('Failed to complete bid placement, please try again');
    }

    // 6. Emit via WebSocket
    emitNewBid(auctionId, newBid);

    return newBid;
  },

  async getBidsByAuction(auctionId) {
    const { data, error } = await supabase
      .from('bid')
      .select('*, user:users(id, username)')
      .eq('auction_id', auctionId)
      .order('bid_amount', { ascending: false });

    if (error) throw ApiError.internal('Failed to fetch bids');
    return data;
  },

  async getBidsByUser(userId) {
    const { data, error } = await supabase
      .from('bid')
      .select('*, auction:auction(*, car:cars(brand, model))')
      .eq('user_id', userId)
      .order('bid_time', { ascending: false });

    if (error) throw ApiError.internal('Failed to fetch user bids');
    return data;
  }
};

module.exports = bidService;
