import { colors } from '@/constants/colors';
import React from 'react';
import type { ViewStyle } from 'react-native';
import { StyleSheet, Text, TouchableOpacity, ActivityIndicator } from 'react-native';

interface LoginButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  variant?: 'primary' | 'secondary';
}

const LoginButton: React.FC<LoginButtonProps> = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  style,
  variant = 'primary'
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        variant === 'secondary' && styles.secondaryButton,
        style,
        (disabled || loading) && styles.disabled
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={[
          styles.buttonText,
          variant === 'secondary' && styles.secondaryButtonText
        ]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.blue500,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.blue500,
  },
  secondaryButtonText: {
    color: colors.blue500,
  },
  disabled: {
    opacity: 0.6,
  },
});

export default LoginButton;

