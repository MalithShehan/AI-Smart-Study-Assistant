import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp, withSpring, useSharedValue, useAnimatedStyle } from 'react-native-reanimated';
import { GlassCard } from '../components/GlassCard';
import { apiGet } from '../api/client';
import { useTheme } from '../context/ThemeContext';
import { Fonts, BorderRadius, Shadow } from '../theme';

interface GamificationProfile {
  totalPoints: number;
  level: number;
  levelProgress: number;
  pointsToNextLevel: number;
  currentStreak: number;
  longestStreak: number;
  totalBadges: number;
  rank: number | null;
  achievements: Array<{
    _id: string;
    badgeId: string;
    title: string;
    description: string;
    icon: string;
    points: number;
    unlockedAt: string;
  }>;
  stats: {
    totalStudyMinutes: number;
    totalQuizzes: number;
    totalPerfectScores: number;
    totalAIInteractions: number;
    totalNotesCreated: number;
    totalPapersUploaded: number;
  };
}

export const GamificationScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState<GamificationProfile | null>(null);
  
  const levelProgress = useSharedValue(0);
  
  useEffect(() => {
    loadProfile();
  }, []);
  
  useEffect(() => {
    if (profile) {
      levelProgress.value = withSpring(profile.levelProgress);
    }
  }, [profile]);
  
  const loadProfile = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    
    try {
      const res = await apiGet('/gamification/profile');
      if (res.success) {
        setProfile(res.data);
      }
    } catch (error) {
      console.error('Failed to load gamification profile:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  const progressStyle = useAnimatedStyle(() => {
    return {
      width: `${levelProgress.value}%`,
    };
  });
  
  if (loading) {
    return (
      <View style={[createStyles(theme).container, { paddingTop: insets.top }]}>
        <LinearGradient colors={['#FF7A00', '#E56900']} style={createStyles(theme).header}>
          <Text style={createStyles(theme).headerTitle}>🏆 Your Progress</Text>
        </LinearGradient>
        <View style={createStyles(theme).loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </View>
    );
  }
  
  if (!profile) {
    return null;
  }

  const styles = createStyles(theme);
  
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <LinearGradient colors={['#FF7A00', '#E56900']} style={styles.header}>
        <Text style={styles.headerTitle}>🏆 Your Progress</Text>
        <Text style={styles.headerSub}>Level {profile.level} Champion</Text>
      </LinearGradient>
      
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadProfile(true)} />}
      >
        {/* Level Card */}
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <GlassCard style={styles.levelCard}>
            <View style={styles.levelHeader}>
              <View style={styles.levelBadge}>
                <LinearGradient colors={['#FFD700', '#FFA500']} style={styles.levelBadgeGradient}>
                  <Text style={styles.levelNumber}>{profile.level}</Text>
                </LinearGradient>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.levelTitle}>Level {profile.level}</Text>
                <Text style={styles.levelPoints}>{profile.totalPoints.toLocaleString()} points</Text>
              </View>
              {profile.rank && (
                <View style={styles.rankBadge}>
                  <Text style={styles.rankText}>#{profile.rank}</Text>
                </View>
              )}
            </View>
            
            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBg}>
                <Animated.View style={[styles.progressFill, progressStyle]}>
                  <LinearGradient
                    colors={['#FF7A00', '#FFD700']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={StyleSheet.absoluteFill}
                  />
                </Animated.View>
              </View>
              <Text style={styles.progressText}>
                {Math.round(profile.levelProgress)}% to Level {profile.level + 1}
              </Text>
            </View>
            
            <Text style={styles.nextLevelText}>
              {profile.pointsToNextLevel} points to next level
            </Text>
          </GlassCard>
        </Animated.View>
        
        {/* Streak Card */}
        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <GlassCard style={styles.streakCard}>
            <View style={styles.streakHeader}>
              <Text style={styles.streakTitle}>🔥 Study Streak</Text>
            </View>
            <View style={styles.streakStats}>
              <View style={styles.streakStat}>
                <Text style={styles.streakNumber}>{profile.currentStreak}</Text>
                <Text style={styles.streakLabel}>Current</Text>
              </View>
              <View style={styles.streakDivider} />
              <View style={styles.streakStat}>
                <Text style={styles.streakNumber}>{profile.longestStreak}</Text>
                <Text style={styles.streakLabel}>Best</Text>
              </View>
            </View>
            {profile.currentStreak > 0 && (
              <Text style={styles.streakMessage}>
                Keep it up! Study today to maintain your streak! 💪
              </Text>
            )}
          </GlassCard>
        </Animated.View>
        
        {/* Stats Grid */}
        <Animated.View entering={FadeInUp.delay(300).springify()}>
          <View style={styles.statsGrid}>
            <GlassCard style={styles.statCard}>
              <Ionicons name="time-outline" size={32} color={theme.primary} />
              <Text style={styles.statValue}>{Math.floor(profile.stats.totalStudyMinutes / 60)}h</Text>
              <Text style={styles.statLabel}>Study Time</Text>
            </GlassCard>
            
            <GlassCard style={styles.statCard}>
              <Ionicons name="school-outline" size={32} color={theme.purple} />
              <Text style={styles.statValue}>{profile.stats.totalQuizzes}</Text>
              <Text style={styles.statLabel}>Quizzes</Text>
            </GlassCard>
            
            <GlassCard style={styles.statCard}>
              <Ionicons name="trophy-outline" size={32} color={theme.warning} />
              <Text style={styles.statValue}>{profile.totalBadges}</Text>
              <Text style={styles.statLabel}>Badges</Text>
            </GlassCard>
            
            <GlassCard style={styles.statCard}>
              <Ionicons name="document-text-outline" size={32} color={theme.success} />
              <Text style={styles.statValue}>{profile.stats.totalNotesCreated}</Text>
              <Text style={styles.statLabel}>Notes</Text>
            </GlassCard>
          </View>
        </Animated.View>
        
        {/* Achievements */}
        <Animated.View entering={FadeInUp.delay(400).springify()}>
          <View style={styles.achievementsSection}>
            <Text style={styles.sectionTitle}>🏅 Achievements</Text>
            
            {profile.achievements.length === 0 ? (
              <GlassCard style={styles.emptyBadges}>
                <Ionicons name="medal-outline" size={48} color={theme.textLight} />
                <Text style={styles.emptyText}>No badges yet</Text>
                <Text style={styles.emptySubtext}>Complete tasks to earn badges!</Text>
              </GlassCard>
            ) : (
              <View style={styles.badgesGrid}>
                {profile.achievements.slice(0, 12).map((badge) => (
                  <GlassCard key={badge._id} style={styles.badgeCard}>
                    <Text style={styles.badgeIcon}>{badge.icon}</Text>
                    <Text style={styles.badgeTitle}>{badge.title}</Text>
                    <Text style={styles.badgePoints}>+{badge.points}</Text>
                  </GlassCard>
                ))}
              </View>
            )}
            
            {profile.achievements.length > 12 && (
              <TouchableOpacity style={styles.viewAllBtn}>
                <Text style={styles.viewAllText}>View All {profile.achievements.length} Badges</Text>
                <Ionicons name="arrow-forward" size={16} color={theme.primary} />
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  header: { paddingHorizontal: 20, paddingVertical: 24 },
  headerTitle: { fontSize: 28, fontFamily: Fonts.bold, color: Colors.white },
  headerSub: { fontSize: 14, fontFamily: Fonts.regular, color: 'rgba(255,255,255,0.9)', marginTop: 4 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scrollContent: { padding: 16 },
  
  levelCard: { padding: 20, marginBottom: 16 },
  levelHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  levelBadge: { width: 70, height: 70, marginRight: 16 },
  levelBadgeGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.medium,
  },
  levelNumber: { fontSize: 32, fontFamily: Fonts.bold, color: Colors.white },
  levelTitle: { fontSize: 20, fontFamily: Fonts.bold, color: theme.text },
  levelPoints: { fontSize: 14, fontFamily: Fonts.medium, color: theme.textLight, marginTop: 4 },
  rankBadge: {
    backgroundColor: theme.purple,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  rankText: { fontSize: 14, fontFamily: Fonts.bold, color: theme.white },
  
  progressContainer: { marginBottom: 8 },
  progressBg: {
    height: 12,
    backgroundColor: theme.border,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: { height: '100%', borderRadius: 6 },
  progressText: { fontSize: 12, fontFamily: Fonts.medium, color: theme.textLight, textAlign: 'center' },
  nextLevelText: { fontSize: 12, fontFamily: Fonts.regular, color: theme.textLight, textAlign: 'center', marginTop: 4 },
  
  streakCard: { padding: 20, marginBottom: 16 },
  streakHeader: { marginBottom: 16 },
  streakTitle: { fontSize: 18, fontFamily: Fonts.bold, color: theme.text },
  streakStats: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', marginBottom: 12 },
  streakStat: { alignItems: 'center' },
  streakNumber: { fontSize: 36, fontFamily: Fonts.bold, color: theme.primary },
  streakLabel: { fontSize: 12, fontFamily: Fonts.regular, color: theme.textLight, marginTop: 4 },
  streakDivider: { width: 1, height: 40, backgroundColor: theme.border },
  streakMessage: { fontSize: 12, fontFamily: Fonts.medium, color: theme.success, textAlign: 'center', marginTop: 8 },
  
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 },
  statCard: {
    flex: 1,
    minWidth: '47%',
    padding: 16,
    alignItems: 'center',
  },
  statValue: { fontSize: 24, fontFamily: Fonts.bold, color: theme.text, marginTop: 8 },
  statLabel: { fontSize: 12, fontFamily: Fonts.regular, color: theme.textLight, marginTop: 4 },
  
  achievementsSection: { marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontFamily: Fonts.bold, color: theme.text, marginBottom: 12 },
  badgesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  badgeCard: {
    width: '31%',
    padding: 12,
    alignItems: 'center',
  },
  badgeIcon: { fontSize: 32, marginBottom: 8 },
  badgeTitle: { fontSize: 10, fontFamily: Fonts.medium, color: theme.text, textAlign: 'center', marginBottom: 4 },
  badgePoints: { fontSize: 10, fontFamily: Fonts.bold, color: theme.primary },
  
  emptyBadges: { padding: 32, alignItems: 'center' },
  emptyText: { fontSize: 16, fontFamily: Fonts.semiBold, color: theme.textLight, marginTop: 12 },
  emptySubtext: { fontSize: 12, fontFamily: Fonts.regular, color: theme.textLight, marginTop: 4 },
  
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    paddingVertical: 12,
  },
  viewAllText: { fontSize: 14, fontFamily: Fonts.semiBold, color: theme.primary },
});

const Shadow = {
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
};
