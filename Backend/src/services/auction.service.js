const supabase = require('../config/database');
const ApiError = require('../utils/ApiError');
const adminLogService = require('./adminLog.service');

const auctionService = {
  async createAuction(auctionData, adminId) {
    const { car_id, start_time, end_time } = auctionData;

    // Verify car exists and is active
    const { data: car } = await supabase.from('cars').select('status, starting_price').eq('id', car_id).single();
    if (!car) throw ApiError.notFound('Car not found');
    if (car.status !== 'active') throw ApiError.badRequest('Car status must be active to auction');

    const { data, error } = await supabase
      .from('auction')
      .insert([{
        car_id,
        start_time,
        end_time,
        current_highest_bid: car.starting_price
      }])
      .select()
      .single();

    if (error) throw ApiError.internal('Failed to create auction');
    
    await adminLogService.logAction(adminId, 'CREATE_AUCTION', data.id, 'auction');

    return data;
  },

  async getAllAuctions(status, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const now = new Date().toISOString();

    let query = supabase.from('auction').select('*, car:cars(*)', { count: 'exact' });

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
      auctions: data,
      meta: { page: parseInt(page), limit: parseInt(limit), total: count, totalPages: Math.ceil(count / limit) }
    };
  },

  async getAuctionById(id) {
    const { data, error } = await supabase
      .from('auction')
      .select('*, car:cars(*, seller:users(id, username))')
      .eq('id', id)
      .single();

    if (error) throw ApiError.notFound('Auction not found');
    return data;
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

    return data;
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

    return data;
  }
};

module.exports = auctionService;
