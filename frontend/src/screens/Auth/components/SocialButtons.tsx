import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';

interface SocialButtonsProps {
  onSocialLogin: (provider: string) => void;
}

const SocialButtons: React.FC<SocialButtonsProps> = ({ onSocialLogin }) => {
  const socialProviders = [
    { id: 'google', icon: 'G', label: 'Google' },
    { id: 'facebook', icon: 'f', label: 'Facebook' },
    { id: 'apple', icon: '🍎', label: 'Apple' },
    { id: 'github', icon: '⚙', label: 'GitHub' },
  ];

  return (
    <View style={styles.socialButtonsContainer}>
      {socialProviders.map((provider) => (
        <TouchableOpacity
          key={provider.id}
          style={styles.socialButton}
          onPress={() => onSocialLogin(provider.label)}
        >
          <Text style={styles.socialButtonText}>{provider.icon}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 400,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  socialButton: {
    width: '22%',
    aspectRatio: 1,
    backgroundColor: colors.gray50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  socialButtonText: {
    fontSize: 20,
    color: colors.gray700,
  },
});

export default SocialButtons;
