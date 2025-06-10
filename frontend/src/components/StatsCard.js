import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';

import { COLORS, SPACING, FONT_SIZES } from '../config/constants';

const StatsCard = ({ 
  title, 
  value, 
  icon, 
  color = COLORS.primary, 
  onPress,
  subtitle,
  trend,
  style 
}) => {
  const gradientColors = [color + '20', color + '10'];
  
  const renderTrend = () => {
    if (!trend) return null;
    
    const isPositive = trend > 0;
    const trendIcon = isPositive ? 'trending-up' : 'trending-down';
    const trendColor = isPositive ? COLORS.success : COLORS.error;
    
    return (
      <View style={styles.trendContainer}>
        <Icon name={trendIcon} size={12} color={trendColor} />
        <Text style={[styles.trendText, { color: trendColor }]}>
          {Math.abs(trend)}%
        </Text>
      </View>
    );
  };

  const CardContent = (
    <LinearGradient
      colors={gradientColors}
      style={[styles.container, style]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {/* Icon */}
      <View style={[styles.iconContainer, { backgroundColor: color }]}>
        <Icon name={icon} size={20} color={COLORS.background} />
      </View>
      
      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        
        <View style={styles.valueRow}>
          <Text style={styles.value}>{value}</Text>
          {renderTrend()}
        </View>
        
        {subtitle && (
          <Text style={styles.subtitle}>{subtitle}</Text>
        )}
      </View>
    </LinearGradient>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        {CardContent}
      </TouchableOpacity>
    );
  }

  return CardContent;
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: SPACING.md,
    minHeight: 80,
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginHorizontal: SPACING.xs,
    elevation: 2,
    shadowColor: COLORS.text,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginBottom: SPACING.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  value: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginRight: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: 8,
  },
  trendText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    marginLeft: 2,
  },
});

export default StatsCard;