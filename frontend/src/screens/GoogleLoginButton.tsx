import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useAuth } from '../context/AuthContext';
import { apiPost } from '../api/client';
import { useHaptics } from '../hooks/useHaptics';

const Colors = {
  white: '#FFFFFF',
  border: '#E5E7EB',
  textDark: '#1F2937',
  error: '#EF4444',
};

const Fonts = {
  semiBold: 'Poppins-SemiBold',
};

const Shadow = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
};

interface GoogleLoginButtonProps {
  onSuccess?: () => void;
}

export const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const { setAuthToken, setUser } = useAuth();
  const haptics = useHaptics();

  useEffect(() => {
    // Configure Google Sign-In
    GoogleSignin.configure({
      webClientId: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com', // Replace with your Web Client ID
      offlineAccess: true,
      forceCodeForRefreshToken: true,
    });
  }, []);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      haptics.light();

      // Check if device supports Play Services (Android only)
      await GoogleSignin.hasPlayServices();

      // Sign in with Google
      const userInfo = await GoogleSignin.signIn();
      const { idToken } = await GoogleSignin.getTokens();

      if (!idToken) {
        throw new Error('Failed to get Google ID token');
      }

      // Send ID token to backend
      const response = await apiPost('/auth/google', { idToken });

      if (response.success) {
        // Store tokens and user info
        await setAuthToken(response.accessToken, response.refreshToken);
        setUser(response.user);

        haptics.success();
        
        // Call success callback
        onSuccess?.();
      } else {
        throw new Error(response.message || 'Google login failed');
      }
    } catch (error: any) {
      console.error('Google login error:', error);
      haptics.error();

      let errorMessage = 'Google login failed. Please try again.';

      if (error.code === 'SIGN_IN_CANCELLED') {
        errorMessage = 'Sign in was cancelled';
      } else if (error.code === 'IN_PROGRESS') {
        errorMessage = 'Sign in is already in progress';
      } else if (error.code === 'PLAY_SERVICES_NOT_AVAILABLE') {
        errorMessage = 'Play Services not available or outdated';
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert('Login Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      style={styles.googleBtn}
      onPress={handleGoogleLogin}
      disabled={loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#4285F4" />
      ) : (
        <>
          <View style={styles.googleIconContainer}>
            <Ionicons name="logo-google" size={20} color="#4285F4" />
          </View>
          <Text style={styles.googleBtnText}>Continue with Google</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 12,
    minHeight: 50,
    ...Shadow.small,
  },
  googleIconContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleBtnText: {
    fontFamily: Fonts.semiBold,
    fontSize: 15,
    color: Colors.textDark,
  },
});

export default GoogleLoginButton;
