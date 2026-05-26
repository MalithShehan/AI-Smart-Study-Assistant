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
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { Card } from '../components/Card';
import { Badge } from '../components/UI';
import { Colors, Fonts, BorderRadius, Shadow } from '../theme';

type Nav = NativeStackNavigationProp<RootStackParamList>;

interface WeakSubject {
  subject: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
}

interface Recommendation {
  category: string;
  suggestion: string;
  action: string;
}

interface StudyPlan {
  dailyGoalMinutes: number;
  focusAreas: string[];
  weeklyTargets: string[];
}

interface RecommendationsData {
  weakSubjects: WeakSubject[];
  strengths: string[];
  recommendations: Recommendation[];
  studyPlan: StudyPlan;
  motivationalMessage: string;
  basedOn: {
    totalActivities: number;
    totalStudyMinutes: number;
    totalQuizzes: number;
  };
  generatedAt: string;
}

export const AIRecommendationsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<RecommendationsData | null>(null);

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/v1/ai/recommendations', {
        headers: {
          Authorization: `Bearer ${/* authToken */}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        setData(result.data);
      }
    } catch (error) {
      console.error('Failed to load recommendations:', error);
      // Mock data for demo
      setData({
        weakSubjects: [
          { subject: 'Mathematics', reason: 'Low quiz scores (avg 58%)', priority: 'high' },
          { subject: 'Physics', reason: 'Infrequent study sessions', priority: 'medium' },
        ],
        strengths: ['Biology', 'Chemistry', 'Consistent study schedule'],
        recommendations: [
          {
            category: 'Study Strategy',
            suggestion: 'Focus on practice problems',
            action: 'Complete 5 math problems daily',
          },
          {
            category: 'Time Management',
            suggestion: 'Increase physics study time',
            action: 'Add 30min physics sessions 3x/week',
          },
          {
            category: 'Learning Method',
            suggestion: 'Use spaced repetition',
            action: 'Review weak topics every 2-3 days',
          },
        ],
        studyPlan: {
          dailyGoalMinutes: 90,
          focusAreas: ['Calculus', 'Newton\'s Laws', 'Thermodynamics'],
          weeklyTargets: [
            'Complete 3 math quizzes',
            'Study physics 90 minutes total',
            'Review all summaries from last week',
          ],
        },
        motivationalMessage:
          'You\'re making great progress! Your consistency in Biology is impressive. Focus on strengthening your math skills this week, and you\'ll see improvement quickly. Keep going! 💪',
        basedOn: {
          totalActivities: 47,
          totalStudyMinutes: 680,
          totalQuizzes: 12,
        },
        generatedAt: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => loadRecommendations(true);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return Colors.danger;
      case 'medium':
        return Colors.warning;
      default:
        return Colors.info;
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#9C27B0', '#BA68C8']}
          style={[styles.header, { paddingTop: insets.top + 12 }]}
        >
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={20} color={Colors.white} />
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.headerTitle}>AI Recommendations</Text>
            <Text style={styles.headerSub}>Personalized study insights</Text>
          </View>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Analyzing your performance...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#9C27B0', '#BA68C8']}
        style={[styles.header, { paddingTop: insets.top + 12 }]}
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color={Colors.white} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.headerTitle}>AI Recommendations</Text>
          <Text style={styles.headerSub}>Personalized study insights</Text>
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={onRefresh}>
          <Ionicons name="refresh" size={20} color={Colors.white} />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Analysis Summary */}
        <Card style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>📊 Analysis Based On</Text>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{data?.basedOn.totalStudyMinutes || 0}</Text>
              <Text style={styles.statLabel}>Study Minutes</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{data?.basedOn.totalQuizzes || 0}</Text>
              <Text style={styles.statLabel}>Quizzes</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{data?.basedOn.totalActivities || 0}</Text>
              <Text style={styles.statLabel}>Activities</Text>
            </View>
          </View>
        </Card>

        {/* Motivational Message */}
        {data?.motivationalMessage && (
          <Card style={styles.motivationCard}>
            <View style={styles.motivationHeader}>
              <Ionicons name="sparkles" size={24} color={Colors.warning} />
              <Text style={styles.motivationTitle}>Keep Going!</Text>
            </View>
            <Text style={styles.motivationText}>{data.motivationalMessage}</Text>
          </Card>
        )}

        {/* Weak Subjects */}
        {data?.weakSubjects && data.weakSubjects.length > 0 && (
          <Card style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="alert-circle" size={22} color={Colors.danger} />
              <Text style={styles.sectionTitle}>Areas to Improve</Text>
            </View>
            {data.weakSubjects.map((item, index) => (
              <View key={index} style={styles.weakItem}>
                <View style={styles.weakHeader}>
                  <Text style={styles.weakSubject}>{item.subject}</Text>
                  <Badge
                    label={item.priority}
                    bgColor={getPriorityColor(item.priority) + '20'}
                    color={getPriorityColor(item.priority)}
                    size="sm"
                  />
                </View>
                <Text style={styles.weakReason}>{item.reason}</Text>
              </View>
            ))}
          </Card>
        )}

        {/* Strengths */}
        {data?.strengths && data.strengths.length > 0 && (
          <Card style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="trophy" size={22} color={Colors.success} />
              <Text style={styles.sectionTitle}>Your Strengths</Text>
            </View>
            {data.strengths.map((strength, index) => (
              <View key={index} style={styles.strengthItem}>
                <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
                <Text style={styles.strengthText}>{strength}</Text>
              </View>
            ))}
          </Card>
        )}

        {/* Recommendations */}
        {data?.recommendations && data.recommendations.length > 0 && (
          <Card style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="bulb" size={22} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Actionable Tips</Text>
            </View>
            {data.recommendations.map((rec, index) => (
              <View key={index} style={styles.recItem}>
                <View style={styles.recHeader}>
                  <Badge
                    label={rec.category}
                    bgColor={Colors.primaryLight}
                    color={Colors.primary}
                    size="sm"
                  />
                </View>
                <Text style={styles.recSuggestion}>{rec.suggestion}</Text>
                <View style={styles.recAction}>
                  <Ionicons name="arrow-forward" size={14} color={Colors.primary} />
                  <Text style={styles.recActionText}>{rec.action}</Text>
                </View>
              </View>
            ))}
          </Card>
        )}

        {/* Study Plan */}
        {data?.studyPlan && (
          <Card style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="calendar" size={22} color={Colors.info} />
              <Text style={styles.sectionTitle}>This Week's Plan</Text>
            </View>

            <View style={styles.planGoal}>
              <Text style={styles.planGoalLabel}>Daily Goal:</Text>
              <Text style={styles.planGoalValue}>
                {data.studyPlan.dailyGoalMinutes} minutes
              </Text>
            </View>

            <Text style={styles.planSubtitle}>Focus Areas:</Text>
            {data.studyPlan.focusAreas.map((area, index) => (
              <View key={index} style={styles.planItem}>
                <Ionicons name="checkbox-outline" size={18} color={Colors.textLight} />
                <Text style={styles.planText}>{area}</Text>
              </View>
            ))}

            <Text style={[styles.planSubtitle, { marginTop: 16 }]}>Weekly Targets:</Text>
            {data.studyPlan.weeklyTargets.map((target, index) => (
              <View key={index} style={styles.planItem}>
                <Ionicons name="flag-outline" size={18} color={Colors.primary} />
                <Text style={styles.planText}>{target}</Text>
              </View>
            ))}
          </Card>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: Fonts.bold,
    color: Colors.white,
  },
  headerSub: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: Colors.textLight,
  },
  scrollContent: {
    padding: 16,
  },
  summaryCard: {
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
  },
  statBox: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontFamily: Fonts.bold,
    color: Colors.primary,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: Colors.textLight,
    marginTop: 4,
  },
  motivationCard: {
    backgroundColor: Colors.warningLight,
    borderLeftWidth: 4,
    borderLeftColor: Colors.warning,
    marginBottom: 16,
  },
  motivationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  motivationTitle: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
    color: Colors.text,
  },
  motivationText: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: Colors.text,
    lineHeight: 20,
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
    color: Colors.text,
  },
  weakItem: {
    padding: 12,
    backgroundColor: Colors.backgroundLight,
    borderRadius: BorderRadius.sm,
    marginBottom: 8,
  },
  weakHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  weakSubject: {
    fontSize: 15,
    fontFamily: Fonts.semiBold,
    color: Colors.text,
  },
  weakReason: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: Colors.textLight,
  },
  strengthItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
  },
  strengthText: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: Colors.text,
  },
  recItem: {
    padding: 12,
    backgroundColor: Colors.backgroundLight,
    borderRadius: BorderRadius.sm,
    marginBottom: 12,
  },
  recHeader: {
    marginBottom: 8,
  },
  recSuggestion: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: Colors.text,
    marginBottom: 8,
  },
  recAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  recActionText: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: Colors.primary,
  },
  planGoal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: Colors.infoLight,
    borderRadius: BorderRadius.sm,
    marginBottom: 16,
  },
  planGoalLabel: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: Colors.text,
  },
  planGoalValue: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    color: Colors.info,
  },
  planSubtitle: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: Colors.text,
    marginBottom: 8,
  },
  planItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
  },
  planText: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: Colors.text,
    flex: 1,
  },
});
