import React from 'react';
import {
  View,
  Text,
  ViewStyle,
  TextStyle,
  StyleProp,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';

// ============================================================================
// GRADIENT CARD COMPONENT
// ============================================================================

interface GradientCardProps {
  children: React.ReactNode;
  colors?: [string, string, ...string[]];
  startPoint?: { x: number; y: number };
  endPoint?: { x: number; y: number };
  style?: StyleProp<ViewStyle>;
  borderRadius?: number;
  shadow?: boolean;
}

export const GradientCard: React.FC<GradientCardProps> = ({
  children,
  colors = ['#3b82f6', '#1e40af'],
  startPoint = { x: 0, y: 0 },
  endPoint = { x: 1, y: 1 },
  style,
  borderRadius = 16,
  shadow = true,
}) => {
  return (
    <LinearGradient
      colors={colors}
      start={startPoint}
      end={endPoint}
      style={[
        {
          borderRadius,
          overflow: 'hidden',
        },
        shadow && {
          shadowColor: colors[0],
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.25,
          shadowRadius: 12,
          elevation: 8,
        },
        style,
      ]}
    >
      {children}
    </LinearGradient>
  );
};

// ============================================================================
// PREMIUM BUTTON COMPONENT
// ============================================================================

interface PremiumButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const PremiumButton: React.FC<PremiumButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  fullWidth = true,
  loading = false,
  disabled = false,
  icon,
  style,
}) => {
  const scale = useSharedValue(1);

  const variantStyles: Record<string, { bg: string; text: string; border: string }> = {
    primary: { bg: 'bg-blue-600', text: 'text-white', border: 'border-blue-600' },
    secondary: { bg: 'bg-gray-200', text: 'text-gray-900', border: 'border-gray-200' },
    outline: { bg: 'bg-transparent', text: 'text-blue-600', border: 'border-blue-600' },
    danger: { bg: 'bg-red-600', text: 'text-white', border: 'border-red-600' },
    success: { bg: 'bg-green-600', text: 'text-white', border: 'border-green-600' },
  };

  const sizeStyles: Record<string, string> = {
    sm: 'px-3 py-2',
    md: 'px-4 py-3',
    lg: 'px-6 py-4',
  };

  const { bg, text, border } = variantStyles[variant];

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      style={[
        animatedStyle,
        {
          opacity: disabled ? 0.5 : 1,
        },
      ]}
    >
      <View
        className={`rounded-xl flex-row items-center justify-center gap-2 border ${
          variant === 'outline' ? 'border-2' : 'border-0'
        } ${fullWidth ? 'w-full' : ''} ${bg} ${sizeStyles[size]}`}
        style={style}
      >
        {loading ? (
          <ActivityIndicator color={variant === 'outline' ? '#2563eb' : '#ffffff'} />
        ) : (
          <>
            {icon}
            <Text className={`font-bold text-center ${text}`}>
              {label}
            </Text>
          </>
        )}
      </View>
    </Animated.View>
  );
};

// ============================================================================
// STAT CARD COMPONENT (for dashboards/analytics)
// ============================================================================

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon?: React.ReactNode;
  colors?: [string, string];
  trend?: { value: number; positive: boolean };
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtext,
  icon,
  colors = ['#10b981', '#059669'],
  trend,
}) => {
  return (
    <GradientCard colors={colors} borderRadius={16}>
      <View className="p-5">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-white text-sm font-semibold opacity-90">
            {label}
          </Text>
          {icon && <View className="text-white">{icon}</View>}
        </View>

        <Text className="text-white text-3xl font-black mb-2">
          {value}
        </Text>

        {trend && (
          <View className="flex-row items-center gap-1">
            <Text className={`text-sm font-semibold ${trend.positive ? 'text-green-200' : 'text-red-200'}`}>
              {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </Text>
          </View>
        )}

        {subtext && (
          <Text className="text-white text-xs opacity-75 mt-1">
            {subtext}
          </Text>
        )}
      </View>
    </GradientCard>
  );
};

// ============================================================================
// EXPANDABLE CARD COMPONENT
// ============================================================================

interface ExpandableCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  expanded?: boolean;
  onToggle?: (expanded: boolean) => void;
  icon?: React.ReactNode;
  variant?: 'info' | 'success' | 'warning' | 'error';
}

