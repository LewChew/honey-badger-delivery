import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { badgerService } from '../../services/badgerService';

// Async thunks
export const fetchBadgers = createAsyncThunk(
  'badger/fetchBadgers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await badgerService.getMyBadgers();
      return response.honeyBadgers;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createBadger = createAsyncThunk(
  'badger/createBadger',
  async (badgerData, { rejectWithValue }) => {
    try {
      const response = await badgerService.createBadger(badgerData);
      return response.honeyBadger;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateBadger = createAsyncThunk(
  'badger/updateBadger',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await badgerService.updateBadger(id, data);
      return response.honeyBadger;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteBadger = createAsyncThunk(
  'badger/deleteBadger',
  async (badgerId, { rejectWithValue }) => {
    try {
      await badgerService.deleteBadger(badgerId);
      return badgerId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchBadgerDetail = createAsyncThunk(
  'badger/fetchBadgerDetail',
  async (badgerId, { rejectWithValue }) => {
    try {
      const response = await badgerService.getBadgerDetail(badgerId);
      return response.honeyBadger;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  badgers: [],
  selectedBadger: null,
  personalities: [],
  loading: false,
  error: null,
  lastUpdated: null,
};

const badgerSlice = createSlice({
  name: 'badger',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedBadger: (state) => {
      state.selectedBadger = null;
    },
    clearData: () => initialState,
    updateBadgerInList: (state, action) => {
      const index = state.badgers.findIndex(b => b.id === action.payload.id);
      if (index !== -1) {
        state.badgers[index] = { ...state.badgers[index], ...action.payload };
      }
    },
    setPersonalities: (state, action) => {
      state.personalities = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch badgers
      .addCase(fetchBadgers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBadgers.fulfilled, (state, action) => {
        state.loading = false;
        state.badgers = action.payload;
        state.lastUpdated = Date.now();
        state.error = null;
      })
      .addCase(fetchBadgers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create badger
      .addCase(createBadger.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBadger.fulfilled, (state, action) => {
        state.loading = false;
        state.badgers.push(action.payload);
        state.error = null;
      })
      .addCase(createBadger.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update badger
      .addCase(updateBadger.fulfilled, (state, action) => {
        const index = state.badgers.findIndex(b => b.id === action.payload.id);
        if (index !== -1) {
          state.badgers[index] = action.payload;
        }
        if (state.selectedBadger?.id === action.payload.id) {
          state.selectedBadger = action.payload;
        }
      })
      
      // Delete badger
      .addCase(deleteBadger.fulfilled, (state, action) => {
        state.badgers = state.badgers.filter(b => b.id !== action.payload);
        if (state.selectedBadger?.id === action.payload) {
          state.selectedBadger = null;
        }
      })
      
      // Fetch badger detail
      .addCase(fetchBadgerDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBadgerDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedBadger = action.payload;
        state.error = null;
      })
      .addCase(fetchBadgerDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  clearSelectedBadger,
  clearData,
  updateBadgerInList,
  setPersonalities,
} = badgerSlice.actions;

export default badgerSlice.reducer;

// Selectors
export const selectBadgers = (state) => state.badger.badgers;
export const selectSelectedBadger = (state) => state.badger.selectedBadger;
export const selectBadgerLoading = (state) => state.badger.loading;
export const selectBadgerError = (state) => state.badger.error;
export const selectPersonalities = (state) => state.badger.personalities;
export const selectAvailableBadgers = (state) => 
  state.badger.badgers.filter(badger => !badger.challengeId);
export const selectAssignedBadgers = (state) => 
  state.badger.badgers.filter(badger => badger.challengeId);