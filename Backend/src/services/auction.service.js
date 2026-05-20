const supabase = require('../config/database');
const ApiError = require('../utils/ApiError');
const adminLogService = require('./adminLog.service');

// Compute status from timestamps so frontend always gets a valid status value
// even if the DB column doesn't exist yet.
function computeStatus(auction) {
  const nowMs = Date.now();
  if (nowMs < new Date(auction.start_time).getTime()) return 'upcoming';
  if (nowMs > new Date(auction.end_time).getTime())   return 'ended';
  return 'active';
}

function withComputedStatus(auc) {
  const computed = computeStatus(auc);
  return { ...auc, status: auc.status || computed, computed_status: computed };
}

const auctionService = {
  async createAuction(auctionData, adminId) {
    const { car_id, start_time, end_time } = auctionData;

    const { data: car } = await supabase
      .from('cars')
      .select('status, starting_price')
      .eq('id', car_id)
      .single();

    if (!car) throw ApiError.notFound('Car not found');
    if (car.status !== 'active') throw ApiError.badRequest('Car status must be active to auction');

    const { data, error } = await supabase
      .from('auction')
      .insert([{ car_id, start_time, end_time, current_highest_bid: car.starting_price }])
      .select()
      .single();

    if (error) throw ApiError.internal('Failed to create auction');

    await adminLogService.logAction(adminId, 'CREATE_AUCTION', data.id, 'auction');
    return withComputedStatus(data);
  },

  async getAllAuctions(status, page = 1, limit = 50) {
    const offset = (page - 1) * limit;
    const now = new Date().toISOString();

    // Select specific car columns to avoid crash if compat-migration columns are missing
    let query = supabase
      .from('auction')
      .select(
        '*, car:cars(id, seller_id, car_id, brand, model, year, starting_price, buy_now_price, status, description, image_url)',
        { count: 'exact' }
      );

    if (status === 'active') {
      query = query.lte('start_time', now).gt('end_time', now);
    } else if (status === 'upcoming') {
      query = query.gt('start_time', now);
    } else if (status === 'ended') {
      query = query.lte('end_time', now);
    }

    const { data, error, count } = await query
      .range(offset, offset + limit - 1)
      .order('end_time', { ascending: true });

    if (error) throw ApiError.internal('Failed to fetch auctions');

    return {
      auctions: data.map(withComputedStatus),
      meta: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    };
  },

  async getAuctionById(id) {
    const { data, error } = await supabase
      .from('auction')
      .select('*, car:cars(*, seller:users(id, username))')
      .eq('id', id)
      .single();

    if (error) throw ApiError.notFound('Auction not found');
    return withComputedStatus(data);
  },

  async updateAuction(id, updateData, adminId) {
    const { data, error } = await supabase
      .from('auction')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw ApiError.internal('Failed to update auction');

    await adminLogService.logAction(adminId, 'UPDATE_AUCTION', id, 'auction', JSON.stringify(updateData));
    return withComputedStatus(data);
  },

  async deleteAuction(id, adminId) {
    const { error } = await supabase.from('auction').delete().eq('id', id);
    if (error) throw ApiError.internal('Failed to delete auction');

    await adminLogService.logAction(adminId, 'DELETE_AUCTION', id, 'auction');
    return true;
  },

  async setWinner(id, winnerId, adminId) {
    const { data, error } = await supabase
      .from('auction')
      .update({ winner_id: winnerId })
      .eq('id', id)
      .select()
      .single();

    if (error) throw ApiError.internal('Failed to set winner');

    await adminLogService.logAction(adminId, 'SET_AUCTION_WINNER', id, 'auction', `Winner ID: ${winnerId}`);
    return withComputedStatus(data);
  }
};

module.exports = auctionService;
