export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Auth: undefined;
  Login: undefined;
  Register: undefined;
  MainTabs: undefined;
  Home: undefined;
  AskQuestion: undefined;
  AISummary: { text?: string };
  QuizGenerator: undefined;
  Library: undefined;
  Profile: undefined;
  AIScanner: undefined;
  Timetable: undefined;
  Notifications: undefined;
};

export type TabParamList = {
  HomeTab: undefined;
  LibraryTab: undefined;
  ScannerTab: undefined;
  QuizTab: undefined;
  ProfileTab: undefined;
};

export interface StudyCard {
  id: string;
  title: string;
  subject: string;
  color: string;
  icon: string;
  progress: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct: number;
  explanation?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface OnboardingSlide {
  id: number;
  title: string;
  description: string;
  icon: string;
  gradient: string[];
}
