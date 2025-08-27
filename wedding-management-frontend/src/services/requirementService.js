import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance
const requirementAPI = axios.create({
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

// Get all requirements
const getRequirements = async (token) => {
  const response = await requirementAPI.get('/requirements', authConfig(token));
  return response.data;
};

// Get single requirement
const getRequirement = async (id, token) => {
  const response = await requirementAPI.get(`/requirements/${id}`, authConfig(token));
  return response.data;
};

// Create new requirement
const createRequirement = async (requirementData, token) => {
  const response = await requirementAPI.post('/requirements', requirementData, authConfig(token));
  return response.data;
};

// Update requirement
const updateRequirement = async (id, requirementData, token) => {
  const response = await requirementAPI.put(`/requirements/${id}`, requirementData, authConfig(token));
  return response.data;
};

// Delete requirement
const deleteRequirement = async (id, token) => {
  const response = await requirementAPI.delete(`/requirements/${id}`, authConfig(token));
  return response.data;
};

// Toggle requirement status
const toggleRequirementStatus = async (id, token) => {
  const response = await requirementAPI.patch(`/requirements/${id}/status`, {}, authConfig(token));
  return response.data;
};

// Bulk update requirement status
const bulkUpdateRequirementStatus = async ({ requirementIds, status }, token) => {
  const response = await requirementAPI.patch('/requirements/bulk-status', { requirementIds, status }, authConfig(token));
  return response.data;
};

// Get requirements by status
const getRequirementsByStatus = async (status, token) => {
  const response = await requirementAPI.get(`/requirements/status/${status}`, authConfig(token));
  return response.data;
};

// Get requirement statistics
const getRequirementStats = async (token) => {
  const response = await requirementAPI.get('/requirements/stats', authConfig(token));
  return response.data;
};

const requirementService = {
  getRequirements,
  getRequirement,
  createRequirement,
  updateRequirement,
  deleteRequirement,
  toggleRequirementStatus,
  bulkUpdateRequirementStatus,
  getRequirementsByStatus,
  getRequirementStats,
};

export default requirementService;
