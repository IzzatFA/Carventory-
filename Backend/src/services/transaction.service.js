const supabase = require('../config/database');
const ApiError = require('../utils/ApiError');
const adminLogService = require('./adminLog.service');

const transactionService = {
  async createTransaction(transactionData, adminId) {
    const { auction_id, amount, payment_status } = transactionData;

    // Check if auction is ended and has a winner
    const { data: auction } = await supabase
      .from('auction')
      .select('end_time, winner_id, car_id')
      .eq('id', auction_id)
      .single();

    if (!auction) throw ApiError.notFound('Auction not found');
    if (new Date(auction.end_time) > new Date()) throw ApiError.badRequest('Auction has not ended yet');
    if (!auction.winner_id) throw ApiError.badRequest('Auction does not have a winner yet');

    const { data, error } = await supabase
      .from('transaction')
      .insert([{
        auction_id,
        amount,
        payment_status: payment_status || 'pending',
        transaction_date: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw ApiError.internal('Failed to create transaction');

    // If paid, update car status to sold
    if (payment_status === 'paid') {
      await supabase.from('cars').update({ status: 'sold' }).eq('id', auction.car_id);
    }

    await adminLogService.logAction(adminId, 'CREATE_TRANSACTION', data.id, 'transaction');

    return data;
  },

  async getAllTransactions(page = 1, limit = 10) {
    const offset = (page - 1) * limit;

    const { data, error, count } = await supabase
      .from('transaction')
      .select('*, auction:auction(*, car:cars(brand, model), winner:users(username))', { count: 'exact' })
      .range(offset, offset + limit - 1)
      .order('transaction_date', { ascending: false });

    if (error) throw ApiError.internal('Failed to fetch transactions');

    return {
      transactions: data,
      meta: { page: parseInt(page), limit: parseInt(limit), total: count, totalPages: Math.ceil(count / limit) }
    };
  },

  async getTransactionById(id) {
    const { data, error } = await supabase
      .from('transaction')
      .select('*, auction:auction(*, car:cars(*), winner:users(*))')
      .eq('id', id)
      .single();

    if (error) throw ApiError.notFound('Transaction not found');
    return data;
  },

  async updateStatus(id, payment_status, adminId) {
    const { data, error } = await supabase
      .from('transaction')
      .update({ payment_status })
      .eq('id', id)
      .select('*, auction(car_id)')
      .single();

    if (error) throw ApiError.internal('Failed to update transaction status');

    // If paid, update car status to sold
    if (payment_status === 'paid' && data.auction?.car_id) {
      await supabase.from('cars').update({ status: 'sold' }).eq('id', data.auction.car_id);
    }

    await adminLogService.logAction(adminId, 'UPDATE_TRANSACTION_STATUS', id, 'transaction', `Status changed to ${payment_status}`);

    return data;
  }
};

module.exports = transactionService;
