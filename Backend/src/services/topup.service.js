const supabase = require('../config/database');
const ApiError = require('../utils/ApiError');

const topupService = {
  async topUp(userId, amount) {
    const ref = `TOPUP-${Date.now()}-${userId}`;
    const now = new Date().toISOString();

    // 1. Increment balance DULU (atomic) — jika ini gagal, tidak ada yang dibuat
    const { data: newBalance, error: balanceError } = await supabase
      .rpc('increment_user_balance', { uid: userId, add_amount: parseFloat(amount) });

    if (balanceError || newBalance === null || newBalance === undefined) {
      throw ApiError.internal(
        balanceError?.message?.includes('increment_user_balance')
          ? 'Fungsi increment_user_balance belum dibuat. Jalankan migration.sql di Supabase SQL Editor.'
          : 'Gagal memperbarui saldo'
      );
    }

    const balance = parseFloat(newBalance);

    // 2. Buat record transaksi setelah saldo berhasil diperbarui
    const { data: transaction, error: txError } = await supabase
      .from('transaction')
      .insert([{
        user_id: userId,
        auction_id: null,
        amount,
        payment_status: 'paid',
        type: 'topup',
        payment_gateway_ref: ref,
        transaction_date: now,
        created_at: now
      }])
      .select()
      .single();

    if (txError) {
      // Rollback: kembalikan saldo karena transaksi tidak tercatat
      await supabase.rpc('decrement_user_balance', { uid: userId, sub_amount: parseFloat(amount) });
      throw ApiError.internal('Gagal mencatat transaksi, saldo sudah dikembalikan');
    }

    // 3. Notifikasi
    await supabase.from('notifications').insert([{
      user_id: userId,
      title: 'Top Up Berhasil',
      message: `Top up sebesar Rp ${Number(amount).toLocaleString('id-ID')} berhasil. Saldo Anda sekarang Rp ${balance.toLocaleString('id-ID')}.`,
      is_read: false,
      created_at: now
    }]);

    return { transaction, deposit_balance: balance };
  },

  async getBalance(userId) {
    const { data, error } = await supabase
      .from('users')
      .select('deposit_balance')
      .eq('id', userId)
      .single();

    if (error || !data) throw ApiError.notFound('User not found');
    return { balance: parseFloat(data.deposit_balance) || 0 };
  },

  async getHistory(userId, page = 1, limit = 10) {
    const offset = (page - 1) * limit;

    const { data, error, count } = await supabase
      .from('transaction')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .eq('type', 'topup')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw ApiError.internal('Gagal mengambil riwayat top up');

    return {
      history: data,
      meta: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    };
  }
};

module.exports = topupService;