export const ExpandableCard: React.FC<ExpandableCardProps> = ({
  title,
  description,
  children,
  expanded = false,
  onToggle,
  icon,
  variant = 'info',
}) => {
  const variantColors: Record<string, string> = {
    info: 'border-blue-500 bg-blue-50',
    success: 'border-green-500 bg-green-50',
    warning: 'border-yellow-500 bg-yellow-50',
    error: 'border-red-500 bg-red-50',
  };

  const iconBgColors: Record<string, string> = {
    info: 'bg-blue-100 text-blue-600',
    success: 'bg-green-100 text-green-600',
    warning: 'bg-yellow-100 text-yellow-600',
    error: 'bg-red-100 text-red-600',
  };

  return (
    <View
      className={`border-l-4 rounded-xl overflow-hidden ${variantColors[variant]}`}
    >
      <View className="p-4">
        <View
          className="flex-row items-center justify-between"
        >
          <View className="flex-row items-center gap-3 flex-1">
            {icon && (
              <View className={`w-10 h-10 rounded-lg justify-center items-center ${iconBgColors[variant]}`}>
                {icon}
              </View>
            )}
            <View className="flex-1">
              <Text className="font-bold text-gray-900 text-base">
                {title}
              </Text>
              {description && (
                <Text className="text-gray-600 text-xs mt-1">
                  {description}
                </Text>
              )}
            </View>
          </View>
          <Text className="text-lg font-bold text-gray-600">
            {expanded ? '−' : '+'}
          </Text>
        </View>

        {expanded && (
          <Animated.View entering={Animated.FadeInDown.springify()} className="mt-4 pt-4 border-t border-gray-200">
            {children}
          </Animated.View>
        )}
      </View>
    </View>
  );
};

// ============================================================================
// PROGRESS RING COMPONENT (circular progress indicator)
// ============================================================================

interface ProgressRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  colors?: [string, string];
  label?: string;
  subLabel?: string;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  percentage,
  size = 120,
  strokeWidth = 8,
  colors = ['#3b82f6', '#1e40af'],
  label,
  subLabel,
}) => {
  const circumference = 2 * Math.PI * ((size - strokeWidth) / 2);
  const progress = useSharedValue(0);

  React.useEffect(() => {
    progress.value = withSpring(percentage / 100);
  }, [percentage]);

  const animatedStyle = useAnimatedStyle(() => ({
    strokeDashoffset: interpolate(
      progress.value,
      [0, 1],
      [circumference, 0],
      Extrapolate.CLAMP
    ),
  }));

  return (
    <View className="items-center">
      <View style={{ width: size, height: size, position: 'relative' }}>
        {/* Background circle */}
        <svg width={size} height={size} style={{ position: 'absolute' }}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={(size - strokeWidth) / 2}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <Animated.circle
            cx={size / 2}
            cy={size / 2}
            r={(size - strokeWidth) / 2}
            fill="none"
            stroke={colors[0]}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeLinecap="round"
            style={animatedStyle}
          />
        </svg>

        {/* Center content */}
        <View className="absolute inset-0 justify-center items-center">
          {label && (
            <Text className="text-2xl font-black text-gray-900">
              {Math.round(percentage)}%
            </Text>
          )}
          {subLabel && (
            <Text className="text-xs text-gray-600 mt-1">
              {subLabel}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
};

// ============================================================================
// BADGE COMPONENT
// ============================================================================

interface BadgeProps {
  label: string;
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'primary',
  size = 'md',
}) => {
  const variantStyles: Record<string, { bg: string; text: string }> = {
    primary: { bg: 'bg-blue-100', text: 'text-blue-700' },
    success: { bg: 'bg-green-100', text: 'text-green-700' },
    warning: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
    error: { bg: 'bg-red-100', text: 'text-red-700' },
    secondary: { bg: 'bg-gray-100', text: 'text-gray-700' },
  };

  const sizeStyles: Record<string, { px: string; py: string; text: string }> = {
    sm: { px: 'px-2', py: 'py-1', text: 'text-xs' },
    md: { px: 'px-3', py: 'py-1.5', text: 'text-sm' },
    lg: { px: 'px-4', py: 'py-2', text: 'text-base' },
  };

  const { bg, text } = variantStyles[variant];
  const { px, py, text: textSize } = sizeStyles[size];

  return (
    <View className={`rounded-full ${bg} ${px} ${py}`}>
      <Text className={`font-bold ${text} ${textSize}`}>
        {label}
      </Text>
    </View>
  );
};

// ============================================================================
// EMPTY STATE COMPONENT
// ============================================================================

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <View className="flex-1 items-center justify-center px-6 py-12">
      <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
        {icon}
      </View>
      <Text className="text-xl font-bold text-gray-900 text-center mb-2">
        {title}
      </Text>
      <Text className="text-sm text-gray-600 text-center mb-6">
        {description}
      </Text>
      {actionLabel && onAction && (
        <PremiumButton label={actionLabel} onPress={onAction} size="md" />
      )}
    </View>
  );
};
