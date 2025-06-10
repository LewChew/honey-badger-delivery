import io from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SOCKET_URL, STORAGE_KEYS } from '../config/constants';
import { store } from '../store';
import { addMessage, updateTypingStatus } from '../store/slices/chatSlice';
import { showNotification } from '../store/slices/uiSlice';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  async connect() {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      
      if (!token) {
        console.error('No auth token found for socket connection');
        return;
      }

      this.socket = io(SOCKET_URL, {
        auth: {
          token,
        },
        transports: ['websocket'],
        timeout: 10000,
      });

      this.setupEventListeners();
      
    } catch (error) {
      console.error('Socket connection error:', error);
    }
  }

  setupEventListeners() {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('Socket connected');
      this.isConnected = true;
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      this.isConnected = false;
      
      // Auto-reconnect on unexpected disconnections
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, don't reconnect
        return;
      }
      
      this.handleReconnect();
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.handleReconnect();
    });

    // Chat events
    this.socket.on('new_message', (message) => {
      store.dispatch(addMessage(message));
      
      // Show notification if app is in background
      if (message.isBadger) {
        store.dispatch(showNotification({
          type: 'badger_message',
          title: message.honeyBadger?.name || 'Honey Badger',
          message: message.content,
          data: {
            challengeId: message.challengeId,
          },
        }));
      }
    });

    this.socket.on('message_sent', (message) => {
      store.dispatch(addMessage(message));
    });

    this.socket.on('user_typing', (data) => {
      store.dispatch(updateTypingStatus(data));
    });

    // Challenge events
    this.socket.on('challenge_update', (data) => {
      store.dispatch(showNotification({
        type: 'challenge_update',
        title: 'Challenge Update',
        message: data.message,
        data,
      }));
    });

    // Notification events
    this.socket.on('notification', (notification) => {
      store.dispatch(showNotification(notification));
    });

    // Error events
    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
      store.dispatch(showNotification({
        type: 'error',
        title: 'Connection Error',
        message: error.message || 'Something went wrong',
      }));
    });
  }

  handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    
    setTimeout(() => {
      console.log(`Reconnection attempt ${this.reconnectAttempts}`);
      this.connect();
    }, delay);
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Challenge room management
  joinChallenge(challengeId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join_challenge', challengeId);
    }
  }

  leaveChallenge(challengeId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave_challenge', challengeId);
    }
  }

  // Message sending
  sendMessage(challengeId, content, messageType = 'TEXT', mediaUrl = null) {
    if (this.socket && this.isConnected) {
      this.socket.emit('send_message', {
        challengeId,
        content,
        messageType,
        mediaUrl,
      });
    }
  }

  // Typing indicators
  startTyping(challengeId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('typing_start', { challengeId });
    }
  }

  stopTyping(challengeId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('typing_stop', { challengeId });
    }
  }

  // Honey badger interactions
  pokeBadger(challengeId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('poke_badger', { challengeId });
    }
  }

  // Connection status
  isSocketConnected() {
    return this.isConnected && this.socket?.connected;
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;