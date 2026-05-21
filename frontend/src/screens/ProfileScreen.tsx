import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { Avatar, Badge, ProgressBar } from '../components/UI';
import { Card } from '../components/Card';
import { Colors, Fonts, Shadow } from '../theme';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const settingsGroups = [
  {
    title: 'Preferences',
    items: [
      { icon: 'notifications-outline', label: 'Push Notifications', type: 'toggle', color: Colors.primary },
      { icon: 'moon-outline', label: 'Dark Mode', type: 'toggle', color: Colors.purple },
      { icon: 'language-outline', label: 'Language', type: 'nav', value: 'English', color: '#06B6D4' },
    ],
  },
  {
    title: 'Study Settings',
    items: [
      { icon: 'time-outline', label: 'Daily Study Goal', type: 'nav', value: '2 hours', color: Colors.success },
      { icon: 'calendar-outline', label: 'Study Reminders', type: 'nav', value: '8:00 AM', color: Colors.warning },
      { icon: 'trophy-outline', label: 'Difficulty Level', type: 'nav', value: 'Intermediate', color: Colors.primary },
    ],
  },
  {
    title: 'Account',
    items: [
      { icon: 'person-outline', label: 'Edit Profile', type: 'nav', color: Colors.textGray },
      { icon: 'shield-outline', label: 'Privacy & Security', type: 'nav', color: Colors.textGray },
      { icon: 'help-circle-outline', label: 'Help & Support', type: 'nav', color: Colors.textGray },
      { icon: 'information-circle-outline', label: 'About App', type: 'nav', color: Colors.textGray },
    ],
  },
];

