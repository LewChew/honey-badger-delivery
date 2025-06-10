import React, { useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector, useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { selectIsAuthenticated, selectIsInitialized, verifyToken } from '../store/slices/authSlice';
import { COLORS, BADGER_PERSONALITIES } from '../config/constants';
import socketService from '../services/socketService';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import OnboardingScreen from '../screens/auth/OnboardingScreen';

// Main Screens
import HomeScreen from '../screens/main/HomeScreen';
import BadgersScreen from '../screens/main/BadgersScreen';
import ChallengesScreen from '../screens/main/ChallengesScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

// Feature Screens
import CreateBadgerScreen from '../screens/badgers/CreateBadgerScreen';
import BadgerDetailScreen from '../screens/badgers/BadgerDetailScreen';
import CreateChallengeScreen from '../screens/challenges/CreateChallengeScreen';
import ChallengeDetailScreen from '../screens/challenges/ChallengeDetailScreen';
import ChatScreen from '../screens/chat/ChatScreen';

// Components
import LoadingScreen from '../components/LoadingScreen';
import SplashScreen from '../components/SplashScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Auth Stack Navigator
const AuthNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: COLORS.background },
      }}
    >
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
};

// Main Tab Navigator
const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Badgers':
              iconName = focused ? 'account-heart' : 'account-heart-outline';
              break;
            case 'Challenges':
              iconName = focused ? 'trophy' : 'trophy-outline';
              break;
            case 'Profile':
              iconName = focused ? 'account-circle' : 'account-circle-outline';
              break;
            default:
              iconName = 'circle';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: {
          backgroundColor: COLORS.background,
          borderTopColor: COLORS.border,
          paddingBottom: 8,
          paddingTop: 8,
          height: 65,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ title: '🏠 Home' }}
      />
      <Tab.Screen 
        name="Badgers" 
        component={BadgersScreen}
        options={{ title: '🦡 Badgers' }}
      />
      <Tab.Screen 
        name="Challenges" 
        component={ChallengesScreen}
        options={{ title: '🏆 Challenges' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: '👤 Profile' }}
      />
    </Tab.Navigator>
  );
};

// Main Stack Navigator
const MainNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.primary,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: COLORS.text,
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 18,
        },
      }}
    >
      <Stack.Screen 
        name="MainTabs" 
        component={MainTabNavigator}
        options={{ headerShown: false }}
      />
      
      {/* Badger Screens */}
      <Stack.Screen 
        name="CreateBadger" 
        component={CreateBadgerScreen}
        options={{ 
          title: '🦡 Create Honey Badger',
          presentation: 'modal',
        }}
      />
      <Stack.Screen 
        name="BadgerDetail" 
        component={BadgerDetailScreen}
        options={({ route }) => ({
          title: route.params?.badgerName || 'Honey Badger',
        })}
      />
      
      {/* Challenge Screens */}
      <Stack.Screen 
        name="CreateChallenge" 
        component={CreateChallengeScreen}
        options={{ 
          title: '🎯 Create Challenge',
          presentation: 'modal',
        }}
      />
      <Stack.Screen 
        name="ChallengeDetail" 
        component={ChallengeDetailScreen}
        options={({ route }) => ({
          title: route.params?.challengeTitle || 'Challenge',
        })}
      />
      
      {/* Chat Screen */}
      <Stack.Screen 
        name="Chat" 
        component={ChatScreen}
        options={({ route }) => ({
          title: `💬 ${route.params?.badgerName || 'Chat'}`,
        })}
      />
    </Stack.Navigator>
  );
};

// Root App Navigator
const AppNavigator = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isInitialized = useSelector(selectIsInitialized);

  useEffect(() => {
    // Verify existing token on app start
    dispatch(verifyToken());
  }, [dispatch]);

  useEffect(() => {
    // Connect to socket when authenticated
    if (isAuthenticated) {
      socketService.connect();
    } else {
      socketService.disconnect();
    }

    // Cleanup on unmount
    return () => {
      socketService.disconnect();
    };
  }, [isAuthenticated]);

  // Show splash screen while initializing
  if (!isInitialized) {
    return <SplashScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name="Main" component={MainNavigator} />
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;