import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Animated, {
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { apiPost, apiGet } from '../api/client';
import { RootStackParamList } from '../types';

interface QuizQuestion {
  id: string;
  question: string;
  userAnswer: string;
  correctAnswer: string;
  options: string[];
  isCorrect: boolean;
  explanation?: string;
}

interface QuizResultData {
  quizId: string;
  quizTitle: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  timeTaken: number;
  questions: QuizQuestion[];
  timestamp: string;
}

type Props = NativeStackScreenProps<RootStackParamList, 'QuizResult'>;

const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedText = Animated.createAnimatedComponent(Text);

export const QuizResultScreen: React.FC<Props> = ({ route, navigation }) => {
  const { quizId, timeTaken } = route.params;
  const { user } = useAuth();
  const [result, setResult] = useState<QuizResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

  // Animated values
  const scoreScale = useSharedValue(0);
  const circleProgress = useSharedValue(0);

  // Fetch quiz results
  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await apiGet(`/ai/quiz-results/${quizId}`);
        if (response) {
          setResult(response);
          // Trigger animations after data loads
          animateScore();
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to load quiz results');
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [quizId]);

  const animateScore = () => {
    scoreScale.value = withSequence(
      withTiming(0, { duration: 0 }),
      withSpring(1, { damping: 8, mass: 1.2 })
    );

    if (result) {
      circleProgress.value = withTiming(result.percentage / 100, {
        duration: 1800,
        easing: Easing.out(Easing.quad),
      });
    }
  };

  const scoreAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scoreScale.value }],
  }));

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getScoreColor = (percentage: number): [string, string] => {
    if (percentage >= 80) return ['#10b981', '#059669'];
    if (percentage >= 60) return ['#f59e0b', '#d97706'];
    return ['#ef4444', '#dc2626'];
  };

  const handleRetakeQuiz = async () => {
    try {
      // Logic to reset quiz and start again
      navigation.replace('QuizGenerator');
    } catch (error) {
      Alert.alert('Error', 'Failed to retake quiz');
    }
  };

  const handleSaveResults = async () => {
    try {
      await apiPost('/analytics/save-result', {
        quizId,
        score: result?.score,
        totalQuestions: result?.totalQuestions,
        percentage: result?.percentage,
        timeTaken,
      });
      Alert.alert('Success', 'Results saved to your analytics');
    } catch (error) {
      Alert.alert('Error', 'Failed to save results');
    }
  };

  if (loading || !result) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text className="text-gray-600 mt-4 text-center">
            Loading your results...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const [startColor, endColor] = getScoreColor(result.percentage);

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Header */}
        <Animated.View
          entering={FadeInDown.delay(100).springify()}
          className="px-6 pt-6 pb-4"
        >
          <Text className="text-3xl font-bold text-gray-900 mb-1">
            {result.percentage >= 80 ? '🎉' : result.percentage >= 60 ? '👍' : '💪'} Quiz Complete!
          </Text>
          <Text className="text-gray-600 text-base">
            {result.quizTitle}
          </Text>
        </Animated.View>

        {/* Score Circle */}
        <Animated.View
          entering={FadeInUp.delay(200).springify()}
          style={scoreAnimatedStyle}
          className="items-center my-6"
        >
          <LinearGradient
            colors={[startColor, endColor]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="w-40 h-40 rounded-full justify-center items-center shadow-2xl"
          >
            <View className="absolute inset-0 border-4 border-white rounded-full opacity-20" />
            <View className="items-center">
              <AnimatedText className="text-white text-6xl font-black">
                {Math.round(result.percentage)}%
              </AnimatedText>
              <Text className="text-white text-sm font-semibold mt-2 opacity-90">
                {result.score}/{result.totalQuestions}
              </Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Stats Cards */}
        <Animated.View
          entering={FadeInUp.delay(300).springify()}
          className="px-6 mb-6"
        >
          <View className="flex-row gap-3">
            {/* Time Card */}
            <View className="flex-1 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <Text className="text-gray-600 text-xs font-semibold uppercase tracking-wide mb-2">
                Time
              </Text>
              <Text className="text-2xl font-bold text-gray-900">
                {formatTime(timeTaken)}
              </Text>
            </View>

            {/* Accuracy Card */}
            <View className="flex-1 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <Text className="text-gray-600 text-xs font-semibold uppercase tracking-wide mb-2">
                Accuracy
              </Text>
              <Text className="text-2xl font-bold text-gray-900">
                {Math.round((result.score / result.totalQuestions) * 100)}%
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Performance Indicator */}
        <Animated.View
          entering={FadeInUp.delay(400).springify()}
          className="px-6 mb-8"
        >
          <View className="bg-white rounded-2xl p-4 border border-gray-100">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="font-semibold text-gray-900">Performance</Text>
              <Text className="text-sm font-bold text-blue-600">
                {result.percentage >= 80
                  ? 'Excellent'
                  : result.percentage >= 60
                  ? 'Good'
                  : 'Needs Improvement'}
              </Text>
            </View>

            {/* Progress Bar */}
            <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <LinearGradient
                colors={[startColor, endColor]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  width: `${result.percentage}%`,
                  height: '100%',
                }}
              />
            </View>

            <Text className="text-xs text-gray-500 mt-3">
              {result.score} correct out of {result.totalQuestions} questions
            </Text>
          </View>
        </Animated.View>

        {/* Divider */}
        <View className="h-px bg-gray-200 my-2" />

        {/* Questions Review */}
        <Animated.View
          entering={FadeInUp.delay(500).springify()}
          className="px-6 py-6"
        >
          <Text className="text-xl font-bold text-gray-900 mb-4">
            Review Answers
          </Text>

          <View className="gap-3">
            {result.questions.map((question, index) => (
              <TouchableOpacity
                key={question.id}
                onPress={() =>
                  setExpandedQuestion(
                    expandedQuestion === question.id ? null : question.id
                  )
                }
                activeOpacity={0.7}
              >
                <View
                  className={`rounded-xl p-4 border-l-4 ${
                    question.isCorrect
                      ? 'bg-green-50 border-green-500'
                      : 'bg-red-50 border-red-500'
                  }`}
                >
                  <View className="flex-row items-start gap-3 mb-2">
                    <View
                      className={`w-7 h-7 rounded-full justify-center items-center ${
                        question.isCorrect ? 'bg-green-500' : 'bg-red-500'
                      }`}
                    >
                      <Text className="text-white font-bold text-sm">
                        {question.isCorrect ? '✓' : '✕'}
                      </Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-gray-900 font-semibold">
                        Q{index + 1}: {question.question}
                      </Text>
                    </View>
                  </View>

                  {/* Expandable Details */}
                  {expandedQuestion === question.id && (
                    <Animated.View
                      entering={FadeInDown.springify()}
                      className="mt-4 pt-4 border-t border-gray-200"
                    >
                      <View className="gap-3">
                        {!question.isCorrect && (
                          <>
                            <View>
                              <Text className="text-xs text-gray-600 font-semibold mb-1">
                                Your Answer
                              </Text>
                              <View className="bg-red-100 rounded-lg p-3">
                                <Text className="text-red-900 text-sm">
                                  {question.userAnswer}
                                </Text>
                              </View>
                            </View>

                            <View>
                              <Text className="text-xs text-gray-600 font-semibold mb-1">
                                Correct Answer
                              </Text>
                              <View className="bg-green-100 rounded-lg p-3">
                                <Text className="text-green-900 text-sm">
                                  {question.correctAnswer}
                                </Text>
                              </View>
                            </View>
                          </>
                        )}

                        {question.explanation && (
                          <View>
                            <Text className="text-xs text-gray-600 font-semibold mb-1">
                              Explanation
                            </Text>
                            <View className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                              <Text className="text-blue-900 text-sm leading-5">
                                {question.explanation}
                              </Text>
                            </View>
                          </View>
                        )}
                      </View>
                    </Animated.View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Action Buttons */}
        <Animated.View
          entering={FadeInUp.delay(600).springify()}
          className="px-6 py-6 gap-3"
        >
          {/* Save Results Button */}
          <TouchableOpacity
            onPress={handleSaveResults}
            activeOpacity={0.7}
            className="bg-blue-600 rounded-xl py-4 shadow-md"
          >
            <Text className="text-white text-center font-bold text-base">
              Save Results to Analytics
            </Text>
          </TouchableOpacity>

          {/* Retake Button */}
          <TouchableOpacity
            onPress={handleRetakeQuiz}
            activeOpacity={0.7}
            className="bg-gray-200 rounded-xl py-4 border border-gray-300"
          >
            <Text className="text-gray-900 text-center font-bold text-base">
              Retake Quiz
            </Text>
          </TouchableOpacity>

          {/* Home Button */}
          <TouchableOpacity
            onPress={() => navigation.navigate('Home')}
            activeOpacity={0.7}
            className="bg-white rounded-xl py-4 border border-gray-300"
          >
            <Text className="text-gray-900 text-center font-semibold text-base">
              Back to Home
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};
