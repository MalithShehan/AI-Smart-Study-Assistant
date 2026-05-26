import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { Colors, Fonts, Shadow } from '../theme';
import { useAuth } from '../context/AuthContext';
import { apiGet } from '../api/client';
import { useHaptics } from '../hooks/useHaptics';
import { StatCard, GradientCard } from '../components/PremiumUI';

const { width } = Dimensions.get('window');
type Nav = NativeStackNavigationProp<RootStackParamList>;

const quickActions = [
  {
    icon: 'scan-outline' as const,
    label: 'AI Scanner',
    sub: 'Scan Notes',
    screen: 'AIScanner' as keyof RootStackParamList,
    color: '#FF7A00',
    bg: '#FFF3E8',
  },
  {
    icon: 'help-circle-outline' as const,
    label: 'Ask Question',
    sub: 'Get Answers',
    screen: 'AskQuestion' as keyof RootStackParamList,
    color: '#06B6D4',
    bg: '#E0F7FA',
  },
  {
    icon: 'clipboard-outline' as const,
    label: 'AI Quiz',
    sub: 'Generate Quiz',
    screen: 'QuizGenerator' as keyof RootStackParamList,
    color: '#8B5CF6',
    bg: '#F3F0FF',
  },
  {
    icon: 'library-outline' as const,
    label: 'Library',
    sub: 'Saved Notes',
    screen: 'Library' as keyof RootStackParamList,
    color: '#4CAF50',
    bg: '#E8F5E9',
  },
];

const ACTIVITY_CONFIG: Record<string, { icon: React.ComponentProps<typeof Ionicons>['name']; color: string }> = {
  study_session: { icon: 'time-outline', color: '#FF7A00' },
  note_scan:     { icon: 'scan-outline', color: '#06B6D4' },
  quiz_attempt:  { icon: 'clipboard-outline', color: '#8B5CF6' },
  ai_summary:    { icon: 'document-text-outline', color: '#4CAF50' },
  ai_question:   { icon: 'help-circle-outline', color: '#06B6D4' },
  note_created:  { icon: 'document-text-outline', color: '#FF7A00' },
  note_updated:  { icon: 'create-outline', color: '#F59E0B' },
  note_deleted:  { icon: 'trash-outline', color: '#EF4444' },
};

