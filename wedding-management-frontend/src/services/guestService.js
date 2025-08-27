import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance
const guestAPI = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth config for protected routes
const authConfig = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

// Get all guests
const getGuests = async (token) => {
  const response = await guestAPI.get('/guests', authConfig(token));
  return response.data;
};

// Get single guest
const getGuest = async (id, token) => {
  const response = await guestAPI.get(`/guests/${id}`, authConfig(token));
  return response.data;
};

// Create new guest
const createGuest = async (guestData, token) => {
  const response = await guestAPI.post('/guests', guestData, authConfig(token));
  return response.data;
};

// Update guest
const updateGuest = async (id, guestData, token) => {
  const response = await guestAPI.put(`/guests/${id}`, guestData, authConfig(token));
  return response.data;
};

// Delete guest
const deleteGuest = async (id, token) => {
  const response = await guestAPI.delete(`/guests/${id}`, authConfig(token));
  return response.data;
};

// Toggle invitation status
const toggleInvitation = async (id, token) => {
  const response = await guestAPI.patch(`/guests/${id}/invitation`, {}, authConfig(token));
  return response.data;
};

// Bulk update invitations
const bulkUpdateInvitation = async ({ guestIds, invitationSent }, token) => {
  const response = await guestAPI.patch('/guests/bulk-invitation', { guestIds, invitationSent }, authConfig(token));
  return response.data;
};

// Get guest statistics
const getGuestStats = async (token) => {
  const response = await guestAPI.get('/guests/stats', authConfig(token));
  return response.data;
};

const guestService = {
  getGuests,
  getGuest,
  createGuest,
  updateGuest,
  deleteGuest,
  toggleInvitation,
  bulkUpdateInvitation,
  getGuestStats,
};

export default guestService;
