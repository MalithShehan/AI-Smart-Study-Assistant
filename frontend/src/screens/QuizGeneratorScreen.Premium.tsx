import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, QuizQuestion } from '../types';
import { Colors, Fonts, Shadow } from '../theme';
import { useHaptics } from '../hooks/useHaptics';
import { PremiumButton, GradientCard, ProgressRing } from '../components/PremiumUI';
import { apiPost } from '../api/client';

const { width, height } = Dimensions.get('window');
type Nav = NativeStackNavigationProp<RootStackParamList>;

const topics = [
  { label: 'Mathematics', icon: 'calculator-outline', color: '#FF7A00' },
  { label: 'Physics', icon: 'planet-outline', color: '#06B6D4' },
  { label: 'Chemistry', icon: 'flask-outline', color: '#8B5CF6' },
  { label: 'Biology', icon: 'leaf-outline', color: '#4CAF50' },
  { label: 'History', icon: 'time-outline', color: '#F59E0B' },
  { label: 'Geography', icon: 'earth-outline', color: '#3B82F6' },
];

const difficulties = [
  { label: 'Easy', value: 'easy', color: '#4CAF50', emoji: '😊' },
  { label: 'Medium', value: 'medium', color: '#F59E0B', emoji: '🤔' },
  { label: 'Hard', value: 'hard', color: '#EF4444', emoji: '🔥' },
];

type Mode = 'setup' | 'quiz' | 'results';