const formatRelativeTime = (isoDate: string): string => {
  const diff = Date.now() - new Date(isoDate).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

interface ActivityItem {
  _id: string;
  type: string;
  subject?: string;
  createdAt: string;
}

const moreFeatures = [
  { icon: 'calendar-outline' as const, label: 'Timetable', color: '#FF7A00', screen: 'Timetable' as keyof RootStackParamList },
  { icon: 'bar-chart-outline' as const, label: 'Analytics', color: '#06B6D4', screen: 'Home' as keyof RootStackParamList },
  { icon: 'reader-outline' as const, label: 'Summary', color: '#8B5CF6', screen: 'AISummary' as keyof RootStackParamList },
  { icon: 'notifications-outline' as const, label: 'Reminders', color: '#EF4444', screen: 'Notifications' as keyof RootStackParamList },
];

const CARD_GAP = 12;
const CARD_WIDTH = (width - 40 - CARD_GAP) / 2;

export const HomeScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const { user } = useAuth();
  const haptics = useHaptics();

  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({ totalStudyHours: 0, quizzesCompleted: 0, averageScore: 0 });
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;

  const fetchActivities = useCallback(async () => {
    try {
      const res = await apiGet('/analytics/activities?limit=3');
      setActivities(res.data?.activities ?? res.data ?? []);
    } catch {
      setActivities([]);
    } finally {
      setActivitiesLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const res = await apiGet('/analytics/stats');
      setStats(res.data ?? { totalStudyHours: 0, quizzesCompleted: 0, averageScore: 0 });
    } catch {
      setStats({ totalStudyHours: 0, quizzesCompleted: 0, averageScore: 0 });
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    haptics.light();
    await Promise.all([fetchActivities(), fetchStats()]);
    haptics.success();
    setRefreshing(false);
  }, [fetchActivities, fetchStats, haptics]);

  useEffect(() => {
    fetchActivities();
    fetchStats();
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fetchActivities, fetchStats]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
      >
        {/* ── Top bar ────────────────────────────────────────── */}
        <Animated.View style={[styles.topBar, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View>
            <Text style={styles.greeting}>Hi, {user?.name ?? 'Student'}! 👋</Text>
            <Text style={styles.greetingSub}>What do you want to learn today?</Text>
          </View>
          <TouchableOpacity
            style={styles.notifBtn}
            onPress={() => {
              haptics.light();
              navigation.navigate('Notifications');
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="notifications-outline" size={22} color={Colors.textDark} />
            <View style={styles.notifDot} />
          </TouchableOpacity>
        </Animated.View>

        {/* ── Search bar ─────────────────────────────────────── */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <TouchableOpacity
            style={styles.searchBar}
            activeOpacity={0.85}
            onPress={() => {
              haptics.light();
              navigation.navigate('AskQuestion');
            }}
          >
            <Ionicons name="search-outline" size={18} color={Colors.textLight} />
            <Text style={styles.searchPlaceholder}>Search for anything...</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* ── Stats Cards ────────────────────────────────────── */}
        <Animated.View style={[styles.statsRow, { opacity: fadeAnim }]}>
          <StatCard
            label="Study Hours"
            value={stats.totalStudyHours}
            icon="time-outline"
            trend={5}
            color="#FF7A00"
          />
          <StatCard
            label="Quizzes"
            value={stats.quizzesCompleted}
            icon="clipboard-outline"
            trend={12}
            color="#8B5CF6"
          />
          <StatCard
            label="Avg Score"
            value={stats.averageScore}
            suffix="%"
            icon="trophy-outline"
            trend={3}
            color="#4CAF50"
          />
        </Animated.View>

        {/* ── AI Assistant card ──────────────────────────────── */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <GradientCard
            colors={['#FF7A00', '#FFB84D']}
            onPress={() => {
              haptics.medium();
              navigation.navigate('AskQuestion');
            }}
          >
            <View style={styles.aiCardContent}>
              <View style={styles.aiCardLeft}>
                <View style={styles.aiCardBadge}>
                  <Text style={styles.aiCardBadgeText}>✨ AI Assistant</Text>
                </View>
                <Text style={styles.aiCardTitle}>Ask anything, get{'\n'}answers instantly!</Text>
                <View style={styles.aiCardArrow}>
                  <Text style={styles.aiCardArrowText}>Try Now</Text>
                  <Ionicons name="arrow-forward" size={14} color={Colors.white} />
                </View>
              </View>
              <View style={styles.aiCardRight}>
                <View style={styles.robotOuter}>
                  <View style={styles.robotInner}>
                    <Text style={styles.robotEmoji}>🤖</Text>
                  </View>
                </View>
              </View>
            </View>
          </GradientCard>
        </Animated.View>

        {/* ── Quick Actions ──────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
        </View>
        <View style={styles.quickGrid}>
          {quickActions.map((action, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.quickCard, { backgroundColor: action.bg }]}
              activeOpacity={0.82}
              onPress={() => {
                haptics.light();
                navigation.navigate(action.screen as any);
              }}
            >
              <View style={[styles.quickIconWrap, { backgroundColor: action.color }]}>
                <Ionicons name={action.icon} size={22} color={Colors.white} />
              </View>
              <Text style={[styles.quickLabel, { color: action.color }]}>{action.label}</Text>
              <Text style={styles.quickSub}>{action.sub}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Recent Activity ─────────────────────────────────── */}
        <View style={[styles.sectionHeader, { marginTop: 8 }]}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Library')}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.activityCard}>
          {activitiesLoading ? (
            <View style={styles.activityRow}>
              <ActivityIndicator size="small" color={Colors.primary} />
              <Text style={[styles.activitySub, { marginLeft: 10 }]}>Loading activity…</Text>
            </View>
          ) : activities.length === 0 ? (
            <View style={styles.activityRow}>
              <Ionicons name="time-outline" size={20} color={Colors.textLight} />
              <Text style={[styles.activitySub, { marginLeft: 10 }]}>No activity yet. Start learning!</Text>
            </View>
          ) : (
            activities.map((item, i) => {
              const cfg = ACTIVITY_CONFIG[item.type] ?? { icon: 'ellipse-outline' as const, color: Colors.textGray };
              const label = item.type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
              return (
                <TouchableOpacity
                  key={item._id}
                  style={[styles.activityRow, i < activities.length - 1 && styles.activityBorder]}
                  activeOpacity={0.8}
                >
                  <View style={[styles.activityIcon, { backgroundColor: cfg.color + '20' }]}>
                    <Ionicons name={cfg.icon} size={18} color={cfg.color} />
                  </View>
                  <View style={styles.activityBody}>
                    <Text style={styles.activityTitle} numberOfLines={1}>{label}</Text>
                    <Text style={styles.activitySub}>
                      {item.subject ? `${item.subject} • ` : ''}{formatRelativeTime(item.createdAt)}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={Colors.textLight} />
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* ── More Features ───────────────────────────────────── */}
        <View style={[styles.sectionHeader, { marginTop: 8 }]}>
          <Text style={styles.sectionTitle}>More Features</Text>
        </View>
        <View style={styles.featureRow}>
          {moreFeatures.map((feat, i) => (
            <TouchableOpacity
              key={i}
              style={styles.featureItem}
              activeOpacity={0.82}
              onPress={() => navigation.navigate(feat.screen as any)}
            >
              <View style={[styles.featureIcon, { backgroundColor: feat.color + '15' }]}>
                <Ionicons name={feat.icon} size={24} color={feat.color} />
              </View>
              <Text style={styles.featureLabel}>{feat.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  scrollContent: { paddingHorizontal: 20 },

  // Top bar
  topBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingTop: 16, paddingBottom: 20,
  },
  greeting: { fontFamily: Fonts.bold, fontSize: 22, color: Colors.textDark },
  greetingSub: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.textGray, marginTop: 3 },
  notifBtn: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: '#F5F5F5',
    alignItems: 'center', justifyContent: 'center',
  },
  notifDot: {
    position: 'absolute', top: 10, right: 10,
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: Colors.danger,
    borderWidth: 1.5, borderColor: Colors.white,
  },

  // Search
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#F5F5F5',
    borderRadius: 14, paddingHorizontal: 16, height: 50,
    marginBottom: 20,
  },
  searchPlaceholder: { flex: 1, fontFamily: Fonts.regular, fontSize: 14, color: Colors.textLight },

  // Stats Row
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },

  // AI Assistant card
  aiCardContent: {
    flexDirection: 'row',
  },
  aiCardLeft: { flex: 1, gap: 8 },
  aiCardBadge: {
    alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4,
  },
  aiCardBadgeText: { fontFamily: Fonts.semiBold, fontSize: 11, color: Colors.white },
  aiCardTitle: { fontFamily: Fonts.bold, fontSize: 16, color: Colors.white, lineHeight: 24 },
  aiCardArrow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  aiCardArrowText: { fontFamily: Fonts.semiBold, fontSize: 13, color: Colors.white },
  aiCardRight: { alignItems: 'center', justifyContent: 'center', paddingLeft: 12 },
  robotOuter: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(255,122,0,0.12)',
    alignItems: 'center', justifyContent: 'center',
  },
  robotInner: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: 'rgba(255,122,0,0.18)',
    alignItems: 'center', justifyContent: 'center',
  },
  robotEmoji: { fontSize: 32 },

  // Section header
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { fontFamily: Fonts.bold, fontSize: 17, color: Colors.textDark },
  seeAll: { fontFamily: Fonts.medium, fontSize: 14, color: Colors.primary },

  // Quick actions grid
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: CARD_GAP, marginBottom: 28 },
  quickCard: {
    width: CARD_WIDTH, borderRadius: 18, padding: 16, gap: 8,
    ...Shadow.small,
  },
  quickIconWrap: {
    width: 50, height: 50, borderRadius: 15,
    alignItems: 'center', justifyContent: 'center',
  },
  quickLabel: { fontFamily: Fonts.bold, fontSize: 14 },
  quickSub: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.textGray },

  // Recent activity
  activityCard: {
    backgroundColor: Colors.white, borderRadius: 18,
    borderWidth: 1, borderColor: Colors.border,
    overflow: 'hidden', marginBottom: 28, ...Shadow.small,
  },
  activityRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingHorizontal: 16, paddingVertical: 14,
  },
  activityBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  activityIcon: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  activityBody: { flex: 1 },
  activityTitle: { fontFamily: Fonts.semiBold, fontSize: 14, color: Colors.textDark },
  activitySub: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.textGray, marginTop: 2 },

  // More features
  featureRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  featureItem: { alignItems: 'center', gap: 8, flex: 1 },
  featureIcon: {
    width: 56, height: 56, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  featureLabel: { fontFamily: Fonts.medium, fontSize: 12, color: Colors.textDark, textAlign: 'center' },
});
