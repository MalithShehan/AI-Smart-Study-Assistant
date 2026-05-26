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
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as DocumentPicker from 'expo-document-picker';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { RootStackParamList } from '../types';
import { GlassCard } from '../components/GlassCard';
import { Badge } from '../components/UI';
import { useHaptics } from '../hooks/useHaptics';
import { apiGet, apiPost, apiDelete } from '../api/client';
import { Colors, Fonts, BorderRadius, Shadow } from '../theme';

type Nav = NativeStackNavigationProp<RootStackParamList>;

interface PastPaper {
  _id: string;
  title: string;
  subject: string;
  year: number;
  examBoard: string;
  level: string;
  paperType: string;
  file: {
    url: string;
    filename: string;
    size: number;
    format: string;
  };
  tags: string[];
  isFavourite: boolean;
  downloadCount: number;
  createdAt: string;
}

interface PaperStats {
  totalPapers: number;
  totalDownloads: number;
  subjects: string[];
  favourites: number;
}

export const PastPaperScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const haptics = useHaptics();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [papers, setPapers] = useState<PastPaper[]>([]);
  const [stats, setStats] = useState<PaperStats | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadData();
  }, [selectedSubject]);

  const loadData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const params = selectedSubject ? `?subject=${selectedSubject}` : '';
      const [papersRes, statsRes] = await Promise.all([
        apiGet(`/papers${params}`),
        apiGet('/papers/stats/summary'),
      ]);

      if (papersRes.success) {
        setPapers(papersRes.data.papers);
      }

      if (statsRes.success) {
        setStats(statsRes.data.summary);
      }
    } catch (error) {
      console.error('Failed to load past papers:', error);
      Alert.alert('Error', 'Failed to load past papers');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleUploadPaper = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      haptics.medium();

      // Show upload form (simplified for now)
      Alert.prompt(
        'Upload Past Paper',
        'Enter paper title',
        async (title) => {
          if (!title) return;

          setUploading(true);

          const formData = new FormData();
          formData.append('file', {
            uri: result.assets[0].uri,
            name: result.assets[0].name,
            type: 'application/pdf',
          } as any);
          formData.append('title', title);
          formData.append('subject', selectedSubject || 'General');
          formData.append('year', new Date().getFullYear().toString());
          formData.append('level', 'a-level');

          try {
            const uploadRes = await apiPost('/papers', formData, {
              headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (uploadRes.success) {
              haptics.success();
              Alert.alert('Success', 'Past paper uploaded successfully');
              loadData();
            }
          } catch (error) {
            haptics.error();
            Alert.alert('Error', 'Failed to upload past paper');
          } finally {
            setUploading(false);
          }
        }
      );
    } catch (error) {
      console.error('Document picker error:', error);
    }
  };

  const handleDownload = async (paper: PastPaper) => {
    try {
      haptics.light();

      // Call download endpoint to increment count
      await apiPost(`/papers/${paper._id}/download`, {});

      // Open PDF in browser
      await Linking.openURL(paper.file.url);
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('Error', 'Failed to download past paper');
    }
  };

  const handleToggleFavourite = async (paper: PastPaper) => {
    try {
      haptics.light();

      const updatedPaper = await apiPost(`/papers/${paper._id}`, {
        isFavourite: !paper.isFavourite,
      });

      if (updatedPaper.success) {
        loadData();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update favourite');
    }
  };

  const handleDelete = async (paperId: string) => {
    Alert.alert('Delete Past Paper', 'Are you sure you want to delete this paper?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            haptics.medium();
            await apiDelete(`/papers/${paperId}`);
            haptics.success();
            loadData();
          } catch (error) {
            haptics.error();
            Alert.alert('Error', 'Failed to delete past paper');
          }
        },
      },
    ]);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#10b981', '#059669']}
          style={[styles.header, { paddingTop: insets.top + 12 }]}
        >
          <Text style={styles.headerTitle}>Past Papers</Text>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <LinearGradient
        colors={['#10b981', '#059669']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>📚 Past Papers</Text>
        <Text style={styles.headerSub}>Your study resources</Text>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadData(true)} />}
      >
        {/* Stats Card */}
        {stats && (
          <Animated.View entering={FadeInDown.delay(100).springify()}>
            <GlassCard style={styles.statsCard}>
              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{stats.totalPapers}</Text>
                  <Text style={styles.statLabel}>Papers</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{stats.totalDownloads}</Text>
                  <Text style={styles.statLabel}>Downloads</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{stats.subjects.length}</Text>
                  <Text style={styles.statLabel}>Subjects</Text>
                </View>
              </View>
            </GlassCard>
          </Animated.View>
        )}

        {/* Subject Filters */}
        {stats && stats.subjects.length > 0 && (
          <Animated.View entering={FadeInUp.delay(200).springify()} style={styles.filtersSection}>
            <Text style={styles.sectionTitle}>Filter by Subject</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  !selectedSubject && styles.filterChipActive,
                ]}
                onPress={() => {
                  setSelectedSubject(null);
                  haptics.selection();
                }}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    !selectedSubject && styles.filterChipTextActive,
                  ]}
                >
                  All
                </Text>
              </TouchableOpacity>
              {stats.subjects.map((subject) => (
                <TouchableOpacity
                  key={subject}
                  style={[
                    styles.filterChip,
                    selectedSubject === subject && styles.filterChipActive,
                  ]}
                  onPress={() => {
                    setSelectedSubject(subject);
                    haptics.selection();
                  }}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      selectedSubject === subject && styles.filterChipTextActive,
                    ]}
                  >
                    {subject}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Animated.View>
        )}

        {/* Upload Button */}
        <Animated.View entering={FadeInUp.delay(300).springify()}>
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={handleUploadPaper}
            disabled={uploading}
          >
            <LinearGradient colors={['#3b82f6', '#1e40af']} style={styles.uploadButtonGradient}>
              {uploading ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <>
                  <Ionicons name="cloud-upload-outline" size={20} color={Colors.white} />
                  <Text style={styles.uploadButtonText}>Upload Past Paper</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Papers List */}
        <View style={styles.papersList}>
          {papers.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="document-outline" size={64} color={Colors.textLight} />
              <Text style={styles.emptyStateText}>No past papers yet</Text>
              <Text style={styles.emptyStateSubtext}>Upload your first past paper to get started</Text>
            </View>
          ) : (
            papers.map((paper, index) => (
              <Animated.View
                key={paper._id}
                entering={FadeInUp.delay(400 + index * 50).springify()}
              >
                <GlassCard style={styles.paperCard}>
                  <View style={styles.paperHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.paperTitle}>{paper.title}</Text>
                      <View style={styles.paperMeta}>
                        <Badge
                          label={paper.subject}
                          bgColor={Colors.primaryLight}
                          color={Colors.primary}
                          size="sm"
                        />
                        <Text style={styles.paperYear}>{paper.year}</Text>
                        <Text style={styles.paperLevel}>{paper.level}</Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleToggleFavourite(paper)}
                      style={styles.favouriteBtn}
                    >
                      <Ionicons
                        name={paper.isFavourite ? 'star' : 'star-outline'}
                        size={24}
                        color={paper.isFavourite ? Colors.warning : Colors.textLight}
                      />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.paperFooter}>
                    <View style={styles.paperInfo}>
                      <Ionicons name="document-text-outline" size={16} color={Colors.textLight} />
                      <Text style={styles.paperInfoText}>
                        {formatFileSize(paper.file.size)}
                      </Text>
                      <Ionicons name="download-outline" size={16} color={Colors.textLight} style={{ marginLeft: 12 }} />
                      <Text style={styles.paperInfoText}>{paper.downloadCount}</Text>
                    </View>
                    <View style={styles.paperActions}>
                      <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => handleDownload(paper)}
                      >
                        <Ionicons name="download" size={18} color={Colors.primary} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => handleDelete(paper._id)}
                      >
                        <Ionicons name="trash-outline" size={18} color={Colors.danger} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </GlassCard>
              </Animated.View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: 20, paddingVertical: 20 },
  headerTitle: { fontSize: 28, fontFamily: Fonts.bold, color: Colors.white },
  headerSub: { fontSize: 14, fontFamily: Fonts.regular, color: 'rgba(255,255,255,0.9)', marginTop: 4 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scrollContent: { padding: 16 },
  statsCard: { marginBottom: 16, padding: 16 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  statBox: { alignItems: 'center' },
  statValue: { fontSize: 24, fontFamily: Fonts.bold, color: Colors.text },
  statLabel: { fontSize: 12, fontFamily: Fonts.regular, color: Colors.textLight, marginTop: 4 },
  filtersSection: { marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontFamily: Fonts.semiBold, color: Colors.text, marginBottom: 12 },
  filterScroll: { flexDirection: 'row' },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.white,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterChipText: { fontSize: 14, fontFamily: Fonts.medium, color: Colors.text },
  filterChipTextActive: { color: Colors.white },
  uploadButton: { marginBottom: 16, borderRadius: BorderRadius.md, overflow: 'hidden' },
  uploadButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  uploadButtonText: { fontSize: 16, fontFamily: Fonts.semiBold, color: Colors.white },
  papersList: { gap: 12 },
  paperCard: { padding: 16 },
  paperHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  paperTitle: { fontSize: 16, fontFamily: Fonts.semiBold, color: Colors.text, marginBottom: 8 },
  paperMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  paperYear: { fontSize: 12, fontFamily: Fonts.regular, color: Colors.textLight },
  paperLevel: { fontSize: 12, fontFamily: Fonts.regular, color: Colors.textLight, textTransform: 'uppercase' },
  favouriteBtn: { padding: 4 },
  paperFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  paperInfo: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  paperInfoText: { fontSize: 12, fontFamily: Fonts.regular, color: Colors.textLight },
  paperActions: { flexDirection: 'row', gap: 8 },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: { alignItems: 'center', paddingVertical: 48 },
  emptyStateText: { fontSize: 18, fontFamily: Fonts.semiBold, color: Colors.textLight, marginTop: 16 },
  emptyStateSubtext: { fontSize: 14, fontFamily: Fonts.regular, color: Colors.textLight, marginTop: 8, textAlign: 'center' },
});
