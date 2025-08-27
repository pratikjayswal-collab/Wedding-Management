import React, { useEffect, useState } from 'react';
import useSpeechToText from '../hooks/useSpeechToText';
import { useDispatch, useSelector } from 'react-redux';
import { getExpenses, createExpense, updateExpense, deleteExpense, addExpenseItem, updateExpenseItem, deleteExpenseItem, getExpenseChartData, downloadProofDocument, deleteProofDocument } from '../store/slices/expenseSlice';
import { openExpenseModal, openExpenseItemModal } from '../store/slices/uiSlice';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

export default function ExpensesTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [amountRange, setAmountRange] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [categoryEdits, setCategoryEdits] = useState({ category: '', budget: 0, status: 'due', notes: '' });
  const [editingItem, setEditingItem] = useState({ expenseId: null, itemId: null });
  const [itemEdits, setItemEdits] = useState({ name: '', cost: 0, description: '' });
  const [formData, setFormData] = useState({
    category: '',
    budget: 0,
    status: 'due',
    notes: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [editSelectedFile, setEditSelectedFile] = useState(null);

  const dispatch = useDispatch();
  const { expenses, chartData, isLoading, error } = useSelector((state) => state.expense);
  const { isExpenseModalOpen, isExpenseItemModalOpen } = useSelector((state) => state.ui);

  const micCategory = useSpeechToText({ 
    lang: 'en-IN',
    onResult: (t) => setFormData(prev => ({ ...prev, category: t })) 
  });

  useEffect(() => {
    dispatch(getExpenses());
    dispatch(getExpenseChartData());
  }, [dispatch]);

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!formData.category.trim()) return;

    try {
      const expenseData = { ...formData };
      if (selectedFile && formData.status === 'paid') {
        expenseData.proofDocument = selectedFile;
      }
      await dispatch(createExpense(expenseData)).unwrap();
      setFormData({ category: '', budget: 0, status: 'due', notes: '' });
      setSelectedFile(null);
      setShowAddForm(false);
    } catch (err) {
      console.error('Failed to create expense category:', err);
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    if (window.confirm('Are you sure you want to delete this expense category?')) {
      try {
        await dispatch(deleteExpense(expenseId)).unwrap();
      } catch (err) {
        console.error('Failed to delete expense:', err);
      }
    }
  };

  const startEditCategory = (expense) => {
    setEditingCategoryId(expense._id);
    setCategoryEdits({
      category: expense.category || '',
      budget: expense.budget || 0,
      status: expense.status || 'due',
      notes: expense.notes || ''
    });
  };

  const cancelEditCategory = () => {
    setEditingCategoryId(null);
    setEditSelectedFile(null);
  };

  const saveEditCategory = async (expenseId) => {
    try {
      const expenseData = { ...categoryEdits };
      if (editSelectedFile) {
        expenseData.proofDocument = editSelectedFile;
      }
      await dispatch(updateExpense({ id: expenseId, expenseData })).unwrap();
      setEditingCategoryId(null);
      setEditSelectedFile(null);
    } catch (err) {
      console.error('Failed to update category:', err);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
  };

  const handleEditFileSelect = (e) => {
    const file = e.target.files[0];
    setEditSelectedFile(file);
  };

  const handleDownloadProof = async (expenseId) => {
    try {
      await dispatch(downloadProofDocument(expenseId)).unwrap();
    } catch (err) {
      console.error('Failed to download proof document:', err);
    }
  };

  const handleDeleteProof = async (expenseId) => {
    if (window.confirm('Are you sure you want to delete this proof document?')) {
      try {
        await dispatch(deleteProofDocument(expenseId)).unwrap();
      } catch (err) {
        console.error('Failed to delete proof document:', err);
      }
    }
  };

  const startEditItem = (expenseId, item) => {
    setEditingItem({ expenseId, itemId: item._id });
    setItemEdits({ name: item.name || '', cost: item.cost || 0, description: item.description || '' });
  };

  const cancelEditItem = () => {
    setEditingItem({ expenseId: null, itemId: null });
  };

  const saveEditItem = async () => {
    try {
      await dispatch(updateExpenseItem({ expenseId: editingItem.expenseId, itemId: editingItem.itemId, itemData: itemEdits })).unwrap();
      setEditingItem({ expenseId: null, itemId: null });
    } catch (err) {
      console.error('Failed to update item:', err);
    }
  };

    // toggle functionality of view charts 
    const [viewCharts, setViewCharts] = useState(false);
    const toggleCharts = () => {
      setViewCharts(!viewCharts);
    };

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || (expense.status || 'due') === statusFilter;
    const amount = Number(expense.budget || 0);
    let matchesRange = true;
    switch (amountRange) {
      case '0-10000':
        matchesRange = amount >= 0 && amount <= 10000;
        break;
      case '10000-20000':
        matchesRange = amount > 10000 && amount <= 20000;
        break;
      case '20000-50000':
        matchesRange = amount > 20000 && amount <= 50000;
        break;
      case '>50000':
        matchesRange = amount > 50000;
        break;
      default:
        matchesRange = true;
    }
    return matchesSearch && matchesStatus && matchesRange;
  });

  const categories = ['all', ...expenses.map(e => e.category)];
  const totalBudget = expenses.reduce((sum, exp) => sum + (exp.budget || 0), 0);
  const paidAmount = expenses.reduce((sum, exp) => sum + ((exp.status === 'paid' ? (exp.budget || 0) : 0)), 0);
  const dueAmount = expenses.reduce((sum, exp) => sum + ((exp.status === 'due' ? (exp.budget || 0) : 0)), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="hidden sm:flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Expense Management</h2>
          <p className="text-gray-600">Track your wedding expenses and budget</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          {showAddForm ? 'Cancel' : 'Add Category'}
        </button>
      </div>

      {/* Add Category Form */}
      {showAddForm && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Add New Expense Category</h3>
          <form onSubmit={handleAddExpense} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category Name</label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full pr-11 pl-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300"
                    placeholder="e.g., Venue, Catering, Photography"
                    required
                  />
                  <button 
                    type="button" 
                    onClick={micCategory.isListening ? micCategory.stop : micCategory.start} 
                    disabled={!micCategory.supported}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all duration-200 ${
                      micCategory.isListening 
                        ? 'bg-red-100 hover:bg-red-200 text-red-600' 
                        : 'hover:bg-gray-50 text-gray-600'
                    } ${!micCategory.supported ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title={
                      !micCategory.supported 
                        ? 'Speech recognition not supported' 
                        : micCategory.isListening 
                        ? 'Stop listening' 
                        : 'Start speaking'
                    }
                  >
                    {micCategory.isListening ? (
                      <div className="relative">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                          <path d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9A2.25 2.25 0 0118.75 7.5v9A2.25 2.25 0 0116.5 18.75h-9A2.25 2.25 0 015.25 16.5v-9z" />
                        </svg>
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                      </div>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                        <path d="M12 14a3 3 0 003-3V7a3 3 0 10-6 0v4a3 3 0 003 3z" />
                        <path d="M19 11a7 7 0 11-14 0 1 1 0 112 0 5 5 0 1010 0 1 1 0 112 0z" />
                        <path d="M13 19.938V22h-2v-2.062a8.001 8.001 0 01-6.938-6.937h2.062A6 6 0 0012 18a6 6 0 005.876-4h2.062A8.001 8.001 0 0113 19.938z" />
                      </svg>
                    )}
                  </button>
                </div>
                {micCategory.error && (
                  <p className="mt-1 text-sm text-amber-600">
                    Speech Error: {micCategory.error}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Expense (₹)</label>
                <input
                  type="number"
                  value={formData.budget}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData({
                      ...formData,
                      budget: value === "" ? "" : parseFloat(value)
                    });
                  }}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />

              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300"
                >
                  <option value="due">Due</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300"
                  placeholder="Any notes about this category"
                />
              </div>
              {formData.status === 'paid' && (
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Proof of Payment
                    <span className="text-xs text-gray-500 ml-2">(PDF, Images - Max 10MB)</span>
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
                    onChange={handleFileSelect}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-rose-50 file:text-rose-700 hover:file:bg-rose-100"
                  />
                  {selectedFile && (
                    <p className="mt-2 text-sm text-gray-600">
                      Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  )}
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-xl font-medium transition-all duration-200 disabled:opacity-50"
              >
                {isLoading ? 'Adding...' : 'Add Category'}
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}


      {/* Budget Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 sm:gap-4">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-3 text-center">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Categories</h3>
          <p className="text-xl font-bold text-gray-800">{expenses.length}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-3 text-center">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Total Expense</h3>
          <p className="text-xl font-bold text-blue-600">₹{totalBudget.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-3 text-center">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Paid</h3>
          <p className="text-xl font-bold text-green-600">₹{paidAmount.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-3 text-center">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Due</h3>
          <p className="text-xl font-bold text-yellow-600">₹{dueAmount.toLocaleString()}</p>
        </div>
      </div>

      {/* toggle to view charts */}
      <div className="flex justify-center font-semibold mt-2 sm:m-8">
          <button onClick={toggleCharts} className="text-sm text-gray-600 hover:text-gray-900">  
        {viewCharts ? "Hide Charts" : "View Charts"}
          </button>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="sm:hidden w-full px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          {showAddForm ? 'Cancel' : 'Add Category'}
        </button>

      {/* Charts */}{viewCharts &&
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h4 className="text-md font-bold text-gray-800 mb-4">Budget by Category</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenses.map(e => ({ category: e.category, budget: e.budget || 0 }))}
                  dataKey="budget"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                >
                  {expenses.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={["#f43f5e", "#fb7185", "#f97316", "#f59e0b", "#84cc16", "#22c55e", "#14b8a6", "#06b6d4", "#3b82f6", "#8b5cf6"][index % 10]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => `₹${Number(v).toLocaleString()}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h4 className="text-md font-semibold text-gray-800 mb-4">Budget (by Category)</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={expenses.map(e => ({ category: e.category, budget: e.budget || 0 }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" interval={0} angle={-15} textAnchor="end" height={50} />
                <YAxis tickFormatter={(v) => `₹${v}`} />
                <Tooltip formatter={(v) => `₹${Number(v).toLocaleString()}`} />
                <Legend />
                <Bar dataKey="budget" name="Budget" fill="#93c5fd" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>}

      <div className="flex-1">
        <input
          type="text"
          placeholder="Search expenses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300"
        />
      </div>

      {/* Search and Filter */}
      <div className="flex flex-row sm:flex-row gap-4">

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300"
          >
            <option value="all">All Status</option>
            <option value="due">Due</option>
            <option value="paid">Paid</option>
          </select>
        </div>
        <div>
          <select
            value={amountRange}
            onChange={(e) => setAmountRange(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300"
          >
            <option value="all">All Amounts</option>
            <option value="0-10000">₹0 - ₹10k</option>
            <option value="10000-20000">₹10k - ₹20k</option>
            <option value="20000-50000">₹20k - ₹50k</option>
            <option value=">50000">₹50k+</option>
          </select>
        </div>
      </div>

      {/* Expenses List */}
      <div className="space-y-1 sm:space-y-4">
        {filteredExpenses.map((expense) => (
          <div key={expense._id} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-3 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 mb-4">
              <div className="flex-1 min-w-0">
                {editingCategoryId === expense._id ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category Name</label>
                      <input
                        type="text"
                        value={categoryEdits.category}
                        onChange={(e) => setCategoryEdits({ ...categoryEdits, category: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Expense (₹)</label>
                      <input
                        type="number"
                        value={categoryEdits.budget}
                        onChange={(e) => setCategoryEdits({ ...categoryEdits, budget: parseFloat(e.target.value) || 0 })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                      <select
                        value={categoryEdits.status}
                        onChange={(e) => setCategoryEdits({ ...categoryEdits, status: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300"
                      >
                        <option value="due">Due</option>
                        <option value="paid">Paid</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                      <textarea
                        value={categoryEdits.notes}
                        onChange={(e) => setCategoryEdits({ ...categoryEdits, notes: e.target.value })}
                        rows={2}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300"
                      />
                    </div>
                    {categoryEdits.status === 'paid' && (
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Proof of Payment
                          <span className="text-xs text-gray-500 ml-2">(PDF, Images - Max 10MB)</span>
                        </label>
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
                          onChange={handleEditFileSelect}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-rose-50 file:text-rose-700 hover:file:bg-rose-100"
                        />
                        {editSelectedFile && (
                          <p className="mt-2 text-sm text-gray-600">
                            Selected: {editSelectedFile.name} ({(editSelectedFile.size / 1024 / 1024).toFixed(2)} MB)
                          </p>
                        )}
                      </div>
                    )}
                    <div className="flex gap-2 sm:col-span-2">
                      <button onClick={() => saveEditCategory(expense._id)} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors duration-200">Save</button>
                      <button onClick={cancelEditCategory} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors duration-200">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-xl font-semibold text-gray-800">{expense.category}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${expense.status === 'paid' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
                        {expense.status === 'paid' ? 'Paid' : 'Due'}
                      </span>
                    </div>
                    <p className="text-gray-600">Expense: ₹{expense.budget?.toLocaleString() || '0'}</p>
                    {expense.notes ? <p className="text-sm text-gray-500 mt-1">{expense.notes}</p> : null}
                    {expense.status === 'paid' && expense.proofDocument && (
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-xs text-gray-500">Proof:</span>
                        <button
                          onClick={() => handleDownloadProof(expense._id)}
                          className="text-xs text-blue-600 hover:text-blue-800 underline"
                        >
                          📄 {expense.proofDocument.originalName}
                        </button>
                        <button
                          onClick={() => handleDeleteProof(expense._id)}
                          className="text-xs text-red-600 hover:text-red-800 ml-2"
                          title="Delete proof document"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                {editingCategoryId === expense._id ? null : (
                  <button
                    onClick={() => startEditCategory(expense)}
                    className="px-2 py-1 bg-gray-500 hover:bg-gray-600 text-sm text-white rounded-2xl font-medium transition-colors duration-200"
                  >
                    Edit
                  </button>
                )}
                <button
                  onClick={() => handleDeleteExpense(expense._id)}
                  className="px-2 py-1 bg-red-500 hover:bg-red-600 text-sm text-white rounded-2xl font-medium transition-colors duration-200"
                >
                  Delete
                </button>
              </div>
            </div>


            {/* Expense Items */}
            {expense.items && expense.items.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-700 mb-3">Items:</h4>
                <div className="space-y-2">
                  {expense.items.map((item) => (
                    <div key={item._id} className="p-3 bg-gray-50 rounded-lg">
                      {editingItem.expenseId === expense._id && editingItem.itemId === item._id ? (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Item</label>
                            <input
                              type="text"
                              value={itemEdits.name}
                              onChange={(e) => setItemEdits({ ...itemEdits, name: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Cost (₹)</label>
                            <input
                              type="number"
                              value={itemEdits.cost}
                              onChange={(e) => setItemEdits({ ...itemEdits, cost: parseFloat(e.target.value) || 0 })}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300"
                              min="0"
                              step="0.01"
                            />
                          </div>
                          <div className="sm:col-span-3">
                            <label className="block text-xs text-gray-600 mb-1">Description</label>
                            <input
                              type="text"
                              value={itemEdits.description}
                              onChange={(e) => setItemEdits({ ...itemEdits, description: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300"
                            />
                          </div>
                          <div className="flex gap-2 sm:col-span-3">
                            <button onClick={saveEditItem} className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm">Save</button>
                            <button onClick={cancelEditItem} className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm">Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-800">{item.name}</p>
                            {item.description && (
                              <p className="text-sm text-gray-600">{item.description}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-800">₹{item.cost?.toLocaleString()}</span>
                            <button
                              onClick={() => startEditItem(expense._id, item)}
                              className="text-blue-500 hover:text-blue-600"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={async () => {
                                if (window.confirm('Delete this item?')) {
                                  try {
                                    await dispatch(deleteExpenseItem({ expenseId: expense._id, itemId: item._id })).unwrap();
                                  } catch (err) {
                                    console.error('Failed to delete item:', err);
                                  }
                                }
                              }}
                              className="text-red-500 hover:text-red-600"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}

        {filteredExpenses.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No expenses found</h3>
            <p className="text-gray-500">Get started by adding your first expense category.</p>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
}
