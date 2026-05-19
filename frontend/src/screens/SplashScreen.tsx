import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { Colors, Fonts } from '../theme';

const { width, height } = Dimensions.get('window');
type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

export const SplashScreen: React.FC<Props> = ({ navigation }) => {
  const scale = useRef(new Animated.Value(0.5)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const taglineY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(textOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(taglineY, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
    ]).start();

    const timer = setTimeout(() => navigation.replace('Onboarding'), 2800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <LinearGradient colors={['#FF7A00', '#FF9A3C', '#FFB366']} style={styles.container}>
      {/* Background circles */}
      <View style={styles.circleLg} />
      <View style={styles.circleSm} />

      <Animated.View style={{ alignItems: 'center', transform: [{ scale }], opacity }}>
        {/* Logo icon */}
        <View style={styles.logoContainer}>
          <LinearGradient
            colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']}
            style={styles.logoGlass}
          >
            <Ionicons name="sparkles" size={52} color={Colors.white} />
          </LinearGradient>
        </View>
      </Animated.View>

      <Animated.View style={{ alignItems: 'center', opacity: textOpacity }}>
        <Animated.Text
          style={[styles.appName, { transform: [{ translateY: taglineY }] }]}
        >
          StudyAI
        </Animated.Text>
        <Text style={styles.tagline}>Your Smart Study Partner</Text>
      </Animated.View>

      {/* Bottom dots */}
      <View style={styles.dots}>
        {[0, 1, 2].map((i) => (
          <View
            key={i}
            style={[styles.dot, i === 0 && { backgroundColor: Colors.white, width: 20 }]}
          />
        ))}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  circleLg: {
    position: 'absolute',
    width: width * 0.9,
    height: width * 0.9,
    borderRadius: width * 0.45,
    backgroundColor: 'rgba(255,255,255,0.08)',
    top: -width * 0.3,
    right: -width * 0.2,
  },
  circleSm: {
    position: 'absolute',
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: width * 0.3,
    backgroundColor: 'rgba(255,255,255,0.06)',
    bottom: -width * 0.1,
    left: -width * 0.1,
  },
  logoContainer: { marginBottom: 24 },
  logoGlass: {
    width: 110,
    height: 110,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  appName: {
    fontFamily: Fonts.bold,
    fontSize: 42,
    color: Colors.white,
    letterSpacing: -0.5,
    marginTop: 16,
  },
  tagline: {
    fontFamily: Fonts.regular,
    fontSize: 16,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 8,
    letterSpacing: 0.2,
  },
  dots: {
    position: 'absolute',
    bottom: 56,
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
});
