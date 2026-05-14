const supabase = require('../config/database');
const ApiError = require('../utils/ApiError');

const userService = {
  async getAllUsers(page = 1, limit = 10) {
    const offset = (page - 1) * limit;

    const { data, error, count } = await supabase
      .from('users')
      .select('id, username, email, role, deposit_balance, created_at', { count: 'exact' })
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (error) throw ApiError.internal('Failed to fetch users');

    return {
      users: data,
      meta: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    };
  },

  async getUserById(id) {
    const { data, error } = await supabase
      .from('users')
      .select('id, username, email, role, deposit_balance, created_at')
      .eq('id', id)
      .single();

    if (error) throw ApiError.notFound('User not found');
    return data;
  },

  async deleteUser(id) {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) throw ApiError.internal('Failed to delete user');
    return true;
  }
};

module.exports = userService;
