import { colors } from '@/constants/colors';
import React from 'react';
import type { ViewStyle } from 'react-native';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  variant?: 'primary' | 'secondary';
}

const CustomButton: React.FC<CustomButtonProps> = ({ 
  title, 
  onPress, 
  style,
  variant = 'primary' 
}) => {
  return (
    <TouchableOpacity 
      style={[
        styles.button, 
        variant === 'secondary' && styles.secondaryButton,
        style
      ]}
      onPress={onPress}
    >
      <Text style={[
        styles.buttonText,
        variant === 'secondary' && styles.secondaryButtonText
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.blue500,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
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
});

export default CustomButton;
