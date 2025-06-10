// API Configuration
export const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3000/api'
  : 'https://your-production-api.com/api';

export const SOCKET_URL = __DEV__
  ? 'http://localhost:3000'
  : 'https://your-production-api.com';

// Stripe Configuration
export const STRIPE_PUBLISHABLE_KEY = __DEV__
  ? 'pk_test_your-stripe-publishable-key'
  : 'pk_live_your-stripe-publishable-key';

// App Configuration
export const APP_NAME = 'Honey Badger';
export const APP_VERSION = '1.0.0';

// Colors (Honey Badger Theme)
export const COLORS = {
  // Primary honey badger colors
  primary: '#F8B500',      // Honey yellow
  secondary: '#8B4513',    // Saddle brown
  accent: '#DAA520',       // Goldenrod
  
  // Grays
  background: '#FFFFFF',
  surface: '#F8F9FA',
  cardBackground: '#FFFFFF',
  border: '#E9ECEF',
  
  // Text
  text: '#212529',
  textSecondary: '#6C757D',
  textLight: '#ADB5BD',
  
  // Status colors
  success: '#28A745',
  warning: '#FFC107',
  error: '#DC3545',
  info: '#17A2B8',
  
  // Challenge status colors
  pending: '#FFC107',
  active: '#28A745',
  completed: '#6F42C1',
  failed: '#DC3545',
  cancelled: '#6C757D',
  
  // Badger personality colors
  relentless: '#DC3545',
  cheerleader: '#E91E63',
  coach: '#2196F3',
  buddy: '#4CAF50',
  competitor: '#FF9800',
};

// Typography
export const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
  light: 'System',
};

export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 24,
  xxl: 32,
};

// Spacing
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Animation durations
export const ANIMATION_DURATION = {
  fast: 200,
  normal: 300,
  slow: 500,
};

// Challenge types
export const CHALLENGE_TYPES = {
  FITNESS: { label: 'Fitness', icon: '💪', color: COLORS.success },
  HABIT: { label: 'Habit', icon: '🔄', color: COLORS.info },
  LEARNING: { label: 'Learning', icon: '📚', color: COLORS.primary },
  CREATIVE: { label: 'Creative', icon: '🎨', color: COLORS.accent },
  SOCIAL: { label: 'Social', icon: '👥', color: COLORS.secondary },
  CUSTOM: { label: 'Custom', icon: '⭐', color: COLORS.text },
};

// Verification methods
export const VERIFICATION_METHODS = {
  PHOTO: { label: 'Photo Proof', icon: '📸' },
  VIDEO: { label: 'Video Proof', icon: '🎥' },
  FITNESS_TRACKER: { label: 'Fitness Tracker', icon: '⌚' },
  LOCATION: { label: 'Location Check-in', icon: '📍' },
  MANUAL: { label: 'Manual Check-in', icon: '✅' },
  TIME_BASED: { label: 'Time Based', icon: '⏰' },
  CHECKIN: { label: 'Check-in', icon: '📋' },
};

// Reward types
export const REWARD_TYPES = {
  MONEY: { label: 'Money', icon: '💰' },
  GIFT_CARD: { label: 'Gift Card', icon: '🎁' },
  MESSAGE: { label: 'Message', icon: '💌' },
  PHOTO: { label: 'Photo', icon: '🖼️' },
  VIDEO: { label: 'Video', icon: '🎬' },
  CUSTOM: { label: 'Custom', icon: '🎉' },
};

// Badger personalities
export const BADGER_PERSONALITIES = {
  RELENTLESS: {
    name: 'The Relentless',
    description: 'Never gives up, maximum persistence',
    emoji: '🦡💪',
    color: COLORS.relentless,
  },
  CHEERLEADER: {
    name: 'The Cheerleader',
    description: 'Positive reinforcement and celebration',
    emoji: '🦡🎉',
    color: COLORS.cheerleader,
  },
  COACH: {
    name: 'The Coach',
    description: 'Strategic guidance and technique tips',
    emoji: '🦡🧠',
    color: COLORS.coach,
  },
  BUDDY: {
    name: 'The Buddy',
    description: 'Friendly companion and accountability partner',
    emoji: '🦡🤝',
    color: COLORS.buddy,
  },
  COMPETITOR: {
    name: 'The Competitor',
    description: 'Gamification and competitive motivation',
    emoji: '🦡🏆',
    color: COLORS.competitor,
  },
};

// Storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: '@honey_badger_auth_token',
  USER_DATA: '@honey_badger_user_data',
  ONBOARDING_COMPLETED: '@honey_badger_onboarding',
  NOTIFICATION_SETTINGS: '@honey_badger_notifications',
};

// Network timeouts
export const TIMEOUTS = {
  request: 10000, // 10 seconds
  upload: 30000,  // 30 seconds
};

// File upload limits
export const FILE_LIMITS = {
  maxSizePhoto: 5 * 1024 * 1024,  // 5MB
  maxSizeVideo: 50 * 1024 * 1024, // 50MB
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif'],
  allowedVideoTypes: ['video/mp4', 'video/quicktime', 'video/avi'],
};

// Achievements
export const ACHIEVEMENTS = {
  FIRST_CHALLENGE: {
    title: 'First Challenge',
    description: 'Complete your first challenge',
    icon: '🌟',
  },
  STREAK_WEEK: {
    title: 'Week Warrior',
    description: 'Complete challenges for 7 days straight',
    icon: '🔥',
  },
  BADGER_BOND: {
    title: 'Badger Bond',
    description: 'Chat with your honey badger 50 times',
    icon: '💕',
  },
  CHALLENGER: {
    title: 'The Challenger',
    description: 'Send 10 challenges to friends',
    icon: '⚡',
  },
};

export default {
  API_BASE_URL,
  SOCKET_URL,
  STRIPE_PUBLISHABLE_KEY,
  APP_NAME,
  APP_VERSION,
  COLORS,
  FONTS,
  FONT_SIZES,
  SPACING,
  ANIMATION_DURATION,
  CHALLENGE_TYPES,
  VERIFICATION_METHODS,
  REWARD_TYPES,
  BADGER_PERSONALITIES,
  STORAGE_KEYS,
  TIMEOUTS,
  FILE_LIMITS,
  ACHIEVEMENTS,
};