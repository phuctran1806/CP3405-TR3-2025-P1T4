import React from 'react';
import { TextInput, StyleSheet, View } from 'react-native';
import type { TextInputProps } from 'react-native';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';

interface CustomInputProps extends TextInputProps {
  style?: any;
}

const CustomInput: React.FC<CustomInputProps> = ({ style, ...props }) => {
  return (
    <View style={styles.inputContainer}>
      <TextInput
        style={[styles.input, style]}
        placeholderTextColor={colors.gray400}
        autoCorrect={false}
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    marginBottom: spacing.md,
  },
  input: {
    backgroundColor: colors.gray50,
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    color: colors.gray900,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
});

export default CustomInput;
