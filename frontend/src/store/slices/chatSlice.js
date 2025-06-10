import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  messages: {}, // Keyed by challengeId
  typingUsers: {}, // Keyed by challengeId
  activeChallenge: null,
  unreadCounts: {}, // Keyed by challengeId
  error: null,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage: (state, action) => {
      const message = action.payload;
      const challengeId = message.challengeId;
      
      if (!state.messages[challengeId]) {
        state.messages[challengeId] = [];
      }
      
      // Avoid duplicates
      const exists = state.messages[challengeId].some(m => m.id === message.id);
      if (!exists) {
        state.messages[challengeId].push(message);
        
        // Increment unread count if not own message and not in active challenge
        if (!message.isOwn && state.activeChallenge !== challengeId) {
          state.unreadCounts[challengeId] = (state.unreadCounts[challengeId] || 0) + 1;
        }
      }
    },
    
    setMessages: (state, action) => {
      const { challengeId, messages } = action.payload;
      state.messages[challengeId] = messages;
    },
    
    updateTypingStatus: (state, action) => {
      const { challengeId, userId, isTyping, username } = action.payload;
      
      if (!state.typingUsers[challengeId]) {
        state.typingUsers[challengeId] = {};
      }
      
      if (isTyping) {
        state.typingUsers[challengeId][userId] = {
          username,
          timestamp: Date.now(),
        };
      } else {
        delete state.typingUsers[challengeId][userId];
      }
    },
    
    setActiveChallenge: (state, action) => {
      const challengeId = action.payload;
      state.activeChallenge = challengeId;
      
      // Clear unread count for active challenge
      if (challengeId && state.unreadCounts[challengeId]) {
        state.unreadCounts[challengeId] = 0;
      }
    },
    
    markMessagesAsRead: (state, action) => {
      const challengeId = action.payload;
      
      if (state.messages[challengeId]) {
        state.messages[challengeId] = state.messages[challengeId].map(message => ({
          ...message,
          isRead: true,
        }));
      }
      
      state.unreadCounts[challengeId] = 0;
    },
    
    clearMessages: (state, action) => {
      const challengeId = action.payload;
      if (challengeId) {
        delete state.messages[challengeId];
        delete state.typingUsers[challengeId];
        delete state.unreadCounts[challengeId];
      } else {
        // Clear all messages
        state.messages = {};
        state.typingUsers = {};
        state.unreadCounts = {};
      }
    },
    
    clearData: () => initialState,
    
    setError: (state, action) => {
      state.error = action.payload;
    },
    
    clearError: (state) => {
      state.error = null;
    },
    
    updateMessageStatus: (state, action) => {
      const { challengeId, messageId, status } = action.payload;
      
      if (state.messages[challengeId]) {
        const messageIndex = state.messages[challengeId].findIndex(m => m.id === messageId);
        if (messageIndex !== -1) {
          state.messages[challengeId][messageIndex] = {
            ...state.messages[challengeId][messageIndex],
            status,
          };
        }
      }
    },
    
    cleanupOldTypingIndicators: (state) => {
      const now = Date.now();
      const TYPING_TIMEOUT = 5000; // 5 seconds
      
      Object.keys(state.typingUsers).forEach(challengeId => {
        Object.keys(state.typingUsers[challengeId]).forEach(userId => {
          const typingInfo = state.typingUsers[challengeId][userId];
          if (now - typingInfo.timestamp > TYPING_TIMEOUT) {
            delete state.typingUsers[challengeId][userId];
          }
        });
        
        // Clean up empty challenge objects
        if (Object.keys(state.typingUsers[challengeId]).length === 0) {
          delete state.typingUsers[challengeId];
        }
      });
    },
  },
});

export const {
  addMessage,
  setMessages,
  updateTypingStatus,
  setActiveChallenge,
  markMessagesAsRead,
  clearMessages,
  clearData,
  setError,
  clearError,
  updateMessageStatus,
  cleanupOldTypingIndicators,
} = chatSlice.actions;

export default chatSlice.reducer;

// Selectors
export const selectMessages = (challengeId) => (state) => 
  state.chat.messages[challengeId] || [];

export const selectTypingUsers = (challengeId) => (state) => 
  state.chat.typingUsers[challengeId] || {};

export const selectActiveChallenge = (state) => state.chat.activeChallenge;

export const selectUnreadCount = (challengeId) => (state) => 
  state.chat.unreadCounts[challengeId] || 0;

export const selectTotalUnreadCount = (state) => 
  Object.values(state.chat.unreadCounts).reduce((total, count) => total + count, 0);

export const selectChatError = (state) => state.chat.error;

// Get last message for a challenge
export const selectLastMessage = (challengeId) => (state) => {
  const messages = state.chat.messages[challengeId];
  return messages && messages.length > 0 ? messages[messages.length - 1] : null;
};

// Get typing indicator text
export const selectTypingIndicatorText = (challengeId) => (state) => {
  const typingUsers = state.chat.typingUsers[challengeId] || {};
  const usernames = Object.values(typingUsers).map(user => user.username);
  
  if (usernames.length === 0) return null;
  if (usernames.length === 1) return `${usernames[0]} is typing...`;
  if (usernames.length === 2) return `${usernames[0]} and ${usernames[1]} are typing...`;
  return `${usernames[0]} and ${usernames.length - 1} others are typing...`;
};