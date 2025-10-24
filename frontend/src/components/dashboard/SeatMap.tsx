import React from 'react';
import { VStack, Box } from '@gluestack-ui/themed';
import { Image } from 'react-native';

interface SeatMapProps {
  location: any;
  map: React.ReactNode;
}

const SeatMap = ({ location, map }: SeatMapProps) => (
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

    {map}
  </VStack>
);

export default SeatMap;
