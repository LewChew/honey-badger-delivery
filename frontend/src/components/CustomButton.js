import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';

import { COLORS, SPACING, FONT_SIZES, ANIMATION_DURATION } from '../config/constants';

const CustomButton = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary', // 'primary', 'secondary', 'outline', 'ghost'
  size = 'medium', // 'small', 'medium', 'large'
  icon,
  iconPosition = 'left', // 'left', 'right'
  gradient = false,
  style,
  textStyle,
  ...props
}) => {
  const getButtonStyles = () => {
    const baseStyles = [styles.button, styles[size]];
    
    if (variant === 'primary') {
      baseStyles.push(styles.primaryButton);
    } else if (variant === 'secondary') {
      baseStyles.push(styles.secondaryButton);
    } else if (variant === 'outline') {
      baseStyles.push(styles.outlineButton);
    } else if (variant === 'ghost') {
      baseStyles.push(styles.ghostButton);
    }
    
    if (disabled) {
      baseStyles.push(styles.disabledButton);
    }
    
    return baseStyles;
  };

  const getTextStyles = () => {
    const baseStyles = [styles.text, styles[`${size}Text`]];
    
    if (variant === 'primary') {
      baseStyles.push(styles.primaryText);
    } else if (variant === 'secondary') {
      baseStyles.push(styles.secondaryText);
    } else if (variant === 'outline') {
      baseStyles.push(styles.outlineText);
    } else if (variant === 'ghost') {
      baseStyles.push(styles.ghostText);
    }
    
    if (disabled) {
      baseStyles.push(styles.disabledText);
    }
    
    return baseStyles;
  };

  const renderContent = () => {
    return (
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator 
            size={size === 'small' ? 'small' : 'small'}
            color={variant === 'primary' ? COLORS.background : COLORS.primary}
          />
        ) : (
          <>
            {icon && iconPosition === 'left' && (
              <Icon 
                name={icon} 
                size={size === 'small' ? 16 : size === 'large' ? 24 : 20}
                color={getTextStyles().find(style => style?.color)?.color || COLORS.primary}
                style={styles.leftIcon}
              />
            )}
            <Text style={[getTextStyles(), textStyle]}>
              {title}
            </Text>
            {icon && iconPosition === 'right' && (
              <Icon 
                name={icon} 
                size={size === 'small' ? 16 : size === 'large' ? 24 : 20}
                color={getTextStyles().find(style => style?.color)?.color || COLORS.primary}
                style={styles.rightIcon}
              />
            )}
          </>
        )}
      </View>
    );
  };

  if (gradient && variant === 'primary' && !disabled) {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.8}
        style={[getButtonStyles(), style]}
        {...props}
      >
        <LinearGradient
          colors={[COLORS.primary, COLORS.accent]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientContainer}
        >
          {renderContent()}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[getButtonStyles(), style]}
      {...props}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradientContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.md,
  },
  
  // Sizes
  small: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    minHeight: 36,
  },
  medium: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    minHeight: 48,
  },
  large: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    minHeight: 56,
  },
  
  // Variants
  primaryButton: {
    backgroundColor: COLORS.primary,
    elevation: 2,
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  secondaryButton: {
    backgroundColor: COLORS.secondary,
    elevation: 2,
    shadowColor: COLORS.secondary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  ghostButton: {
    backgroundColor: 'transparent',
  },
  disabledButton: {
    backgroundColor: COLORS.border,
    elevation: 0,
    shadowOpacity: 0,
  },
  
  // Text styles
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  smallText: {
    fontSize: FONT_SIZES.sm,
  },
  mediumText: {
    fontSize: FONT_SIZES.md,
  },
  largeText: {
    fontSize: FONT_SIZES.lg,
  },
  
  // Text colors
  primaryText: {
    color: COLORS.text,
  },
  secondaryText: {
    color: COLORS.background,
  },
  outlineText: {
    color: COLORS.primary,
  },
  ghostText: {
    color: COLORS.primary,
  },
  disabledText: {
    color: COLORS.textLight,
  },
  
  // Icons
  leftIcon: {
    marginRight: SPACING.sm,
  },
  rightIcon: {
    marginLeft: SPACING.sm,
  },
});

export default CustomButton;