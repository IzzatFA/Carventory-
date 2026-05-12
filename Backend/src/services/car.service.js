const supabase = require('../config/database');
const ApiError = require('../utils/ApiError');
const adminLogService = require('./adminLog.service');

const carService = {
  async createCar(carData, sellerId) {
    const { data, error } = await supabase
      .from('cars')
      .insert([{ ...carData, seller_id: sellerId }])
      .select()
      .single();

    if (error) throw ApiError.internal('Failed to create car: ' + error.message);
    return data;
  },

  async getAllCars(filters, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    let query = supabase.from('cars').select('*, seller:users!seller_id(id, username)', { count: 'exact' });

    if (filters.brand) query = query.ilike('brand', `%${filters.brand}%`);
    if (filters.status) query = query.eq('status', filters.status);
    if (filters.min_price) query = query.gte('starting_price', filters.min_price);
    if (filters.max_price) query = query.lte('starting_price', filters.max_price);

    const { data, error, count } = await query
      .range(offset, offset + limit - 1)
      .order('id', { ascending: false });

    if (error) throw ApiError.internal('Failed to fetch cars: ' + error.message);

    return {
      cars: data,
      meta: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    };
  },

  async getCarById(id) {
    const { data, error } = await supabase
      .from('cars')
      .select('*, seller:users!seller_id(id, username)')
      .eq('id', id)
      .single();

    if (error) throw ApiError.notFound('Car not found');
    return data;
  },

  async updateCar(id, carData, userId, userRole) {
    // Check ownership if not admin
    if (userRole !== 'admin') {
      const { data: car } = await supabase.from('cars').select('seller_id').eq('id', id).single();
      if (!car) throw ApiError.notFound('Car not found');
      if (car.seller_id !== userId) throw ApiError.forbidden('You do not own this car');
    }

    const { data, error } = await supabase
      .from('cars')
      .update(carData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw ApiError.internal('Failed to update car');
    
    if (userRole === 'admin') {
      await adminLogService.logAction(userId, 'UPDATE_CAR', id, 'car', JSON.stringify(carData));
    }

    return data;
  },

  async deleteCar(id, userId, userRole) {
    if (userRole !== 'admin') {
      const { data: car } = await supabase.from('cars').select('seller_id').eq('id', id).single();
      if (!car) throw ApiError.notFound('Car not found');
      if (car.seller_id !== userId) throw ApiError.forbidden('You do not own this car');
    }

    const { error } = await supabase.from('cars').delete().eq('id', id);
    if (error) throw ApiError.internal('Failed to delete car');

    if (userRole === 'admin') {
      await adminLogService.logAction(userId, 'DELETE_CAR', id, 'car');
    }
    return true;
  },
  
  async updateStatus(id, status, adminId) {
    const { data, error } = await supabase
      .from('cars')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw ApiError.internal('Failed to update car status');
    
    await adminLogService.logAction(adminId, 'UPDATE_CAR_STATUS', id, 'car', `Status changed to ${status}`);

    return data;
  }
};

module.exports = carService;
