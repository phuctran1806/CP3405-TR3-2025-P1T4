import React from 'react';
import { Box, VStack, HStack, Text, Icon, Pressable } from '@gluestack-ui/themed';
import { Pencil } from 'lucide-react-native';

interface LecturerAssignmentCardProps {
  lecturerName: string;
  totalSubjects: number;
  totalVenues: number;
  subjects: string[];
  venues: string[];
  onEdit?: () => void;
}

export default function LecturerAssignmentCard({
  lecturerName,
  totalSubjects,
  totalVenues,
  subjects,
  venues,
  onEdit,
}: LecturerAssignmentCardProps) {
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
      <HStack justifyContent="space-between" alignItems="center" mb="$2">
        <VStack>
          <Text fontWeight="$bold" fontSize="$md" color="$black">
            {lecturerName}
          </Text>
          <Text fontSize="$sm" color="$gray600">
            {`${totalSubjects} subjects • ${totalVenues} venues`}
          </Text>
        </VStack>

        <Pressable
          onPress={onEdit}
          bg="$gray100"
          p="$2"
          borderRadius="$lg"
          alignItems="center"
          justifyContent="center"
        >
          <Icon as={Pencil} size="sm" color="$gray700" />
        </Pressable>
      </HStack>

      {/* Venues */}
      <VStack mb="$3">
        <Text fontSize="$xs" color="$gray500" mb="$1">
          Assigned Venues
        </Text>
        <HStack flexWrap="wrap" space="sm">
          {venues.map((v) => (
            <Box
              key={v}
              bg="$gray100"
              px="$3"
              py="$1"
              borderRadius="$lg"
              mb="$2"
            >
              <Text fontSize="$sm" color="$gray700">
                {v}
              </Text>
            </Box>
          ))}
        </HStack>
      </VStack>

      {/* Subjects */}
      <VStack>
        <Text fontSize="$xs" color="$gray500" mb="$1">
          Subjects
        </Text>
        <HStack flexWrap="wrap" space="sm">
          {subjects.map((s) => (
            <Box
              key={s}
              borderWidth={1}
              borderColor="$gray300"
              px="$3"
              py="$1"
              borderRadius="$lg"
              mb="$2"
            >
              <Text fontSize="$sm" color="$gray700">
                {s}
              </Text>
            </Box>
          ))}
        </HStack>
      </VStack>
    </Box>
  );
}
