import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Badge, ProgressBar } from '../components/UI';
import { Skeleton, CardSkeleton } from '../components/Skeleton';
import { Colors, Fonts, BorderRadius, Shadow } from '../theme';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type RouteProps = RouteProp<RootStackParamList, 'AISummary'>;

const placeholderSummary = `📌 Key Points:

1. **Definition**: A clear and concise definition of the main concept with its core components.

2. **How it works**: Step-by-step breakdown of the process or mechanism, using simple language and analogies.

3. **Examples**: Real-world applications and examples that illustrate the concept in action.

4. **Why it matters**: The significance and relevance to your studies and the real world.

5. **Quick tip**: A memory trick or mnemonic to help you remember the key facts for your exam.`;

export const AISummaryScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteProps>();
  const [inputText, setInputText] = useState(route.params?.text || '');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [wordCount, setWordCount] = useState(0);

  const generateSummary = () => {
    if (!inputText.trim()) return;
    setLoading(true);
    setSummary('');
    setTimeout(() => {
      setSummary(placeholderSummary);
      setWordCount(Math.floor(Math.random() * 80) + 120);
      setLoading(false);
    }, 2000);
  };

  const copySummary = async () => {
    await Clipboard.setStringAsync(summary);
    Alert.alert('Copied!', 'Summary copied to clipboard.');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <LinearGradient
        colors={['#4CAF50', '#66BB6A']}
        style={[styles.header, { paddingTop: insets.top + 12 }]}
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color={Colors.white} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.headerTitle}>AI Summary</Text>
          <Text style={styles.headerSub}>Turn any text into clear notes</Text>
        </View>
        <View style={styles.headerIconBox}>
          <Ionicons name="document-text" size={22} color={Colors.white} />
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Input Card */}
        <Card style={styles.inputCard}>
          <Text style={styles.label}>Paste your text or topic</Text>
          <Input
            placeholder="e.g. Paste a paragraph, chapter, or just type a topic like 'Photosynthesis'..."
            value={inputText}
            onChangeText={setInputText}
            multiline
            numberOfLines={6}
            style={styles.textArea}
          />
          <View style={styles.inputFooter}>
            <Text style={styles.charCount}>{inputText.length} characters</Text>
            <TouchableOpacity onPress={() => setInputText('')}>
              <Text style={styles.clearText}>Clear</Text>
            </TouchableOpacity>
          </View>
          <Button
            title={loading ? 'Generating...' : 'Generate Summary ✨'}
            onPress={generateSummary}
            loading={loading}
            disabled={!inputText.trim()}
          />
        </Card>

        {/* Loading skeleton */}
        {loading && (
          <View style={{ marginTop: 4, gap: 12 }}>
            <CardSkeleton />
          </View>
        )}

        {/* Summary Result */}
        {!loading && summary ? (
          <Card style={styles.resultCard}>
            {/* Result header */}
            <View style={styles.resultHeader}>
              <View style={styles.resultHeaderLeft}>
                <View style={styles.aiIconBox}>
                  <Ionicons name="sparkles" size={18} color={Colors.success} />
                </View>
                <Text style={styles.resultTitle}>AI Summary</Text>
              </View>
              <Badge label={`~${wordCount} words`} bgColor={Colors.successLight} color={Colors.success} size="sm" />
            </View>

            {/* Summary text */}
            <Text style={styles.summaryText}>{summary}</Text>

            {/* Actions */}
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.actionBtn} onPress={copySummary}>
                <Ionicons name="copy-outline" size={16} color={Colors.primary} />
                <Text style={styles.actionText}>Copy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn}>
                <Ionicons name="bookmark-outline" size={16} color={Colors.primary} />
                <Text style={styles.actionText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn}>
                <Ionicons name="share-outline" size={16} color={Colors.primary} />
                <Text style={styles.actionText}>Share</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, styles.quizActionBtn]}
                onPress={() => navigation.navigate('QuizGenerator')}
              >
                <Ionicons name="trophy-outline" size={16} color={Colors.white} />
                <Text style={[styles.actionText, { color: Colors.white }]}>Make Quiz</Text>
              </TouchableOpacity>
            </View>
          </Card>
        ) : null}

        {/* Tips */}
        {!summary && !loading && (
          <View style={styles.tipsContainer}>
            <Text style={styles.tipsTitle}>What can you summarize?</Text>
            {[
              { icon: '📄', title: 'Textbook passages', desc: 'Paste any paragraph or chapter' },
              { icon: '💡', title: 'Topics', desc: 'Just type "Explain photosynthesis"' },
              { icon: '📝', title: 'Your notes', desc: 'Paste messy notes, get clean summaries' },
              { icon: '🔗', title: 'Concepts', desc: 'Ask for key points on any subject' },
            ].map((tip, i) => (
              <View key={i} style={styles.tipItem}>
                <Text style={styles.tipEmoji}>{tip.icon}</Text>
                <View>
                  <Text style={styles.tipTitle}>{tip.title}</Text>
                  <Text style={styles.tipDesc}>{tip.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 20 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontFamily: Fonts.bold, fontSize: 18, color: Colors.white },
  headerSub: { fontFamily: Fonts.regular, fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  headerIconBox: { width: 42, height: 42, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  scrollContent: { padding: 20, gap: 16 },
  label: { fontFamily: Fonts.semiBold, fontSize: 15, color: Colors.textDark, marginBottom: 10 },
  inputCard: {},
  textArea: { minHeight: 120 },
  inputFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  charCount: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.textLight },
  clearText: { fontFamily: Fonts.medium, fontSize: 13, color: Colors.danger },
  resultCard: { borderWidth: 1, borderColor: Colors.successLight },
  resultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  resultHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  aiIconBox: { width: 34, height: 34, borderRadius: 10, backgroundColor: Colors.successLight, alignItems: 'center', justifyContent: 'center' },
  resultTitle: { fontFamily: Fonts.bold, fontSize: 16, color: Colors.textDark },
  summaryText: { fontFamily: Fonts.regular, fontSize: 14, color: Colors.textDark, lineHeight: 24, marginBottom: 16 },
  actionRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.primaryLight,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  quizActionBtn: { backgroundColor: Colors.primary },
  actionText: { fontFamily: Fonts.semiBold, fontSize: 13, color: Colors.primary },
  tipsContainer: { backgroundColor: Colors.white, borderRadius: 20, padding: 20, gap: 14, ...Shadow.small },
  tipsTitle: { fontFamily: Fonts.bold, fontSize: 16, color: Colors.textDark, marginBottom: 4 },
  tipItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  tipEmoji: { fontSize: 24, width: 36, textAlign: 'center' },
  tipTitle: { fontFamily: Fonts.semiBold, fontSize: 14, color: Colors.textDark },
  tipDesc: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.textGray, marginTop: 2 },
});
