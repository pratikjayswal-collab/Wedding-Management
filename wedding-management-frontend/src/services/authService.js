import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance
const authAPI = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Register user
const register = async (userData) => {
  const response = await authAPI.post('/users/register', userData);
  if (response.data) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response.data;
};

// Login user
const login = async (userData) => {
  const response = await authAPI.post('/users/login', userData);
  if (response.data) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response.data;
};

// Logout user
const logout = () => {
  localStorage.removeItem('user');
};

// Get user profile
const getProfile = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await authAPI.get('/users/profile', config);
  return response.data;
};

const authService = {
  register,
  login,
  logout,
  getProfile,
};

export default authService;
