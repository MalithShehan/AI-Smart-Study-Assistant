import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Fonts, Shadow } from '../theme';

type NotifType = 'quiz' | 'reminder' | 'achievement' | 'tip' | 'streak';

interface Notification {
  id: string;
  type: NotifType;
  title: string;
  message: string;
  time: string;
  read: boolean;
  icon: string;
  iconColor: string;
  iconBg: string;
}

const notifications: Notification[] = [
  {
    id: '1',
    type: 'streak',
    title: '🔥 7-Day Streak!',
    message: "You've studied 7 days in a row! Keep it up to maintain your streak.",
    time: '2 min ago',
    read: false,
    icon: 'flame',
    iconColor: Colors.warning,
    iconBg: '#FEF3C7',
  },
  {
    id: '2',
    type: 'quiz',
    title: 'New Quiz Available',
    message: 'A new Mathematics quiz on Calculus is ready for you to attempt.',
    time: '1 hour ago',
    read: false,
    icon: 'trophy-outline',
    iconColor: Colors.primary,
    iconBg: Colors.primaryLight,
  },
  {
    id: '3',
    type: 'reminder',
    title: '📚 Study Reminder',
    message: "Time for your Physics session! You have 'Quantum Mechanics' scheduled at 2:00 PM.",
    time: '3 hours ago',
    read: false,
    icon: 'time-outline',
    iconColor: '#8B5CF6',
    iconBg: '#F3F0FF',
  },
  {
    id: '4',
    type: 'achievement',
    title: '🏆 Achievement Unlocked!',
    message: "You've completed 100 study sessions! You earned the 'Study Master' badge.",
    time: 'Yesterday',
    read: true,
    icon: 'medal-outline',
    iconColor: Colors.success,
    iconBg: '#E8F5E9',
  },
  {
    id: '5',
    type: 'tip',
    title: '💡 Study Tip of the Day',
    message: 'Try the Pomodoro technique: 25 minutes of focused study followed by a 5-minute break.',
    time: 'Yesterday',
    read: true,
    icon: 'bulb-outline',
    iconColor: Colors.warning,
    iconBg: '#FFFBF0',
  },
  {
    id: '6',
    type: 'quiz',
    title: 'Quiz Score Updated',
    message: 'Your Chemistry quiz score has been updated. You scored 92% — well done!',
    time: '2 days ago',
    read: true,
    icon: 'checkmark-circle-outline',
    iconColor: Colors.success,
    iconBg: '#E8F5E9',
  },
  {
    id: '7',
    type: 'reminder',
    title: '📅 Exam Reminder',
    message: 'Your Mathematics exam is in 5 days. Consider reviewing Calculus and Algebra.',
    time: '2 days ago',
    read: true,
    icon: 'calendar-outline',
    iconColor: Colors.danger,
    iconBg: '#FFEBEE',
  },
];

export const NotificationsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState(notifications);

  const unreadCount = items.filter((n) => !n.read).length;

  const markAllRead = () => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markRead = (id: string) => {
    setItems((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <Text style={styles.headerSub}>{unreadCount} unread notifications</Text>
          )}
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity style={styles.markAllBtn} onPress={markAllRead}>
            <Ionicons name="checkmark-done-outline" size={16} color={Colors.primary} />
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {['All', 'Unread', 'Quiz', 'Reminder', 'Achievement'].map((f, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.filterPill, i === 0 && styles.filterPillActive]}
          >
            <Text style={[styles.filterText, i === 0 && styles.filterTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {items.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="notifications-off-outline" size={56} color={Colors.textLight} />
          <Text style={styles.emptyTitle}>No notifications</Text>
          <Text style={styles.emptySub}>You're all caught up!</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 100 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Today group */}
          <Text style={styles.groupLabel}>Today</Text>
          {items.filter((n) => ['2 min ago', '1 hour ago', '3 hours ago'].includes(n.time)).map((notif) => (
            <TouchableOpacity
              key={notif.id}
              style={[styles.notifItem, !notif.read && styles.notifItemUnread]}
              onPress={() => markRead(notif.id)}
              activeOpacity={0.85}
            >
              <View style={[styles.notifIcon, { backgroundColor: notif.iconBg }]}>
                <Ionicons name={notif.icon as any} size={22} color={notif.iconColor} />
              </View>
              <View style={styles.notifBody}>
                <View style={styles.notifTopRow}>
                  <Text style={styles.notifTitle} numberOfLines={1}>{notif.title}</Text>
                  <Text style={styles.notifTime}>{notif.time}</Text>
                </View>
                <Text style={styles.notifMessage} numberOfLines={2}>{notif.message}</Text>
              </View>
              {!notif.read && <View style={styles.unreadDot} />}
            </TouchableOpacity>
          ))}

          {/* Earlier group */}
          <Text style={[styles.groupLabel, { marginTop: 20 }]}>Earlier</Text>
          {items.filter((n) => !['2 min ago', '1 hour ago', '3 hours ago'].includes(n.time)).map((notif) => (
            <TouchableOpacity
              key={notif.id}
              style={[styles.notifItem, !notif.read && styles.notifItemUnread]}
              onPress={() => markRead(notif.id)}
              activeOpacity={0.85}
            >
              <View style={[styles.notifIcon, { backgroundColor: notif.iconBg }]}>
                <Ionicons name={notif.icon as any} size={22} color={notif.iconColor} />
              </View>
              <View style={styles.notifBody}>
                <View style={styles.notifTopRow}>
                  <Text style={styles.notifTitle} numberOfLines={1}>{notif.title}</Text>
                  <Text style={styles.notifTime}>{notif.time}</Text>
                </View>
                <Text style={styles.notifMessage} numberOfLines={2}>{notif.message}</Text>
              </View>
              {!notif.read && <View style={styles.unreadDot} />}
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 14 },
  headerTitle: { fontFamily: Fonts.bold, fontSize: 24, color: Colors.textDark },
  headerSub: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.textGray, marginTop: 2 },
  markAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: Colors.primaryLight, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  markAllText: { fontFamily: Fonts.semiBold, fontSize: 13, color: Colors.primary },
  filterRow: { paddingHorizontal: 20, gap: 10, marginBottom: 16 },
  filterPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border },
  filterPillActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterText: { fontFamily: Fonts.medium, fontSize: 13, color: Colors.textGray },
  filterTextActive: { color: Colors.white },
  listContent: { paddingHorizontal: 20 },
  groupLabel: { fontFamily: Fonts.bold, fontSize: 13, color: Colors.textGray, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 },
  notifItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 14,
    marginBottom: 8,
    ...Shadow.small,
  },
  notifItemUnread: { borderLeftWidth: 3, borderLeftColor: Colors.primary },
  notifIcon: { width: 46, height: 46, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  notifBody: { flex: 1 },
  notifTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  notifTitle: { fontFamily: Fonts.semiBold, fontSize: 14, color: Colors.textDark, flex: 1 },
  notifTime: { fontFamily: Fonts.regular, fontSize: 11, color: Colors.textLight, marginTop: 2 },
  notifMessage: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.textGray, marginTop: 4, lineHeight: 20 },
  unreadDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: Colors.primary, marginTop: 5 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, paddingBottom: 100 },
  emptyTitle: { fontFamily: Fonts.bold, fontSize: 20, color: Colors.textDark },
  emptySub: { fontFamily: Fonts.regular, fontSize: 15, color: Colors.textGray },
});
