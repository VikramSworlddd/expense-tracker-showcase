const API_BASE = import.meta.env.VITE_API_BASE || '/api';

class ApiError extends Error {
  constructor(message, code, status) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

async function request(method, path, body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  };

  // Add mutation header for POST/PUT/DELETE
  if (['POST', 'PUT', 'DELETE'].includes(method)) {
    options.headers['X-Requested-With'] = 'XMLHttpRequest';
  }

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE}${path}`, options);
  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(
      data.error?.message || 'An error occurred',
      data.error?.code || 'ERROR',
      response.status
    );
  }

  return data;
}

export const api = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body),
  put: (path, body) => request('PUT', path, body),
  delete: (path) => request('DELETE', path)
};

