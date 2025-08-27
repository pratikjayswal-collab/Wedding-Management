import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import expenseService from '../../services/expenseService';

const initialState = {
  expenses: [],
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: '',
  stats: null,
  chartData: null,
};

// Get all expenses
export const getExpenses = createAsyncThunk(
  'expense/getAll',
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user?.token;
      return await expenseService.getExpenses(token);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Create new expense
export const createExpense = createAsyncThunk(
  'expense/create',
  async (expenseData, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user?.token;
      return await expenseService.createExpense(expenseData, token);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update expense
export const updateExpense = createAsyncThunk(
  'expense/update',
  async ({ id, expenseData }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user?.token;
      return await expenseService.updateExpense(id, expenseData, token);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Delete expense
export const deleteExpense = createAsyncThunk(
  'expense/delete',
  async (id, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user?.token;
      await expenseService.deleteExpense(id, token);
      return id;
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Add expense item
export const addExpenseItem = createAsyncThunk(
  'expense/addItem',
  async ({ expenseId, itemData }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user?.token;
      return await expenseService.addExpenseItem(expenseId, itemData, token);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update expense item
export const updateExpenseItem = createAsyncThunk(
  'expense/updateItem',
  async ({ expenseId, itemId, itemData }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user?.token;
      return await expenseService.updateExpenseItem(expenseId, itemId, itemData, token);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Delete expense item
export const deleteExpenseItem = createAsyncThunk(
  'expense/deleteItem',
  async ({ expenseId, itemId }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user?.token;
      await expenseService.deleteExpenseItem(expenseId, itemId, token);
      return { expenseId, itemId };
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get expense statistics
export const getExpenseStats = createAsyncThunk(
  'expense/getStats',
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user?.token;
      return await expenseService.getExpenseStats(token);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get expense chart data
export const getExpenseChartData = createAsyncThunk(
  'expense/getChartData',
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user?.token;
      return await expenseService.getExpenseChartData(token);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const expenseSlice = createSlice({
  name: 'expense',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
    clearError: (state) => {
      state.isError = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getExpenses.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getExpenses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.expenses = action.payload;
      })
      .addCase(getExpenses.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(createExpense.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createExpense.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.expenses.push(action.payload);
      })
      .addCase(createExpense.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(updateExpense.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateExpense.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.expenses = state.expenses.map((expense) =>
          expense._id === action.payload._id ? action.payload : expense
        );
      })
      .addCase(updateExpense.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(deleteExpense.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteExpense.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.expenses = state.expenses.filter((expense) => expense._id !== action.payload);
      })
      .addCase(deleteExpense.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(addExpenseItem.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addExpenseItem.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        // Update the expense with new item
        const expenseIndex = state.expenses.findIndex(exp => exp._id === action.payload._id);
        if (expenseIndex !== -1) {
          state.expenses[expenseIndex] = action.payload;
        }
      })
      .addCase(addExpenseItem.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(updateExpenseItem.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateExpenseItem.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        // Update the expense with updated item
        const expenseIndex = state.expenses.findIndex(exp => exp._id === action.payload._id);
        if (expenseIndex !== -1) {
          state.expenses[expenseIndex] = action.payload;
        }
      })
      .addCase(updateExpenseItem.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(deleteExpenseItem.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteExpenseItem.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        // Update the expense by removing the deleted item
        const { expenseId, itemId } = action.payload;
        const expenseIndex = state.expenses.findIndex(exp => exp._id === expenseId);
        if (expenseIndex !== -1) {
          state.expenses[expenseIndex].items = state.expenses[expenseIndex].items.filter(
            item => item._id !== itemId
          );
        }
      })
      .addCase(deleteExpenseItem.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getExpenseStats.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getExpenseStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.stats = action.payload;
      })
      .addCase(getExpenseStats.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getExpenseChartData.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getExpenseChartData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.chartData = action.payload;
      })
      .addCase(getExpenseChartData.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset, clearError } = expenseSlice.actions;
export default expenseSlice.reducer;
