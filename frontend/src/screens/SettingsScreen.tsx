import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { apiPost } from '../api/client';
import { RootStackParamList } from '../types';
import {
  GradientCard,
  PremiumButton,
  Badge,
  ExpandableCard,
} from '../components/PremiumUI';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

interface SettingSection {
  title: string;
  items: SettingItem[];
}

interface SettingItem {
  label: string;
  type: 'toggle' | 'button' | 'text';
  value?: boolean;
  description?: string;
  onToggle?: (value: boolean) => void;
  onPress?: () => void;
}

export const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const { user, logout } = useAuth();
  const { isDark, themeMode, setThemeMode, toggleTheme } = useTheme();
  
  const [notifications, setNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(true);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', onPress: () => {}, style: 'cancel' },
        {
          text: 'Logout',
          onPress: async () => {
            await logout();
            navigation.replace('Login');
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', onPress: () => {}, style: 'cancel' },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              await apiPost('/users/delete-account', {});
              Alert.alert('Success', 'Your account has been deleted.');
              await logout();
              navigation.replace('Login');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete account');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const settingsSections: SettingSection[] = [
    {
      title: 'Notifications',
      items: [
        {
          label: 'Push Notifications',
          type: 'toggle',
          value: notifications,
          description: 'Receive quiz and study reminders',
          onToggle: (value) => {
            setNotifications(value);
            // API call to update preferences
          },
        },
        {
          label: 'Email Updates',
          type: 'toggle',
          value: emailUpdates,
          description: 'Weekly study summary and tips',
          onToggle: (value) => setEmailUpdates(value),
        },
      ],
    },
    {
      title: 'Preferences',
      items: [
        {
          label: 'Dark Mode',
          type: 'toggle',
          value: isDark,
          description: themeMode === 'auto' ? 'Following system (Currently ' + (isDark ? 'Dark' : 'Light') + ')' : (isDark ? 'Dark theme enabled' : 'Light theme enabled'),
          onToggle: (value) => toggleTheme(),
        },
        {
          label: 'Analytics',
          type: 'toggle',
          value: analyticsEnabled,
          description: 'Help us improve the app',
          onToggle: (value) => setAnalyticsEnabled(value),
        },
      ],
    },
    {
      title: 'Account',
      items: [
        {
          label: 'Change Password',
          type: 'button',
          onPress: () => Alert.alert('Coming Soon', 'Password change feature coming soon'),
        },
        {
          label: 'Privacy Policy',
          type: 'button',
          onPress: () => Alert.alert('Privacy Policy', 'View privacy policy in browser'),
        },
        {
          label: 'Terms & Conditions',
          type: 'button',
          onPress: () => Alert.alert('Terms', 'View terms in browser'),
        },
      ],
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View
          entering={FadeInDown.delay(100).springify()}
          className="px-6 pt-6 pb-8"
        >
          <Text className="text-3xl font-bold text-gray-900">Settings</Text>
          <Text className="text-gray-600 mt-2">Customize your study experience</Text>
        </Animated.View>

        {/* User Profile Card */}
        <Animated.View
          entering={FadeInUp.delay(150).springify()}
          className="px-6 mb-8"
        >
          <GradientCard colors={['#3b82f6', '#1e40af']} borderRadius={20}>
            <View className="p-6">
              <View className="flex-row items-center gap-4 mb-4">
                <View className="w-16 h-16 bg-white rounded-full items-center justify-center opacity-20" />
                <View className="flex-1">
                  <Text className="text-white text-lg font-bold">
                    {user?.name || 'User'}
                  </Text>
                  <Text className="text-blue-100 text-sm mt-1">
                    {user?.email}
                  </Text>
                </View>
              </View>

              <View className="flex-row gap-2 mb-4">
                <Badge label={user?.role || 'Student'} variant="primary" />
                {user?.isEmailVerified && (
                  <Badge label="Verified" variant="success" />
                )}
              </View>

              <TouchableOpacity
                className="bg-blue-700 rounded-lg py-2 px-4"
                onPress={() => navigation.navigate('Profile')}
              >
                <Text className="text-white text-center font-semibold">
                  View Profile
                </Text>
              </TouchableOpacity>
            </View>
          </GradientCard>
        </Animated.View>

        {/* Settings Sections */}
        {settingsSections.map((section, sectionIndex) => (
          <Animated.View
            key={section.title}
            entering={FadeInUp.delay(200 + sectionIndex * 100).springify()}
            className="px-6 mb-8"
          >
            <Text className="text-lg font-bold text-gray-900 mb-4">
              {section.title}
            </Text>

            <View className="gap-3">
              {section.items.map((item, itemIndex) => (
                <View
                  key={`${section.title}-${itemIndex}`}
                  className="bg-white rounded-xl p-4 border border-gray-100"
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text className="text-gray-900 font-semibold">
                        {item.label}
                      </Text>
                      {item.description && (
                        <Text className="text-gray-600 text-xs mt-1">
                          {item.description}
                        </Text>
                      )}
                    </View>

                    {item.type === 'toggle' && item.onToggle && (
                      <Switch
                        value={item.value || false}
                        onValueChange={item.onToggle}
                        trackColor={{ false: '#e5e7eb', true: '#3b82f6' }}
                      />
                    )}

                    {item.type === 'button' && item.onPress && (
                      <TouchableOpacity onPress={item.onPress} className="p-2">
                        <Text className="text-blue-600 font-semibold">→</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </Animated.View>
        ))}

        {/* About Section */}
        <Animated.View
          entering={FadeInUp.delay(600).springify()}
          className="px-6 mb-8"
        >
          <ExpandableCard
            title="About"
            description="App information and version"
            variant="info"
          >
            <View className="gap-3">
              <View className="flex-row justify-between">
                <Text className="text-gray-600 text-sm">App Version</Text>
                <Text className="text-gray-900 font-semibold text-sm">1.0.0</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-600 text-sm">Build</Text>
                <Text className="text-gray-900 font-semibold text-sm">2026.05.26</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-600 text-sm">Environment</Text>
                <Text className="text-gray-900 font-semibold text-sm">Production</Text>
              </View>
            </View>
          </ExpandableCard>
        </Animated.View>

        {/* Danger Zone */}
        <Animated.View
          entering={FadeInUp.delay(700).springify()}
          className="px-6 mb-12"
        >
          <ExpandableCard
            title="Danger Zone"
            description="Irreversible actions"
            variant="error"
          >
            <View className="gap-3">
              <PremiumButton
                label="Logout"
                onPress={handleLogout}
                variant="secondary"
                size="md"
              />
              <PremiumButton
                label="Delete Account"
                onPress={handleDeleteAccount}
                variant="danger"
                size="md"
              />
            </View>
          </ExpandableCard>
        </Animated.View>

        {/* Footer */}
        <Animated.View
          entering={FadeInUp.delay(800).springify()}
          className="px-6 pb-12 items-center"
        >
          <Text className="text-gray-600 text-xs">
            Made with ❤️ for better learning
          </Text>
          <Text className="text-gray-500 text-xs mt-2">
            © 2026 AI Study Assistant. All rights reserved.
          </Text>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};
