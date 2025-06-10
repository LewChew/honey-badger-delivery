import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { COLORS, SPACING, FONT_SIZES } from '../config/constants';

const QuickActionButton = ({ 
  title, 
  icon, 
  color = COLORS.primary, 
  onPress,
  disabled = false,
  style 
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: color + '15' },
        disabled && styles.disabled,
        style
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: color }]}>
        <Icon 
          name={icon} 
          size={24} 
          color={COLORS.background} 
        />
      </View>
      <Text style={[
        styles.title,
        disabled && styles.disabledText
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderRadius: 16,
    minWidth: 90,
    flex: 1,
    marginHorizontal: SPACING.xs,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
    elevation: 2,
    shadowColor: COLORS.text,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  title: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 16,
  },
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    color: COLORS.textLight,
  },
});

export default QuickActionButton;