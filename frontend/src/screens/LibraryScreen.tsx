import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TextInput,
  Modal,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { Colors, Fonts, Shadow } from '../theme';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Tab = 'All' | 'Notes' | 'Quizzes' | 'Papers';

interface LibraryItem {
  id: string;
  title: string;
  type: 'Note' | 'Quiz' | 'Paper';
  subject: string;
  date: string;
  meta: string;
  color: string;
  icon: string;
}

const libraryItems: LibraryItem[] = [
  { id: '1', title: 'Biology Notes', type: 'Note', subject: 'Biology', date: '25 May 2024', meta: '12 pages', color: '#06B6D4', icon: 'document-text' },
  { id: '2', title: 'Physics Formulas', type: 'Note', subject: 'Physics', date: '20 May 2024', meta: '8 pages', color: '#4CAF50', icon: 'document-text' },
  { id: '3', title: 'Chemistry Quiz', type: 'Quiz', subject: 'Chemistry', date: '18 May 2024', meta: '10 Questions', color: '#EF4444', icon: 'clipboard' },
  { id: '4', title: 'Math Equations', type: 'Note', subject: 'Mathematics', date: '15 May 2024', meta: '15 pages', color: '#FF7A00', icon: 'calculator' },
  { id: '5', title: 'Past Paper 2023', type: 'Paper', subject: 'General', date: '10 May 2024', meta: 'PDF', color: '#8B5CF6', icon: 'document' },
  { id: '6', title: 'History Chapter 5', type: 'Note', subject: 'History', date: '08 May 2024', meta: '9 pages', color: '#F59E0B', icon: 'document-text' },
  { id: '7', title: 'Biology Quiz', type: 'Quiz', subject: 'Biology', date: '05 May 2024', meta: '15 Questions', color: '#EF4444', icon: 'clipboard' },
  { id: '8', title: 'A/L Papers 2022', type: 'Paper', subject: 'General', date: '01 May 2024', meta: 'PDF', color: '#8B5CF6', icon: 'document' },
];

const TABS: Tab[] = ['All', 'Notes', 'Quizzes', 'Papers'];

const typeMap: Record<Tab, LibraryItem['type'] | null> = {
  All: null, Notes: 'Note', Quizzes: 'Quiz', Papers: 'Paper',
};

// ── Empty state component ────────────────────────────────────────────────────

function EmptyState({ tab, search }: { tab: Tab; search: string }) {
  if (search) {
    return (
      <View style={styles.emptyWrap}>
        <View style={styles.emptyRobotCircle}>
          <Text style={styles.emptyEmoji}>🔍</Text>
        </View>
        <Text style={styles.emptyTitle}>No Results Found</Text>
        <Text style={styles.emptySub}>We couldn't find anything{'\n'}matching your search.</Text>
      </View>
    );
  }
  return (
    <View style={styles.emptyWrap}>
      <View style={styles.emptyRobotCircle}>
        <Text style={styles.emptyEmoji}>📦</Text>
      </View>
      <Text style={styles.emptyTitle}>Your Library is Empty</Text>
      <Text style={styles.emptySub}>Save your notes, quizzes{'\n'}and papers here.</Text>
    </View>
  );
}

