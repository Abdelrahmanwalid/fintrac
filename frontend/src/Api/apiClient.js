import axios from 'axios';
import config from './config'; // Adjust your config path

const apiClient = axios.create({
  baseURL: config.BASE_ENDPOINT || 'http://localhost:5000/api',
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Include cookies for refresh tokens
});

// Request interceptor for adding Authorization header
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    console.log('Sending Token:', token); // Debugging log
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      console.log('Refreshing token...');

      try {
        const refreshResponse = await axios.post(
          `${config.BASE_ENDPOINT || 'http://localhost:5000/api'}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        const newToken = refreshResponse.data.accessToken;
        localStorage.setItem('accessToken', newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;