import {
  Box,
  HStack,
  Icon,
  Pressable,
  Text,
  VStack,
} from '@gluestack-ui/themed';
import { MapPin } from 'lucide-react-native';
import React from 'react';
import type { ImageSourcePropType } from 'react-native';
import { Image } from 'react-native';
import { accessibilityMapping } from '@/utils/accessibilityIcons';
import type { AccessibilityFeature } from '@/utils/accessibilityIcons';

interface LocationCardProps {
  name: string;
  subject?: string;
  image: ImageSourcePropType;
  distance?: string;
  schedule?: string;
  accessibility: AccessibilityFeature[] | null;
  onPress: () => void;
}

export default function LocationCard({
  name,
  subject,
  image,
  distance,
  schedule,
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
        width={272}
        alignSelf='center'
      >
        <Box height={180} bg="$gray200">
          <Box
            flex={1}
            justifyContent="center"
            alignItems="center"
            bg="$blue100"
          >
            <Image
              source={image}
              alt={name}
              style={{ width: '100%', height: '100%', resizeMode: 'cover' }}
            />
          </Box>
        </Box>

        <VStack p="$4" space="sm">
          {/* Location name */}
          <Text fontSize="$lg" fontWeight="$bold" color="$black">
            {name}
          </Text>

          {/* Subject for lecturers */}
          <Text fontSize="$md" color="$gray700">
            {subject}
          </Text>

          {/* Show distance for students, schedule for lecturers */}
          <HStack space="xs" alignItems="center">
            <Icon as={MapPin} size="sm" color="$gray600" />
            <Text fontSize="$sm" color="$gray600">
              {distance ? distance : schedule} 
            </Text>
          </HStack>

          {accessibility && accessibility.length > 0 && (
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
