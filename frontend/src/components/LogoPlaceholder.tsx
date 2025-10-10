import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';

const LogoPlaceholder = () => {
  return (
    <View style={styles.logoContainer}>
      <View style={styles.logoPlaceholder}>
        <Text style={styles.logoText}>LOGO</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  logoContainer: {
    marginBottom: spacing.xl,
  },
  logoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A2942',
  },
});

export default LogoPlaceholder;
