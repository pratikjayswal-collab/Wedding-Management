import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import guestReducer from './slices/guestSlice';
import expenseReducer from './slices/expenseSlice';
import requirementReducer from './slices/requirementSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    guest: guestReducer,
    expense: expenseReducer,
    requirement: requirementReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export default store;

