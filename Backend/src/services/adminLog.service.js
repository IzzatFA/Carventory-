const supabase = require('../config/database');
const ApiError = require('../utils/ApiError');

const adminLogService = {
  /**
   * Log an admin action
   */
  async logAction(adminId, action, targetId, targetType, details = '') {
    try {
      await supabase.from('admin_log').insert([{
        admin_id: adminId,
        action,
        target_id: targetId,
        target_type: targetType,
        details
      }]);
    } catch (error) {
      console.error('Failed to log admin action:', error.message);
    }
  },

  async getLogs(page = 1, limit = 10) {
    const offset = (page - 1) * limit;

    const { data, error, count } = await supabase
      .from('admin_log')
      .select(`
        *,
        admin:users!admin_id(id, username, email)
      `, { count: 'exact' })
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (error) throw ApiError.internal('Failed to fetch logs');

    return {
      logs: data,
      meta: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    };
  }
};

module.exports = adminLogService;
