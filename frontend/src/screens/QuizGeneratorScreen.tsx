import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, QuizQuestion } from '../types';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';
import { Badge, ProgressBar } from '../components/UI';
import { Colors, Fonts, BorderRadius, Shadow } from '../theme';

const { width } = Dimensions.get('window');
type Nav = NativeStackNavigationProp<RootStackParamList>;

const sampleQuestions: QuizQuestion[] = [
  {
    id: '1',
    question: 'What is the derivative of sin(x)?',
    options: ['cos(x)', '-cos(x)', '-sin(x)', 'tan(x)'],
    correct: 0,
    explanation: 'The derivative of sin(x) is cos(x). This is one of the fundamental trigonometric derivatives.',
  },
  {
    id: '2',
    question: 'Which of the following is Newton\'s Second Law?',
    options: ['F = ma', 'E = mc²', 'PV = nRT', 'F = -kx'],
    correct: 0,
    explanation: 'Newton\'s Second Law states F = ma, where F is force, m is mass, and a is acceleration.',
  },
  {
    id: '3',
    question: 'What is the powerhouse of the cell?',
    options: ['Nucleus', 'Ribosome', 'Mitochondria', 'Golgi Apparatus'],
    correct: 2,
    explanation: 'The mitochondria is often called the "powerhouse of the cell" because it produces ATP energy.',
  },
  {
    id: '4',
    question: 'What is the chemical formula for water?',
    options: ['CO₂', 'H₂O', 'O₂', 'NaCl'],
    correct: 1,
    explanation: 'Water is made of two hydrogen atoms and one oxygen atom: H₂O.',
  },
];

const topics = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'History', 'Geography'];

type Mode = 'setup' | 'quiz' | 'results';

