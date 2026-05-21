const jwt = require('jsonwebtoken');
const supabase = require('../config/database');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');

const authService = {
  async register(userData) {
    const { username, email, password, role } = userData;

    // maybeSingle() → tidak error saat 0 rows, berbeda dengan single() yang throw PGRST116
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existingUser) {
      throw ApiError.conflict('Email sudah terdaftar');
    }

    // Insert — tidak include deposit_balance di select agar tidak crash
    // jika kolom belum exist di DB (CREATE TABLE IF NOT EXISTS melewati kolom baru)
    const { data: newUser, error } = await supabase
      .from('users')
      .insert([{ username, email, password, role: role || 'user' }])
      .select('id, username, email, role, created_at')
      .single();

    if (error || !newUser) {
      throw ApiError.internal('Gagal membuat akun: ' + (error?.message || 'Unknown error'));
    }

    // deposit_balance default 0 — kolom ini mungkin belum ada, aman di-default
    return { ...newUser, deposit_balance: 0 };
  },

  async login(email, password) {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, username, email, password, role, created_at')
      .eq('email', email)
      .maybeSingle();

    if (error || !user) {
      throw ApiError.unauthorized('Email atau password salah');
    }

    if (password !== user.password) {
      throw ApiError.unauthorized('Email atau password salah');
    }

    // Ambil deposit_balance terpisah agar tidak crash jika kolom belum ada
    let depositBalance = 0;
    try {
      const { data: balanceData } = await supabase
        .from('users')
        .select('deposit_balance')
        .eq('id', user.id)
        .single();
      depositBalance = parseFloat(balanceData?.deposit_balance) || 0;
    } catch {
      // Kolom deposit_balance belum ada — defaultkan ke 0
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN }
    );

    const { password: _, ...userWithoutPassword } = user;

    return {
      user: { ...userWithoutPassword, deposit_balance: depositBalance },
      token
    };
  }
};

module.exports = authService;
