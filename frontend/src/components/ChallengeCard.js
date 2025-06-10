import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { formatDistanceToNow } from 'date-fns';

import { 
  COLORS, 
  SPACING, 
  FONT_SIZES, 
  CHALLENGE_TYPES,
  VERIFICATION_METHODS,
  REWARD_TYPES 
} from '../config/constants';

const ChallengeCard = ({ challenge, onPress, style, showBadger = true }) => {
  const getStatusColor = () => {
    switch (challenge.status) {
      case 'PENDING':
        return COLORS.warning;
      case 'ACTIVE':
        return COLORS.success;
      case 'COMPLETED':
        return COLORS.info;
      case 'FAILED':
        return COLORS.error;
      case 'CANCELLED':
        return COLORS.textLight;
      default:
        return COLORS.textSecondary;
    }
  };

  const getStatusIcon = () => {
    switch (challenge.status) {
      case 'PENDING':
        return 'clock-outline';
      case 'ACTIVE':
        return 'play-circle';
      case 'COMPLETED':
        return 'check-circle';
      case 'FAILED':
        return 'close-circle';
      case 'CANCELLED':
        return 'cancel';
      default:
        return 'help-circle';
    }
  };

  const formatTimeRemaining = () => {
    if (!challenge.deadline) return null;
    
    try {
      const deadline = new Date(challenge.deadline);
      const now = new Date();
      
      if (deadline < now) {
        return 'Overdue';
      }
      
      return formatDistanceToNow(deadline, { addSuffix: true });
    } catch {
      return null;
    }
  };

  const challengeType = CHALLENGE_TYPES[challenge.type];
  const verificationMethod = VERIFICATION_METHODS[challenge.verificationMethod];
  const rewardType = REWARD_TYPES[challenge.rewardType];
  const statusColor = getStatusColor();
  const timeRemaining = formatTimeRemaining();

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.typeIcon, { backgroundColor: challengeType?.color || COLORS.primary }]}>
            <Text style={styles.typeEmoji}>{challengeType?.icon || '⭐'}</Text>
          </View>
          <View style={styles.headerText}>
            <Text style={styles.title} numberOfLines={1}>
              {challenge.title}
            </Text>
            <Text style={styles.type}>{challengeType?.label || challenge.type}</Text>
          </View>
        </View>
        
        <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
          <Icon name={getStatusIcon()} size={12} color={COLORS.background} />
          <Text style={styles.statusText}>{challenge.status}</Text>
        </View>
      </View>

      {/* Description */}
      <Text style={styles.description} numberOfLines={2}>
        {challenge.description}
      </Text>

      {/* Participants */}
      <View style={styles.participants}>
        <View style={styles.participant}>
          <Image 
            source={{ uri: challenge.sender?.avatar }} 
            style={styles.avatar}
            defaultSource={require('../assets/default-avatar.png')}
          />
          <Text style={styles.participantName}>
            {challenge.sender?.firstName} {challenge.sender?.lastName}
          </Text>
          <Text style={styles.participantRole}>Sender</Text>
        </View>
        
        <Icon name="arrow-right" size={16} color={COLORS.textLight} />
        
        <View style={styles.participant}>
          <Image 
            source={{ uri: challenge.recipient?.avatar }} 
            style={styles.avatar}
            defaultSource={require('../assets/default-avatar.png')}
          />
          <Text style={styles.participantName}>
            {challenge.recipient?.firstName} {challenge.recipient?.lastName}
          </Text>
          <Text style={styles.participantRole}>Recipient</Text>
        </View>
      </View>

      {/* Honey Badger */}
      {showBadger && challenge.honeyBadger && (
        <View style={styles.badgerInfo}>
          <Text style={styles.badgerEmoji}>🦡</Text>
          <View style={styles.badgerText}>
            <Text style={styles.badgerName}>{challenge.honeyBadger.name}</Text>
            <Text style={styles.badgerLevel}>Level {challenge.honeyBadger.level}</Text>
          </View>
        </View>
      )}

      {/* Challenge Details */}
      <View style={styles.details}>
        <View style={styles.detailItem}>
          <Icon name={verificationMethod?.icon || 'check'} size={14} color={COLORS.textSecondary} />
          <Text style={styles.detailText}>{verificationMethod?.label || 'Verification'}</Text>
        </View>
        
        <View style={styles.detailItem}>
          <Icon name={rewardType?.icon || 'gift'} size={14} color={COLORS.textSecondary} />
          <Text style={styles.detailText}>
            {challenge.rewardAmount ? `$${challenge.rewardAmount}` : rewardType?.label || 'Reward'}
          </Text>
        </View>
        
        {timeRemaining && (
          <View style={styles.detailItem}>
            <Icon name="clock-outline" size={14} color={COLORS.textSecondary} />
            <Text style={[styles.detailText, timeRemaining === 'Overdue' && styles.overdueText]}>
              {timeRemaining}
            </Text>
          </View>
        )}
      </View>

      {/* Progress Bar (for active challenges) */}
      {challenge.status === 'ACTIVE' && challenge.progressUpdates?.length > 0 && (
        <View style={styles.progressContainer}>
          <Text style={styles.progressLabel}>Progress</Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill,
                { 
                  width: `${challenge.progressUpdates[0]?.progressPercent || 0}%`,
                  backgroundColor: statusColor 
                }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {Math.round(challenge.progressUpdates[0]?.progressPercent || 0)}%
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    elevation: 2,
    shadowColor: COLORS.text,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: SPACING.sm,
  },
  typeIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  typeEmoji: {
    fontSize: 16,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  type: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
  },
  statusText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.background,
    fontWeight: '600',
    marginLeft: SPACING.xs,
    textTransform: 'capitalize',
  },
  description: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  participants: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.sm,
  },
  participant: {
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginBottom: SPACING.xs,
  },
  participantName: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
  participantRole: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  badgerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accent + '20',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
    marginBottom: SPACING.md,
  },
  badgerEmoji: {
    fontSize: 20,
    marginRight: SPACING.sm,
  },
  badgerText: {
    flex: 1,
  },
  badgerName: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
  },
  badgerLevel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
    fontWeight: '500',
  },
  overdueText: {
    color: COLORS.error,
    fontWeight: '600',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  progressLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginRight: SPACING.sm,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    marginRight: SPACING.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    fontWeight: '600',
    minWidth: 30,
    textAlign: 'right',
  },
});

export default ChallengeCard;