// Light Theme Colors
export const LightColors = {
  primary: '#FF7A00',
  primaryLight: '#FFE0B2',
  primaryDark: '#E56900',
  primaryGradient: ['#FF7A00', '#FF9A3C'] as const,
  cream: '#FFF6EB',
  purple: '#8B5CF6',
  purpleLight: '#EDE9FE',
  purpleDark: '#6D28D9',
  
  background: '#FFF6EB', // Cream background
  backgroundLight: '#FFFFFF',
  card: '#FFFFFF',
  
  text: '#1E1E1E',
  textSecondary: '#6B7280',
  textLight: '#9CA3AF',
  
  success: '#10B981',
  successLight: '#D1FAE5',
  danger: '#EF4444',
  dangerLight: '#FEE2E2',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  
  white: '#FFFFFF',
  black: '#000000',
  
  overlay: 'rgba(0,0,0,0.5)',
  glass: 'rgba(255,255,255,0.15)',
  glassBorder: 'rgba(255,255,255,0.3)',
};

// Dark Theme Colors
export const DarkColors = {
  primary: '#FF7A00',
  primaryLight: '#FF9A3C',
  primaryDark: '#E56900',
  primaryGradient: ['#FF7A00', '#E56900'] as const,
  cream: '#2D2416',
  purple: '#8B5CF6',
  purpleLight: '#6D28D9',
  purpleDark: '#5B21B6',
  
  background: '#0F0F0F',
  backgroundLight: '#1A1A1A',
  card: '#1E1E1E',
  
  text: '#FFFFFF',
  textSecondary: '#A0A0A0',
  textLight: '#6B7280',
  
  success: '#10B981',
  successLight: '#065F46',
  danger: '#EF4444',
  dangerLight: '#7F1D1D',
  warning: '#F59E0B',
  warningLight: '#78350F',
  
  border: '#2D2D2D',
  borderLight: '#262626',
  
  white: '#FFFFFF',
  black: '#000000',
  
  overlay: 'rgba(0,0,0,0.7)',
  glass: 'rgba(30,30,30,0.5)',
  glassBorder: 'rgba(255,255,255,0.1)',
};

// Default to Light (will be controlled by context)
export const Colors = LightColors;

export const Fonts = {
  regular: 'Poppins_400Regular',
  medium: 'Poppins_500Medium',
  semiBold: 'Poppins_600SemiBold',
  bold: 'Poppins_700Bold',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  full: 9999,
};

export const Shadow = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  medium: {
    shadowColor: '#FF7A00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 12,
  },
};
