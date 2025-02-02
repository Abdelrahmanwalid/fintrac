import apiClient from './apiClient';

// Register User
export const registerUser = async (email, password) => {
  try {
    const response = await apiClient.post('/auth/register', { email, password });
    localStorage.setItem('accessToken', response.data.accessToken); // Store access token
    return response.data;
  } catch (error) {
    console.error("Registration failed:", error.response?.data?.message || error.message);
    throw new Error(error.response?.data?.message || 'Registration failed');
  }
};

export const loginUser = async (email, password) => {
  try {
    const response = await apiClient.post('/auth/login', { email, password }); // Corrected path
    const { accessToken } = response.data;

    localStorage.setItem('accessToken', accessToken);

    return response.data;
  } catch (error) {
    console.error("Login failed:", error.response?.data?.message || error.message);
    throw new Error(error.response?.data?.message || 'Login failed');
  }
};

// Fetch Protected Data
export const fetchProtectedData = async () => {
  try {
    const response = await apiClient.get('/protected');
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      try {
        // Refresh access token
        const refreshResponse = await apiClient.post('/auth/refresh-token', {}, { withCredentials: true });
        const newAccessToken = refreshResponse.data.accessToken;
        localStorage.setItem('accessToken', newAccessToken); // Update access token
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
        // Retry original request
        return await apiClient.get('/protected');
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError.message);
        throw new Error('Session expired. Please log in again.');
      }
    }
    console.error("Failed to fetch protected data:", error.message);
    throw error;
  }
};