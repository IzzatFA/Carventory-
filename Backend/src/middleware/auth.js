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

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = auth;
