import React, { useEffect, useState } from 'react';
import useSpeechToText from '../hooks/useSpeechToText';
import { useDispatch, useSelector } from 'react-redux';
import { getRequirements, createRequirement, updateRequirement, deleteRequirement, toggleRequirementStatus, bulkUpdateRequirementStatus, getRequirementsByStatus } from '../store/slices/requirementSlice';
import { openRequirementModal, toggleRequirementSelection, selectAllRequirements, clearRequirementSelection } from '../store/slices/uiSlice';

export default function RequirementsTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRequirementId, setEditingRequirementId] = useState(null);
  const [requirementEdits, setRequirementEdits] = useState({
    item: '',
    description: '',
    priority: 'medium',
    category: '',
    dueDate: ''
  });
  const [formData, setFormData] = useState({
    item: '',
    description: '',
    priority: 'medium',
    category: '',
    dueDate: ''
  });

  const micTask = useSpeechToText({ 
    lang: 'en-IN',
    silenceThreshold: 2000, // 2 seconds of silence to auto-stop
    onResult: (t) => setFormData(prev => ({ ...prev, item: t })) 
  });

  const dispatch = useDispatch();
  const { requirements, isLoading, error } = useSelector((state) => state.requirement);
  const { selectedRequirements, isRequirementModalOpen } = useSelector((state) => state.ui);

  useEffect(() => {
    if (selectedStatus === 'all') {
      dispatch(getRequirements());
    } else {
      dispatch(getRequirementsByStatus(selectedStatus));
    }
  }, [dispatch, selectedStatus]);

  const handleAddRequirement = async (e) => {
    e.preventDefault();
    if (!formData.item.trim()) return;

    try {
      await dispatch(createRequirement(formData)).unwrap();
      setFormData({
        item: '',
        description: '',
        priority: 'medium',
        category: '',
        dueDate: ''
      });
      setShowAddForm(false);
    } catch (err) {
      console.error('Failed to create requirement:', err);
    }
  };

  const handleDeleteRequirement = async (requirementId) => {
    if (window.confirm('Are you sure you want to delete this requirement?')) {
      try {
        await dispatch(deleteRequirement(requirementId)).unwrap();
      } catch (err) {
        console.error('Failed to delete requirement:', err);
      }
    }
  };

  const startEditRequirement = (requirement) => {
    setEditingRequirementId(requirement._id);
    setRequirementEdits({
      item: requirement.item || '',
      description: requirement.description || '',
      priority: requirement.priority || 'medium',
      category: requirement.category || '',
      dueDate: requirement.dueDate ? requirement.dueDate.substring(0, 10) : ''
    });
  };

  const cancelEditRequirement = () => {
    setEditingRequirementId(null);
  };



  const saveEditRequirement = async (requirementId) => {
    try {
      await dispatch(updateRequirement({ id: requirementId, requirementData: requirementEdits })).unwrap();
      setEditingRequirementId(null);
    } catch (err) {
      console.error('Failed to update requirement:', err);
    }
  };

  const handleBulkStatusUpdate = async (status) => {
    if (selectedRequirements.length === 0) return;

    try {
      // Clear selection first so bulk actions hide immediately
      dispatch(clearRequirementSelection());
      await dispatch(bulkUpdateRequirementStatus({ requirementIds: selectedRequirements, status })).unwrap();
    } catch (err) {
      console.error('Failed to update requirements status:', err);
    }
  };

  const handleSelectAll = () => {
    if (selectedRequirements.length === filteredRequirements.length) {
      dispatch(clearRequirementSelection());
    } else {
      dispatch(selectAllRequirements(filteredRequirements.map(r => r._id)));
    }
  };

  const filteredRequirements = requirements.filter(requirement => {
    const matchesSearch = requirement.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         requirement.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         requirement.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = selectedPriority === 'all' || requirement.priority === selectedPriority;
    return matchesSearch && matchesPriority;
  });

  const priorities = ['all', 'low', 'medium', 'high'];
  const statuses = ['all', 'pending', 'done'];
  const totalRequirements = requirements.length;
  const pendingRequirements = requirements.filter(r => r.status === 'pending').length;
  const completedRequirements = requirements.filter(r => r.status === 'done').length;

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };

  return (
    <div className="space-y-3 sm:space-y-6">
      {/* Header */}
      <div className="hidden sm:flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Requirements & Tasks</h2>
          <p className="text-gray-600">Manage your wedding planning tasks and requirements</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className=" px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          {showAddForm ? 'Cancel' : 'Add Task'}
        </button>
      </div>

      {/* Add Task Form */}
      {showAddForm && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Add New Task</h3>
          <form onSubmit={handleAddRequirement} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Task Name *</label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.item}
                    onChange={(e) => setFormData({ ...formData, item: e.target.value })}
                    className="w-full pr-11 pl-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300"
                    placeholder="e.g., Book photographer, Order invitations"
                    required
                  />
                  <button
  type="button"
  onClick={micTask.start}
  disabled={!micTask.supported || micTask.isListening}
  className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all duration-200 ${
    micTask.isListening 
      ? 'bg-red-100 text-red-600' 
      : 'hover:bg-gray-50 text-gray-600'
  } ${!micTask.supported ? 'opacity-50 cursor-not-allowed' : ''}`}
  title={
    !micTask.supported 
      ? 'Microphone access not supported' 
      : micTask.isListening 
      ? 'Listening...' 
      : 'Click to start speaking'
  }
>
  {micTask.isListening ? (
    <div className="relative">
      <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
        <path d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9A2.25 2.25 0 0118.75 7.5v9A2.25 2.25 0 0116.5 18.75h-9A2.25 2.25 0 015.25 16.5v-9z" />
      </svg>
      <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
    </div>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
      <path d="M12 14a3 3 0 003-3V7a3 3 0 10-6 0v4a3 3 0 003 3z" />
      <path d="M19 11a7 7 0 11-14 0 1 1 0 112 0 5 5 0 1010 0 1 1 0 112 0z" />
      <path d="M13 19.938V22h-2v-2.062a8.001 8.001 0 01-6.938-6.937h2.062A6 6 0 0012 18a6 6 0 005.876-4h2.062A8.001 8.001 0 0113 19.938z" />
    </svg>
  )}
</button>

                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300"
                  placeholder="e.g., Venue, Catering, Decor"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300"
                placeholder="Add any additional details about this task..."
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-xl font-medium transition-all duration-200 disabled:opacity-50"
              >
                {isLoading ? 'Adding...' : 'Add Task'}
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

      {/* Task Statistics */}
      <div className="grid grid-cols-3 sm:grid-cols-3 gap-1 sm:gap-4">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-2 sm:p-6 text-center">
          <h3 className="text-sm font-medium text-gray-600 ">Total Tasks</h3>
          <p className="text-3xl font-bold text-blue-600">{totalRequirements}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-2 sm:p-6 text-center">
          <h3 className="text-sm font-medium text-gray-600 ">Pending</h3>
          <p className="text-3xl font-bold text-yellow-600">{pendingRequirements}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-2 sm:p-6 text-center">
          <h3 className="text-sm font-medium text-gray-600 ">Completed</h3>
          <p className="text-3xl font-bold text-green-600">{completedRequirements}</p>
        </div>
      </div>

      <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="sm:hidden w-full px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          {showAddForm ? 'Cancel' : 'Add Task'}
        </button>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-1 sm:gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300"
          />
        </div>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300"
        >
          {statuses.map(status => (
            <option key={status} value={status}>
              {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
            </option>
          ))}
        </select>
        <select
          value={selectedPriority}
          onChange={(e) => setSelectedPriority(e.target.value)}
          className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300"
        >
          {priorities.map(priority => (
            <option key={priority} value={priority}>
              {priority === 'all' ? 'All Priority' : priority.charAt(0).toUpperCase() + priority.slice(1)}
            </option>
          ))}
        </select>
      </div>



      {/* Requirements List */}
      <div className="space-y-4">
        {/* Select All Checkbox */}
        {filteredRequirements.length > 0 && (
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
            <input
              type="checkbox"
              checked={selectedRequirements.length === filteredRequirements.length}
              onChange={handleSelectAll}
              className="w-4 h-4 text-rose-600 bg-gray-100 border-gray-300 rounded focus:ring-rose-500 focus:ring-2"
            />
            <span className="text-sm font-medium text-gray-700">
              Select All ({filteredRequirements.length})
            </span>
          </div>
        )}


        {/* Bulk Actions */}
      {selectedRequirements.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">
                {selectedRequirements.length} task(s) selected
              </span>
              
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleBulkStatusUpdate('done')}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors duration-200"
              >
                Mark Complete
              </button>
              <button
                onClick={() => handleBulkStatusUpdate('pending')}
                className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium transition-colors duration-200"
              >
                Mark Pending
              </button>
            </div>
          </div>
        </div>
      )}

        {filteredRequirements.map((requirement) => (
          <div key={requirement._id} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-start gap-3">
              {/* Checkbox */}
              <input
                type="checkbox"
                checked={selectedRequirements.includes(requirement._id)}
                onChange={() => dispatch(toggleRequirementSelection(requirement._id))}
                className="w-4 h-4 text-rose-600 bg-gray-100 border-gray-300 rounded focus:ring-rose-500 focus:ring-2 mt-1"
              />

              {/* Task Info */}
              <div className="flex-1 min-w-0">
                {editingRequirementId === requirement._id ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Task Name</label>
                        <input
                          type="text"
                          value={requirementEdits.item}
                          onChange={(e) => setRequirementEdits({ ...requirementEdits, item: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Category</label>
                        <input
                          type="text"
                          value={requirementEdits.category}
                          onChange={(e) => setRequirementEdits({ ...requirementEdits, category: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Priority</label>
                        <select
                          value={requirementEdits.priority}
                          onChange={(e) => setRequirementEdits({ ...requirementEdits, priority: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Due Date</label>
                        <input
                          type="date"
                          value={requirementEdits.dueDate}
                          onChange={(e) => setRequirementEdits({ ...requirementEdits, dueDate: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Description</label>
                      <textarea
                        value={requirementEdits.description}
                        onChange={(e) => setRequirementEdits({ ...requirementEdits, description: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => saveEditRequirement(requirement._id)} className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm">Save</button>
                      <button onClick={cancelEditRequirement} className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-800 truncate">{requirement.item}</h3>
                        {requirement.description && (
                          <p className="text-sm text-gray-600 mt-1">{requirement.description}</p>
                        )}
                      </div>

                      {/* Status Badge */}
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        requirement.status === 'done'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {requirement.status === 'done' ? '✓ Done' : '⏳ Pending'}
                      </span>
                    </div>

                    {/* Task Details */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                      {requirement.category && (
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                          {requirement.category}
                        </span>
                      )}

                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(requirement.priority)}`}>
                        <span className="mr-1">{getPriorityIcon(requirement.priority)}</span>
                        {requirement.priority}
                      </span>

                      {requirement.dueDate && (
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {new Date(requirement.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    {/* Action Icons */}
                    <div className="flex gap-2 mt-4 justify-end">
                      <button
                        onClick={() => startEditRequirement(requirement)}
                        className="text-blue-600 hover:text-blue-700 transition-colors duration-200"
                        title="Edit"
                        aria-label="Edit task"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteRequirement(requirement._id)}
                        className="text-red-600 hover:text-red-700 transition-colors duration-200"
                        title="Delete"
                        aria-label="Delete task"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}

        {filteredRequirements.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
            <p className="text-gray-500">Get started by adding your first wedding planning task.</p>
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
