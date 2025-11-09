import React from 'react';
import { Box, VStack, Text, HStack, Badge, Icon } from '@gluestack-ui/themed';
import { accessibilityMapping, type AccessibilityFeature } from '@/utils/accessibilityIcons';
import SegmentedControl from '@/components/dashboard/SegmentedControl';

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
          <Text fontSize="$xl" fontWeight="$bold" color="$black" mb="$2">
            {location.name}
          </Text>
        </VStack>
        <VStack alignItems="flex-end">
          <Text fontSize="$xl" fontWeight="$bold" color="$blue600">
            {Math.round(location.occupancyPercentage)}% Occupied
          </Text>
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
              {occupancyStatus.label} Traffic
            </Text>
          </Badge>
        </VStack>
      </HStack>

      {/* Accessibility */}
      {location.accessibility !== undefined && location.accessibility.length > 0 && (
        <HStack space="xs" flexWrap="wrap">
          {location.accessibility.map((feature: string) => {
            const accessInfo = accessibilityMapping[feature as AccessibilityFeature];
            return (
              <HStack
                key={feature}
                space="xs"
                alignItems="center"
                bg="$gray100"
                px="$2.5"
                py="$0"
                borderRadius="$full"
                mb="$1"
              >
                <Icon as={accessInfo.icon} size="xs" color={accessInfo.color} />
                <Text fontSize="$xs" color="$gray700" fontWeight="$medium">
                  {accessInfo.label}
                </Text>
              </HStack>
            );
          })}
        </HStack>
      )}

      <SegmentedControl view={view} setView={setView} />
    </VStack>
  </Box>
);

export default Header;
