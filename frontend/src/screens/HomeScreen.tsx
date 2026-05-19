import React, { useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { Card } from '../components/Card';
import { Badge, ProgressBar, Avatar } from '../components/UI';
import { Colors, Fonts, BorderRadius, Shadow } from '../theme';

const { width } = Dimensions.get('window');
type Nav = NativeStackNavigationProp<RootStackParamList>;

const quickActions = [
  { icon: 'chatbubble-ellipses', label: 'Ask AI', screen: 'AskQuestion', color: Colors.primary, bg: '#FFF3E8' },
  { icon: 'scan', label: 'Scanner', screen: 'AIScanner', color: Colors.purple, bg: '#F3F0FF' },
  { icon: 'document-text', label: 'Summary', screen: 'AISummary', color: Colors.success, bg: '#E8F5E9' },
  { icon: 'trophy', label: 'Quiz', screen: 'QuizGenerator', color: Colors.warning, bg: '#FEF3C7' },
];

const subjectCards = [
  { subject: 'Mathematics', topic: 'Calculus & Integration', progress: 0.72, color: '#FF7A00', icon: '📐' },
  { subject: 'Physics', topic: 'Quantum Mechanics', progress: 0.45, color: '#8B5CF6', icon: '⚛️' },
  { subject: 'Chemistry', topic: 'Organic Chemistry', progress: 0.88, color: '#4CAF50', icon: '🧪' },
  { subject: 'Biology', topic: 'Cell Division & DNA', progress: 0.33, color: '#F59E0B', icon: '🧬' },
];

const recentTopics = [
  { label: 'Derivatives', count: 12 },
  { label: 'Newton\'s Laws', count: 8 },
  { label: 'Photosynthesis', count: 5 },
  { label: 'Algebra', count: 15 },
];

export const HomeScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const scrollY = useRef(new Animated.Value(0)).current;

  const headerOpacity = scrollY.interpolate({ inputRange: [0, 80], outputRange: [0, 1], extrapolate: 'clamp' });

  return (
    <View style={styles.container}>
      {/* Sticky mini-header on scroll */}
      <Animated.View style={[styles.stickyHeader, { opacity: headerOpacity, paddingTop: insets.top }]}>
        <Text style={styles.stickyTitle}>StudyAI</Text>
      </Animated.View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Hero gradient header */}
        <LinearGradient
          colors={['#FF7A00', '#FF9A3C']}
          style={[styles.heroGradient, { paddingTop: insets.top + 16 }]}
        >
          {/* Top row */}
          <View style={styles.topRow}>
            <View>
              <Text style={styles.greetingSmall}>Good morning! ☀️</Text>
              <Text style={styles.greetingName}>Malith Shehan</Text>
            </View>
            <View style={styles.topRowRight}>
              <TouchableOpacity
                style={styles.notifBtn}
                onPress={() => navigation.navigate('Notifications')}
              >
                <Ionicons name="notifications-outline" size={22} color={Colors.white} />
                <View style={styles.notifDot} />
              </TouchableOpacity>
              <Avatar initials="MS" bgColor="rgba(255,255,255,0.25)" color={Colors.white} size={42} />
            </View>
          </View>

          {/* Search bar */}
          <TouchableOpacity
            style={styles.searchBar}
            onPress={() => navigation.navigate('AskQuestion')}
            activeOpacity={0.9}
          >
            <Ionicons name="search-outline" size={18} color={Colors.textLight} />
            <Text style={styles.searchPlaceholder}>Ask anything... e.g. "Explain Newton's laws"</Text>
            <View style={styles.searchAIBadge}>
              <Text style={styles.searchAIText}>AI</Text>
            </View>
          </TouchableOpacity>

          {/* Stats row */}
          <View style={styles.statsRow}>
            {[
              { label: 'Day Streak', value: '7 🔥', color: '#FFE0B2' },
              { label: 'Topics Done', value: '42', color: '#FFE0B2' },
              { label: 'Quiz Score', value: '94%', color: '#FFE0B2' },
            ].map((stat, i) => (
              <View key={i} style={styles.statItem}>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        {/* Content */}
        <View style={styles.content}>
          {/* Quick Actions */}
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.quickActionCard, { backgroundColor: action.bg }]}
                onPress={() => navigation.navigate(action.screen as any)}
                activeOpacity={0.85}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: action.color }]}>
                  <Ionicons name={action.icon as any} size={22} color={Colors.white} />
                </View>
                <Text style={[styles.quickActionLabel, { color: action.color }]}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Daily Challenge */}
          <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate('QuizGenerator')}>
            <LinearGradient
              colors={['#8B5CF6', '#A78BFA']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.challengeCard}
            >
              <View style={{ flex: 1 }}>
                <Badge label="Daily Challenge" bgColor="rgba(255,255,255,0.25)" color={Colors.white} size="sm" />
                <Text style={styles.challengeTitle}>5-Minute{'\n'}Math Quiz 🧠</Text>
                <Text style={styles.challengeSub}>10 questions • Mixed difficulty</Text>
              </View>
              <View style={styles.challengeCircle}>
                <Text style={styles.challengeScore}>94</Text>
                <Text style={styles.challengeScoreLabel}>avg</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Continue Studying */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Continue Studying</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Library')}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -20 }} contentContainerStyle={{ paddingHorizontal: 20, gap: 14 }}>
            {subjectCards.map((card, i) => (
              <TouchableOpacity key={i} style={[styles.subjectCard, { borderTopColor: card.color }]} activeOpacity={0.88}>
                <View style={styles.subjectCardTop}>
                  <Text style={styles.subjectEmoji}>{card.icon}</Text>
                  <View style={[styles.subjectColorDot, { backgroundColor: card.color }]} />
                </View>
                <Text style={styles.subjectName}>{card.subject}</Text>
                <Text style={styles.subjectTopic} numberOfLines={1}>{card.topic}</Text>
                <View style={{ marginTop: 12 }}>
                  <View style={styles.progressRow}>
                    <Text style={styles.progressText}>{Math.round(card.progress * 100)}%</Text>
                  </View>
                  <ProgressBar progress={card.progress} color={card.color} height={5} />
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Recent Topics */}
          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Recent Topics</Text>
          <View style={styles.topicsRow}>
            {recentTopics.map((t, i) => (
              <TouchableOpacity
                key={i}
                style={styles.topicPill}
                onPress={() => navigation.navigate('AskQuestion')}
              >
                <Text style={styles.topicLabel}>{t.label}</Text>
                <View style={styles.topicCount}>
                  <Text style={styles.topicCountText}>{t.count}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* AI Tip */}
          <Card style={styles.aiTipCard}>
            <View style={{ flexDirection: 'row', gap: 14, alignItems: 'flex-start' }}>
              <View style={styles.aiTipIcon}>
                <Ionicons name="bulb" size={22} color={Colors.warning} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.aiTipTitle}>AI Study Tip 💡</Text>
                <Text style={styles.aiTipText}>
                  Spaced repetition increases retention by up to 200%. Try reviewing your notes every 24 hours for best results.
                </Text>
              </View>
            </View>
          </Card>
        </View>
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    backgroundColor: Colors.white,
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  stickyTitle: { fontFamily: Fonts.bold, fontSize: 18, color: Colors.textDark },
  heroGradient: { paddingHorizontal: 20, paddingBottom: 32 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  greetingSmall: { fontFamily: Fonts.regular, fontSize: 14, color: 'rgba(255,255,255,0.85)' },
  greetingName: { fontFamily: Fonts.bold, fontSize: 22, color: Colors.white },
  topRowRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  notifBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifDot: { position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.danger, borderWidth: 1.5, borderColor: Colors.primary },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 52,
    gap: 10,
    marginBottom: 20,
    ...Shadow.small,
  },
  searchPlaceholder: { flex: 1, fontFamily: Fonts.regular, fontSize: 14, color: Colors.textLight },
  searchAIBadge: { backgroundColor: Colors.primaryLight, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  searchAIText: { fontFamily: Fonts.bold, fontSize: 11, color: Colors.primary },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontFamily: Fonts.bold, fontSize: 20, color: Colors.white },
  statLabel: { fontFamily: Fonts.regular, fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  content: { padding: 20 },
  sectionTitle: { fontFamily: Fonts.bold, fontSize: 18, color: Colors.textDark, marginBottom: 14 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, marginTop: 24 },
  seeAll: { fontFamily: Fonts.medium, fontSize: 14, color: Colors.primary },
  quickActionsGrid: { flexDirection: 'row', gap: 12, marginBottom: 20, flexWrap: 'wrap' },
  quickActionCard: {
    flex: 1,
    minWidth: (width - 64) / 2 - 6,
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
    gap: 10,
    ...Shadow.small,
  },
  quickActionIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  quickActionLabel: { fontFamily: Fonts.semiBold, fontSize: 13 },
  challengeCard: {
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    ...Shadow.medium,
  },
  challengeTitle: { fontFamily: Fonts.bold, fontSize: 20, color: Colors.white, marginTop: 8, marginBottom: 6, lineHeight: 28 },
  challengeSub: { fontFamily: Fonts.regular, fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  challengeCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  challengeScore: { fontFamily: Fonts.bold, fontSize: 26, color: Colors.white },
  challengeScoreLabel: { fontFamily: Fonts.regular, fontSize: 11, color: 'rgba(255,255,255,0.8)' },
  subjectCard: {
    width: 160,
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 16,
    borderTopWidth: 4,
    ...Shadow.small,
  },
  subjectCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  subjectEmoji: { fontSize: 28 },
  subjectColorDot: { width: 10, height: 10, borderRadius: 5 },
  subjectName: { fontFamily: Fonts.bold, fontSize: 15, color: Colors.textDark, marginBottom: 4 },
  subjectTopic: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.textGray },
  progressRow: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 4 },
  progressText: { fontFamily: Fonts.semiBold, fontSize: 12, color: Colors.textGray },
  topicsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  topicPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.full,
    paddingVertical: 8,
    paddingHorizontal: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  topicLabel: { fontFamily: Fonts.medium, fontSize: 14, color: Colors.textDark },
  topicCount: { backgroundColor: Colors.primaryLight, borderRadius: 10, width: 22, height: 22, alignItems: 'center', justifyContent: 'center' },
  topicCountText: { fontFamily: Fonts.bold, fontSize: 11, color: Colors.primary },
  aiTipCard: { backgroundColor: '#FFFBF0', borderWidth: 1, borderColor: '#FEF3C7' },
  aiTipIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: Colors.warningLight, alignItems: 'center', justifyContent: 'center' },
  aiTipTitle: { fontFamily: Fonts.bold, fontSize: 15, color: Colors.textDark, marginBottom: 6 },
  aiTipText: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.textGray, lineHeight: 20 },
});
