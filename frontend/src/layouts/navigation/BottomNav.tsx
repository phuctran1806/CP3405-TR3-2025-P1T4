import React, { useState, useEffect } from 'react';
import { Tabs } from 'expo-router';
import { Home, Settings, MapPin } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { UserRole } from '@/api/types';
import { View, ActivityIndicator } from 'react-native';

export default function MainLayout() {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserRole = async () => {
      try {
        const role = await AsyncStorage.getItem('user_role');
        setUserRole((role as UserRole) || 'guest');
      } catch (error) {
        console.error('Error loading user role:', error);
        setUserRole('guest');
      } finally {
        setLoading(false);
      }
    };

    loadUserRole();
  }, []);

  // Show loading indicator while fetching role
  if (loading || userRole === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

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
      {/* Location Editor - Only visible for admin */}
      <Tabs.Screen
        name="editor/index"
        options={{
          title: 'Edit Map',
          tabBarIcon: ({ color, size }) => <MapPin size={size} color={color} />,
          href: userRole === 'admin' ? undefined : null, // Hide from non-admins
        }}
      />

      {/* Home Screen */}
      <Tabs.Screen
        name="home/index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />

      {/* Settings Screen */}
      <Tabs.Screen
        name="settings/index"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />,
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