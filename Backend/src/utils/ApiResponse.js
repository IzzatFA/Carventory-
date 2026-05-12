class ApiResponse {
  static success(res, message, data = null, meta = null, statusCode = 200) {
    const response = {
      success: true,
      message,
    };

    if (data !== null) {
      response.data = data;
    }

    if (meta !== null) {
      response.meta = meta;
    }

    return res.status(statusCode).json(response);
  }

  static created(res, message, data = null) {
    return this.success(res, message, data, null, 201);
  }
}

module.exports = ApiResponse;
