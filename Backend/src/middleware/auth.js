const jwt = require('jsonwebtoken');
const env = require('../config/env');
const supabase = require('../config/database');
const ApiError = require('../utils/ApiError');

const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized('Please authenticate');
    }

    const token = authHeader.split(' ')[1];
    
    let decoded;
    try {
      decoded = jwt.verify(token, env.JWT_SECRET);
    } catch (err) {
      throw ApiError.unauthorized('Invalid or expired token');
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('id, username, email, role')
      .eq('id', decoded.id)
      .single();

    if (error || !user) {
      throw ApiError.unauthorized('User not found');
    }

    // Ambil deposit_balance terpisah — kolom ini mungkin belum ada di DB
    // jika gagal, default 0 (tidak block auth)
    let depositBalance = 0;
    try {
      const { data: balanceRow } = await supabase
        .from('users')
        .select('deposit_balance')
        .eq('id', decoded.id)
        .single();
      depositBalance = parseFloat(balanceRow?.deposit_balance) || 0;
    } catch {
      // kolom belum ada — biarkan 0
    }

    req.user = { ...user, deposit_balance: depositBalance };
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = auth;
