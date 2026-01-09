import axios from 'axios';

// Create an Axios instance for API calls.  All requests include
// the token from localStorage (if present) in the Authorization header.
const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000',
  timeout: 10000, // 10 second timeout
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

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Enhance error messages for network errors
    if (!error.response) {
      // Network error - no response from server
      if (error.code === 'ECONNABORTED') {
        error.message = 'Request timeout - server took too long to respond';
      } else if (error.message === 'Network Error') {
        error.message = 'Network Error: Cannot connect to backend server. Please ensure the Django server is running on http://localhost:8000';
      }
    }
    return Promise.reject(error);
  }
);

export default api;