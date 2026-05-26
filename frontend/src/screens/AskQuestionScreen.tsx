import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, Message } from '../types';
import { Input } from '../components/Input';
import { Card } from '../components/Card';
import { Badge } from '../components/UI';
import { AIVoicePlayer } from '../components/AIVoicePlayer';
import { Colors, Fonts, BorderRadius, Shadow } from '../theme';

const { width } = Dimensions.get('window');
type Nav = NativeStackNavigationProp<RootStackParamList>;

const suggestions = [
  'Explain photosynthesis',
  'Solve quadratic equations',
  'What is quantum entanglement?',
  'Newton\'s 3 laws explained',
];

const initialMessages: Message[] = [
  {
    id: '1',
    role: 'assistant',
    content: 'Hi! I\'m your AI study assistant 🤖. Ask me anything — math, science, history, or any subject you\'re studying!',
    timestamp: new Date(),
  },
];

export const AskQuestionScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const sendMessage = (text?: string) => {
    const msg = text || input.trim();
    if (!msg) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: msg,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    setTimeout(() => {
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Great question! Here's a clear explanation of "${msg}":\n\nThis is a comprehensive AI-generated response. In production, this will be powered by your AI backend API to give accurate, educational answers with step-by-step explanations, examples, and related concepts.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setLoading(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }, 1500);
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      {/* Header */}
      <LinearGradient
        colors={['#FF7A00', '#FF9A3C']}
        style={[styles.header, { paddingTop: insets.top + 12 }]}
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color={Colors.white} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.headerTitle}>Ask AI Tutor</Text>
          <View style={styles.onlineRow}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlineText}>AI is online</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.headerIcon} onPress={() => navigation.navigate('AISummary', {})}>
          <Ionicons name="document-text-outline" size={20} color={Colors.white} />
        </TouchableOpacity>
      </LinearGradient>

      {/* Suggestions */}
      {messages.length === 1 && (
        <View style={styles.suggestionsContainer}>
          <Text style={styles.suggestionsTitle}>Try asking:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingRight: 8 }}>
            {suggestions.map((s, i) => (
              <TouchableOpacity key={i} style={styles.suggestionChip} onPress={() => sendMessage(s)}>
                <Text style={styles.suggestionText}>{s}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Messages */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((msg) => (
            <View key={msg.id} style={[styles.messageRow, msg.role === 'user' && styles.messageRowUser]}>
              {msg.role === 'assistant' && (
                <View style={styles.aiAvatar}>
                  <Ionicons name="sparkles" size={16} color={Colors.primary} />
                </View>
              )}
              <View
                style={[
                  styles.messageBubble,
                  msg.role === 'user' ? styles.userBubble : styles.aiBubble,
                ]}
              >
                <Text style={[styles.messageText, msg.role === 'user' && styles.userText]}>
                  {msg.content}
                </Text>
                {msg.role === 'assistant' && (
                  <>
                    {/* AI Voice Player */}
                    <AIVoicePlayer text={msg.content} voice="nova" />
                    
                    <View style={styles.messageActions}>
                      <TouchableOpacity style={styles.messageActionBtn}>
                        <Ionicons name="copy-outline" size={14} color={Colors.textGray} />
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.messageActionBtn}>
                        <Ionicons name="share-outline" size={14} color={Colors.textGray} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.messageActionBtn, styles.summaryBtn]}
                        onPress={() => navigation.navigate('AISummary', { text: msg.content })}
                      >
                        <Text style={styles.summaryBtnText}>Summarize</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </View>
            </View>
          ))}

          {loading && (
            <View style={styles.messageRow}>
              <View style={styles.aiAvatar}>
                <Ionicons name="sparkles" size={16} color={Colors.primary} />
              </View>
              <View style={styles.typingBubble}>
                {[0, 1, 2].map((i) => (
                  <View key={i} style={styles.typingDot} />
                ))}
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input */}
        <View style={styles.inputArea}>
          <View style={styles.inputRow}>
            <TouchableOpacity style={styles.attachBtn} onPress={() => navigation.navigate('AIScanner')}>
              <Ionicons name="camera-outline" size={22} color={Colors.primary} />
            </TouchableOpacity>
            <View style={styles.inputWrap}>
              <Input
                placeholder="Ask a question..."
                value={input}
                onChangeText={setInput}
                style={{ marginBottom: 0 }}
              />
            </View>
            <TouchableOpacity
              style={[styles.sendBtn, !input.trim() && { opacity: 0.5 }]}
              onPress={() => sendMessage()}
              disabled={!input.trim()}
            >
              <LinearGradient colors={['#FF7A00', '#FF9A3C']} style={styles.sendGrad}>
                <Ionicons name="send" size={18} color={Colors.white} />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 16 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontFamily: Fonts.bold, fontSize: 18, color: Colors.white },
  onlineRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  onlineDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#4AE54A' },
  onlineText: { fontFamily: Fonts.regular, fontSize: 12, color: 'rgba(255,255,255,0.9)' },
  headerIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  suggestionsContainer: { paddingHorizontal: 16, paddingVertical: 12, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.border },
  suggestionsTitle: { fontFamily: Fonts.medium, fontSize: 13, color: Colors.textGray, marginBottom: 8 },
  suggestionChip: { backgroundColor: Colors.primaryLight, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
  suggestionText: { fontFamily: Fonts.medium, fontSize: 13, color: Colors.primary },
  messagesList: { padding: 16, gap: 12, paddingBottom: 8 },
  messageRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  messageRowUser: { flexDirection: 'row-reverse' },
  aiAvatar: { width: 32, height: 32, borderRadius: 10, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  messageBubble: { maxWidth: width * 0.72, borderRadius: 18, padding: 14 },
  aiBubble: { backgroundColor: Colors.white, borderBottomLeftRadius: 4, ...Shadow.small },
  userBubble: { backgroundColor: Colors.primary, borderBottomRightRadius: 4 },
  messageText: { fontFamily: Fonts.regular, fontSize: 14, color: Colors.textDark, lineHeight: 22 },
  userText: { color: Colors.white },
  messageActions: { flexDirection: 'row', gap: 6, marginTop: 10, alignItems: 'center' },
  messageActionBtn: { width: 28, height: 28, borderRadius: 8, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' },
  summaryBtn: { backgroundColor: Colors.primaryLight, paddingHorizontal: 10, width: 'auto', borderRadius: 8 },
  summaryBtnText: { fontFamily: Fonts.semiBold, fontSize: 11, color: Colors.primary },
  typingBubble: { flexDirection: 'row', gap: 5, backgroundColor: Colors.white, borderRadius: 18, padding: 14, alignItems: 'center', ...Shadow.small },
  typingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.textLight },
  inputArea: { backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.border, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  attachBtn: { width: 44, height: 44, borderRadius: 13, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  inputWrap: { flex: 1 },
  sendBtn: {},
  sendGrad: { width: 44, height: 44, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
});
