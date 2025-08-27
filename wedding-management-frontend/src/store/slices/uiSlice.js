import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Modal states
  isGuestModalOpen: false,
  isExpenseModalOpen: false,
  isExpenseItemModalOpen: false,
  isRequirementModalOpen: false,
  
  // Navigation states
  activeTab: (typeof window !== 'undefined' && window.localStorage.getItem('activeTab')) || 'overview',
  isSidebarOpen: false,
  
  // Loading states
  isLoading: false,

  // Editing state
  editingGuest: null,
  
  // Selection states
  selectedGuests: [],
  selectedExpenses: [],
  selectedRequirements: [],
  
  // Guest member states
  expandedGuestMembers: {},
  
  // Filter states
  filterStatus: 'all',
  filterPriority: 'all',
  filterCategory: 'all',
  filterTags: [],
  
  // Search states
  searchTerm: '',
  
  // Notification states
  showNotification: false,
  notificationMessage: '',
  notificationType: 'success', // 'success', 'error', 'warning', 'info'
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Modal actions
    openGuestModal: (state, action) => {
      state.isGuestModalOpen = true;
    },
    closeGuestModal: (state) => {
      state.isGuestModalOpen = false;
    },
    setEditingGuest: (state, action) => {
      state.editingGuest = action.payload || null;
    },
    openExpenseModal: (state, action) => {
      state.isExpenseModalOpen = true;
    },
    closeExpenseModal: (state) => {
      state.isExpenseModalOpen = false;
    },
    openExpenseItemModal: (state, action) => {
      state.isExpenseItemModalOpen = true;
    },
    closeExpenseItemModal: (state) => {
      state.isExpenseItemModalOpen = false;
    },
    openRequirementModal: (state, action) => {
      state.isRequirementModalOpen = true;
    },
    closeRequirementModal: (state) => {
      state.isRequirementModalOpen = false;
    },
    
    // Navigation actions
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
      try {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem('activeTab', action.payload);
        }
      } catch (_) {
        // ignore storage errors
      }
    },
    toggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen;
    },
    
    // Loading actions
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    
    // Selection actions
    toggleGuestSelection: (state, action) => {
      const guestId = action.payload;
      if (state.selectedGuests.includes(guestId)) {
        state.selectedGuests = state.selectedGuests.filter(id => id !== guestId);
      } else {
        state.selectedGuests.push(guestId);
      }
    },
    selectAllGuests: (state, action) => {
      state.selectedGuests = action.payload;
    },
    clearGuestSelection: (state) => {
      state.selectedGuests = [];
    },
    
    toggleExpenseSelection: (state, action) => {
      const expenseId = action.payload;
      if (state.selectedExpenses.includes(expenseId)) {
        state.selectedExpenses = state.selectedExpenses.filter(id => id !== expenseId);
      } else {
        state.selectedExpenses.push(expenseId);
      }
    },
    selectAllExpenses: (state, action) => {
      state.selectedExpenses = action.payload;
    },
    clearExpenseSelection: (state) => {
      state.selectedExpenses = [];
    },
    
    toggleRequirementSelection: (state, action) => {
      const requirementId = action.payload;
      if (state.selectedRequirements.includes(requirementId)) {
        state.selectedRequirements = state.selectedRequirements.filter(id => id !== requirementId);
      } else {
        state.selectedRequirements.push(requirementId);
      }
    },
    selectAllRequirements: (state, action) => {
      state.selectedRequirements = action.payload;
    },
    clearRequirementSelection: (state) => {
      state.selectedRequirements = [];
    },
    
    // Guest member actions
    toggleGuestMembers: (state, action) => {
      const guestId = action.payload;
      state.expandedGuestMembers[guestId] = !state.expandedGuestMembers[guestId];
    },
    
    // Filter actions
    setFilterStatus: (state, action) => {
      state.filterStatus = action.payload;
    },
    setFilterPriority: (state, action) => {
      state.filterPriority = action.payload;
    },
    setFilterCategory: (state, action) => {
      state.filterCategory = action.payload;
    },
    setFilterTags: (state, action) => {
      state.filterTags = Array.isArray(action.payload) ? action.payload : [];
    },
    
    // Search actions
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    },
    
    // Notification actions
    showNotification: (state, action) => {
      state.showNotification = true;
      state.notificationMessage = action.payload.message || '';
      state.notificationType = action.payload.type || 'success';
    },
    hideNotification: (state) => {
      state.showNotification = false;
    },
    
    // Reset UI state
    resetUI: (state) => {
      state.selectedGuests = [];
      state.selectedExpenses = [];
      state.selectedRequirements = [];
      state.expandedGuestMembers = {};
      state.filterStatus = 'all';
      state.filterPriority = 'all';
      state.filterCategory = 'all';
      state.searchTerm = '';
      state.showNotification = false;
    },
  },
});

export const {
  // Modal actions
  openGuestModal,
  closeGuestModal,
  setEditingGuest,
  openExpenseModal,
  closeExpenseModal,
  openExpenseItemModal,
  closeExpenseItemModal,
  openRequirementModal,
  closeRequirementModal,
  
  // Navigation actions
  setActiveTab,
  toggleSidebar,
  
  // Loading actions
  setLoading,
  
  // Selection actions
  toggleGuestSelection,
  selectAllGuests,
  clearGuestSelection,
  toggleExpenseSelection,
  selectAllExpenses,
  clearExpenseSelection,
  toggleRequirementSelection,
  selectAllRequirements,
  clearRequirementSelection,
  
  // Guest member actions
  toggleGuestMembers,
  
  // Filter actions
  setFilterStatus,
  setFilterPriority,
  setFilterCategory,
  setFilterTags,
  
  // Search actions
  setSearchTerm,
  
  // Notification actions
  showNotification,
  hideNotification,
  
  // Reset actions
  resetUI,
} = uiSlice.actions;

export default uiSlice.reducer;
