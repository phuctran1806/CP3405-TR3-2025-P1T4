import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { UserCircle } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HeaderLayout() {
  const [username, setUsername] = React.useState("");

  React.useEffect(() => {
    const fetchUsername = async () => {
      const storedUsername = await AsyncStorage.getItem("user_data").then(data => {
        if (data) {
          const user = JSON.parse(data);
          return user.name || "";
        }
      });
      if (storedUsername) {
        setUsername(storedUsername);
      }
    };

    fetchUsername();
  }, []);

  return (
    <View style={styles.header}>
      {/* Left section: Avatar + text */}
      <View style={styles.leftSection}>
        <UserCircle style={styles.avatar} />
        <View>
          <Text style={styles.subtitle}>Welcome back</Text>
          <Text style={styles.title}>{username}</Text>
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
