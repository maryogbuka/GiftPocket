// utils/response.js
export function successResponse(data, message = 'Success', statusCode = 200) {
  return {
    success: true,
    message,
    data,
    statusCode,
  };
}

export function errorResponse(message, errors = null, statusCode = 400) {
  return {
    success: false,
    message,
    errors,
    statusCode,
  };
}

export function paginatedResponse(data, total, page, limit) {
  return {
    success: true,
    data,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
    },
  };
}