import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  Dimensions,
  FlatList,
  TouchableOpacity,
  Animated,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { Colors, Fonts } from '../theme';

const { width, height } = Dimensions.get('window');
type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

interface Slide {
  id: number;
  title: string;
  subtitle?: string;
  description: string;
  emoji: string;
  accentColor: string;
  bgColor: string;
  iconBg: string;
  isHero?: boolean;
}

const slides: Slide[] = [
  {
    id: 1,
    title: 'AI Study\nAssistant',
    subtitle: 'Smart Learning, Better Future',
    description: '',
    emoji: '🤖',
    accentColor: '#FF7A00',
    bgColor: '#FF7A00',
    iconBg: 'rgba(255,255,255,0.2)',
    isHero: true,
  },
  {
    id: 2,
    title: 'Learn Smarter\nwith AI',
    description: 'Get AI summaries, quizzes, and solutions in seconds.',
    emoji: '✨',
    accentColor: '#FF7A00',
    bgColor: '#FFFFFF',
    iconBg: '#FFF3E8',
  },
  {
    id: 3,
    title: 'Scan, Understand\n& Learn',
    description: 'Scan your notes, and let AI explain everything.',
    emoji: '📷',
    accentColor: '#8B5CF6',
    bgColor: '#FFFFFF',
    iconBg: '#F3F0FF',
  },
  {
    id: 4,
    title: 'Practice &\nImprove',
    description: 'Generate quizzes and track your progress.',
    emoji: '📋',
    accentColor: '#4CAF50',
    bgColor: '#FFFFFF',
    iconBg: '#E8F5E9',
  },
];

