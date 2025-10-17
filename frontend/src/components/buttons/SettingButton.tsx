import React from 'react';
import { Box, VStack, Text } from '@gluestack-ui/themed';
import { Settings as SettingsIcon } from 'lucide-react-native';

export default function Settings() {
  return (
    <Box flex={1} bg="$gray50">
      <Box bg="$white" pt="$12" pb="$4" px="$4" mb="$4">
        <Text fontSize="$2xl" fontWeight="$bold" color="$black">
          Settings
        </Text>
      </Box>
      
      <Box flex={1} justifyContent="center" alignItems="center" p="$4">
        <SettingsIcon size={64} color="#9ca3af" />
        <VStack space="sm" alignItems="center" mt="$4">
          <Text fontSize="$lg" fontWeight="$semibold" color="$gray600">
            Settings page coming soon
          </Text>
          <Text fontSize="$sm" color="$gray500" textAlign="center">
            Manage your preferences, notifications, and account settings
          </Text>
        </VStack>
      </Box>
    </Box>
  );
}