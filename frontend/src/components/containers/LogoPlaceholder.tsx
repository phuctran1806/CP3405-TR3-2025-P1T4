import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';

const LogoPlaceholder = () => {
  return (
    <View style={styles.logoContainer}>
      <View style={styles.logoPlaceholder}>
        <Image
          source={require("assets/jcu-logo.png")}
          style={styles.logoImage}
          resizeMode="contain"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  logoContainer: {
    marginBottom: spacing.xl,
  },
  logoPlaceholder: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
});

export default LogoPlaceholder;
