import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFocusEffect } from '@react-navigation/native';

import { selectUser } from '../../store/slices/authSlice';
import { COLORS, SPACING, FONT_SIZES, CHALLENGE_TYPES } from '../../config/constants';
import { badgerService } from '../../services/badgerService';
import { challengeService } from '../../services/challengeService';

// Components
import BadgerCard from '../../components/BadgerCard';
import ChallengeCard from '../../components/ChallengeCard';
import StatsCard from '../../components/StatsCard';
import QuickActionButton from '../../components/QuickActionButton';

const HomeScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [badgers, setBadgers] = useState([]);
  const [activeChallenges, setActiveChallenges] = useState([]);
  const [stats, setStats] = useState({
    totalBadgers: 0,
    activeChallenges: 0,
    completedChallenges: 0,
    successRate: 0,
  });

  const loadDashboardData = async () => {
    try {
      const [badgersData, challengesData] = await Promise.all([
        badgerService.getMyBadgers(),
        challengeService.getMyChallenges({ status: 'ACTIVE' }),
      ]);

      setBadgers(badgersData.honeyBadgers || []);
      setActiveChallenges(challengesData.challenges || []);
      
      // Calculate stats
      const totalBadgers = badgersData.honeyBadgers?.length || 0;
      const activeChallengesCount = challengesData.challenges?.length || 0;
      
      // Get completed challenges for stats
      const completedData = await challengeService.getMyChallenges({ status: 'COMPLETED' });
      const completedCount = completedData.challenges?.length || 0;
      
      const totalChallenges = activeChallengesCount + completedCount;
      const successRate = totalChallenges > 0 ? Math.round((completedCount / totalChallenges) * 100) : 0;
      
      setStats({
        totalBadgers,
        activeChallenges: activeChallengesCount,
        completedChallenges: completedCount,
        successRate,
      });
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadDashboardData();
    }, [])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '🌅 Good morning';
    if (hour < 17) return '☀️ Good afternoon';
    return '🌙 Good evening';
  };

  const navigateToCreateBadger = () => {
    navigation.navigate('CreateBadger');
  };

  const navigateToCreateChallenge = () => {
    if (badgers.length === 0) {
      Alert.alert(
        'No Honey Badgers',
        'You need to create a honey badger first before sending challenges!',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Create Badger', onPress: navigateToCreateBadger },
        ]
      );
      return;
    }
    navigation.navigate('CreateChallenge');
  };

  const navigateToBadgerDetail = (badger) => {
    navigation.navigate('BadgerDetail', { 
      badgerId: badger.id,
      badgerName: badger.name,
    });
  };

  const navigateToChallengeDetail = (challenge) => {
    navigation.navigate('ChallengeDetail', { 
      challengeId: challenge.id,
      challengeTitle: challenge.title,
    });
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.loadingText}>Loading your honey badgers... 🦡</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={COLORS.primary}
          colors={[COLORS.primary]}
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            {getGreeting()}, {user?.firstName}!
          </Text>
          <Text style={styles.subtitle}>
            Your honey badgers are ready to help! 🦡💪
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.notificationButton}
          onPress={() => navigation.navigate('Profile')}
        >
          <Icon name="bell-outline" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <StatsCard
          title="Active Badgers"
          value={stats.totalBadgers}
          icon="account-heart"
          color={COLORS.primary}
        />
        <StatsCard
          title="Active Challenges"
          value={stats.activeChallenges}
          icon="trophy"
          color={COLORS.success}
        />
        <StatsCard
          title="Success Rate"
          value={`${stats.successRate}%`}
          icon="chart-line"
          color={COLORS.info}
        />
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <QuickActionButton
            title="Create Badger"
            icon="plus-circle"
            color={COLORS.primary}
            onPress={navigateToCreateBadger}
          />
          <QuickActionButton
            title="Send Challenge"
            icon="send"
            color={COLORS.success}
            onPress={navigateToCreateChallenge}
          />
          <QuickActionButton
            title="View All"
            icon="view-grid"
            color={COLORS.info}
            onPress={() => navigation.navigate('Challenges')}
          />
        </View>
      </View>

      {/* Active Honey Badgers */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Honey Badgers</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Badgers')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        
        {badgers.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🦡</Text>
            <Text style={styles.emptyTitle}>No Honey Badgers Yet</Text>
            <Text style={styles.emptyDescription}>
              Create your first honey badger to start sending motivational challenges!
            </Text>
            <TouchableOpacity 
              style={styles.emptyAction}
              onPress={navigateToCreateBadger}
            >
              <Text style={styles.emptyActionText}>Create Your First Badger</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          >
            {badgers.map((badger) => (
              <BadgerCard
                key={badger.id}
                badger={badger}
                onPress={() => navigateToBadgerDetail(badger)}
                style={styles.badgerCard}
              />
            ))}
          </ScrollView>
        )}
      </View>

      {/* Active Challenges */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Active Challenges</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Challenges')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        
        {activeChallenges.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🎯</Text>
            <Text style={styles.emptyTitle}>No Active Challenges</Text>
            <Text style={styles.emptyDescription}>
              Send or receive challenges to get your honey badgers working!
            </Text>
          </View>
        ) : (
          activeChallenges.slice(0, 3).map((challenge) => (
            <ChallengeCard
              key={challenge.id}
              challenge={challenge}
              onPress={() => navigateToChallengeDetail(challenge)}
              style={styles.challengeCard}
            />
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    paddingBottom: SPACING.xl,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  greeting: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  notificationButton: {
    padding: SPACING.sm,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  seeAllText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: SPACING.md,
  },
  horizontalList: {
    paddingLeft: SPACING.md,
  },
  badgerCard: {
    marginRight: SPACING.md,
  },
  challengeCard: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.md,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    lineHeight: 22,
  },
  emptyAction: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 25,
  },
  emptyActionText: {
    color: COLORS.text,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
});

export default HomeScreen;