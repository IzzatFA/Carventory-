const supabase = require('../config/database');
const ApiError = require('../utils/ApiError');

const buyNowService = {
  async buyNow(buyerId, carId) {
    // 1. Validasi mobil
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

    // 2. Pre-check saldo (untuk pesan error yang jelas sebelum RPC)
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

    // 3. Deduct saldo DULU via RPC atomic — jika ini gagal, tidak ada yang berubah
    const { data: newBalance, error: balanceError } = await supabase
      .rpc('decrement_user_balance', { uid: buyerId, sub_amount: price });

    if (balanceError || newBalance === null || newBalance === undefined) {
      throw ApiError.badRequest(
        balanceError?.message?.includes('Saldo tidak cukup')
          ? 'Saldo tidak cukup untuk melakukan pembelian ini'
          : 'Gagal memproses pembayaran'
      );
    }

    // 4. Buat record transaksi setelah saldo berhasil dikurangi
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

    if (txError) {
      // Rollback saldo karena transaksi tidak bisa dicatat
      await supabase.rpc('increment_user_balance', { uid: buyerId, add_amount: price });
      throw ApiError.internal('Gagal mencatat transaksi, saldo sudah dikembalikan');
    }

    // 5. Update status mobil menjadi sold
    await supabase.from('cars').update({ status: 'sold' }).eq('id', carId);

    // 6. Akhiri lelang untuk mobil ini dengan menggeser end_time ke masa lalu
    // Menggunakan end_time agar computed_status frontend langsung mendeteksi 'ended'
    // tanpa bergantung pada kolom status yang mungkin belum ada
    const pastTime = new Date(Date.now() - 1000).toISOString();
    await supabase
      .from('auction')
      .update({ end_time: pastTime })
      .eq('car_id', carId)
      .gt('end_time', now); // Hanya update jika belum berakhir

    // 7. Kredit saldo ke penjual
    await supabase.rpc('increment_user_balance', { uid: car.seller_id, add_amount: price });

    // 8. Notifikasi pembeli
    await supabase.from('notifications').insert([{
      user_id: buyerId,
      title: 'Pembelian Berhasil!',
      message: `Anda berhasil membeli ${car.brand} ${car.model} seharga Rp ${price.toLocaleString('id-ID')}. Saldo Anda sekarang Rp ${parseFloat(newBalance).toLocaleString('id-ID')}.`,
      is_read: false,
      created_at: now
    }]);

    // 9. Notifikasi penjual
    await supabase.from('notifications').insert([{
      user_id: car.seller_id,
      title: 'Kendaraan Terjual!',
      message: `${car.brand} ${car.model} Anda telah dibeli langsung seharga Rp ${price.toLocaleString('id-ID')}. Saldo Anda bertambah Rp ${price.toLocaleString('id-ID')}.`,
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
