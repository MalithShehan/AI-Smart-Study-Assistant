import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RootStackParamList, TabParamList } from '../types';
import { Colors, Fonts, Shadow } from '../theme';

import { SplashScreen } from '../screens/SplashScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { AskQuestionScreen } from '../screens/AskQuestionScreen';
import { AISummaryScreen } from '../screens/AISummaryScreen';
import { QuizGeneratorScreen } from '../screens/QuizGeneratorScreen';
import { LibraryScreen } from '../screens/LibraryScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { AIScannerScreen } from '../screens/AIScannerScreen';
import { TimetableScreen } from '../screens/TimetableScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

type TabIconName = React.ComponentProps<typeof Ionicons>['name'];

const tabConfig: Record<string, { icon: TabIconName; activeIcon: TabIconName; label: string }> = {
  HomeTab: { icon: 'home-outline', activeIcon: 'home', label: 'Home' },
  LibraryTab: { icon: 'library-outline', activeIcon: 'library', label: 'Library' },
  ScannerTab: { icon: 'scan-outline', activeIcon: 'scan', label: 'Scan' },
  QuizTab: { icon: 'help-circle-outline', activeIcon: 'help-circle', label: 'Quiz' },
  ProfileTab: { icon: 'person-outline', activeIcon: 'person', label: 'Profile' },
};

const CustomTabBar = ({ state, descriptors, navigation }: any) => {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.tabBar, { paddingBottom: insets.bottom + 8 }]}>
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;
        const isScanner = route.name === 'ScannerTab';
        const cfg = tabConfig[route.name];

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        if (isScanner) {
          return (
            <TouchableOpacity key={route.key} style={styles.tabItem} onPress={onPress} activeOpacity={0.85}>
              <View style={styles.scannerFAB}>
                <Ionicons name={isFocused ? 'scan' : 'scan-outline'} size={26} color={Colors.white} />
              </View>
            </TouchableOpacity>
          );
        }

        return (
          <TouchableOpacity key={route.key} style={styles.tabItem} onPress={onPress} activeOpacity={0.75}>
            <View style={[styles.tabIconWrap, isFocused && styles.tabIconWrapActive]}>
              <Ionicons
                name={isFocused ? cfg.activeIcon : cfg.icon}
                size={22}
                color={isFocused ? Colors.primary : Colors.textLight}
              />
            </View>
            <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>
              {cfg.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} />
      <Tab.Screen name="LibraryTab" component={LibraryScreen} />
      <Tab.Screen name="ScannerTab" component={AIScannerScreen} />
      <Tab.Screen name="QuizTab" component={QuizGeneratorScreen} />
      <Tab.Screen name="ProfileTab" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Splash">
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="AskQuestion" component={AskQuestionScreen} />
        <Stack.Screen name="AISummary" component={AISummaryScreen} />
        <Stack.Screen name="AIScanner" component={AIScannerScreen} />
        <Stack.Screen name="Timetable" component={TimetableScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        {/* Aliases for standalone access */}
        <Stack.Screen name="QuizGenerator" component={QuizGeneratorScreen} />
        <Stack.Screen name="Library" component={LibraryScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Auth" component={LoginScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 10,
    ...Shadow.medium,
  },
  tabItem: { flex: 1, alignItems: 'center', gap: 3 },
  tabIconWrap: { width: 40, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 10 },
  tabIconWrapActive: { backgroundColor: Colors.primaryLight },
  tabLabel: { fontFamily: Fonts.regular, fontSize: 11, color: Colors.textLight },
  tabLabelActive: { fontFamily: Fonts.semiBold, color: Colors.primary },
  scannerFAB: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -20,
    ...Shadow.large,
  },
});
