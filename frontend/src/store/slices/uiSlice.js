import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // App state
  isOnboarded: false,
  theme: 'light', // 'light', 'dark'
  
  // Navigation
  activeTab: 'Home',
  
  // Notifications
  notifications: [],
  notificationSettings: {
    challengeUpdates: true,
    badgerMessages: true,
    reminders: true,
    achievements: true,
    marketing: false,
  },
  
  // Loading states
  globalLoading: false,
  loadingMessages: {},
  
  // Modals and overlays
  modals: {
    createBadger: false,
    createChallenge: false,
    settings: false,
    achievement: null, // Achievement data when showing achievement modal
  },
  
  // Toast messages
  toasts: [],
  
  // App settings
  settings: {
    enableHaptics: true,
    enableSounds: true,
    enableAnimations: true,
    autoSaveProgress: true,
    showBadgerEmoji: true,
  },
  
  // Network state
  isOnline: true,
  lastSync: null,
  
  // Error handling
  globalError: null,
};

let toastId = 0;
let notificationId = 0;

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Onboarding
    setOnboarded: (state, action) => {
      state.isOnboarded = action.payload;
    },
    
    // Theme
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
    
    // Navigation
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
    
    // Loading states
    setGlobalLoading: (state, action) => {
      state.globalLoading = action.payload;
    },
    
    setLoadingMessage: (state, action) => {
      const { key, message } = action.payload;
      if (message) {
        state.loadingMessages[key] = message;
      } else {
        delete state.loadingMessages[key];
      }
    },
    
    // Modals
    showModal: (state, action) => {
      const { modal, data } = action.payload;
      state.modals[modal] = data || true;
    },
    
    hideModal: (state, action) => {
      const modal = action.payload;
      state.modals[modal] = false;
    },
    
    hideAllModals: (state) => {
      Object.keys(state.modals).forEach(key => {
        state.modals[key] = false;
      });
    },
    
    // Toasts
    showToast: (state, action) => {
      const toast = {
        id: ++toastId,
        timestamp: Date.now(),
        ...action.payload,
      };
      state.toasts.push(toast);
    },
    
    hideToast: (state, action) => {
      const toastId = action.payload;
      state.toasts = state.toasts.filter(toast => toast.id !== toastId);
    },
    
    clearToasts: (state) => {
      state.toasts = [];
    },
    
    // Notifications
    showNotification: (state, action) => {
      const notification = {
        id: ++notificationId,
        timestamp: Date.now(),
        read: false,
        ...action.payload,
      };
      state.notifications.unshift(notification);
      
      // Keep only last 50 notifications
      if (state.notifications.length > 50) {
        state.notifications = state.notifications.slice(0, 50);
      }
    },
    
    markNotificationAsRead: (state, action) => {
      const notificationId = action.payload;
      const notification = state.notifications.find(n => n.id === notificationId);
      if (notification) {
        notification.read = true;
      }
    },
    
    markAllNotificationsAsRead: (state) => {
      state.notifications.forEach(notification => {
        notification.read = true;
      });
    },
    
    clearNotifications: (state) => {
      state.notifications = [];
    },
    
    updateNotificationSettings: (state, action) => {
      state.notificationSettings = {
        ...state.notificationSettings,
        ...action.payload,
      };
    },
    
    // Settings
    updateSettings: (state, action) => {
      state.settings = {
        ...state.settings,
        ...action.payload,
      };
    },
    
    resetSettings: (state) => {
      state.settings = initialState.settings;
    },
    
    // Network state
    setOnlineStatus: (state, action) => {
      state.isOnline = action.payload;
    },
    
    setLastSync: (state, action) => {
      state.lastSync = action.payload || Date.now();
    },
    
    // Error handling
    setGlobalError: (state, action) => {
      state.globalError = action.payload;
    },
    
    clearGlobalError: (state) => {
      state.globalError = null;
    },
    
    // Reset all UI state
    resetUI: () => initialState,
  },
});

export const {
  setOnboarded,
  setTheme,
  setActiveTab,
  setGlobalLoading,
  setLoadingMessage,
  showModal,
  hideModal,
  hideAllModals,
  showToast,
  hideToast,
  clearToasts,
  showNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  clearNotifications,
  updateNotificationSettings,
  updateSettings,
  resetSettings,
  setOnlineStatus,
  setLastSync,
  setGlobalError,
  clearGlobalError,
  resetUI,
} = uiSlice.actions;

export default uiSlice.reducer;

// Selectors
export const selectIsOnboarded = (state) => state.ui.isOnboarded;
export const selectTheme = (state) => state.ui.theme;
export const selectActiveTab = (state) => state.ui.activeTab;
export const selectGlobalLoading = (state) => state.ui.globalLoading;
export const selectLoadingMessage = (key) => (state) => state.ui.loadingMessages[key];
export const selectModals = (state) => state.ui.modals;
export const selectModal = (modalName) => (state) => state.ui.modals[modalName];
export const selectToasts = (state) => state.ui.toasts;
export const selectNotifications = (state) => state.ui.notifications;
export const selectUnreadNotifications = (state) => 
  state.ui.notifications.filter(n => !n.read);
export const selectNotificationSettings = (state) => state.ui.notificationSettings;
export const selectSettings = (state) => state.ui.settings;
export const selectIsOnline = (state) => state.ui.isOnline;
export const selectLastSync = (state) => state.ui.lastSync;
export const selectGlobalError = (state) => state.ui.globalError;

// Helper selectors
export const selectShouldShowOfflineWarning = (state) => {
  const lastSync = state.ui.lastSync;
  const isOnline = state.ui.isOnline;
  const timeSinceSync = lastSync ? Date.now() - lastSync : Infinity;
  
  return !isOnline || timeSinceSync > 5 * 60 * 1000; // 5 minutes
};

export const selectActiveModal = (state) => {
  const modals = state.ui.modals;
  return Object.entries(modals).find(([key, value]) => value !== false)?.[0] || null;
};