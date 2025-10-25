import React from 'react';
import { Box, VStack, HStack, Text, Pressable, Icon } from '@gluestack-ui/themed';
import { Calendar, Clock, User2, CheckCircle, XCircle } from 'lucide-react-native';

interface BookingRequestCardProps {
  venue: string;
  lecturerName: string;
  lecturerRole?: string;
  purpose: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'pending' | 'approved' | 'rejected';
  onApprove?: () => void;
  onReject?: () => void;
}

export default function BookingRequestCard({
  venue,
  lecturerName,
  lecturerRole,
  purpose,
  date,
  startTime,
  endTime,
  status,
  onApprove,
  onReject,
}: BookingRequestCardProps) {
  const isPending = status === 'pending';
  const isApproved = status === 'approved';

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
        <Text fontWeight="$bold" fontSize="$md" color="$black">
          {venue}
        </Text>

        <Box
          bg={
            isPending
              ? '$gray100'
              : isApproved
              ? '$green100'
              : '$red100'
          }
          px="$2"
          py="$1"
          borderRadius="$md"
        >
          <Text
            fontSize="$xs"
            fontWeight="$semibold"
            color={
              isPending
                ? '$gray700'
                : isApproved
                ? '$green700'
                : '$red700'
            }
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Text>
        </Box>
      </HStack>

      {/* Lecturer Info */}
      <HStack alignItems="center" space="sm" mb="$1">
        <Icon as={User2} size="sm" color="$gray600" />
        <Text fontSize="$sm" color="$gray700">
          {lecturerName} ({lecturerRole || 'Lecturer'})
        </Text>
      </HStack>

      {/* Date and Time */}
      <HStack alignItems="center" space="sm" mb="$2">
        <Icon as={Calendar} size="sm" color="$gray600" />
        <Text fontSize="$sm" color="$gray700">
          {date}
        </Text>
        <Icon as={Clock} size="sm" color="$gray600" ml="$2" />
        <Text fontSize="$sm" color="$gray700">
          {startTime} - {endTime}
        </Text>
      </HStack>

      {/* Purpose */}
      <VStack mb="$3">
        <Text fontSize="$xs" color="$gray500">
          Purpose
        </Text>
        <Text fontSize="$sm" fontWeight="$bold" color="$black">
          {purpose}
        </Text>
      </VStack>

      {/* Action Buttons */}
      {isPending && (
        <HStack space="sm" justifyContent="space-between">
          <Pressable
            flex={1}
            onPress={onApprove}
            bg="$green800"
            borderRadius="$lg"
            p="$3"
            alignItems="center"
            justifyContent="center"
          >
            <HStack space="xs" alignItems="center">
              <Icon as={CheckCircle} size="sm" color="$white" />
              <Text fontSize="$sm" color="$white" fontWeight="$semibold">
                Approve
              </Text>
            </HStack>
          </Pressable>

          <Pressable
            flex={1}
            onPress={onReject}
            borderWidth={1}
            borderColor="$red600"
            borderRadius="$lg"
            p="$3"
            alignItems="center"
            justifyContent="center"
          >
            <HStack space="xs" alignItems="center">
              <Icon as={XCircle} size="sm" color="$red600" />
              <Text fontSize="$sm" color="$red600" fontWeight="$semibold">
                Reject
              </Text>
            </HStack>
          </Pressable>
        </HStack>
      )}
    </Box>
  );
}
