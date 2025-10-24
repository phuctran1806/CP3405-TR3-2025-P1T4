import React from "react";
import { View, TextInput, Text, StyleSheet } from "react-native";
import type { TextInputProps } from "react-native";
import { colors } from "@/constants/colors";

type LoginInputProps = TextInputProps & {
  error?: string | null;
};

const LoginInput: React.FC<LoginInputProps> = ({ style, error, ...props }) => {
  return (
    <View style={styles.inputContainer}>
      <TextInput
        style={[styles.input, style]}
        placeholderTextColor={colors.gray400}
        autoCorrect={false}
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: { marginVertical: 8 },
  input: {
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: 8,
    padding: 12,
    color: colors.black,
  },
  errorText: {
    color: colors.red500,
    marginTop: 4,
  },
});

export default LoginInput;

