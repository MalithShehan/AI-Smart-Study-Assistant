import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Fonts, Shadow, BorderRadius } from '../theme';

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const dates = [12, 13, 14, 15, 16, 17, 18];
const todayIndex = 2; // Wednesday

const schedule = [
  { id: '1', subject: 'Mathematics', topic: 'Calculus Integration', time: '09:00 - 10:30', color: '#FF7A00', icon: '📐', completed: true },
  { id: '2', subject: 'Physics', topic: 'Quantum Mechanics', time: '11:00 - 12:00', color: '#8B5CF6', icon: '⚛️', completed: true },
  { id: '3', subject: 'Chemistry', topic: 'Organic Reactions', time: '14:00 - 15:30', color: '#4CAF50', icon: '🧪', completed: false },
  { id: '4', subject: 'Biology', topic: 'Cell Division', time: '16:00 - 17:00', color: '#F59E0B', icon: '🧬', completed: false },
  { id: '5', subject: 'English', topic: 'Essay Writing', time: '18:00 - 19:00', color: '#06B6D4', icon: '✏️', completed: false },
];

const upcomingExams = [
  { subject: 'Mathematics', date: 'Dec 20', daysLeft: 5, color: '#FF7A00' },
  { subject: 'Physics', date: 'Dec 23', daysLeft: 8, color: '#8B5CF6' },
  { subject: 'Chemistry', date: 'Dec 28', daysLeft: 13, color: '#4CAF50' },
];

