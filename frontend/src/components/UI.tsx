import React from 'react';
import { View, Text, ViewStyle } from 'react-native';
import { Colors, Fonts, BorderRadius } from '../theme';

interface BadgeProps {
  label: string;
  color?: string;
  bgColor?: string;
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  color = Colors.primary,
  bgColor = Colors.primaryLight,
  size = 'md',
  style,
}) => {
  const sizes = {
    sm: { px: 8, py: 3, fontSize: 10 },
    md: { px: 12, py: 5, fontSize: 12 },
  };
  const { px, py, fontSize } = sizes[size];
  return (
    <View
      style={{
        backgroundColor: bgColor,
        borderRadius: BorderRadius.full,
        paddingHorizontal: px,
        paddingVertical: py,
        alignSelf: 'flex-start',
        ...style,
      }}
    >
      <Text style={{ fontFamily: Fonts.semiBold, fontSize, color }}>{label}</Text>
    </View>
  );
};

interface ProgressBarProps {
  progress: number; // 0-1
  color?: string;
  bgColor?: string;
  height?: number;
  style?: ViewStyle;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  color = Colors.primary,
  bgColor = Colors.primaryLight,
  height = 6,
  style,
}) => (
  <View style={{ backgroundColor: bgColor, borderRadius: BorderRadius.full, height, ...style }}>
    <View
      style={{
        width: `${Math.min(Math.max(progress * 100, 0), 100)}%`,
        height,
        backgroundColor: color,
        borderRadius: BorderRadius.full,
      }}
    />
  </View>
);

interface AvatarProps {
  initials?: string;
  size?: number;
  bgColor?: string;
  color?: string;
  fontSize?: number;
  style?: ViewStyle;
}

export const Avatar: React.FC<AvatarProps> = ({
  initials = 'U',
  size = 44,
  bgColor = Colors.primaryLight,
  color = Colors.primary,
  fontSize,
  style,
}) => (
  <View
    style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: bgColor,
      alignItems: 'center',
      justifyContent: 'center',
      ...style,
    }}
  >
    <Text style={{ fontFamily: Fonts.bold, fontSize: fontSize ?? size * 0.36, color }}>{initials}</Text>
  </View>
);

interface DividerProps {
  label?: string;
  style?: ViewStyle;
}

export const Divider: React.FC<DividerProps> = ({ label, style }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', ...style }}>
    <View style={{ flex: 1, height: 1, backgroundColor: Colors.border }} />
    {label && (
      <Text
        style={{
          fontFamily: Fonts.regular,
          fontSize: 13,
          color: Colors.textLight,
          marginHorizontal: 12,
        }}
      >
        {label}
      </Text>
    )}
    <View style={{ flex: 1, height: 1, backgroundColor: Colors.border }} />
  </View>
);
