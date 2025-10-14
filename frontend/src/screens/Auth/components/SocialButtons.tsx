import React from 'react';
import { Image, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';


interface SocialButtonsProps {
  onSocialLogin: (provider: string) => void;
}

const SocialButtons: React.FC<SocialButtonsProps> = ({ onSocialLogin }) => {
  const socialProviders = [
    {
      id: 'google',
      icon: <Image source={require('assets/icons/google.png')} style={{ width: 24, height: 24 }} />,
      label: 'Google',
    },
    {
      id: 'facebook',
      icon: <Image source={require('assets/icons/facebook.png')} style={{ width: 24, height: 24 }} />,
      label: 'Facebook',
    },
    {
      id: 'apple',
      icon: <Image source={require('assets/icons/apple.png')} style={{ width: 24, height: 24 }} />,
      label: 'Apple',
    },
    {
      id: 'github',
      icon: <Image source={require('assets/icons/github.png')} style={{ width: 24, height: 24 }} />,
      label: 'GitHub',
    },
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
