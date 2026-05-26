import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { GlassCard } from '../components/GlassCard';
import { apiGet, apiPost, apiPatch } from '../api/client';
import { useTheme } from '../context/ThemeContext';
import { Fonts, BorderRadius } from '../theme';

interface Task {
  _id: string;
  title: string;
  subject: string;
  duration: number;
  priority: 'high' | 'medium' | 'low';
  type: 'revision' | 'practice' | 'quiz' | 'reading' | 'video' | 'break';
  description: string;
  timeSlot: string;
  isCompleted: boolean;
  completedAt?: string;
  order: number;
}

interface StudyPlan {
  _id: string;
  date: string;
  title: string;
  summary: string;
  motivationalMessage: string;
  tasks: Task[];
  totalTasks: number;
  completedTasks: number;
  totalDuration: number;
  progress: number;
  isCompleted: boolean;
  status: string;
}

export const StudyPlanScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [plan, setPlan] = useState<StudyPlan | null>(null);
  
  useEffect(() => {
    loadTodaysPlan();
  }, []);
  
  const loadTodaysPlan = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    
    try {
      const res = await apiGet('/study-plans/today');
      if (res.success && res.data) {
        setPlan(res.data);
      } else {
        setPlan(null);
      }
    } catch (error) {
      console.error('Failed to load study plan:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  const generatePlan = async () => {
    Alert.prompt(
      'Generate Study Plan',
      'How many hours can you study today?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Generate',
          onPress: async (hours) => {
            const studyHours = parseFloat(hours || '4');
            if (isNaN(studyHours) || studyHours < 0.5 || studyHours > 12) {
              Alert.alert('Invalid Input', 'Please enter hours between 0.5 and 12');
              return;
            }
            
            setGenerating(true);
            try {
              const res = await apiPost('/study-plans/generate', {
                studyHours,
                subjects: ['Mathematics', 'Science', 'English'],
                preferredTime: 'morning',
              });
              
              if (res.success) {
                setPlan(res.data);
                Alert.alert('Success', 'Study plan generated! 🎉');
              }
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to generate plan');
            } finally {
              setGenerating(false);
            }
          },
        },
      ],
      'plain-text',
      '4'
    );
  };
  
  const completeTask = async (taskId: string) => {
    if (!plan) return;
    
    try {
      const res = await apiPatch(`/study-plans/${plan._id}/task/${taskId}/complete`);
      if (res.success) {
        setPlan(res.data.plan);
      }
    } catch (error) {
      console.error('Failed to complete task:', error);
    }
  };
  
  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'revision': return 'book-outline';
      case 'practice': return 'create-outline';
      case 'quiz': return 'school-outline';
      case 'reading': return 'reader-outline';
      case 'video': return 'play-circle-outline';
      case 'break': return 'cafe-outline';
      default: return 'ellipse-outline';
    }
  };
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return theme.danger;
      case 'medium': return theme.warning;
      case 'low': return theme.success;
      default: return theme.textLight;
    }
  };
  
  if (loading) {
    return (
      <View style={[createStyles(theme).container, { paddingTop: insets.top }]}>
        <LinearGradient colors={['#FF7A00', '#E56900']} style={createStyles(theme).header}>
          <Text style={createStyles(theme).headerTitle}>📅 Today's Plan</Text>
        </LinearGradient>
        <View style={createStyles(theme).loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </View>
    );
  }

  const styles = createStyles(theme);
  
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <LinearGradient colors={['#FF7A00', '#E56900']} style={styles.header}>
        <Text style={styles.headerTitle}>📅 Today's Plan</Text>
        {plan && (
          <Text style={styles.headerSub}>{new Date(plan.date).toDateString()}</Text>
        )}
      </LinearGradient>
      
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadTodaysPlan(true)} />}
      >
        {!plan ? (
          /* No Plan - Generate */
          <Animated.View entering={FadeInDown.springify()}>
            <GlassCard style={styles.emptyCard}>
              <Ionicons name="calendar-outline" size={64} color={Colors.primary} />
              <Text style={styles.emptyTitle}>No Plan Yet</Text>
              <Text style={styles.emptyText}>
                Let AI create a personalized study plan for you today!
              </Text>
              <TouchableOpacity
                style={styles.generateBtn}
                onPress={generatePlan}
                disabled={generating}
              >
                <LinearGradient colors={['#FF7A00', '#E56900']} style={styles.generateBtnGradient}>
                  {generating ? (
                    <ActivityIndicator color={Colors.white} />
                  ) : (
                    <>
                      <Ionicons name="sparkles" size={20} color={Colors.white} />
                      <Text style={styles.generateBtnText}>Generate Plan</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </GlassCard>
          </Animated.View>
        ) : (
          <>
            {/* Progress Card */}
            <Animated.View entering={FadeInDown.delay(100).springify()}>
              <GlassCard style={styles.progressCard}>
                <View style={styles.progressHeader}>
                  <View>
                    <Text style={styles.planTitle}>{plan.title}</Text>
                    <Text style={styles.planSummary}>{plan.summary}</Text>
                  </View>
                  <View style={styles.progressCircle}>
                    <Text style={styles.progressPercent}>{Math.round(plan.progress)}%</Text>
                  </View>
                </View>
                
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${plan.progress}%` }]}>
                    <LinearGradient
                      colors={['#FF7A00', '#FFD700']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={StyleSheet.absoluteFill}
                    />
                  </View>
                </View>
                
                <View style={styles.statsRow}>
                  <View style={styles.stat}>
                    <Ionicons name="checkmark-circle" size={16} color={theme.success} />
                    <Text style={styles.statText}>{plan.completedTasks}/{plan.totalTasks} tasks</Text>
                  </View>
                  <View style={styles.stat}>
                    <Ionicons name="time" size={16} color={theme.primary} />
                    <Text style={styles.statText}>{plan.totalDuration} min</Text>
                  </View>
                </View>
              </GlassCard>
            </Animated.View>
            
            {/* Motivational Message */}
            {plan.motivationalMessage && (
              <Animated.View entering={FadeInUp.delay(200).springify()}>
                <GlassCard style={styles.motivationCard}>
                  <Ionicons name="bulb" size={20} color={theme.warning} />
                  <Text style={styles.motivationText}>{plan.motivationalMessage}</Text>
                </GlassCard>
              </Animated.View>
            )}
            
            {/* Tasks */}
            <Animated.View entering={FadeInUp.delay(300).springify()}>
              <Text style={styles.sectionTitle}>Tasks</Text>
              {plan.tasks
                .sort((a, b) => a.order - b.order)
                .map((task, index) => (
                  <GlassCard key={task._id} style={styles.taskCard}>
                    <View style={styles.taskHeader}>
                      <TouchableOpacity
                        style={styles.checkbox}
                        onPress={() => !task.isCompleted && completeTask(task._id)}
                        disabled={task.isCompleted}
                      >
                        {task.isCompleted ? (
                          <Ionicons name="checkmark-circle" size={28} color={theme.success} />
                        ) : (
                          <View style={styles.checkboxEmpty} />
                        )}
                      </TouchableOpacity>
                      
                      <View style={{ flex: 1 }}>
                        <View style={styles.taskTitleRow}>
                          <Text style={[styles.taskTitle, task.isCompleted && styles.taskTitleCompleted]}>
                            {task.title}
                          </Text>
                          <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(task.priority) }]} />
                        </View>
                        <Text style={styles.taskSubject}>
                          <Ionicons name={getTaskIcon(task.type)} size={14} color={theme.textLight} /> {task.subject}
                        </Text>
                        <Text style={styles.taskDescription}>{task.description}</Text>
                        
                        <View style={styles.taskFooter}>
                          <View style={styles.taskTime}>
                            <Ionicons name="time-outline" size={14} color={theme.textLight} />
                            <Text style={styles.taskTimeText}>{task.timeSlot} ({task.duration} min)</Text>
                          </View>
                          {task.isCompleted && (
                            <View style={styles.completedBadge}>
                              <Text style={styles.completedText}>✓ Done</Text>
                            </View>
                          )}
                        </View>
                      </View>
                    </View>
                  </GlassCard>
                ))}
            </Animated.View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  header: { paddingHorizontal: 20, paddingVertical: 24 },
  headerTitle: { fontSize: 28, fontFamily: Fonts.bold, color: theme.white },
  headerSub: { fontSize: 14, fontFamily: Fonts.regular, color: 'rgba(255,255,255,0.9)', marginTop: 4 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scrollContent: { padding: 16 },
  
  emptyCard: { padding: 32, alignItems: 'center' },
  emptyTitle: { fontSize: 24, fontFamily: Fonts.bold, color: theme.text, marginTop: 16 },
  emptyText: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: theme.textLight,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  generateBtn: { borderRadius: BorderRadius.large, overflow: 'hidden' },
  generateBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  generateBtnText: { fontSize: 16, fontFamily: Fonts.bold, color: theme.white },
  
  progressCard: { padding: 20, marginBottom: 16 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  planTitle: { fontSize: 20, fontFamily: Fonts.bold, color: theme.text },
  planSummary: { fontSize: 12, fontFamily: Fonts.regular, color: theme.textLight, marginTop: 4 },
  progressCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressPercent: { fontSize: 18, fontFamily: Fonts.bold, color: theme.white },
  progressBar: {
    height: 8,
    backgroundColor: theme.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: { height: '100%', borderRadius: 4 },
  statsRow: { flexDirection: 'row', gap: 16 },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statText: { fontSize: 12, fontFamily: Fonts.medium, color: theme.textLight },
  
  motivationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    marginBottom: 16,
  },
  motivationText: { flex: 1, fontSize: 14, fontFamily: Fonts.medium, color: theme.text },
  
  sectionTitle: { fontSize: 18, fontFamily: Fonts.bold, color: theme.text, marginBottom: 12 },
  
  taskCard: { padding: 16, marginBottom: 12 },
  taskHeader: { flexDirection: 'row', gap: 12 },
  checkbox: { width: 28, height: 28 },
  checkboxEmpty: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: theme.border,
  },
  taskTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  taskTitle: { fontSize: 16, fontFamily: Fonts.semiBold, color: theme.text, flex: 1 },
  taskTitleCompleted: { textDecorationLine: 'line-through', color: theme.textLight },
  priorityDot: { width: 8, height: 8, borderRadius: 4 },
  taskSubject: { fontSize: 12, fontFamily: Fonts.medium, color: theme.textLight, marginTop: 4 },
  taskDescription: { fontSize: 12, fontFamily: Fonts.regular, color: theme.textLight, marginTop: 4 },
  taskFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  taskTime: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  taskTimeText: { fontSize: 11, fontFamily: Fonts.regular, color: theme.textLight },
  completedBadge: {
    backgroundColor: theme.success,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  completedText: { fontSize: 10, fontFamily: Fonts.bold, color: theme.white },
});
