export function errorHandler(err, req, res, next) {
  console.error(err);

  // Zod validation errors
  if (err.name === 'ZodError') {
    return res.status(400).json({
      error: {
        message: err.errors[0]?.message || 'Validation failed',
        code: 'VALIDATION_ERROR'
      }
    });
  }

  // Custom application errors
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      error: {
        message: err.message,
        code: err.code || 'ERROR'
      }
    });
  }

  // Default server error
  res.status(500).json({
    error: {
      message: 'Internal server error',
      code: 'SERVER_ERROR'
    }
  });
}

export class AppError extends Error {
  constructor(message, statusCode = 400, code = 'ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