export const TimetableScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [selectedDay, setSelectedDay] = useState(todayIndex);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Timetable 📅</Text>
          <Text style={styles.headerSub}>December 2024</Text>
        </View>
        <TouchableOpacity style={styles.addBtn}>
          <Ionicons name="add" size={22} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Weekly calendar */}
      <View style={styles.weekRow}>
        {days.map((day, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.dayItem, selectedDay === i && styles.dayItemActive]}
            onPress={() => setSelectedDay(i)}
          >
            <Text style={[styles.dayName, selectedDay === i && styles.dayTextActive]}>{day}</Text>
            <View style={[styles.dateCircle, selectedDay === i && styles.dateCircleActive]}>
              <Text style={[styles.dateNum, selectedDay === i && styles.dayTextActive]}>{dates[i]}</Text>
            </View>
            {i === todayIndex && <View style={[styles.todayDot, selectedDay === i && { backgroundColor: Colors.white }]} />}
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Upcoming exams */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Exams 🎯</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}>
          {upcomingExams.map((exam, i) => (
            <LinearGradient
              key={i}
              colors={[exam.color, exam.color + 'AA']}
              style={styles.examCard}
            >
              <Text style={styles.examSubject}>{exam.subject}</Text>
              <Text style={styles.examDate}>{exam.date}</Text>
              <View style={styles.examDaysBox}>
                <Text style={styles.examDaysNum}>{exam.daysLeft}</Text>
                <Text style={styles.examDaysLabel}>days left</Text>
              </View>
            </LinearGradient>
          ))}
        </ScrollView>

        {/* Schedule */}
        <View style={[styles.sectionHeader, { marginTop: 20 }]}>
          <Text style={styles.sectionTitle}>
            {selectedDay === todayIndex ? "Today's Schedule" : `${days[selectedDay]}'s Schedule`}
          </Text>
          <Text style={styles.sectionCount}>{schedule.length} sessions</Text>
        </View>

        {schedule.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🎉</Text>
            <Text style={styles.emptyTitle}>No sessions</Text>
            <Text style={styles.emptySub}>No study sessions scheduled for this day</Text>
          </View>
        ) : (
          <View style={styles.scheduleList}>
            {schedule.map((item, i) => (
              <TouchableOpacity key={item.id} style={styles.scheduleItem} activeOpacity={0.88}>
                {/* Time column */}
                <View style={styles.timeCol}>
                  <Text style={styles.timeText}>{item.time.split(' - ')[0]}</Text>
                  <View style={[styles.timeLine, { backgroundColor: item.color }]} />
                  <Text style={styles.timeText}>{item.time.split(' - ')[1]}</Text>
                </View>

                {/* Card */}
                <View style={[styles.scheduleCard, item.completed && styles.scheduleCardDone]}>
                  <View style={[styles.scheduleColorBar, { backgroundColor: item.color }]} />
                  <View style={styles.scheduleBody}>
                    <View style={styles.scheduleTop}>
                      <Text style={styles.scheduleEmoji}>{item.icon}</Text>
                      {item.completed && (
                        <View style={styles.completedBadge}>
                          <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                          <Text style={styles.completedText}>Done</Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.scheduleSubject, { color: item.color }]}>{item.subject}</Text>
                    <Text style={styles.scheduleTopic}>{item.topic}</Text>
                    <View style={styles.scheduleTimeRow}>
                      <Ionicons name="time-outline" size={13} color={Colors.textGray} />
                      <Text style={styles.scheduleTimeText}>{item.time}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 16 },
  headerTitle: { fontFamily: Fonts.bold, fontSize: 24, color: Colors.textDark },
  headerSub: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.textGray, marginTop: 2 },
  addBtn: { width: 44, height: 44, borderRadius: 13, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  weekRow: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 16, gap: 4 },
  dayItem: { flex: 1, alignItems: 'center', gap: 6, paddingVertical: 8, borderRadius: 14 },
  dayItemActive: { backgroundColor: Colors.primary },
  dayName: { fontFamily: Fonts.medium, fontSize: 12, color: Colors.textGray },
  dayTextActive: { color: Colors.white },
  dateCircle: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.white, ...Shadow.small },
  dateCircleActive: { backgroundColor: 'rgba(255,255,255,0.25)', shadowOpacity: 0 },
  dateNum: { fontFamily: Fonts.bold, fontSize: 14, color: Colors.textDark },
  todayDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: Colors.primary },
  scrollContent: { paddingTop: 4 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 12 },
  sectionTitle: { fontFamily: Fonts.bold, fontSize: 17, color: Colors.textDark },
  sectionCount: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.textGray },
  examCard: { width: 140, borderRadius: 18, padding: 16, gap: 4 },
  examSubject: { fontFamily: Fonts.bold, fontSize: 14, color: Colors.white },
  examDate: { fontFamily: Fonts.regular, fontSize: 12, color: 'rgba(255,255,255,0.85)' },
  examDaysBox: { flexDirection: 'row', alignItems: 'baseline', gap: 4, marginTop: 8 },
  examDaysNum: { fontFamily: Fonts.bold, fontSize: 28, color: Colors.white },
  examDaysLabel: { fontFamily: Fonts.regular, fontSize: 11, color: 'rgba(255,255,255,0.8)' },
  scheduleList: { paddingHorizontal: 20, gap: 12 },
  scheduleItem: { flexDirection: 'row', gap: 12, alignItems: 'stretch' },
  timeCol: { width: 52, alignItems: 'center', gap: 4, paddingTop: 4 },
  timeText: { fontFamily: Fonts.regular, fontSize: 11, color: Colors.textGray, textAlign: 'center' },
  timeLine: { flex: 1, width: 2, borderRadius: 1, minHeight: 20 },
  scheduleCard: { flex: 1, backgroundColor: Colors.white, borderRadius: 16, flexDirection: 'row', overflow: 'hidden', ...Shadow.small },
  scheduleCardDone: { opacity: 0.7 },
  scheduleColorBar: { width: 5 },
  scheduleBody: { flex: 1, padding: 12, gap: 3 },
  scheduleTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  scheduleEmoji: { fontSize: 20 },
  completedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  completedText: { fontFamily: Fonts.medium, fontSize: 12, color: Colors.success },
  scheduleSubject: { fontFamily: Fonts.bold, fontSize: 14 },
  scheduleTopic: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.textGray },
  scheduleTimeRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  scheduleTimeText: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.textGray },
  emptyState: { alignItems: 'center', padding: 40, gap: 8 },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontFamily: Fonts.bold, fontSize: 18, color: Colors.textDark },
  emptySub: { fontFamily: Fonts.regular, fontSize: 14, color: Colors.textGray, textAlign: 'center' },
});
