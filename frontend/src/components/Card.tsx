import React from 'react';
import { View, ViewStyle } from 'react-native';
import { Colors, BorderRadius, Shadow } from '../theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: number;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  variant = 'default',
  padding = 16,
}) => {
  const variantStyles: Record<string, ViewStyle> = {
    default: {
      backgroundColor: Colors.card,
      ...Shadow.small,
    },
    elevated: {
      backgroundColor: Colors.card,
      ...Shadow.large,
    },
    outlined: {
      backgroundColor: Colors.card,
      borderWidth: 1,
      borderColor: Colors.border,
    },
  };

  return (
    <View
      style={{
        borderRadius: BorderRadius.lg,
        padding,
        ...variantStyles[variant],
        ...style,
      }}
    >
      {children}
    </View>
  );
};
