import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, StudyCard } from '../types';
import { Card } from '../components/Card';
import { Badge, ProgressBar } from '../components/UI';
import { Colors, Fonts, BorderRadius, Shadow } from '../theme';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const categories = ['All', 'Math', 'Science', 'History', 'Language', 'Saved'];

const studyCards: StudyCard[] = [
  { id: '1', title: 'Calculus Fundamentals', subject: 'Mathematics', color: '#FF7A00', icon: '📐', progress: 0.72 },
  { id: '2', title: 'Quantum Mechanics Basics', subject: 'Physics', color: '#8B5CF6', icon: '⚛️', progress: 0.45 },
  { id: '3', title: 'Organic Chemistry Reactions', subject: 'Chemistry', color: '#4CAF50', icon: '🧪', progress: 0.88 },
  { id: '4', title: 'Cell Division & DNA', subject: 'Biology', color: '#F59E0B', icon: '🧬', progress: 0.33 },
  { id: '5', title: 'World War II History', subject: 'History', color: '#EF4444', icon: '🌍', progress: 0.60 },
  { id: '6', title: 'English Grammar Rules', subject: 'Language', color: '#06B6D4', icon: '✏️', progress: 0.50 },
  { id: '7', title: 'Algebra & Equations', subject: 'Mathematics', color: '#FF7A00', icon: '➕', progress: 0.90 },
  { id: '8', title: 'Newton\'s Laws of Motion', subject: 'Physics', color: '#8B5CF6', icon: '🌀', progress: 0.65 },
];

export const LibraryScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = studyCards.filter((c) => {
    const matchesCategory = activeCategory === 'All' || c.subject.toLowerCase().includes(activeCategory.toLowerCase());
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase()) || c.subject.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>My Library</Text>
          <Text style={styles.headerSub}>{studyCards.length} study materials</Text>
        </View>
        <TouchableOpacity style={styles.headerBtn}>
          <Ionicons name="add" size={22} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color={Colors.textLight} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search topics, subjects..."
            placeholderTextColor={Colors.textLight}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={Colors.textLight} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryContent}
      >
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.categoryPill, activeCategory === cat && styles.categoryPillActive]}
            onPress={() => setActiveCategory(cat)}
          >
            <Text style={[styles.categoryText, activeCategory === cat && styles.categoryTextActive]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Stats banner */}
      {activeCategory === 'All' && !search && (
        <LinearGradient
          colors={['#FF7A00', '#FF9A3C']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.statsBanner}
        >
          <View style={styles.statsBannerItem}>
            <Text style={styles.statsBannerVal}>{studyCards.length}</Text>
            <Text style={styles.statsBannerLabel}>Topics</Text>
          </View>
          <View style={styles.statsBannerDivider} />
          <View style={styles.statsBannerItem}>
            <Text style={styles.statsBannerVal}>6</Text>
            <Text style={styles.statsBannerLabel}>Subjects</Text>
          </View>
          <View style={styles.statsBannerDivider} />
          <View style={styles.statsBannerItem}>
            <Text style={styles.statsBannerVal}>64%</Text>
            <Text style={styles.statsBannerLabel}>Avg Progress</Text>
          </View>
        </LinearGradient>
      )}

      {/* Cards list */}
      {filtered.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>📚</Text>
          <Text style={styles.emptyTitle}>No materials found</Text>
          <Text style={styles.emptySub}>Try a different search or category</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 100 }]}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.studyCardItem}
              activeOpacity={0.88}
              onPress={() => navigation.navigate('AISummary', {})}
            >
              <View style={[styles.cardIconBox, { backgroundColor: item.color + '20' }]}>
                <Text style={styles.cardEmoji}>{item.icon}</Text>
              </View>
              <View style={styles.cardBody}>
                <View style={styles.cardTopRow}>
                  <Badge label={item.subject} bgColor={item.color + '20'} color={item.color} size="sm" />
                  <TouchableOpacity>
                    <Ionicons name="bookmark-outline" size={18} color={Colors.textGray} />
                  </TouchableOpacity>
                </View>
                <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
                <View style={{ marginTop: 8, gap: 4 }}>
                  <View style={styles.cardProgressRow}>
                    <Text style={styles.cardProgressText}>Progress</Text>
                    <Text style={[styles.cardProgressText, { color: item.color }]}>{Math.round(item.progress * 100)}%</Text>
                  </View>
                  <ProgressBar progress={item.progress} color={item.color} height={5} />
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 14 },
  headerTitle: { fontFamily: Fonts.bold, fontSize: 24, color: Colors.textDark },
  headerSub: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.textGray, marginTop: 2 },
  headerBtn: { width: 44, height: 44, borderRadius: 13, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  searchContainer: { paddingHorizontal: 20, marginBottom: 14 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.white,
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 50,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: { flex: 1, fontFamily: Fonts.regular, fontSize: 14, color: Colors.textDark },
  categoryScroll: { marginBottom: 14 },
  categoryContent: { paddingHorizontal: 20, gap: 10 },
  categoryPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.border },
  categoryPillActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  categoryText: { fontFamily: Fonts.medium, fontSize: 13, color: Colors.textGray },
  categoryTextActive: { color: Colors.white },
  statsBanner: { marginHorizontal: 20, borderRadius: 16, padding: 16, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginBottom: 16 },
  statsBannerItem: { alignItems: 'center', gap: 2 },
  statsBannerVal: { fontFamily: Fonts.bold, fontSize: 22, color: Colors.white },
  statsBannerLabel: { fontFamily: Fonts.regular, fontSize: 12, color: 'rgba(255,255,255,0.85)' },
  statsBannerDivider: { width: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.3)' },
  listContent: { paddingHorizontal: 20, gap: 12 },
  studyCardItem: { flexDirection: 'row', backgroundColor: Colors.white, borderRadius: 18, padding: 16, gap: 14, alignItems: 'flex-start', ...Shadow.small },
  cardIconBox: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  cardEmoji: { fontSize: 24 },
  cardBody: { flex: 1 },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  cardTitle: { fontFamily: Fonts.semiBold, fontSize: 15, color: Colors.textDark, lineHeight: 22 },
  cardProgressRow: { flexDirection: 'row', justifyContent: 'space-between' },
  cardProgressText: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.textGray },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, paddingBottom: 100 },
  emptyEmoji: { fontSize: 52 },
  emptyTitle: { fontFamily: Fonts.bold, fontSize: 20, color: Colors.textDark },
  emptySub: { fontFamily: Fonts.regular, fontSize: 15, color: Colors.textGray },
});
