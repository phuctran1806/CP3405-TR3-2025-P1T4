import React from 'react';
import { Tabs } from 'expo-router';
import { Home, BarChart3, QrCode, Settings } from 'lucide-react-native';
import { View, StyleSheet } from 'react-native';
import { GluestackUIProvider } from '@gluestack-ui/themed';
   import { config } from '@gluestack-ui/config';

// TODO: put style in its corresponding component

export default function TabLayout() {
  return (
  <GluestackUIProvider config={config}>
      <Tabs
        screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: 65,
          paddingBottom: 5,
          paddingTop: 5,
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: -2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />

      <Tabs.Screen
        name="forecast"
        options={{
          title: 'Forecast',
          tabBarIcon: ({ color, size }) => <BarChart3 size={size} color={color} />,
        }}
      />

      <Tabs.Screen
        name="qrscan"
        options={{
          title: 'Scan',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={styles.qrButtonContainer}>
              <View
                style={[
                  styles.qrButton,
                  { backgroundColor: focused ? '#3b82f6' : '#60a5fa' },
                ]}
              >
                <QrCode size={28} color="#ffffff" />
              </View>
            </View>
          ),
          tabBarLabel: () => null,
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />,
        }}
      />

      <Tabs.Screen
        name="events"
        options={{
          href: null,
        }}
      />
    </Tabs>
  </GluestackUIProvider>)
}

const styles = StyleSheet.create({
  qrButtonContainer: {
    position: 'absolute',
    top: -20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 4,
    borderColor: '#ffffff',
  },
});
