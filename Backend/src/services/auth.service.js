const jwt = require('jsonwebtoken');
const supabase = require('../config/database');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');

const authService = {
  /**
   * Register a new user
   * @param {Object} userData
   */
  async register(userData) {
    const { username, email, password, role } = userData;

    // Check if email exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      throw ApiError.conflict('Email already registered');
    }

    // Insert user
    const { data: newUser, error } = await supabase
      .from('users')
      .insert([
        {
          username,
          email,
          password,
          role: role || 'user'
        }
      ])
      .select('id, username, email, role, deposit_balance, created_at')
      .single();

    if (error) {
      throw ApiError.internal('Failed to create user');
    }

    return newUser;
  },

  /**
   * Login user and return JWT
   * @param {String} email
   * @param {String} password
   */
  async login(email, password) {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, username, email, password, role, deposit_balance')
      .eq('email', email)
      .single();

    if (error || !user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    // Verify password
    if (password !== user.password) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, role: user.role },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN }
    );

    // Remove password from returned object
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token
    };
  }
};

module.exports = authService;
