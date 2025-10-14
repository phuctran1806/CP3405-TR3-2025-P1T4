import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';

interface AuthFooterProps {
  onGuestLogin: () => void;
}

const AuthFooter: React.FC<AuthFooterProps> = ({ onGuestLogin }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.footerText}>
        By signing in/continue or logging in, you are agreeing to Streamline ICU account, 
        you agree to our{' '}
        <Text style={styles.footerLink}>Terms of Service</Text> and acknowledge our{' '}
        <Text style={styles.footerLink}>Privacy Policy</Text>. Well explore how to opt out of 
        office and promote.
      </Text>

      <TouchableOpacity onPress={onGuestLogin} style={styles.guestButton}>
        <Text style={styles.guestButtonText}>Sign in as a Guest</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  footerText: {
    fontSize: 11,
    color: colors.gray400,
    textAlign: 'center',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    maxWidth: 400,
  },
  footerLink: {
    color: colors.blue500,
  },
  guestButton: {
    marginTop: spacing.xs,
  },
  guestButtonText: {
    fontSize: 14,
    color: colors.white,
    fontWeight: '500',
  },
});

export default AuthFooter;
