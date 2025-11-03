import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import CheckBox from '@/components/buttons/CheckBox';
import SocialButtons from './SocialButtons';
import LoginInput from '@/components/forms/LoginInput';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import LoginButton from '@/components/buttons/LoginButton';

interface LoginFormProps {
  email: string;
  password: string;
  rememberMe: boolean;
  emailError?: string | null;
  passwordError?: string | null;
  generalError?: string | null;
  loading?: boolean;
  onEmailChange: (text: string) => void;
  onPasswordChange: (text: string) => void;
  onRememberMeToggle: () => void;
  onLogin: () => void;
  onForgotPassword: () => void;
  onSignUp: () => void;
  onSocialLogin: (provider: string) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({
  email,
  password,
  rememberMe,
  emailError,
  passwordError,
  generalError,
  loading,
  onEmailChange,
  onPasswordChange,
  onRememberMeToggle,
  onLogin,
  onForgotPassword,
  onSignUp,
  onSocialLogin,
}) => {
  return (
    <View style={styles.loginCard}>
      <Text style={styles.title}>Login</Text>
      <Text style={styles.subtitle}>Enter your email and password to login!</Text>

      <LoginInput
        placeholder="example@email.com"
        value={email}
        onChangeText={onEmailChange}
        keyboardType="email-address"
        autoCapitalize="none"
        error={emailError}
      />

      <LoginInput
        placeholder="••••••••"
        value={password}
        onChangeText={onPasswordChange}
        secureTextEntry
        autoCapitalize="none"
        error={passwordError}
      />

      <View style={styles.optionsRow}>
        <CheckBox
          checked={rememberMe}
          onToggle={onRememberMeToggle}
          label="Remember me"
        />
        <TouchableOpacity onPress={onForgotPassword}>
          <Text style={styles.forgotPassword}>Forgot Password?</Text>
        </TouchableOpacity>
      </View>

      <LoginButton
        title="Log in"
        onPress={onLogin}
        loading={loading}
        disabled={loading}
        style={styles.loginButton}
      />

      {generalError && (
        <Text style={{ color: colors.red500, marginTop: 8, textAlign: 'center' }}>
          {generalError}
        </Text>
      )}

      <View style={styles.dividerContainer}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>Or log in with</Text>
        <View style={styles.dividerLine} />
      </View>

      <SocialButtons onSocialLogin={onSocialLogin} />

      <View style={styles.signUpContainer}>
        <Text style={styles.signUpText}>Don&apos;t have an account? </Text>
        <TouchableOpacity onPress={onSignUp}>
          <Text style={styles.signUpLink}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  loginCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.gray900,
    marginBottom: spacing.xs,
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 14,
    color: colors.gray600,
    marginBottom: spacing.lg,
    textAlign: 'center'
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg
  },
  forgotPassword: {
    fontSize: 14,
    color: colors.blue500,
    fontWeight: '500'
  },
  loginButton: {
    marginBottom: spacing.md
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.gray200
  },
  dividerText: {
    marginHorizontal: spacing.sm,
    fontSize: 12,
    color: colors.gray400
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md
  },
  signUpText: {
    fontSize: 14,
    color: colors.gray600
  },
  signUpLink: {
    fontSize: 14,
    color: colors.blue500,
    fontWeight: '600'
  },
});

export default LoginForm;

