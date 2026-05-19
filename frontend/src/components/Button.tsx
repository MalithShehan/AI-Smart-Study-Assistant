import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, BorderRadius, Fonts, Shadow } from '../theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  style,
  textStyle,
  fullWidth = true,
}) => {
  const sizeStyles: Record<string, { py: number; px: number; fontSize: number; height: number }> = {
    sm: { py: 8, px: 16, fontSize: 13, height: 40 },
    md: { py: 14, px: 24, fontSize: 15, height: 52 },
    lg: { py: 18, px: 32, fontSize: 16, height: 60 },
  };

  const { py, px, fontSize, height } = sizeStyles[size];

  const containerStyle: ViewStyle = {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    width: fullWidth ? '100%' : undefined,
    ...Shadow.medium,
    ...(disabled && { opacity: 0.6 }),
    ...style,
  };

  const textBaseStyle: TextStyle = {
    fontFamily: Fonts.semiBold,
    fontSize,
    textAlign: 'center',
    ...textStyle,
  };

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.85}
        style={containerStyle}
      >
        <LinearGradient
          colors={['#FF7A00', '#FF9A3C']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            height,
            paddingHorizontal: px,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          {loading ? (
            <ActivityIndicator color={Colors.white} size="small" />
          ) : (
            <>
              {icon}
              <Text style={{ ...textBaseStyle, color: Colors.white }}>{title}</Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  if (variant === 'outline') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.85}
        style={{
          ...containerStyle,
          borderWidth: 2,
          borderColor: Colors.primary,
          backgroundColor: Colors.white,
          height,
          paddingHorizontal: px,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        }}
      >
        {loading ? (
          <ActivityIndicator color={Colors.primary} size="small" />
        ) : (
          <>
            {icon}
            <Text style={{ ...textBaseStyle, color: Colors.primary }}>{title}</Text>
          </>
        )}
      </TouchableOpacity>
    );
  }

  if (variant === 'secondary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.85}
        style={{
          ...containerStyle,
          backgroundColor: Colors.primaryLight,
          height,
          paddingHorizontal: px,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        }}
      >
        {loading ? (
          <ActivityIndicator color={Colors.primary} size="small" />
        ) : (
          <>
            {icon}
            <Text style={{ ...textBaseStyle, color: Colors.primary }}>{title}</Text>
          </>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={{
        height,
        paddingHorizontal: px,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        ...style,
      }}
    >
      {icon}
      <Text style={{ ...textBaseStyle, color: Colors.primary }}>{title}</Text>
    </TouchableOpacity>
  );
};
