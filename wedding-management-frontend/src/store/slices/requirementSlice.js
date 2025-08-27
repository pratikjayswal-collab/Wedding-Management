import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import requirementService from '../../services/requirementService';

const initialState = {
  requirements: [],
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: '',
  stats: null,
};

// Get all requirements
export const getRequirements = createAsyncThunk(
  'requirement/getAll',
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user?.token;
      return await requirementService.getRequirements(token);
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

// Create new requirement
export const createRequirement = createAsyncThunk(
  'requirement/create',
  async (requirementData, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user?.token;
      return await requirementService.createRequirement(requirementData, token);
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

// Update requirement
export const updateRequirement = createAsyncThunk(
  'requirement/update',
  async ({ id, requirementData }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user?.token;
      return await requirementService.updateRequirement(id, requirementData, token);
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

// Delete requirement
export const deleteRequirement = createAsyncThunk(
  'requirement/delete',
  async (id, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user?.token;
      await requirementService.deleteRequirement(id, token);
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

// Toggle requirement status
export const toggleRequirementStatus = createAsyncThunk(
  'requirement/toggleStatus',
  async (id, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user?.token;
      return await requirementService.toggleRequirementStatus(id, token);
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

// Bulk update requirement status
export const bulkUpdateRequirementStatus = createAsyncThunk(
  'requirement/bulkUpdateStatus',
  async ({ requirementIds, status }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user?.token;
      return await requirementService.bulkUpdateRequirementStatus({ requirementIds, status }, token);
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

// Get requirements by status
export const getRequirementsByStatus = createAsyncThunk(
  'requirement/getByStatus',
  async (status, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user?.token;
      return await requirementService.getRequirementsByStatus(status, token);
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

// Get requirement statistics
export const getRequirementStats = createAsyncThunk(
  'requirement/getStats',
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user?.token;
      return await requirementService.getRequirementStats(token);
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

export const requirementSlice = createSlice({
  name: 'requirement',
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
      .addCase(getRequirements.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getRequirements.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.requirements = action.payload;
      })
      .addCase(getRequirements.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(createRequirement.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createRequirement.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.requirements.push(action.payload);
      })
      .addCase(createRequirement.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(updateRequirement.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateRequirement.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.requirements = state.requirements.map((requirement) =>
          requirement._id === action.payload._id ? action.payload : requirement
        );
      })
      .addCase(updateRequirement.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(deleteRequirement.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteRequirement.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.requirements = state.requirements.filter((requirement) => requirement._id !== action.payload);
      })
      .addCase(deleteRequirement.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(toggleRequirementStatus.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(toggleRequirementStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.requirements = state.requirements.map((requirement) =>
          requirement._id === action.payload._id ? action.payload : requirement
        );
      })
      .addCase(toggleRequirementStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(bulkUpdateRequirementStatus.pending, (state, action) => {
        // Optimistic update so UI reflects immediately
        state.isLoading = true;
        const { requirementIds, status } = action.meta.arg || {};
        if (Array.isArray(requirementIds)) {
          state.requirements = state.requirements.map((req) =>
            requirementIds.includes(req._id) ? { ...req, status } : req
          );
        }
      })
      .addCase(bulkUpdateRequirementStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        // Update all affected requirements
        action.payload.forEach((updatedRequirement) => {
          state.requirements = state.requirements.map((requirement) =>
            requirement._id === updatedRequirement._id ? updatedRequirement : requirement
          );
        });
      })
      .addCase(bulkUpdateRequirementStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getRequirementsByStatus.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getRequirementsByStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.requirements = action.payload;
      })
      .addCase(getRequirementsByStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getRequirementStats.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getRequirementStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.stats = action.payload;
      })
      .addCase(getRequirementStats.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset, clearError } = requirementSlice.actions;
export default requirementSlice.reducer;
