import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius, Fonts, Spacing } from '../theme';

interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  error?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  multiline?: boolean;
  numberOfLines?: number;
  style?: ViewStyle;
  editable?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  error,
  icon,
  multiline = false,
  numberOfLines = 1,
  style,
  editable = true,
}) => {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={{ marginBottom: Spacing.md, ...style }}>
      {label && (
        <Text
          style={{
            fontFamily: Fonts.medium,
            fontSize: 14,
            color: Colors.textDark,
            marginBottom: 8,
          }}
        >
          {label}
        </Text>
      )}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: Colors.white,
          borderRadius: BorderRadius.lg,
          borderWidth: 1.5,
          borderColor: error ? Colors.danger : focused ? Colors.primary : Colors.border,
          paddingHorizontal: 16,
          minHeight: multiline ? undefined : 52,
          paddingVertical: multiline ? 12 : 0,
          shadowColor: focused ? Colors.primary : '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: focused ? 0.1 : 0.04,
          shadowRadius: 8,
          elevation: focused ? 3 : 1,
        }}
      >
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color={focused ? Colors.primary : Colors.textLight}
            style={{ marginRight: 10 }}
          />
        )}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.textLight}
          secureTextEntry={secureTextEntry && !showPassword}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          multiline={multiline}
          numberOfLines={numberOfLines}
          editable={editable}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            flex: 1,
            fontFamily: Fonts.regular,
            fontSize: 15,
            color: Colors.textDark,
            paddingVertical: 0,
          }}
        />
        {secureTextEntry && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={Colors.textLight}
            />
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text
          style={{
            fontFamily: Fonts.regular,
            fontSize: 12,
            color: Colors.danger,
            marginTop: 4,
            marginLeft: 4,
          }}
        >
          {error}
        </Text>
      )}
    </View>
  );
};
