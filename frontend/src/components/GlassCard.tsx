import React from 'react';
import { View, StyleProp, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

interface GlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  intensity?: number; // 0-100
  tint?: 'light' | 'dark' | 'default';
  borderRadius?: number;
  withShadow?: boolean;
  withBorder?: boolean;
}

/**
 * Glassmorphism Card Component
 * Creates a modern glass-like effect with blur and transparency
 */
export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  intensity = 20,
  tint = 'light',
  borderRadius = 16,
  withShadow = true,
  withBorder = true,
}) => {
  return (
    <View
      style={[
        {
          borderRadius,
          overflow: 'hidden',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
        },
        withShadow && {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 5,
        },
        style,
      ]}
    >
      {/* Blur Background */}
      <BlurView
        intensity={intensity}
        tint={tint}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />

      {/* Gradient Overlay for extra depth */}
      <LinearGradient
        colors={[
          'rgba(255, 255, 255, 0.2)',
          'rgba(255, 255, 255, 0.05)',
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />

      {/* Border */}
      {withBorder && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius,
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.2)',
          }}
        />
      )}

      {/* Content */}
      <View style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </View>
    </View>
  );
};

/**
 * Glass Modal Component
 * Full-screen glassmorphism modal
 */
export const GlassModal: React.FC<{
  visible: boolean;
  children: React.ReactNode;
  onClose?: () => void;
}> = ({ visible, children, onClose }) => {
  if (!visible) return null;

  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
      }}
    >
      <BlurView
        intensity={80}
        tint="dark"
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20,
        }}
      >
        {children}
      </BlurView>
    </View>
  );
};

/**
 * Frosted Glass Panel
 * Strong frosted glass effect
 */
export const FrostedPanel: React.FC<{
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}> = ({ children, style }) => {
  return (
    <View
      style={[
        {
          borderRadius: 20,
          overflow: 'hidden',
          backgroundColor: 'rgba(255, 255, 255, 0.15)',
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.3)',
        },
        style,
      ]}
    >
      <BlurView
        intensity={50}
        tint="light"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />
      <View style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </View>
    </View>
  );
};
