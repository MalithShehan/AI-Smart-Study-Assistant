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
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '../types';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Colors, Fonts, Spacing } from '../theme';
import { useAuth } from '../context/AuthContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

export const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password) {
      Alert.alert('Validation', 'Please fill in all fields.');
      return;
    }
    if (password !== confirm) {
      Alert.alert('Validation', 'Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await register(name.trim(), email.trim(), password);
      navigation.replace('MainTabs');
    } catch (err: any) {
      Alert.alert('Registration Failed', err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <LinearGradient
        colors={['#8B5CF6', '#A78BFA']}
        style={[styles.headerGrad, { paddingTop: insets.top + 8 }]}
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Account ✨</Text>
        <Text style={styles.headerSub}>Start your AI-powered learning journey</Text>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Input
            label="Full Name"
            placeholder="John Doe"
            value={name}
            onChangeText={setName}
            icon="person-outline"
          />
          <Input
            label="Email Address"
            placeholder="you@email.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            icon="mail-outline"
          />
          <Input
            label="Password"
            placeholder="Create a strong password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            icon="lock-closed-outline"
          />
          <Input
            label="Confirm Password"
            placeholder="Repeat your password"
            value={confirm}
            onChangeText={setConfirm}
            secureTextEntry
            icon="shield-checkmark-outline"
          />

          {/* Terms */}
          <View style={styles.termsRow}>
            <Ionicons name="checkbox" size={20} color={Colors.primary} />
            <Text style={styles.termsText}>
              I agree to the{' '}
              <Text style={{ color: Colors.primary }}>Terms of Service</Text> &{' '}
              <Text style={{ color: Colors.primary }}>Privacy Policy</Text>
            </Text>
          </View>

          <Button
            title="Create Account"
            onPress={handleRegister}
            loading={loading}
            size="lg"
          />
        </View>

        <TouchableOpacity
          style={styles.loginRow}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.loginText}>
            Already have an account?{' '}
            <Text style={{ color: Colors.primary, fontFamily: Fonts.semiBold }}>Sign In</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  headerGrad: { paddingHorizontal: 24, paddingBottom: 40 },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  headerTitle: { fontFamily: Fonts.bold, fontSize: 28, color: Colors.white, marginBottom: 6 },
  headerSub: { fontFamily: Fonts.regular, fontSize: 15, color: 'rgba(255,255,255,0.85)' },
  scrollContent: { paddingTop: 0 },
  card: {
    backgroundColor: Colors.white,
    marginHorizontal: 20,
    marginTop: -20,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
  },
  termsRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: Spacing.lg },
  termsText: { flex: 1, fontFamily: Fonts.regular, fontSize: 13, color: Colors.textGray, lineHeight: 20 },
  loginRow: { alignItems: 'center', marginTop: 24 },
  loginText: { fontFamily: Fonts.regular, fontSize: 15, color: Colors.textGray },
});