export const QuizGeneratorScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const [mode, setMode] = useState<Mode>('setup');
  const [topic, setTopic] = useState('');
  const [questions] = useState<QuizQuestion[]>(sampleQuestions);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);

  const currentQuestion = questions[currentIndex];
  const progress = (currentIndex + 1) / questions.length;
  const score = answers.filter((a, i) => a === questions[i]?.correct).length;

  const handleAnswer = (index: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(index);
    setShowExplanation(true);
  };

  const handleNext = () => {
    setAnswers((prev) => [...prev, selectedAnswer ?? -1]);
    setSelectedAnswer(null);
    setShowExplanation(false);
    if (currentIndex + 1 >= questions.length) {
      setMode('results');
    } else {
      setCurrentIndex((i) => i + 1);
    }
  };

  const handleRestart = () => {
    setMode('setup');
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setAnswers([]);
    setShowExplanation(false);
  };

  const getOptionStyle = (index: number) => {
    if (selectedAnswer === null) return styles.optionDefault;
    if (index === currentQuestion.correct) return styles.optionCorrect;
    if (index === selectedAnswer && selectedAnswer !== currentQuestion.correct) return styles.optionWrong;
    return styles.optionDefault;
  };

  const getOptionTextStyle = (index: number) => {
    if (selectedAnswer === null) return styles.optionTextDefault;
    if (index === currentQuestion.correct) return styles.optionTextCorrect;
    if (index === selectedAnswer && selectedAnswer !== currentQuestion.correct) return styles.optionTextWrong;
    return styles.optionTextDefault;
  };

  if (mode === 'results') {
    const percent = Math.round((score / questions.length) * 100);
    const grade = percent >= 90 ? 'Excellent!' : percent >= 70 ? 'Good Job!' : percent >= 50 ? 'Keep Going!' : 'Try Again!';
    const gradeColor = percent >= 90 ? Colors.success : percent >= 70 ? Colors.primary : percent >= 50 ? Colors.warning : Colors.danger;
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#FF7A00', '#FF9A3C']} style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={20} color={Colors.white} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { marginLeft: 12 }]}>Quiz Results</Text>
        </LinearGradient>
        <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}>
          <View style={styles.resultCircleContainer}>
            <View style={[styles.resultCircle, { borderColor: gradeColor }]}>
              <Text style={[styles.resultScore, { color: gradeColor }]}>{percent}%</Text>
              <Text style={styles.resultFraction}>{score}/{questions.length}</Text>
            </View>
            <Text style={[styles.resultGrade, { color: gradeColor }]}>{grade}</Text>
            <Text style={styles.resultSub}>You answered {score} out of {questions.length} questions correctly.</Text>
          </View>

          {questions.map((q, i) => (
            <View key={i} style={[styles.reviewItem, { borderLeftColor: answers[i] === q.correct ? Colors.success : Colors.danger }]}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewQ}>Q{i + 1}. {q.question}</Text>
                <Ionicons
                  name={answers[i] === q.correct ? 'checkmark-circle' : 'close-circle'}
                  size={22}
                  color={answers[i] === q.correct ? Colors.success : Colors.danger}
                />
              </View>
              <Text style={styles.reviewAnswer}>Correct: {q.options[q.correct]}</Text>
            </View>
          ))}

          <View style={styles.resultActions}>
            <Button title="Try Again" onPress={handleRestart} variant="outline" />
            <Button title="New Quiz" onPress={() => { handleRestart(); setTopic(''); }} />
          </View>
        </ScrollView>
      </View>
    );
  }

  if (mode === 'quiz') {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#FF7A00', '#FF9A3C']} style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <TouchableOpacity style={styles.backBtn} onPress={handleRestart}>
            <Ionicons name="close" size={20} color={Colors.white} />
          </TouchableOpacity>
          <View style={{ flex: 1, marginHorizontal: 16 }}>
            <View style={styles.progressInfo}>
              <Text style={styles.progressLabel}>{currentIndex + 1} of {questions.length}</Text>
              <Badge label={`${Math.round(progress * 100)}%`} bgColor="rgba(255,255,255,0.25)" color={Colors.white} size="sm" />
            </View>
            <ProgressBar progress={progress} color={Colors.white} height={5} />
          </View>
          <View style={styles.timerBadge}>
            <Ionicons name="time-outline" size={14} color={Colors.white} />
            <Text style={styles.timerText}>2:30</Text>
          </View>
        </LinearGradient>

        <ScrollView contentContainerStyle={[styles.quizContent, { paddingBottom: insets.bottom + 24 }]}>
          <Badge label={topic || 'General'} bgColor={Colors.primaryLight} color={Colors.primary} size="sm" />
          <Text style={styles.questionText}>{currentQuestion.question}</Text>

          <View style={styles.optionsContainer}>
            {currentQuestion.options.map((opt, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.optionBtn, getOptionStyle(i)]}
                onPress={() => handleAnswer(i)}
                activeOpacity={0.85}
              >
                <View style={[styles.optionLetter, getOptionStyle(i)]}>
                  <Text style={[styles.optionLetterText, getOptionTextStyle(i)]}>
                    {String.fromCharCode(65 + i)}
                  </Text>
                </View>
                <Text style={[styles.optionText, getOptionTextStyle(i)]}>{opt}</Text>
                {selectedAnswer !== null && i === currentQuestion.correct && (
                  <Ionicons name="checkmark-circle" size={20} color={Colors.success} style={{ marginLeft: 'auto' }} />
                )}
                {selectedAnswer !== null && i === selectedAnswer && selectedAnswer !== currentQuestion.correct && (
                  <Ionicons name="close-circle" size={20} color={Colors.danger} style={{ marginLeft: 'auto' }} />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {showExplanation && currentQuestion.explanation && (
            <Card style={styles.explanationCard}>
              <View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-start' }}>
                <Ionicons name="bulb" size={20} color={Colors.warning} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.explanationTitle}>Explanation</Text>
                  <Text style={styles.explanationText}>{currentQuestion.explanation}</Text>
                </View>
              </View>
            </Card>
          )}

          {selectedAnswer !== null && (
            <Button title={currentIndex + 1 < questions.length ? 'Next Question →' : 'See Results'} onPress={handleNext} />
          )}
        </ScrollView>
      </View>
    );
  }

  // Setup screen
  return (
    <View style={styles.container}>
      <LinearGradient colors={['#FF7A00', '#FF9A3C']} style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color={Colors.white} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.headerTitle}>Quiz Generator</Text>
          <Text style={styles.headerSub}>Test your knowledge with AI</Text>
        </View>
        <View style={styles.headerIconBox}>
          <Ionicons name="trophy" size={22} color={Colors.white} />
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <Card>
          <Text style={styles.setupLabel}>Topic or Subject</Text>
          <Input
            placeholder="e.g. Calculus, Newton's Laws, Cell Biology..."
            value={topic}
            onChangeText={setTopic}
            icon="search-outline"
          />
          <Text style={styles.setupLabel}>Quick Select</Text>
          <View style={styles.topicsGrid}>
            {topics.map((t, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.topicChip, topic === t && styles.topicChipActive]}
                onPress={() => setTopic(t)}
              >
                <Text style={[styles.topicChipText, topic === t && styles.topicChipTextActive]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Button
            title="Start Quiz 🚀"
            onPress={() => setMode('quiz')}
            disabled={!topic.trim()}
          />
        </Card>

        {/* Stats */}
        <Card style={styles.statsCard}>
          <Text style={styles.statsTitle}>Your Quiz Stats</Text>
          <View style={styles.statsRow}>
            {[
              { value: '48', label: 'Quizzes Taken', icon: 'trophy-outline', color: Colors.primary },
              { value: '87%', label: 'Avg Score', icon: 'star-outline', color: Colors.success },
              { value: '12', label: 'Day Streak', icon: 'flame-outline', color: Colors.warning },
            ].map((s, i) => (
              <View key={i} style={styles.statBox}>
                <View style={[styles.statIcon, { backgroundColor: s.color + '20' }]}>
                  <Ionicons name={s.icon as any} size={18} color={s.color} />
                </View>
                <Text style={styles.statVal}>{s.value}</Text>
                <Text style={styles.statLbl}>{s.label}</Text>
              </View>
            ))}
          </View>
        </Card>
      </ScrollView>
    </View>
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
  setupLabel: { fontFamily: Fonts.semiBold, fontSize: 15, color: Colors.textDark, marginBottom: 10 },
  topicsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  topicChip: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: 20, backgroundColor: Colors.background, borderWidth: 1.5, borderColor: Colors.border },
  topicChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  topicChipText: { fontFamily: Fonts.medium, fontSize: 13, color: Colors.textGray },
  topicChipTextActive: { color: Colors.white },
  statsCard: {},
  statsTitle: { fontFamily: Fonts.bold, fontSize: 16, color: Colors.textDark, marginBottom: 16 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  statBox: { alignItems: 'center', gap: 6 },
  statIcon: { width: 44, height: 44, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  statVal: { fontFamily: Fonts.bold, fontSize: 22, color: Colors.textDark },
  statLbl: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.textGray, textAlign: 'center' },
  // Quiz mode
  progressInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  progressLabel: { fontFamily: Fonts.semiBold, fontSize: 13, color: Colors.white },
  timerBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 },
  timerText: { fontFamily: Fonts.bold, fontSize: 13, color: Colors.white },
  quizContent: { padding: 20, gap: 16 },
  questionText: { fontFamily: Fonts.bold, fontSize: 20, color: Colors.textDark, lineHeight: 30, marginTop: 12, marginBottom: 4 },
  optionsContainer: { gap: 12 },
  optionBtn: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, borderRadius: 16, borderWidth: 1.5 },
  optionDefault: { backgroundColor: Colors.white, borderColor: Colors.border },
  optionCorrect: { backgroundColor: '#E8F5E9', borderColor: Colors.success },
  optionWrong: { backgroundColor: '#FFEBEE', borderColor: Colors.danger },
  optionLetter: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  optionLetterText: { fontFamily: Fonts.bold, fontSize: 14 },
  optionText: { fontFamily: Fonts.medium, fontSize: 15, flex: 1 },
  optionTextDefault: { color: Colors.textDark },
  optionTextCorrect: { color: Colors.success },
  optionTextWrong: { color: Colors.danger },
  explanationCard: { backgroundColor: '#FFFBF0', borderWidth: 1, borderColor: '#FEF3C7' },
  explanationTitle: { fontFamily: Fonts.bold, fontSize: 14, color: Colors.textDark, marginBottom: 4 },
  explanationText: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.textGray, lineHeight: 20 },
  // Results
  resultCircleContainer: { alignItems: 'center', marginVertical: 24, gap: 10 },
  resultCircle: { width: 130, height: 130, borderRadius: 65, borderWidth: 5, alignItems: 'center', justifyContent: 'center' },
  resultScore: { fontFamily: Fonts.bold, fontSize: 36 },
  resultFraction: { fontFamily: Fonts.regular, fontSize: 14, color: Colors.textGray },
  resultGrade: { fontFamily: Fonts.bold, fontSize: 26 },
  resultSub: { fontFamily: Fonts.regular, fontSize: 14, color: Colors.textGray, textAlign: 'center', paddingHorizontal: 20 },
  reviewItem: { backgroundColor: Colors.white, borderRadius: 14, padding: 14, borderLeftWidth: 4, marginBottom: 10, ...Shadow.small },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  reviewQ: { fontFamily: Fonts.semiBold, fontSize: 14, color: Colors.textDark, flex: 1 },
  reviewAnswer: { fontFamily: Fonts.regular, fontSize: 13, color: Colors.textGray, marginTop: 6 },
  resultActions: { flexDirection: 'row', gap: 12, marginTop: 8 },
});
