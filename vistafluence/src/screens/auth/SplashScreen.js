import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, StatusBar, Animated, Easing } from 'react-native';

export default function SplashScreen({ navigation }) {
  const fadeAnim   = useRef(new Animated.Value(0)).current;
  const scaleAnim  = useRef(new Animated.Value(0.85)).current;
  const loaderAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 60,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.timing(loaderAnim, {
      toValue: 1,
      duration: 2000,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start();

    const timer = setTimeout(() => {
      navigation.replace('Onboarding');
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const loaderWidth = loaderAnim.interpolate({
    inputRange:  [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a0f" />
      <View style={[styles.circle, styles.circle1]} />
      <View style={[styles.circle, styles.circle2]} />
      <Animated.View
        style={[
          styles.content,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
        ]}
      >
        <View style={styles.logoContainer}>
          <View style={styles.iconWrapper}>
            <View style={[styles.shape, styles.pinkShape]} />
            <View style={[styles.shape, styles.blueShape]} />
          </View>
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.brandName}>
            VISTA<Text style={styles.accent}>FLUENCE</Text>
          </Text>
          <View style={styles.divider} />
          <Text style={styles.tagline}>
            NO MIDDLEMEN. JUST REAL COLLABORATIONS.
          </Text>
          <View style={styles.lineLoader}>
            <Animated.View style={[styles.progress, { width: loaderWidth }]} />
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circle: {
    position: 'absolute',
    borderRadius: 200,
    opacity: 0.07,
  },
  circle1: {
    width: 360,
    height: 360,
    backgroundColor: '#c9a227',
    top: -100,
    right: -100,
  },
  circle2: {
    width: 280,
    height: 280,
    backgroundColor: '#8B6914',
    bottom: -80,
    left: -80,
  },
  content: {
    alignItems: 'center',
    zIndex: 10,
  },

  // ── Logo ──────────────────────────────────────
  logoContainer: {
    marginBottom: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrapper: {
    width: 72,
    height: 72,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shape: {
    position: 'absolute',
    width: 30,
    height: 48,
  },
  // Lighter gold — left wing
  pinkShape: {
    backgroundColor: '#E8C87A',
    borderRadius: 6,
    transform: [{ rotate: '-25deg' }, { translateX: -12 }],
  },
  // Deeper gold — right wing
  blueShape: {
    backgroundColor: '#c9a227',
    borderRadius: 6,
    transform: [{ rotate: '25deg' }, { translateX: 12 }],
  },

  // ── Text ──────────────────────────────────────
  textContainer: {
    alignItems: 'center',
  },
  brandName: {
    fontSize: 36,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -2,
  },
  accent: {
    color: '#E8C87A',
  },
  divider: {
    width: 40,
    height: 1,
    backgroundColor: '#2a2010',
    marginTop: 10,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 8,
    color: '#6b5a2a',
    fontWeight: '800',
    letterSpacing: 2,
    textAlign: 'center',
  },

  // ── Loader ────────────────────────────────────
  lineLoader: {
    width: 52,
    height: 2,
    backgroundColor: '#1a1508',
    marginTop: 28,
    borderRadius: 10,
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
    backgroundColor: '#E8C87A',
    borderRadius: 10,
  },
});