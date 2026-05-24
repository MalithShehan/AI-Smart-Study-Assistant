import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '../types';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Divider } from '../components/UI';
import { Colors, Fonts, Spacing } from '../theme';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');
type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Validation', 'Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      await login(email.trim(), password);
      navigation.replace('MainTabs');
    } catch (err: any) {
      Alert.alert('Login Failed', err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header gradient */}
      <LinearGradient
        colors={['#FF7A00', '#FF9A3C']}
        style={[styles.headerGrad, { paddingTop: insets.top + 16 }]}
      >
        <View style={styles.logoRow}>
          <View style={styles.logoIcon}>
            <Ionicons name="sparkles" size={24} color={Colors.white} />
          </View>
          <Text style={styles.logoText}>StudyAI</Text>
        </View>
        <Text style={styles.headerTitle}>Welcome back! 👋</Text>
        <Text style={styles.headerSub}>Sign in to continue learning</Text>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
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
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            icon="lock-closed-outline"
          />

          <TouchableOpacity style={{ alignSelf: 'flex-end', marginBottom: Spacing.lg }}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          <Button title="Sign In" onPress={handleLogin} loading={loading} size="lg" />
        </View>

        <Divider label="or continue with" style={{ marginHorizontal: 24, marginVertical: 20 }} />

        {/* Social buttons */}
        <View style={styles.socialRow}>
          {(['logo-google', 'logo-apple', 'logo-facebook'] as const).map((icon, i) => (
            <TouchableOpacity key={i} style={styles.socialBtn}>
              <Ionicons name={icon} size={22} color={Colors.textDark} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.registerRow}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.registerText}>
            Don't have an account?{' '}
            <Text style={{ color: Colors.primary, fontFamily: Fonts.semiBold }}>Sign Up</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  headerGrad: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  logoIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  logoText: { fontFamily: Fonts.bold, fontSize: 22, color: Colors.white },
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
  forgotText: { fontFamily: Fonts.medium, fontSize: 14, color: Colors.primary },
  socialRow: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginHorizontal: 24 },
  socialBtn: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  registerRow: { alignItems: 'center', marginTop: 24 },
  registerText: { fontFamily: Fonts.regular, fontSize: 15, color: Colors.textGray },
});
