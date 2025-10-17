import React from 'react';
import { VStack, Box, Text } from '@gluestack-ui/themed';
import { Image } from 'react-native';

const SeatMap = ({ location }: any) => (
  <VStack space="md">
    <Box
      bg="$white"
      borderRadius="$2xl"
      overflow="hidden"
      shadowColor="#000"
      shadowOffset={{ width: 0, height: 2 }}
      shadowOpacity={0.08}
      shadowRadius={8}
    >
      <Image source={location.image} style={{ width: '100%', height: 220 }} />
    </Box>

    <Box
      bg="$white"
      borderRadius="$2xl"
      shadowColor="#000"
      shadowOffset={{ width: 0, height: 2 }}
      shadowOpacity={0.08}
      shadowRadius={8}
      p="$5"
    >
      <VStack space="md">
        <Text fontSize="$lg" fontWeight="$bold" color="$black">
          Interactive Seat Map
        </Text>
        <Box
          w="100%"
          h={320}
          bg="$gray100"
          borderRadius="$xl"
          borderWidth={2}
          borderColor="$gray200"
          borderStyle="dashed"
          justifyContent="center"
          alignItems="center"
        >
          <VStack space="sm" alignItems="center">
            <Text fontSize="$4xl">🪑</Text>
            <Text color="$gray500" fontSize="$md" fontWeight="$medium">
              Seat Map Coming Soon
            </Text>
            <Text color="$gray400" fontSize="$sm" textAlign="center" px="$4">
              Tap individual seats to view availability and reserve
            </Text>
          </VStack>
        </Box>
      </VStack>
    </Box>
  </VStack>
);

export default SeatMap;
