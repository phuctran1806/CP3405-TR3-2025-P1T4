import {
  Box,
  HStack,
  Icon,
  Pressable,
  Text,
  VStack,
  Badge,
} from '@gluestack-ui/themed';
import React from 'react';
import type { ImageSourcePropType } from 'react-native';
import { Image } from 'react-native';
import { accessibilityMapping, type AccessibilityFeature } from '@/utils/accessibilityIcons';
import type { LocationStatus } from '@/api/types/location_types';
import { Users } from 'lucide-react-native';

interface LocationCardProps {
  name: string;
  subject?: string;
  image: ImageSourcePropType | null;
  schedule?: {
    start_time: Date;
    end_time: Date;
  };
  accessibility: AccessibilityFeature[] | null;
  status?: LocationStatus;
  maxTableCapacity?: number | null;
  onPress: () => void;
}

export default function LocationCard({
  name,
  subject,
  image,
  schedule,
  accessibility,
  status,
  maxTableCapacity,
  onPress,
}: LocationCardProps) {
  const getStatusStyle = (status: LocationStatus) => {
    switch (status) {
      case 'open':
        return { bg: '$green100', color: '$green700', text: 'Open' };
      case 'closed':
        return { bg: '$red100', color: '$red700', text: 'Closed' };
      case 'maintenance':
        return { bg: '$amber100', color: '$amber700', text: 'Maintenance' };
      default:
        return { bg: '$gray100', color: '$gray700', text: status };
    }
  };

  const statusStyle = getStatusStyle(status || 'open');
  const hasTableInfo = typeof maxTableCapacity === 'number';

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
            {image && (
              <Image
                source={image}
                alt={name}
                style={{ width: '100%', height: '100%', resizeMode: 'cover' }}
              />
            )}
          </Box>
        </Box>

        <VStack p="$4" space="sm">
          {/* Location name and status */}
          <HStack alignItems="center" justifyContent="space-between">
            <Text fontSize="$lg" fontWeight="$bold" color="$black" flex={1}>
              {name}
            </Text>
            {status && (
              <Badge
                variant="solid"
                bg={statusStyle.bg}
                borderRadius="$full"
                px="$2.5"
                py="$0.5"
              >
                <Text fontSize="$xs" fontWeight="$semibold" color={statusStyle.color}>
                  {statusStyle.text}
                </Text>
              </Badge>
            )}
          </HStack>

          {/* Subject for lecturers */}
          {subject && (
            <Text fontSize="$md" color="$gray700">
              {subject}
            </Text>
          )}

          {/* Schedule */}
          {schedule && (
            <Text fontSize="$sm" color="$gray600">
              {`${new Date(schedule.start_time).toLocaleString([], { weekday: 'short', hour: '2-digit' })} - ${new Date(schedule.end_time).toLocaleTimeString([], { hour: '2-digit' })}`}
            </Text>
          )}

          {hasTableInfo && (
            <HStack alignItems="center" space="sm">
              <Icon as={Users} size="sm" color="$blue500" />
              <Text fontSize="$sm" color="$gray700">
                Max table size: {maxTableCapacity}
              </Text>
            </HStack>
          )}

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