import axios from 'axios';

// Create an Axios instance for API calls.  All requests include
// the token from localStorage (if present) in the Authorization header.
const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000',
});

// Attach token to every request if available
// Skip adding token for the auth endpoint
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    // Don't add token to auth endpoints
    if (token && !config.url?.includes('/api/auth/token/')) {
      config.headers['Authorization'] = `Token ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;