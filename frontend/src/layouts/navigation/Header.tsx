import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

export default function HeaderLayout() {
  return (
    <View style={styles.header}>
      {/* Left section: Avatar + text */}
      <View style={styles.leftSection}>
        <Image
          source={{
            uri: 'https://via.placeholder.com/150/4A90E2/FFFFFF?text=User',
          }}
          style={styles.avatar}
        />

        <View>
          <Text style={styles.subtitle}>Welcome back</Text>
          <Text style={styles.title}>Explore seats</Text>
        </View>
      </View>

      {/* Right section: JCU logo */}
      <View style={styles.rightSection}>
        <Image
          source={require('assets/jcu-logo.png')}
          style={styles.logo}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 65,
    width: '100%', // ensures full width
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: StyleSheet.hairlineWidth, // subtle bottom line only
    borderBottomColor: '#e5e7eb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    // subtle shadow to match tab bar
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1, // prevents overflow pushing logo
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3b82f6',
    marginRight: 12,
  },
  subtitle: {
    fontSize: 12,
    color: '#6b7280',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  rightSection: {
    width: 40,
    height: 40,
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden', // trims inner image edges cleanly
  },
  logo: {
    width: 95,
    height: 95,
    resizeMode: 'contain',
  },
});
