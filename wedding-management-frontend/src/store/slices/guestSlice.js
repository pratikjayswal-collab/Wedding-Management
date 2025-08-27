import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import guestService from '../../services/guestService';

const initialState = {
  guests: [],
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: '',
  stats: null,
};

// Get all guests
export const getGuests = createAsyncThunk(
  'guest/getAll',
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user?.token;
      return await guestService.getGuests(token);
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

// Create new guest
export const createGuest = createAsyncThunk(
  'guest/create',
  async (guestData, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user?.token;
      return await guestService.createGuest(guestData, token);
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

// Update guest
export const updateGuest = createAsyncThunk(
  'guest/update',
  async ({ id, guestData }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user?.token;
      return await guestService.updateGuest(id, guestData, token);
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

// Delete guest
export const deleteGuest = createAsyncThunk(
  'guest/delete',
  async (id, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user?.token;
      await guestService.deleteGuest(id, token);
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

// Toggle invitation status
export const toggleInvitation = createAsyncThunk(
  'guest/toggleInvitation',
  async (id, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user?.token;
      return await guestService.toggleInvitation(id, token);
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

// Bulk update invitations
export const bulkUpdateInvitation = createAsyncThunk(
  'guest/bulkUpdateInvitation',
  async ({ guestIds, invitationSent }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user?.token;
      return await guestService.bulkUpdateInvitation({ guestIds, invitationSent }, token);
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

// Get guest stats
export const getGuestStats = createAsyncThunk(
  'guest/getStats',
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user?.token;
      return await guestService.getGuestStats(token);
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

export const guestSlice = createSlice({
  name: 'guest',
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
      .addCase(getGuests.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getGuests.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.guests = action.payload;
      })
      .addCase(getGuests.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(createGuest.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createGuest.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.guests.push(action.payload);
      })
      .addCase(createGuest.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(updateGuest.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateGuest.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.guests = state.guests.map((guest) =>
          guest._id === action.payload._id ? action.payload : guest
        );
      })
      .addCase(updateGuest.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(deleteGuest.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteGuest.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.guests = state.guests.filter((guest) => guest._id !== action.payload);
      })
      .addCase(deleteGuest.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(toggleInvitation.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(toggleInvitation.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.guests = state.guests.map((guest) =>
          guest._id === action.payload._id ? action.payload : guest
        );
      })
      .addCase(toggleInvitation.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(bulkUpdateInvitation.pending, (state, action) => {
        // Optimistically update invitationSent for immediate UI feedback
        state.isLoading = true;
        const { guestIds, invitationSent } = action.meta.arg || {};
        if (Array.isArray(guestIds)) {
          state.guests = state.guests.map((guest) =>
            guestIds.includes(guest._id) ? { ...guest, invitationSent } : guest
          );
        }
      })
      .addCase(bulkUpdateInvitation.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        // Update all affected guests
        action.payload.forEach((updatedGuest) => {
          state.guests = state.guests.map((guest) =>
            guest._id === updatedGuest._id ? updatedGuest : guest
          );
        });
      })
      .addCase(bulkUpdateInvitation.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getGuestStats.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getGuestStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.stats = action.payload;
      })
      .addCase(getGuestStats.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset, clearError } = guestSlice.actions;
export default guestSlice.reducer;