export const ProfileScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const getToggleValue = (label: string) => {
    if (label === 'Push Notifications') return notifications;
    if (label === 'Dark Mode') return darkMode;
    return false;
  };

  const handleToggle = (label: string, val: boolean) => {
    if (label === 'Push Notifications') setNotifications(val);
    if (label === 'Dark Mode') setDarkMode(val);
  };

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: () => navigation.replace('Login') },
    ]);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero */}
      <LinearGradient
        colors={['#FF7A00', '#FF9A3C']}
        style={[styles.heroGradient, { paddingTop: insets.top + 16 }]}
      >
        <View style={styles.heroTop}>
          <Text style={styles.heroTitle}>Profile</Text>
          <TouchableOpacity style={styles.editBtn}>
            <Ionicons name="create-outline" size={20} color={Colors.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.profileInfo}>
          <Avatar initials="MS" size={80} bgColor="rgba(255,255,255,0.25)" color={Colors.white} fontSize={28} />
          <Text style={styles.profileName}>Malith Shehan</Text>
          <Text style={styles.profileEmail}>malith@example.com</Text>
          <Badge label="Pro Student 🎓" bgColor="rgba(255,255,255,0.25)" color={Colors.white} size="sm" />
        </View>
      </LinearGradient>

      {/* Stats */}
      <View style={styles.statsRow}>
        {[
          { label: 'Quizzes', value: '48', icon: '🏆' },
          { label: 'Sessions', value: '127', icon: '📚' },
          { label: 'Day Streak', value: '7', icon: '🔥' },
          { label: 'Avg Score', value: '87%', icon: '⭐' },
        ].map((stat, i) => (
          <View key={i} style={styles.statBox}>
            <Text style={styles.statEmoji}>{stat.icon}</Text>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Progress */}
      <Card style={styles.progressCard}>
        <Text style={styles.progressTitle}>Monthly Goal Progress</Text>
        <Text style={styles.progressSub}>62 of 100 study sessions completed</Text>
        <View style={{ marginTop: 12, gap: 8 }}>
          <View style={styles.progressBarRow}>
            <Text style={styles.progressBarLabel}>Overall Progress</Text>
            <Text style={[styles.progressBarLabel, { color: Colors.primary }]}>62%</Text>
          </View>
          <ProgressBar progress={0.62} color={Colors.primary} height={8} />
        </View>
        {[
          { subject: 'Mathematics', progress: 0.78, color: '#FF7A00' },
          { subject: 'Physics', progress: 0.52, color: '#8B5CF6' },
          { subject: 'Chemistry', progress: 0.88, color: '#4CAF50' },
        ].map((item, i) => (
          <View key={i} style={{ marginTop: 12, gap: 5 }}>
            <View style={styles.progressBarRow}>
              <Text style={styles.progressBarLabel}>{item.subject}</Text>
              <Text style={[styles.progressBarLabel, { color: item.color }]}>{Math.round(item.progress * 100)}%</Text>
            </View>
            <ProgressBar progress={item.progress} color={item.color} height={6} />
          </View>
        ))}
      </Card>

      {/* Settings */}
      {settingsGroups.map((group, gi) => (
        <View key={gi} style={{ marginBottom: 8 }}>
          <Text style={styles.groupTitle}>{group.title}</Text>
          <View style={styles.settingsCard}>
            {group.items.map((item, ii) => (
              <View key={ii}>
                <View style={styles.settingsItem}>
                  <View style={[styles.settingsIconBox, { backgroundColor: item.color + '20' }]}>
                    <Ionicons name={item.icon as any} size={18} color={item.color} />
                  </View>
                  <Text style={styles.settingsLabel}>{item.label}</Text>
                  <View style={styles.settingsRight}>
                    {item.type === 'toggle' ? (
                      <Switch
                        value={getToggleValue(item.label)}
                        onValueChange={(v) => handleToggle(item.label, v)}
                        trackColor={{ false: Colors.border, true: Colors.primary + '60' }}
                        thumbColor={getToggleValue(item.label) ? Colors.primary : Colors.textLight}
                      />
                    ) : (
                      <>
                        {item.value && <Text style={styles.settingsValue}>{item.value}</Text>}
                        <Ionicons name="chevron-forward" size={16} color={Colors.textLight} />
                      </>
                    )}
                  </View>
                </View>
                {ii < group.items.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </View>
        </View>
      ))}

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
        <Ionicons name="log-out-outline" size={20} color={Colors.danger} />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>

      <Text style={styles.versionText}>StudyAI v1.0.0 · Made with ❤️</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: {},
  heroGradient: { paddingHorizontal: 20, paddingBottom: 60 },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  heroTitle: { fontFamily: Fonts.bold, fontSize: 24, color: Colors.white },
  editBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  profileInfo: { alignItems: 'center', gap: 8 },
  profileName: { fontFamily: Fonts.bold, fontSize: 24, color: Colors.white },
  profileEmail: { fontFamily: Fonts.regular, fontSize: 14, color: 'rgba(255,255,255,0.85)' },
  statsRow: { flexDirection: 'row', backgroundColor: Colors.white, marginHorizontal: 20, marginTop: -30, borderRadius: 20, padding: 16, justifyContent: 'space-around', ...Shadow.medium },
  statBox: { alignItems: 'center', gap: 3 },
  statEmoji: { fontSize: 20 },
  statValue: { fontFamily: Fonts.bold, fontSize: 18, color: Colors.textDark },
  statLabel: { fontFamily: Fonts.regular, fontSize: 11, color: Colors.textGray, textAlign: 'center' },
  progressCard: { margin: 20, marginTop: 16 },
  progressTitle: { fontFamily: Fonts.bold, fontSize: 16, color: Colors.textDark },
  progressSub: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.textGray, marginTop: 4 },
  progressBarRow: { flexDirection: 'row', justifyContent: 'space-between' },
  progressBarLabel: { fontFamily: Fonts.medium, fontSize: 13, color: Colors.textGray },
  groupTitle: { fontFamily: Fonts.bold, fontSize: 15, color: Colors.textGray, paddingHorizontal: 20, marginBottom: 8 },
  settingsCard: { backgroundColor: Colors.white, marginHorizontal: 20, borderRadius: 18, overflow: 'hidden', ...Shadow.small },
  settingsItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  settingsIconBox: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  settingsLabel: { flex: 1, fontFamily: Fonts.medium, fontSize: 15, color: Colors.textDark },
  settingsRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  settingsValue: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.textGray },
  divider: { height: 1, backgroundColor: Colors.border, marginLeft: 64 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginHorizontal: 20, marginTop: 20, marginBottom: 8, backgroundColor: '#FFEBEE', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: Colors.danger + '30' },
  logoutText: { fontFamily: Fonts.semiBold, fontSize: 16, color: Colors.danger },
  versionText: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.textLight, textAlign: 'center', marginTop: 8 },
});
