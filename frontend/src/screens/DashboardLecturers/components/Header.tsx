import React from 'react';
import { Box, VStack, Text, HStack, Badge } from '@gluestack-ui/themed';
import SegmentedControl from './SegmentedControl';

const Header = ({ location, occupancyStatus, view, setView }: any) => (
  <Box
    bg="$white"
    borderBottomLeftRadius="$2xl"
    borderBottomRightRadius="$2xl"
    shadowColor="#000"
    shadowOffset={{ width: 0, height: 2 }}
    shadowOpacity={0.1}
    shadowRadius={8}
    pb="$4"
  >
    <VStack px="$5" pt="$4" space="md">
      <HStack alignItems="flex-start" justifyContent="space-between">
        <VStack flex={1} mr="$3">
          <Text fontSize="$xl" fontWeight="$bold" color="$black" mb="$1">
            {location.name}
          </Text>
          <Text color="$gray600" fontWeight="$semibold">{location.subject}</Text>
          <Text color="$gray600" mb="$3">
            {location.schedule}
          </Text>
        </VStack>

        <VStack alignItems="flex-end">
          {location.liveOccupancy !== null ? (
            <Text fontSize="$xl" fontWeight="$bold" color="$blue600">
              {location.liveOccupancy}% Occupied
            </Text>
          ) : (
            <Text fontSize="$xl" fontWeight="$bold" color="$gray500">
              No Lecture
            </Text>
          )}
          <Badge
            action="error"
            variant="solid"
            bg={occupancyStatus.bg}
            borderRadius="$full"
            px="$2.5"
            py="$0"
            mt="$1"
          >
            <Text fontSize="$xs" fontWeight="$bold" color={occupancyStatus.color}>
              {occupancyStatus.label}
            </Text>
          </Badge>
        </VStack>
      </HStack>

      <SegmentedControl view={view} setView={setView} />
    </VStack>
  </Box>
);

export default Header;
