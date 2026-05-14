const supabase = require('../config/database');
const ApiError = require('../utils/ApiError');

const buyNowService = {
  async buyNow(buyerId, carId) {
    // 1. Ambil data mobil beserta seller-nya
    const { data: car, error: carError } = await supabase
      .from('cars')
      .select('id, brand, model, seller_id, buy_now_price, status')
      .eq('id', carId)
      .single();

    if (carError || !car) throw ApiError.notFound('Kendaraan tidak ditemukan');

    if (!car.buy_now_price || car.buy_now_price <= 0) {
      throw ApiError.badRequest('Kendaraan ini tidak memiliki harga langsung beli');
    }

    if (car.status === 'sold') {
      throw ApiError.badRequest('Kendaraan ini sudah terjual');
    }

    if (car.status === 'pending') {
      throw ApiError.badRequest('Kendaraan belum disetujui untuk dijual');
    }

    if (Number(car.seller_id) === Number(buyerId)) {
      throw ApiError.forbidden('Penjual tidak dapat membeli kendaraan milik sendiri');
    }

    const price = parseFloat(car.buy_now_price);

    // 2. Pre-check saldo pembeli (untuk pesan error yang jelas)
    const { data: buyer, error: buyerError } = await supabase
      .from('users')
      .select('deposit_balance')
      .eq('id', buyerId)
      .single();

    if (buyerError || !buyer) throw ApiError.notFound('Data pembeli tidak ditemukan');

    if (parseFloat(buyer.deposit_balance) < price) {
      throw ApiError.badRequest(
        `Saldo tidak cukup. Saldo Anda: Rp ${parseFloat(buyer.deposit_balance).toLocaleString('id-ID')}, dibutuhkan: Rp ${price.toLocaleString('id-ID')}`
      );
    }

    const now = new Date().toISOString();
    const ref = `BUYNOW-${Date.now()}-${buyerId}`;

    // 3. Buat record transaksi terlebih dahulu
    const { data: transaction, error: txError } = await supabase
      .from('transaction')
      .insert([{
        user_id: buyerId,
        auction_id: null,
        amount: price,
        payment_status: 'paid',
        type: 'buy_now',
        payment_gateway_ref: ref,
        transaction_date: now,
        created_at: now
      }])
      .select()
      .single();

    if (txError) throw ApiError.internal('Gagal membuat transaksi pembelian');

    // 4. Atomic deduct saldo pembeli via RPC
    const { data: newBalance, error: balanceError } = await supabase
      .rpc('decrement_user_balance', { uid: buyerId, sub_amount: price });

    if (balanceError || newBalance === null || newBalance === undefined) {
      // Rollback transaksi
      await supabase.from('transaction').delete().eq('id', transaction.id);
      throw ApiError.badRequest(
        balanceError?.message?.includes('Saldo tidak cukup')
          ? 'Saldo tidak cukup untuk melakukan pembelian ini'
          : 'Gagal memproses pembayaran, transaksi dibatalkan'
      );
    }

    // 5. Update status mobil menjadi sold
    await supabase.from('cars').update({ status: 'sold' }).eq('id', carId);

    // 6. Jika ada lelang aktif untuk mobil ini, akhiri lelang
    await supabase
      .from('auction')
      .update({ status: 'ended' })
      .eq('car_id', carId)
      .in('status', ['active', 'upcoming']);

    // 7. Notifikasi pembeli
    await supabase.from('notifications').insert([{
      user_id: buyerId,
      title: 'Pembelian Berhasil!',
      message: `Anda berhasil membeli ${car.brand} ${car.model} seharga Rp ${price.toLocaleString('id-ID')}. Saldo Anda sekarang Rp ${parseFloat(newBalance).toLocaleString('id-ID')}.`,
      is_read: false,
      created_at: now
    }]);

    // 8. Notifikasi penjual
    await supabase.from('notifications').insert([{
      user_id: car.seller_id,
      title: 'Kendaraan Terjual!',
      message: `${car.brand} ${car.model} Anda telah dibeli langsung seharga Rp ${price.toLocaleString('id-ID')}.`,
      is_read: false,
      created_at: now
    }]);

    return {
      transaction,
      car: { id: car.id, brand: car.brand, model: car.model },
      deposit_balance: parseFloat(newBalance)
    };
  }
};

module.exports = buyNowService;
