export const Colors = {
  primary: '#FF7A00',
  primaryLight: '#FFE0B2',
  primaryDark: '#E56900',
  primaryGradient: ['#FF7A00', '#FF9A3C'] as const,
  secondary: '#FFE0B2',
  background: '#F8F9FB',
  card: '#FFFFFF',
  textDark: '#1E1E1E',
  textGray: '#6B7280',
  textLight: '#9CA3AF',
  success: '#4CAF50',
  successLight: '#E8F5E9',
  purple: '#8B5CF6',
  purpleLight: '#EDE9FE',
  danger: '#EF4444',
  dangerLight: '#FEE2E2',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  border: '#E5E7EB',
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(0,0,0,0.5)',
  glass: 'rgba(255,255,255,0.15)',
  glassBorder: 'rgba(255,255,255,0.3)',
};

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
