import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';

import { COLORS, SPACING, FONT_SIZES, BADGER_PERSONALITIES } from '../config/constants';

const BadgerCard = ({ badger, onPress, style }) => {
  const personality = BADGER_PERSONALITIES[badger.personality];
  const isAssigned = !!badger.challenge;
  
  const getStatusInfo = () => {
    if (isAssigned) {
      return {
        text: 'On Mission',
        icon: 'rocket-launch',
        color: COLORS.success,
      };
    }
    return {
      text: 'Available',
      icon: 'check-circle',
      color: COLORS.primary,
    };
  };

  const status = getStatusInfo();
  const gradientColors = [personality?.color || COLORS.primary, COLORS.surface];

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.nameContainer}>
            <Text style={styles.name}>{badger.name}</Text>
            <Text style={styles.personality}>{personality?.name}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: status.color }]}>
            <Icon name={status.icon} size={12} color={COLORS.background} />
          </View>
        </View>

        {/* Badger Avatar */}
        <View style={styles.avatarContainer}>
          <Text style={styles.avatar}>{personality?.emoji || '🦡'}</Text>
          <Text style={styles.level}>Lv. {badger.level}</Text>
        </View>

        {/* Stats */}
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{badger.successfulChallenges || 0}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{badger.experience || 0}</Text>
            <Text style={styles.statLabel}>XP</Text>
          </View>
        </View>

        {/* Current Challenge */}
        {isAssigned && badger.challenge && (
          <View style={styles.challengeInfo}>
            <Icon name="target" size={14} color={COLORS.textSecondary} />
            <Text style={styles.challengeTitle} numberOfLines={1}>
              {badger.challenge.title}
            </Text>
          </View>
        )}

        {/* Status */}
        <View style={styles.statusContainer}>
          <Icon name={status.icon} size={16} color={status.color} />
          <Text style={[styles.statusText, { color: status.color }]}>
            {status.text}
          </Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 180,
    height: 220,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: COLORS.text,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  gradient: {
    flex: 1,
    padding: SPACING.md,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  nameContainer: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  name: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  personality: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarContainer: {
    alignItems: 'center',
    marginVertical: SPACING.sm,
  },
  avatar: {
    fontSize: 40,
    marginBottom: SPACING.xs,
  },
  level: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '600',
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 20,
    backgroundColor: COLORS.border,
  },
  statValue: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  challengeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  challengeTitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
    flex: 1,
    fontWeight: '500',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    marginLeft: SPACING.xs,
  },
});

export default BadgerCard;