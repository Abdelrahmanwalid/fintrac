import axios from 'axios';
import config from './config'; // Ensure `config.js` exports `BASE_ENDPOINT`

// Base API configuration
const baseApi = axios.create({
  baseURL: config.BASE_ENDPOINT || 'http://localhost:5000/api/auth', // Default to localhost
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor to handle token injection
baseApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Replace with your token storage method
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default baseApi;

// Authentication functions
export const registerUser = async (email, password) => {
  try {
    const payload = { email, password };
    const response = await baseApi.post('/register', payload);
    return response.data; // Return the data if successful
  } catch (error) {
    console.error("Registration failed:", error.response?.data?.message || error.message);
    throw new Error(error.response?.data?.message || 'Registration failed');
  }
};

export const loginUser = async (email, password) => {
  try {
    const payload = { email, password };
    const response = await baseApi.post('/login', payload); // Use POST for login with payload
    return response.data; // Return token or data from the server
  } catch (error) {
    console.error("Login failed:", error.response?.data?.message || error.message);
    throw new Error(error.response?.data?.message || 'Login failed');
  }
};

export const fetchProtectedData = async () => {
  try {
    const response = await baseApi.get('/protected'); // Token is already added via the interceptor
    return response.data; // Return protected data
  } catch (error) {
    console.error("Failed to fetch protected data:", error.response?.data?.message || error.message);
    throw new Error(error.response?.data?.message || 'Failed to fetch protected data');
  }
};