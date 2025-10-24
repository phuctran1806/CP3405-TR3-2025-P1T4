import React from "react";
import { HStack, Box, Text } from "@gluestack-ui/themed";

export const MapLegend: React.FC = () => (
  <HStack space="lg" justifyContent="center" flexWrap="wrap">
    <HStack space="xs" alignItems="center">
      <Box w={16} h={16} bg="#10B981" borderRadius="$sm" />
      <Text fontSize="$xs" color="$gray600">
        Available
      </Text>
    </HStack>
    <HStack space="xs" alignItems="center">
      <Box w={16} h={16} bg="#ef4444" borderRadius="$sm" />
      <Text fontSize="$xs" color="$gray600">
        Occupied
      </Text>
    </HStack>
    <HStack space="xs" alignItems="center">
      <Box w={16} h={16} bg="#10B981" borderRadius="$sm" />
      <Text fontSize="$xs" color="$gray600">
        ⚡ Power
      </Text>
    </HStack>
  </HStack>
);
