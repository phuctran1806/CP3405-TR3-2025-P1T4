import React from 'react';
import { Tabs } from 'expo-router';
import { Home } from 'lucide-react-native';

export default function MainLayout() {
  return (
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
        name="home/index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />

      {/* Dashboard (hidden) */}
      <Tabs.Screen
        name="dashboard/[location]"
        options={{
          href: null, // Hides it from the tab bar
        }}
      />
    </Tabs>
  );
}
