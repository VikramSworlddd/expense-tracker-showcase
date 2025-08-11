import { AppError } from './errorHandler.js';

export function mutationHeaderMiddleware(req, res, next) {
  const mutationMethods = ['POST', 'PUT', 'DELETE'];
  
  if (mutationMethods.includes(req.method)) {
    const xRequestedWith = req.headers['x-requested-with'];
    
    if (xRequestedWith !== 'XMLHttpRequest') {
      throw new AppError('Missing required header', 400, 'INVALID_REQUEST');
    }
  }
  
  next();
}

