import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import CheckBox from '@/components/buttons/CheckBox';
import LoginInput from '@/components/forms/LoginInput';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import LoginButton from '@/components/buttons/LoginButton';
import { ChevronDown } from 'lucide-react-native';

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

const quickLoginCredentials = [
  { role: 'Student', email: 'student@jcu.edu.au', password: 'student123' },
  { role: 'Lecturer', email: 'lecturer@jcu.edu.au', password: 'lecturer123' },
  { role: 'Admin', email: 'admin@jcu.edu.au', password: 'admin123' },
];

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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleQuickLogin = (credential: typeof quickLoginCredentials[0]) => {
    onEmailChange(credential.email);
    onPasswordChange(credential.password);
    setIsDropdownOpen(false);
  };

  return (
    <View style={styles.loginCard}>
      <Text style={styles.title}>Login</Text>
      <Text style={styles.subtitle}>Enter your email and password to login!</Text>

      {/* Quick Login Dropdown */}
      <View style={styles.quickLoginContainer}>
        <TouchableOpacity
          style={styles.dropdownButton}
          onPress={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <Text style={styles.dropdownButtonText}>Quick Login</Text>
          <ChevronDown 
            size={16} 
            color={colors.blue500} 
            style={{ 
              transform: [{ rotate: isDropdownOpen ? '180deg' : '0deg' }] 
            }} 
          />
        </TouchableOpacity>
        
        {isDropdownOpen && (
          <View style={styles.dropdownMenu}>
            {quickLoginCredentials.map((credential, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dropdownItem,
                  index !== quickLoginCredentials.length - 1 && styles.dropdownItemBorder
                ]}
                onPress={() => handleQuickLogin(credential)}
              >
                <View>
                  <Text style={styles.dropdownItemRole}>{credential.role}</Text>
                  <Text style={styles.dropdownItemEmail}>{credential.email}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

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
  quickLoginContainer: {
    marginBottom: spacing.md,
    position: 'relative',
    zIndex: 1000,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.blue50,
    borderWidth: 1,
    borderColor: colors.blue200,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  dropdownButtonText: {
    fontSize: 14,
    color: colors.blue500,
    fontWeight: '600',
  },
  dropdownMenu: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    borderRadius: 8,
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  dropdownItem: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  dropdownItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  dropdownItemRole: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray900,
    marginBottom: 2,
  },
  dropdownItemEmail: {
    fontSize: 12,
    color: colors.gray600,
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