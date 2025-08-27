import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance
const expenseAPI = axios.create({
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

// Get all expenses
const getExpenses = async (token) => {
  const response = await expenseAPI.get('/expenses', authConfig(token));
  return response.data;
};

// Get single expense
const getExpense = async (id, token) => {
  const response = await expenseAPI.get(`/expenses/${id}`, authConfig(token));
  return response.data;
};

// Create new expense (with optional file upload)
const createExpense = async (expenseData, token) => {
  if (expenseData.proofDocument) {
    const formData = new FormData();
    formData.append('category', expenseData.category);
    formData.append('budget', expenseData.budget);
    formData.append('status', expenseData.status);
    formData.append('notes', expenseData.notes || '');
    formData.append('proofDocument', expenseData.proofDocument);
    
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    };
    
    const response = await expenseAPI.post('/expenses', formData, config);
    return response.data;
  } else {
    const response = await expenseAPI.post('/expenses', expenseData, authConfig(token));
    return response.data;
  }
};

// Update expense (with optional file upload)
const updateExpense = async (id, expenseData, token) => {
  const formData = new FormData();
  
  // Append text fields
  formData.append('category', expenseData.category);
  formData.append('budget', expenseData.budget);
  formData.append('status', expenseData.status);
  formData.append('notes', expenseData.notes || '');
  
  // Append file if provided
  if (expenseData.proofDocument) {
    formData.append('proofDocument', expenseData.proofDocument);
  }
  
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  };
  
  const response = await expenseAPI.put(`/expenses/${id}`, formData, config);
  return response.data;
};

// Delete expense
const deleteExpense = async (id, token) => {
  const response = await expenseAPI.delete(`/expenses/${id}`, authConfig(token));
  return response.data;
};

// Add expense item
const addExpenseItem = async (expenseId, itemData, token) => {
  const response = await expenseAPI.post(`/expenses/${expenseId}/items`, itemData, authConfig(token));
  return response.data;
};

// Update expense item
const updateExpenseItem = async (expenseId, itemId, itemData, token) => {
  const response = await expenseAPI.put(`/expenses/${expenseId}/items/${itemId}`, itemData, authConfig(token));
  return response.data;
};

// Delete expense item
const deleteExpenseItem = async (expenseId, itemId, token) => {
  const response = await expenseAPI.delete(`/expenses/${expenseId}/items/${itemId}`, authConfig(token));
  return response.data;
};

// Get expense statistics
const getExpenseStats = async (token) => {
  const response = await expenseAPI.get('/expenses/stats', authConfig(token));
  return response.data;
};

// Get expense chart data
const getExpenseChartData = async (token) => {
  const response = await expenseAPI.get('/expenses/chart-data', authConfig(token));
  return response.data;
};

// Download proof document
const downloadProofDocument = async (id, token) => {
  const config = {
    ...authConfig(token),
    responseType: 'blob',
  };
  const response = await expenseAPI.get(`/expenses/${id}/proof`, config);
  return response;
};

// Delete proof document
const deleteProofDocument = async (id, token) => {
  const response = await expenseAPI.delete(`/expenses/${id}/proof`, authConfig(token));
  return response.data;
};

const expenseService = {
  getExpenses,
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense,
  addExpenseItem,
  updateExpenseItem,
  deleteExpenseItem,
  getExpenseStats,
  getExpenseChartData,
  downloadProofDocument,
  deleteProofDocument,
};

export default expenseService;
