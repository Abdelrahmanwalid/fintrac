import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth'; // Adjust the URL if needed

// Register user
export const registerUser = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/register`, { email, password });
    return response.data;
  } catch (error) {
    console.error("Registration failed:", error.response.data.message);
    throw error;
  }
};

// Login user
export const loginUser = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/login`, { email, password });
    return response.data;
  } catch (error) {
    console.error("Login failed:", error.response.data.message);
    throw error;
  }
};

// Fetch protected data
export const fetchProtectedData = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/protected`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch protected data:", error.response.data.message);
    throw error;
  }
};