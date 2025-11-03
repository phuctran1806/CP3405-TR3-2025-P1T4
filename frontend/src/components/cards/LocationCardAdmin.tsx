import React from 'react';
import { Box, VStack, HStack, Text, Pressable, Icon } from '@gluestack-ui/themed';
import { Building2, MapPin, BarChart2, Edit3 } from 'lucide-react-native';
import { View } from 'react-native';

interface LocationCardAdminProps {
  name: string;
  block: string;
  status: 'active' | 'maintenance';
  current: number;
  capacity: number;
  onAnalytics: () => void;
  onEdit: () => void;
}

export default function LocationCardAdmin({
  name,
  block,
  status,
  current,
  capacity,
  onAnalytics,
  onEdit,
}: LocationCardAdminProps) {
  // Maintenance = no occupancy allowed
  const safeCurrent = status === 'maintenance' ? 0 : current;
  const occupancyPercentage = Math.round((safeCurrent / capacity) * 100) || 0;

  // Bar color thresholds
  let barColor = '#22c55e'; // green
  if (occupancyPercentage > 75) barColor = '#ef4444'; // red
  else if (occupancyPercentage > 50) barColor = '#facc15'; // yellow

  return (
    <Box
      bg="$white"
      borderRadius="$2xl"
      shadowColor="#000"
      shadowOffset={{ width: 0, height: 3 }}
      shadowOpacity={0.1}
      shadowRadius={6}
      elevation={4}
      mb="$5"
      p="$4"
    >
      {/* Header */}
      <HStack justifyContent="space-between" alignItems="center" mb="$3">
        <HStack space="sm" alignItems="center">
          <Box bg="$green100" borderRadius="$lg" p="$2">
            <Icon as={Building2} size="sm" color="$green700" />
          </Box>
          <VStack>
            <Text fontWeight="$bold" fontSize="$md" color="$black">
              {name}
            </Text>
            <HStack alignItems="center" space="xs">
              <Icon as={MapPin} size="xs" color="$gray600" />
              <Text fontSize="$xs" color="$gray600">
                {block}
              </Text>
            </HStack>
          </VStack>
        </HStack>

        {/* Status Tag */}
        <Box
          bg={status === 'active' ? '$green100' : '$yellow100'}
          px="$2"
          py="$1"
          borderRadius="$md"
        >
          <Text
            fontSize="$xs"
            fontWeight="$semibold"
            color={status === 'active' ? '$green700' : '$yellow700'}
          >
            {status}
          </Text>
        </Box>
      </HStack>

      {/* Occupancy Info */}
      <VStack space="xs" mb="$3">
        <Text fontSize="$sm" color="$gray600">
          Current Occupancy
        </Text>
        <Text fontWeight="$bold" fontSize="$md" color="$black">
          {`${safeCurrent} / ${capacity} (${occupancyPercentage}%)`}
        </Text>

        {/* Occupancy Bar */}
        <View
          style={{
            marginTop: 6,
            height: 6,
            borderRadius: 6,
            backgroundColor: '#e5e7eb',
            overflow: 'hidden',
          }}
        >
          <View
            style={{
              width: `${occupancyPercentage}%`,
              height: '100%',
              backgroundColor: barColor,
            }}
          />
        </View>
      </VStack>

      {/* Action Buttons */}
      <HStack space="sm" justifyContent="space-between">
        <Pressable
          flex={1}
          onPress={onAnalytics}
          bg="$gray100"
          borderRadius="$lg"
          p="$2"
          alignItems="center"
          justifyContent="center"
          disabled={status !== 'active'}
        >
          <HStack space="xs" alignItems="center">
            <Icon as={BarChart2} size="sm" color="$gray700" />
            <Text
              fontSize="$sm"
              color={status === 'active' ? '$gray700' : '$gray400'}
              fontWeight="$medium"
            >
              View Analytics
            </Text>
          </HStack>
        </Pressable>

        <Pressable
          flex={1}
          onPress={onEdit}
          bg="$gray100"
          borderRadius="$lg"
          p="$2"
          alignItems="center"
          justifyContent="center"
        >
          <HStack space="xs" alignItems="center">
            <Icon as={Edit3} size="sm" color="$gray700" />
            <Text fontSize="$sm" color="$gray700" fontWeight="$medium">
              Edit Details
            </Text>
          </HStack>
        </Pressable>
      </HStack>
    </Box>
  );
}
