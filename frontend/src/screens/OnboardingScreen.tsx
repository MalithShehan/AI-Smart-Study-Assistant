import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  Dimensions,
  FlatList,
  TouchableOpacity,
  Animated,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, OnboardingSlide } from '../types';
import { Button } from '../components/Button';
import { Colors, Fonts } from '../theme';

const { width, height } = Dimensions.get('window');
type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

const slides: OnboardingSlide[] = [
  {
    id: 1,
    title: 'AI-Powered\nStudy Sessions',
    description: 'Get instant answers, summaries, and explanations powered by cutting-edge AI technology.',
    icon: 'sparkles',
    gradient: ['#FF7A00', '#FF9A3C'],
  },
  {
    id: 2,
    title: 'Scan & Solve\nInstantly',
    description: 'Point your camera at any problem or textbook page and get step-by-step solutions.',
    icon: 'scan',
    gradient: ['#8B5CF6', '#A78BFA'],
  },
  {
    id: 3,
    title: 'Smart Quizzes\n& Progress',
    description: 'Auto-generated quizzes that adapt to your learning pace and track your mastery.',
    icon: 'trophy',
    gradient: ['#4CAF50', '#66BB6A'],
  },
];

export const OnboardingScreen: React.FC<Props> = ({ navigation }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const goNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      navigation.replace('Login');
    }
  };

  const renderSlide = ({ item }: { item: OnboardingSlide }) => (
    <View style={{ width, flex: 1, paddingHorizontal: 32 }}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        {/* Illustration circle */}
        <LinearGradient
          colors={item.gradient as [string, string]}
          style={styles.illustrationBg}
        >
          <View style={styles.illustrationInner}>
            <Ionicons name={item.icon as any} size={80} color={Colors.white} />
          </View>
          {/* Floating dots */}
          <View style={[styles.floatDot, { top: 20, right: 20 }]} />
          <View style={[styles.floatDot, { bottom: 30, left: 10, width: 10, height: 10 }]} />
        </LinearGradient>

        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Skip button */}
      <TouchableOpacity
        style={styles.skipBtn}
        onPress={() => navigation.replace('Login')}
      >
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <Animated.FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
      />

      {/* Bottom section */}
      <View style={styles.bottom}>
        {/* Dots */}
        <View style={styles.dotsRow}>
          {slides.map((_, i) => {
            const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [8, 24, 8],
              extrapolate: 'clamp',
            });
            const dotColor = scrollX.interpolate({
              inputRange,
              outputRange: [Colors.border, Colors.primary, Colors.border],
              extrapolate: 'clamp',
            });
            return (
              <Animated.View
                key={i}
                style={[styles.dot, { width: dotWidth, backgroundColor: dotColor }]}
              />
            );
          })}
        </View>

        <Button
          title={currentIndex === slides.length - 1 ? 'Get Started' : 'Continue'}
          onPress={goNext}
          size="lg"
        />

        {currentIndex === slides.length - 1 && (
          <TouchableOpacity
            style={{ marginTop: 16, alignItems: 'center' }}
            onPress={() => navigation.replace('Login')}
          >
            <Text style={styles.loginLink}>
              Already have an account?{' '}
              <Text style={{ color: Colors.primary, fontFamily: Fonts.semiBold }}>Log In</Text>
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  skipBtn: {
    position: 'absolute',
    top: 56,
    right: 24,
    zIndex: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.primaryLight,
  },
  skipText: { fontFamily: Fonts.semiBold, fontSize: 14, color: Colors.primary },
  illustrationBg: {
    width: width * 0.72,
    height: width * 0.72,
    borderRadius: width * 0.36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    position: 'relative',
  },
  illustrationInner: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  floatDot: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: 30,
    color: Colors.textDark,
    textAlign: 'center',
    lineHeight: 40,
    marginBottom: 16,
  },
  description: {
    fontFamily: Fonts.regular,
    fontSize: 16,
    color: Colors.textGray,
    textAlign: 'center',
    lineHeight: 26,
  },
  bottom: {
    paddingHorizontal: 32,
    paddingBottom: 48,
    paddingTop: 16,
  },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginBottom: 28 },
  dot: { height: 8, borderRadius: 4 },
  loginLink: { fontFamily: Fonts.regular, fontSize: 14, color: Colors.textGray },
});