export const OnboardingScreen: React.FC<Props> = ({ navigation }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const isLastSlide = currentIndex === slides.length - 1;
  const currentSlide = slides[currentIndex];

  const goNext = () => {
    if (!isLastSlide) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      navigation.replace('Login');
    }
  };

  const renderSlide = ({ item }: { item: Slide }) => {
    if (item.isHero) {
      return (
        <LinearGradient colors={['#FF7A00', '#FF9A3C']} style={[styles.heroSlide, { width }]}>
          <StatusBar barStyle="light-content" />
          {/* Decorative circles */}
          <View style={styles.heroCircle1} />
          <View style={styles.heroCircle2} />
          {/* Robot illustration */}
          <View style={styles.heroIllustration}>
            <View style={styles.heroRobotOuter}>
              <View style={styles.heroRobotInner}>
                <Text style={styles.heroEmoji}>🤖</Text>
              </View>
            </View>
            {/* Floating badges */}
            <View style={[styles.floatingBadge, { top: 10, right: -10 }]}>
              <Text style={styles.floatingBadgeText}>✨ AI</Text>
            </View>
            <View style={[styles.floatingBadge, { bottom: 20, left: -20, backgroundColor: '#fff' }]}>
              <Text style={[styles.floatingBadgeText, { color: Colors.primary }]}>📚 Smart</Text>
            </View>
          </View>
          {/* Text */}
          <Text style={styles.heroTitle}>AI Study{'\n'}Assistant</Text>
          <Text style={styles.heroSubtitle}>Smart Learning, Better Future</Text>
        </LinearGradient>
      );
    }

    return (
      <View style={[styles.slide, { width }]}>
        {/* Illustration */}
        <View style={[styles.illustrationWrap, { backgroundColor: item.iconBg }]}>
          {/* Inner decorative ring */}
          <View style={[styles.illustrationRing, { borderColor: item.accentColor + '30' }]}>
            <View style={[styles.illustrationCenter, { backgroundColor: item.accentColor + '15' }]}>
              <Text style={styles.slideEmoji}>{item.emoji}</Text>
            </View>
          </View>
          {/* Floating dots */}
          <View style={[styles.floatDot, { top: 24, right: 32, backgroundColor: item.accentColor + '40' }]} />
          <View style={[styles.floatDot, { bottom: 32, left: 24, width: 10, height: 10, backgroundColor: item.accentColor + '30' }]} />
          <View style={[styles.floatDot, { top: 48, left: 40, width: 8, height: 8, backgroundColor: item.accentColor + '50' }]} />
        </View>
        {/* Text */}
        <View style={styles.slideTextWrap}>
          <Text style={styles.slideTitle}>{item.title}</Text>
          <Text style={styles.slideDescription}>{item.description}</Text>
        </View>
      </View>
    );
  };

  const isHero = currentIndex === 0;

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isHero ? 'light-content' : 'dark-content'} />

      <Animated.FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
        style={{ flex: 1 }}
      />

      {/* Bottom bar */}
      <View style={[styles.bottom, isHero && styles.bottomHero]}>
        {/* Skip */}
        <TouchableOpacity
          style={styles.skipBtn}
          onPress={() => navigation.replace('Login')}
        >
          <Text style={[styles.skipText, isHero && { color: 'rgba(255,255,255,0.8)' }]}>Skip</Text>
        </TouchableOpacity>

        {/* Dots */}
        <View style={styles.dotsRow}>
          {slides.map((_, i) => {
            const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
            const dotWidth = scrollX.interpolate({ inputRange, outputRange: [8, 24, 8], extrapolate: 'clamp' });
            const opacity = scrollX.interpolate({ inputRange, outputRange: [0.35, 1, 0.35], extrapolate: 'clamp' });
            return (
              <Animated.View
                key={i}
                style={[
                  styles.dot,
                  {
                    width: dotWidth,
                    opacity,
                    backgroundColor: isHero ? Colors.white : currentSlide.accentColor,
                  },
                ]}
              />
            );
          })}
        </View>

        {/* Next / Get Started */}
        <TouchableOpacity
          style={[styles.nextBtn, { backgroundColor: isHero ? Colors.white : currentSlide.accentColor }]}
          onPress={goNext}
          activeOpacity={0.85}
        >
          {isLastSlide ? (
            <Text style={[styles.nextBtnText, { color: isHero ? Colors.primary : Colors.white }]}>
              Get Started
            </Text>
          ) : (
            <Text style={[styles.nextBtnText, { color: isHero ? Colors.primary : Colors.white }]}>
              Next
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {isLastSlide && (
        <TouchableOpacity
          style={styles.loginRow}
          onPress={() => navigation.replace('Login')}
        >
          <Text style={styles.loginLink}>
            Already have an account?{' '}
            <Text style={{ color: Colors.primary, fontFamily: Fonts.semiBold }}>Log In</Text>
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },

  // ── Hero slide ──
  heroSlide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: 60,
    paddingBottom: 40,
    position: 'relative',
    overflow: 'hidden',
  },
  heroCircle1: {
    position: 'absolute', width: 300, height: 300, borderRadius: 150,
    backgroundColor: 'rgba(255,255,255,0.08)', top: -80, right: -80,
  },
  heroCircle2: {
    position: 'absolute', width: 200, height: 200, borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.06)', bottom: 60, left: -60,
  },
  heroIllustration: { alignItems: 'center', justifyContent: 'center', marginBottom: 40 },
  heroRobotOuter: {
    width: 200, height: 200, borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.25)',
  },
  heroRobotInner: {
    width: 150, height: 150, borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  heroEmoji: { fontSize: 72 },
  floatingBadge: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
  },
  floatingBadgeText: { fontFamily: Fonts.semiBold, fontSize: 13, color: Colors.white },
  heroTitle: {
    fontFamily: Fonts.bold, fontSize: 38, color: Colors.white,
    textAlign: 'center', lineHeight: 48, marginBottom: 12,
  },
  heroSubtitle: {
    fontFamily: Fonts.regular, fontSize: 16, color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
  },

  // ── Regular slides ──
  slide: {
    flex: 1, alignItems: 'center',
    paddingHorizontal: 32, paddingTop: 60,
    backgroundColor: Colors.white,
  },
  illustrationWrap: {
    width: width * 0.78, height: width * 0.78, borderRadius: width * 0.39,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 48, position: 'relative',
  },
  illustrationRing: {
    width: '80%', height: '80%', borderRadius: 1000,
    borderWidth: 2, alignItems: 'center', justifyContent: 'center',
  },
  illustrationCenter: {
    width: '80%', height: '80%', borderRadius: 1000,
    alignItems: 'center', justifyContent: 'center',
  },
  slideEmoji: { fontSize: 80 },
  floatDot: {
    position: 'absolute', width: 14, height: 14, borderRadius: 7,
  },
  slideTextWrap: { alignItems: 'center', paddingHorizontal: 8 },
  slideTitle: {
    fontFamily: Fonts.bold, fontSize: 30, color: Colors.textDark,
    textAlign: 'center', lineHeight: 42, marginBottom: 16,
  },
  slideDescription: {
    fontFamily: Fonts.regular, fontSize: 16, color: Colors.textGray,
    textAlign: 'center', lineHeight: 26,
  },

  // ── Bottom bar ──
  bottom: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 28, paddingVertical: 20,
    paddingBottom: 28, backgroundColor: Colors.white,
  },
  bottomHero: { backgroundColor: 'transparent', position: 'absolute', bottom: 0, left: 0, right: 0 },
  skipBtn: { paddingHorizontal: 4, paddingVertical: 8, minWidth: 48 },
  skipText: { fontFamily: Fonts.medium, fontSize: 15, color: Colors.textGray },
  dotsRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { height: 8, borderRadius: 4 },
  nextBtn: {
    paddingHorizontal: 24, paddingVertical: 12,
    borderRadius: 24, minWidth: 90, alignItems: 'center',
  },
  nextBtnText: { fontFamily: Fonts.bold, fontSize: 15 },
  loginRow: { alignItems: 'center', paddingBottom: 16, backgroundColor: Colors.white },
  loginLink: { fontFamily: Fonts.regular, fontSize: 14, color: Colors.textGray },
});
