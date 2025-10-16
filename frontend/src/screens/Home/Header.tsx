import React from 'react';
import { Box, HStack, VStack, Text, Avatar, AvatarImage } from '@gluestack-ui/themed';
import { Image } from 'react-native';

export default function Header() {
  return (
    <Box bg="$white" pt="$12" pb="$4" px="$4">
      <HStack justifyContent="space-between" alignItems="center">
        <HStack space="md" alignItems="center" flex={1}>
          <Avatar size="md" bg="$blue500">
            <AvatarImage
              source={{
                uri: 'https://via.placeholder.com/150/4A90E2/FFFFFF?text=User',
              }}
              alt="Profile"
            />
          </Avatar>

          <VStack>
            <Text fontSize="$sm" color="$gray600">
              Welcome back
            </Text>
            <Text fontSize="$lg" fontWeight="$bold" color="$black">
              Explore seats
            </Text>
          </VStack>
        </HStack>

        <Box
          width={50}
          height={50}
          bg="$gray200"
          borderRadius="$md"
          justifyContent="center"
          alignItems="center"
        >
          <Image
            source={require('assets/jcu-logo.png')}
            alt="JCU Logo"
            style={{ width: 200, height: 200, resizeMode: 'contain' }}
          />
        </Box>
      </HStack>
    </Box>
  );
}
