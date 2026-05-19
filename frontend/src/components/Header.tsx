import React from 'react';
import { View, Text, TouchableOpacity, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Colors, Fonts } from '../theme';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  rightAction?: { icon: keyof typeof Ionicons.glyphMap; onPress: () => void };
  transparent?: boolean;
  style?: ViewStyle;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  rightAction,
  transparent = false,
  style,
}) => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        paddingTop: insets.top + 8,
        paddingBottom: 12,
        paddingHorizontal: 20,
        backgroundColor: transparent ? 'transparent' : Colors.white,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        ...style,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
        {showBack && (
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: Colors.background,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12,
            }}
          >
            <Ionicons name="arrow-back" size={20} color={Colors.textDark} />
          </TouchableOpacity>
        )}
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontFamily: Fonts.bold,
              fontSize: 20,
              color: transparent ? Colors.white : Colors.textDark,
            }}
          >
            {title}
          </Text>
          {subtitle && (
            <Text
              style={{
                fontFamily: Fonts.regular,
                fontSize: 13,
                color: transparent ? 'rgba(255,255,255,0.8)' : Colors.textGray,
                marginTop: 2,
              }}
            >
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      {rightAction && (
        <TouchableOpacity
          onPress={rightAction.onPress}
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            backgroundColor: transparent ? Colors.glass : Colors.background,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons
            name={rightAction.icon}
            size={20}
            color={transparent ? Colors.white : Colors.textDark}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};
