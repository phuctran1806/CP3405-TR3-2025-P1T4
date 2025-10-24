import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import LoginInput from '@/components/forms/LoginInput';
import LoginButton from '@/components/buttons/LoginButton';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { Picker } from '@react-native-picker/picker';

type Roles = 'student' | 'lecturer' | 'admin';

interface SignupFormProps {
  email: string;
  name: string;
  phoneNumber: string;
  role: Roles;
  password: string;
  studentId: string;
  emailError?: string;
  nameError?: string;
  phoneError?: string;
  passwordError?: string;
  studentIdError?: string;
  loading?: boolean
  onEmailChange: (text: string) => void;
  onNameChange: (text: string) => void;
  onPhoneNumberChange: (text: string) => void;
  onRoleChange: (role: Roles) => void;
  onPasswordChange: (text: string) => void;
  onStudentIdChange: (text: string) => void;
  onSignup: () => void;
  onSignIn: () => void;
}

const SignupForm: React.FC<SignupFormProps> = ({
  email,
  name,
  phoneNumber,
  role,
  password,
  studentId,
  emailError,
  nameError,
  phoneError,
  passwordError,
  studentIdError,
  loading,
  onEmailChange,
  onNameChange,
  onPhoneNumberChange,
  onRoleChange,
  onPasswordChange,
  onStudentIdChange,
  onSignup,
  onSignIn,
}) => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Sign Up</Text>
      <Text style={styles.subtitle}>Create your account to get started!</Text>

      <LoginInput placeholder="Full Name" value={name} onChangeText={onNameChange} error={nameError} />
      <LoginInput placeholder="Email" value={email} onChangeText={onEmailChange} error={emailError} keyboardType="email-address" autoCapitalize="none" />
      <LoginInput placeholder="Phone Number" value={phoneNumber} onChangeText={onPhoneNumberChange} error={phoneError} keyboardType="phone-pad" />

      <View style={styles.pickerContainer}>
        <Picker selectedValue={role} onValueChange={onRoleChange} style={styles.picker} dropdownIconColor={colors.gray700}>
          <Picker.Item label="Student" value="student" />
          <Picker.Item label="Lecturer" value="lecturer" />
          <Picker.Item label="Admin" value="admin" />
        </Picker>
      </View>

      {role === 'student' && (
        <LoginInput placeholder="Student ID" value={studentId} onChangeText={onStudentIdChange} error={studentIdError} />
      )}

      <LoginInput placeholder="Password" value={password} onChangeText={onPasswordChange} secureTextEntry autoCapitalize="none" error={passwordError} />

      <LoginButton
        title="Sign Up"
        onPress={onSignup}
        loading={loading}
        disabled={loading}
      />

      <View style={styles.signInContainer}>
        <Text style={styles.signInText}>Already have an account? </Text>
        <TouchableOpacity onPress={onSignIn}>
          <Text style={styles.signInLink}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { width: '100%', maxWidth: 400, backgroundColor: colors.white, borderRadius: 16, padding: spacing.lg },
  title: { fontSize: 28, fontWeight: 'bold', color: colors.gray900, marginBottom: spacing.xs, textAlign: 'center' },
  subtitle: { fontSize: 14, color: colors.gray600, marginBottom: spacing.lg, textAlign: 'center' },
  pickerContainer: { backgroundColor: colors.gray50, borderRadius: 8, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.gray200, height: 50, justifyContent: 'center' },
  picker: { color: colors.gray900, fontSize: 16, height: 50, width: '100%', backgroundColor: 'transparent' },
  signInContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: spacing.md },
  signInText: { fontSize: 14, color: colors.gray600 },
  signInLink: { fontSize: 14, color: colors.blue500, fontWeight: '600' },
});

export default SignupForm;
