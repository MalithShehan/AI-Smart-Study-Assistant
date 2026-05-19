import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';
import { Colors, BorderRadius } from '../theme';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: object;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 16,
  borderRadius = BorderRadius.md,
  style,
}) => {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 800, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: Colors.border,
          opacity,
        },
        style,
      ]}
    />
  );
};

export const CardSkeleton: React.FC = () => (
  <View
    style={{
      backgroundColor: Colors.white,
      borderRadius: BorderRadius.lg,
      padding: 16,
      marginBottom: 12,
    }}
  >
    <Skeleton width="60%" height={16} />
    <View style={{ height: 8 }} />
    <Skeleton width="90%" height={12} />
    <View style={{ height: 6 }} />
    <Skeleton width="75%" height={12} />
    <View style={{ height: 16 }} />
    <Skeleton height={6} borderRadius={3} />
  </View>
);
