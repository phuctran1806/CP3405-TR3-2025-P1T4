import React from 'react';
import {
  Box,
  HStack,
  VStack,
  Text,
  Image,
  Icon,
  Pressable,
} from '@gluestack-ui/themed';
import { MapPin } from 'lucide-react-native';
import { accessibilityMapping, AccessibilityFeature } from '../utils/accessibilityIcons';

interface LocationCardProps {
  name: string;
  image: string;
  distance: string;
  accessibility: AccessibilityFeature[];
  onPress?: () => void;
}

export default function LocationCard({
  name,
  image,
  distance,
  accessibility,
  onPress,
}: LocationCardProps) {
  return (
    <Pressable onPress={onPress}>
      <Box
        bg="$white"
        borderRadius="$xl"
        overflow="hidden"
        shadowColor="$black"
        shadowOffset={{ width: 0, height: 2 }}
        shadowOpacity={0.1}
        shadowRadius={8}
        elevation={3}
        mb="$4"
      >
        <Box height={180} bg="$gray200">
          <Box
            flex={1}
            justifyContent="center"
            alignItems="center"
            bg="$blue100"
          >
            <Text color="$blue600" fontSize="$sm">
              {name} Image
            </Text>
          </Box>
        </Box>

        <VStack p="$4" space="sm">
          <Text fontSize="$lg" fontWeight="$bold" color="$black">
            {name}
          </Text>

          <HStack space="xs" alignItems="center">
            <Icon as={MapPin} size="sm" color="$gray600" />
            <Text fontSize="$sm" color="$gray600">
              {distance}
            </Text>
          </HStack>

          {accessibility.length > 0 && (
            <HStack space="md" flexWrap="wrap" mt="$2">
              {accessibility.map((feature) => {
                const accessInfo = accessibilityMapping[feature];
                return (
                  <HStack
                    key={feature}
                    space="xs"
                    alignItems="center"
                    bg="$gray50"
                    px="$2"
                    py="$1"
                    borderRadius="$md"
                  >
                    <Icon
                      as={accessInfo.icon}
                      size="xs"
                      color={accessInfo.color}
                    />
                    <Text fontSize="$xs" color="$gray700">
                      {accessInfo.label}
                    </Text>
                  </HStack>
                );
              })}
            </HStack>
          )}
        </VStack>
      </Box>
    </Pressable>
  );
}