export const QuizGeneratorScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const haptics = useHaptics();

  const [mode, setMode] = useState<Mode>('setup');
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [questionCount, setQuestionCount] = useState(5);
  const [generating, setGenerating] = useState(false);

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 40,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, [mode]);

  const generateQuiz = async () => {
    if (!topic) {
      Alert.alert('Select Topic', 'Please select a topic for your quiz');
      haptics.warning();
      return;
    }

    setGenerating(true);
    haptics.medium();

    try {
      const res = await apiPost('/ai/quiz', {
        topic,
        difficulty,
        count: questionCount,
      });

      if (res.data?.questions && res.data.questions.length > 0) {
        setQuestions(res.data.questions);
        setStartTime(Date.now());
        setMode('quiz');
        haptics.success();
      } else {
        throw new Error('No questions generated');
      }
    } catch (error: any) {
      Alert.alert('Generation Failed', error.message || 'Could not generate quiz. Please try again.');
      haptics.error();
    } finally {
      setGenerating(false);
    }
  };

  const handleAnswer = (index: number) => {
    if (selectedAnswer !== null) return;

    setSelectedAnswer(index);
    setShowExplanation(true);

    if (index === currentQuestion.correct) {
      haptics.success();
    } else {
      haptics.error();
    }
  };

  const handleNext = () => {
    if (selectedAnswer === null) {
      Alert.alert('Select Answer', 'Please select an answer before continuing');
      haptics.warning();
      return;
    }

    const newAnswers = [...answers, selectedAnswer];
    setAnswers(newAnswers);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
      haptics.light();
    } else {
      // Quiz completed
      const timeTaken = Math.floor((Date.now() - startTime) / 1000);
      haptics.success();
      navigation.navigate('QuizResult', {
        quizId: 'temp_' + Date.now(),
        timeTaken,
      });
    }
  };

  const currentQuestion = questions[currentIndex];
  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  // ═══════════════════════════════════════════════════════════════
  // SETUP MODE
  // ═══════════════════════════════════════════════════════════════
  if (mode === 'setup') {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <LinearGradient colors={['#8B5CF6', '#A78BFA']} style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => {
              haptics.light();
              navigation.goBack();
            }}
          >
            <Ionicons name="arrow-back" size={20} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>AI Quiz Generator</Text>
          <View style={{ width: 40 }} />
        </LinearGradient>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <GradientCard colors={['#FF7A00', '#FFB84D']} style={{ marginBottom: 24 }}>
              <View style={{ alignItems: 'center', gap: 12 }}>
                <Text style={{ fontSize: 48 }}>✨</Text>
                <Text style={styles.aiCardTitle}>Generate Smart Quizzes</Text>
                <Text style={styles.aiCardSubtitle}>
                  AI-powered quiz generation tailored to your learning needs
                </Text>
              </View>
            </GradientCard>

            {/* Topic Selection */}
            <Text style={styles.sectionTitle}>Select Topic</Text>
            <View style={styles.topicGrid}>
              {topics.map((t) => (
                <TouchableOpacity
                  key={t.label}
                  style={[
                    styles.topicCard,
                    topic === t.label && styles.topicCardSelected,
                    { borderColor: t.color },
                  ]}
                  onPress={() => {
                    setTopic(t.label);
                    haptics.light();
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={t.icon as any}
                    size={28}
                    color={topic === t.label ? Colors.white : t.color}
                  />
                  <Text
                    style={[
                      styles.topicLabel,
                      topic === t.label && { color: Colors.white },
                    ]}
                  >
                    {t.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Difficulty Selection */}
            <Text style={styles.sectionTitle}>Select Difficulty</Text>
            <View style={styles.difficultyRow}>
              {difficulties.map((d) => (
                <TouchableOpacity
                  key={d.value}
                  style={[
                    styles.difficultyCard,
                    difficulty === d.value && [
                      styles.difficultyCardSelected,
                      { borderColor: d.color, backgroundColor: d.color },
                    ],
                  ]}
                  onPress={() => {
                    setDifficulty(d.value);
                    haptics.light();
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={{ fontSize: 24, marginBottom: 4 }}>{d.emoji}</Text>
                  <Text
                    style={[
                      styles.difficultyLabel,
                      difficulty === d.value && { color: Colors.white },
                    ]}
                  >
                    {d.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Question Count */}
            <Text style={styles.sectionTitle}>Number of Questions</Text>
            <View style={styles.countRow}>
              {[5, 10, 15, 20].map((count) => (
                <TouchableOpacity
                  key={count}
                  style={[
                    styles.countBtn,
                    questionCount === count && styles.countBtnSelected,
                  ]}
                  onPress={() => {
                    setQuestionCount(count);
                    haptics.selection();
                  }}
                >
                  <Text
                    style={[
                      styles.countText,
                      questionCount === count && styles.countTextSelected,
                    ]}
                  >
                    {count}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Generate Button */}
            <PremiumButton
              label={generating ? 'Generating Quiz...' : 'Generate Quiz'}
              onPress={generateQuiz}
              variant="primary"
              size="lg"
              loading={generating}
              style={{ marginTop: 32 }}
            />
          </Animated.View>
        </ScrollView>
      </View>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // QUIZ MODE
  // ═══════════════════════════════════════════════════════════════
  if (mode === 'quiz' && currentQuestion) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <LinearGradient colors={['#8B5CF6', '#A78BFA']} style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => {
              Alert.alert(
                'Exit Quiz',
                'Are you sure you want to exit? Your progress will be lost.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Exit',
                    style: 'destructive',
                    onPress: () => {
                      setMode('setup');
                      setCurrentIndex(0);
                      setAnswers([]);
                      setQuestions([]);
                      haptics.light();
                    },
                  },
                ]
              );
            }}
          >
            <Ionicons name="close" size={20} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            Question {currentIndex + 1}/{questions.length}
          </Text>
          <View style={{ width: 40 }} />
        </LinearGradient>

        {/* Progress Bar */}
        <View style={styles.progressBar}>
          <Animated.View
            style={[
              styles.progressFill,
              { width: `${progress}%`, backgroundColor: '#8B5CF6' },
            ]}
          />
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
        >
          <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
            {/* Question Card */}
            <GradientCard
              colors={['#8B5CF6', '#A78BFA']}
              style={{ marginBottom: 24 }}
            >
              <Text style={styles.questionText}>{currentQuestion.question}</Text>
            </GradientCard>

            {/* Options */}
            <View style={{ gap: 12 }}>
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedAnswer === index;
                const isCorrect = index === currentQuestion.correct;
                const showResult = selectedAnswer !== null;

                let borderColor = Colors.border;
                let bgColor = Colors.white;
                let icon: React.ComponentProps<typeof Ionicons>['name'] | null = null;

                if (showResult) {
                  if (isCorrect) {
                    borderColor = '#4CAF50';
                    bgColor = '#E8F5E9';
                    icon = 'checkmark-circle';
                  } else if (isSelected) {
                    borderColor = '#EF4444';
                    bgColor = '#FFEBEE';
                    icon = 'close-circle';
                  }
                }

                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.optionCard,
                      { borderColor, backgroundColor: bgColor },
                      isSelected && styles.optionCardSelected,
                    ]}
                    onPress={() => handleAnswer(index)}
                    disabled={selectedAnswer !== null}
                    activeOpacity={0.7}
                  >
                    <View style={styles.optionLeft}>
                      <View
                        style={[
                          styles.optionCircle,
                          { borderColor },
                          isSelected && { backgroundColor: borderColor },
                        ]}
                      >
                        {isSelected && !showResult && (
                          <View style={styles.optionCircleInner} />
                        )}
                      </View>
                      <Text
                        style={[
                          styles.optionText,
                          showResult && isCorrect && { color: '#4CAF50' },
                          showResult && isSelected && !isCorrect && { color: '#EF4444' },
                        ]}
                      >
                        {option}
                      </Text>
                    </View>
                    {showResult && icon && (
                      <Ionicons name={icon} size={24} color={borderColor} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Explanation */}
            {showExplanation && currentQuestion.explanation && (
              <Animated.View
                style={[
                  styles.explanationCard,
                  { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
                ]}
              >
                <View style={styles.explanationHeader}>
                  <Ionicons name="information-circle" size={20} color="#06B6D4" />
                  <Text style={styles.explanationTitle}>Explanation</Text>
                </View>
                <Text style={styles.explanationText}>{currentQuestion.explanation}</Text>
              </Animated.View>
            )}

            {/* Next Button */}
            {selectedAnswer !== null && (
              <PremiumButton
                label={
                  currentIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'
                }
                onPress={handleNext}
                variant="primary"
                size="lg"
                style={{ marginTop: 24 }}
              />
            )}
          </Animated.View>
        </ScrollView>
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    ...Shadow.medium,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: Fonts.bold,
    fontSize: 18,
    color: Colors.white,
  },
  scrollContent: { padding: 20 },

  // AI Card
  aiCardTitle: {
    fontFamily: Fonts.bold,
    fontSize: 20,
    color: Colors.white,
    textAlign: 'center',
  },
  aiCardSubtitle: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 20,
  },

  // Section
  sectionTitle: {
    fontFamily: Fonts.bold,
    fontSize: 16,
    color: Colors.textDark,
    marginBottom: 12,
    marginTop: 8,
  },

  // Topics
  topicGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  topicCard: {
    width: (width - 40 - 24) / 3,
    aspectRatio: 1,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.white,
  },
  topicCardSelected: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  topicLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: 12,
    color: Colors.textDark,
  },

  // Difficulty
  difficultyRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  difficultyCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.border,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  difficultyCardSelected: {},
  difficultyLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: 13,
    color: Colors.textDark,
  },

  // Count
  countRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  countBtn: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
  },
  countBtnSelected: {
    borderColor: '#8B5CF6',
    backgroundColor: '#F3F0FF',
  },
  countText: {
    fontFamily: Fonts.semiBold,
    fontSize: 16,
    color: Colors.textGray,
  },
  countTextSelected: {
    color: '#8B5CF6',
  },

  // Quiz
  progressBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
  },
  progressFill: {
    height: '100%',
  },
  questionText: {
    fontFamily: Fonts.semiBold,
    fontSize: 18,
    color: Colors.white,
    lineHeight: 26,
  },

  // Options
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 14,
    borderWidth: 2,
    ...Shadow.small,
  },
  optionCardSelected: {},
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  optionCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionCircleInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.white,
  },
  optionText: {
    fontFamily: Fonts.medium,
    fontSize: 15,
    color: Colors.textDark,
    flex: 1,
  },

  // Explanation
  explanationCard: {
    marginTop: 20,
    padding: 16,
    borderRadius: 14,
    backgroundColor: '#E0F7FA',
    borderWidth: 1,
    borderColor: '#06B6D4',
  },
  explanationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  explanationTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: '#06B6D4',
  },
  explanationText: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.textDark,
    lineHeight: 20,
  },
});
