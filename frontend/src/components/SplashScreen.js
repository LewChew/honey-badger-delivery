import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import { COLORS, SPACING, FONT_SIZES, APP_NAME, APP_VERSION } from '../config/constants';

const { width } = Dimensions.get('window');

const SplashScreen = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    const animationSequence = Animated.sequence([
      // Logo entrance
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),
      // Text slide up
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]);

    animationSequence.start();
  }, [fadeAnim, scaleAnim, slideAnim]);

  return (
    <LinearGradient
      colors={[COLORS.primary, COLORS.accent, COLORS.secondary]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {/* Main Logo */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Text style={styles.badgerEmoji}>🦡</Text>
      </Animated.View>

      {/* App Name and Tagline */}
      <Animated.View
        style={[
          styles.textContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Text style={styles.appName}>{APP_NAME}</Text>
        <Text style={styles.tagline}>Your Motivational Companion</Text>
        <Text style={styles.version}>v{APP_VERSION}</Text>
      </Animated.View>

      {/* Bottom Quote */}
      <Animated.View
        style={[
          styles.quoteContainer,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        <Text style={styles.quote}>
          "Honey badger don't care, honey badger don't give up!"
        </Text>
      </Animated.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  badgerEmoji: {
    fontSize: 120,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 8,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  appName: {
    fontSize: FONT_SIZES.xxl + 12,
    fontWeight: 'bold',
    color: COLORS.background,
    textAlign: 'center',
    marginBottom: SPACING.sm,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  tagline: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.background,
    textAlign: 'center',
    opacity: 0.9,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  version: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.background,
    opacity: 0.7,
    fontWeight: '500',
  },
  quoteContainer: {
    position: 'absolute',
    bottom: SPACING.xxl,
    left: SPACING.xl,
    right: SPACING.xl,
  },
  quote: {
    fontSize: FONT_SIZES.md,
    color: COLORS.background,
    textAlign: 'center',
    fontStyle: 'italic',
    opacity: 0.8,
    lineHeight: 22,
  },
});

export default SplashScreen;