export const LibraryScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const [activeTab, setActiveTab] = useState<Tab>('All');
  const [search, setSearch] = useState('');
  const [menuItemId, setMenuItemId] = useState<string | null>(null);

  const filtered = libraryItems.filter((item) => {
    const matchType = !typeMap[activeTab] || item.type === typeMap[activeTab];
    const q = search.toLowerCase();
    const matchSearch = !q || item.title.toLowerCase().includes(q) || item.subject.toLowerCase().includes(q);
    return matchType && matchSearch;
  });

  const renderItem = ({ item }: { item: LibraryItem }) => (
    <TouchableOpacity
      style={styles.listItem}
      activeOpacity={0.82}
      onPress={() => navigation.navigate('AISummary', {})}
    >
      {/* Icon */}
      <View style={[styles.itemIconBox, { backgroundColor: item.color + '20' }]}>
        <Ionicons name={item.icon as any} size={22} color={item.color} />
      </View>

      {/* Content */}
      <View style={styles.itemContent}>
        <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.itemMeta}>{item.date} • {item.meta}</Text>
      </View>

      {/* 3-dot menu */}
      <TouchableOpacity
        style={styles.menuBtn}
        onPress={() => setMenuItemId(item.id)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="ellipsis-vertical" size={18} color={Colors.textGray} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* ── Header ──────────────────────────────────────── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Library</Text>
        <TouchableOpacity style={styles.searchIconBtn}>
          <Ionicons name="search-outline" size={22} color={Colors.textDark} />
        </TouchableOpacity>
      </View>

      {/* ── Tab filter ──────────────────────────────────── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabScroll}
        contentContainerStyle={styles.tabContent}
      >
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabPill, activeTab === tab && styles.tabPillActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ── Search + filter bar ─────────────────────────── */}
      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={16} color={Colors.textLight} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search your library..."
            placeholderTextColor={Colors.textLight}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={16} color={Colors.textLight} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.filterBtn}>
          <Ionicons name="filter-outline" size={18} color={Colors.textDark} />
        </TouchableOpacity>
      </View>

      {/* ── List ────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <EmptyState tab={activeTab} search={search} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 100 }]}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}

      {/* ── 3-dot context menu modal ─────────────────────── */}
      <Modal
        visible={menuItemId !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuItemId(null)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setMenuItemId(null)}>
          <View style={styles.menuSheet}>
            {[
              { icon: 'open-outline', label: 'Open', color: Colors.textDark },
              { icon: 'share-outline', label: 'Share', color: Colors.textDark },
              { icon: 'bookmark-outline', label: 'Save to Favourites', color: Colors.textDark },
              { icon: 'trash-outline', label: 'Delete', color: Colors.danger },
            ].map((opt, i, arr) => (
              <TouchableOpacity
                key={opt.label}
                style={[styles.menuOption, i < arr.length - 1 && styles.menuOptionBorder]}
                onPress={() => setMenuItemId(null)}
              >
                <Ionicons name={opt.icon as any} size={20} color={opt.color} />
                <Text style={[styles.menuOptionText, { color: opt.color }]}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },

  // Header
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 14,
  },
  headerTitle: { fontFamily: Fonts.bold, fontSize: 24, color: Colors.textDark },
  searchIconBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center',
  },

  // Tabs
  tabScroll: { maxHeight: 52 },
  tabContent: { paddingHorizontal: 20, gap: 10, alignItems: 'center', paddingVertical: 8 },
  tabPill: {
    paddingHorizontal: 20, paddingVertical: 8,
    borderRadius: 20, backgroundColor: '#F5F5F5',
  },
  tabPillActive: { backgroundColor: Colors.primary },
  tabText: { fontFamily: Fonts.medium, fontSize: 14, color: Colors.textGray },
  tabTextActive: { color: Colors.white },

  // Search + filter
  searchRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 20, paddingTop: 14, paddingBottom: 10,
  },
  searchBar: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#F5F5F5', borderRadius: 12,
    paddingHorizontal: 14, height: 44,
  },
  searchInput: { flex: 1, fontFamily: Fonts.regular, fontSize: 14, color: Colors.textDark },
  filterBtn: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center',
  },

  // List
  listContent: { paddingHorizontal: 20, paddingTop: 10 },
  listItem: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingVertical: 14, backgroundColor: Colors.white,
  },
  separator: { height: 1, backgroundColor: '#F0F0F0', marginLeft: 68 },
  itemIconBox: {
    width: 48, height: 48, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  itemContent: { flex: 1 },
  itemTitle: { fontFamily: Fonts.semiBold, fontSize: 15, color: Colors.textDark, marginBottom: 4 },
  itemMeta: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.textGray },
  menuBtn: { padding: 4 },

  // Empty state
  emptyWrap: {
    flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 100, gap: 12,
  },
  emptyRobotCircle: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: '#FFF3E8',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 8,
  },
  emptyEmoji: { fontSize: 52 },
  emptyTitle: { fontFamily: Fonts.bold, fontSize: 20, color: Colors.textDark },
  emptySub: {
    fontFamily: Fonts.regular, fontSize: 14, color: Colors.textGray,
    textAlign: 'center', lineHeight: 22,
  },

  // Context menu modal
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end', paddingBottom: 32,
  },
  menuSheet: {
    marginHorizontal: 16, backgroundColor: Colors.white,
    borderRadius: 20, overflow: 'hidden', ...Shadow.medium,
  },
  menuOption: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingHorizontal: 20, paddingVertical: 16,
  },
  menuOptionBorder: { borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  menuOptionText: { fontFamily: Fonts.medium, fontSize: 15 },
});
