import React, { useState } from 'react';
import { Alert, Platform, ScrollView } from 'react-native';
import { Box, VStack, Text, HStack, Switch, Pressable } from '@gluestack-ui/themed';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function Settings() {
  const [darkMode, setDarkMode] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => router.replace('/login') },
    ]);

    if (Platform.OS === 'web') {
      router.replace('/login');
    }
  };

  return (
    <Box flex={1} bg="$gray50">
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text fontSize="$xl" fontWeight="$bold" color="$black" mb="$4">
          Settings
        </Text>

        {/* Theme Setting */}
        <VStack
          bg="$white"
          borderRadius="$2xl"
          p="$4"
          shadowColor="#000"
          shadowOffset={{ width: 0, height: 2 }}
          shadowOpacity={0.08}
          shadowRadius={8}
        >
          <HStack justifyContent="space-between" alignItems="center">
            <Text fontSize="$md" color="$gray700">
              Dark Mode
            </Text>
            <Switch value={darkMode} onValueChange={setDarkMode} />
          </HStack>
        </VStack>

        {/* Logout Button */}
        <VStack
          bg="$white"
          borderRadius="$2xl"
          p="$4"
          mt="$4"
          shadowColor="#000"
          shadowOffset={{ width: 0, height: 2 }}
          shadowOpacity={0.08}
          shadowRadius={8}
        >
          <Pressable
            onPress={handleLogout}
            p="$2"
            borderRadius="$md"
          >
            <HStack justifyContent="space-between" alignItems="center">
              <Text fontSize="$md" color="$red600" fontWeight="$semibold">
                Log Out
              </Text>
              <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            </HStack>
          </Pressable>
        </VStack>
      </ScrollView>
    </Box>
  );
}
