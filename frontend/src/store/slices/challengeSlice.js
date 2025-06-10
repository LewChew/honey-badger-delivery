import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { challengeService } from '../../services/challengeService';

// Async thunks
export const fetchChallenges = createAsyncThunk(
  'challenge/fetchChallenges',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await challengeService.getMyChallenges(filters);
      return response.challenges;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createChallenge = createAsyncThunk(
  'challenge/createChallenge',
  async (challengeData, { rejectWithValue }) => {
    try {
      const response = await challengeService.createChallenge(challengeData);
      return response.challenge;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchChallengeDetail = createAsyncThunk(
  'challenge/fetchChallengeDetail',
  async (challengeId, { rejectWithValue }) => {
    try {
      const response = await challengeService.getChallengeDetail(challengeId);
      return response.challenge;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const acceptChallenge = createAsyncThunk(
  'challenge/acceptChallenge',
  async (challengeId, { rejectWithValue }) => {
    try {
      const response = await challengeService.acceptChallenge(challengeId);
      return response.challenge;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const submitProgress = createAsyncThunk(
  'challenge/submitProgress',
  async ({ challengeId, progressData }, { rejectWithValue }) => {
    try {
      const response = await challengeService.submitProgress(challengeId, progressData);
      return { challengeId, progressUpdate: response.progressUpdate };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const cancelChallenge = createAsyncThunk(
  'challenge/cancelChallenge',
  async (challengeId, { rejectWithValue }) => {
    try {
      await challengeService.cancelChallenge(challengeId);
      return challengeId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  challenges: [],
  sentChallenges: [],
  receivedChallenges: [],
  selectedChallenge: null,
  loading: false,
  error: null,
  filters: {
    status: 'all',
    type: 'all',
    role: 'all', // 'sent', 'received', 'all'
  },
  lastUpdated: null,
};

const challengeSlice = createSlice({
  name: 'challenge',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedChallenge: (state) => {
      state.selectedChallenge = null;
    },
    clearData: () => initialState,
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    updateChallengeInList: (state, action) => {
      const updateChallenge = (list) => {
        const index = list.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          list[index] = { ...list[index], ...action.payload };
        }
      };
      
      updateChallenge(state.challenges);
      updateChallenge(state.sentChallenges);
      updateChallenge(state.receivedChallenges);
      
      if (state.selectedChallenge?.id === action.payload.id) {
        state.selectedChallenge = { ...state.selectedChallenge, ...action.payload };
      }
    },
    addProgressUpdate: (state, action) => {
      const { challengeId, progressUpdate } = action.payload;
      
      if (state.selectedChallenge?.id === challengeId) {
        if (!state.selectedChallenge.progressUpdates) {
          state.selectedChallenge.progressUpdates = [];
        }
        state.selectedChallenge.progressUpdates.unshift(progressUpdate);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch challenges
      .addCase(fetchChallenges.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChallenges.fulfilled, (state, action) => {
        state.loading = false;
        state.challenges = action.payload;
        
        // Separate into sent and received
        // This would need user ID from auth state
        state.sentChallenges = action.payload;
        state.receivedChallenges = action.payload;
        
        state.lastUpdated = Date.now();
        state.error = null;
      })
      .addCase(fetchChallenges.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create challenge
      .addCase(createChallenge.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createChallenge.fulfilled, (state, action) => {
        state.loading = false;
        state.challenges.unshift(action.payload);
        state.sentChallenges.unshift(action.payload);
        state.error = null;
      })
      .addCase(createChallenge.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch challenge detail
      .addCase(fetchChallengeDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChallengeDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedChallenge = action.payload;
        state.error = null;
      })
      .addCase(fetchChallengeDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Accept challenge
      .addCase(acceptChallenge.fulfilled, (state, action) => {
        const challengeId = action.payload.id;
        const updateLists = (list) => {
          const index = list.findIndex(c => c.id === challengeId);
          if (index !== -1) {
            list[index] = action.payload;
          }
        };
        
        updateLists(state.challenges);
        updateLists(state.receivedChallenges);
        
        if (state.selectedChallenge?.id === challengeId) {
          state.selectedChallenge = action.payload;
        }
      })
      
      // Submit progress
      .addCase(submitProgress.fulfilled, (state, action) => {
        const { challengeId, progressUpdate } = action.payload;
        
        if (state.selectedChallenge?.id === challengeId) {
          if (!state.selectedChallenge.progressUpdates) {
            state.selectedChallenge.progressUpdates = [];
          }
          state.selectedChallenge.progressUpdates.unshift(progressUpdate);
        }
      })
      
      // Cancel challenge
      .addCase(cancelChallenge.fulfilled, (state, action) => {
        const challengeId = action.payload;
        
        const removeFromList = (list) => {
          const index = list.findIndex(c => c.id === challengeId);
          if (index !== -1) {
            list[index].status = 'CANCELLED';
          }
        };
        
        removeFromList(state.challenges);
        removeFromList(state.sentChallenges);
        
        if (state.selectedChallenge?.id === challengeId) {
          state.selectedChallenge.status = 'CANCELLED';
        }
      });
  },
});

export const {
  clearError,
  clearSelectedChallenge,
  clearData,
  setFilters,
  updateChallengeInList,
  addProgressUpdate,
} = challengeSlice.actions;

export default challengeSlice.reducer;

// Selectors
export const selectChallenges = (state) => state.challenge.challenges;
export const selectSentChallenges = (state) => state.challenge.sentChallenges;
export const selectReceivedChallenges = (state) => state.challenge.receivedChallenges;
export const selectSelectedChallenge = (state) => state.challenge.selectedChallenge;
export const selectChallengeLoading = (state) => state.challenge.loading;
export const selectChallengeError = (state) => state.challenge.error;
export const selectChallengeFilters = (state) => state.challenge.filters;

// Filtered selectors
export const selectActiveChallenges = (state) => 
  state.challenge.challenges.filter(challenge => challenge.status === 'ACTIVE');

export const selectPendingChallenges = (state) => 
  state.challenge.challenges.filter(challenge => challenge.status === 'PENDING');

export const selectCompletedChallenges = (state) => 
  state.challenge.challenges.filter(challenge => challenge.status === 'COMPLETED');

export const selectFilteredChallenges = (state) => {
  const { challenges, filters } = state.challenge;
  
  return challenges.filter(challenge => {
    if (filters.status !== 'all' && challenge.status !== filters.status) {
      return false;
    }
    
    if (filters.type !== 'all' && challenge.type !== filters.type) {
      return false;
    }
    
    // Role filtering would need user context
    
    return true;
  });
};