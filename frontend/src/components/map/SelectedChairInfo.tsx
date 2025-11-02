// ===== components/SelectedChairInfo.tsx =====
import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { Box, VStack, HStack, Text, Badge } from "@gluestack-ui/themed";
import type { SeatResponse } from "@/api/seats";

interface SelectedChairInfoProps {
  seat: SeatResponse;
  compact?: boolean;
  onClose?: () => void;
}

export const SelectedChairInfo: React.FC<SelectedChairInfoProps> = ({
  seat,
  compact = false,
  onClose,
}) => {
  if (compact) {
    return (
      <Box
        bg="$blue50"
        p="$3"
        borderRadius="$lg"
        borderWidth={1}
        borderColor="$blue200"
      >
        <HStack justifyContent="space-between" alignItems="center">
          <VStack space="xs">
            <Text fontSize="$sm" fontWeight="$semibold" color="$blue900">
              Seat {seat.seat_number} : {seat.seat_type}
            </Text>
            <HStack space="sm">
              {seat.has_power_outlet && (
                <Text fontSize="$xs" color="$blue700">
                  ⚡ Power outlet available
                </Text>
              )}
              <Text fontSize="$xs" color="$blue700">
                {seat.status}
              </Text>
            </HStack>
          </VStack>

          {/* Touch to view statistics */}
          <TouchableOpacity style={styles.reserveButton}>
            <Text fontSize="$sm" fontWeight="$semibold" color="$white">
              View statistics
            </Text>
          </TouchableOpacity>

        </HStack>
      </Box>
    );
  }

  return (
    <Box
      bg="$white"
      p="$5"
      borderTopLeftRadius="$3xl"
      borderTopRightRadius="$3xl"
      shadowColor="#000"
      shadowOffset={{ width: 0, height: -4 }}
      shadowOpacity={0.1}
      shadowRadius={12}
    >
      <VStack space="md">
        <HStack justifyContent="space-between" alignItems="center">
          <VStack space="xs">
            <Text fontSize="$xl" fontWeight="$bold" color="$black">
              Seat {seat.seat_number} : {seat.seat_type}
            </Text>
            <HStack space="md">
              <Badge
                size="md"
                variant="solid"
                bgColor={seat.status === "available" ? "$green" : "$red"}
                borderRadius="$full"
              >
                <Text fontSize="$sm" color="$white">
                  {seat.status}
                </Text>
              </Badge>
              {seat.has_power_outlet && (
                <HStack space="xs" alignItems="center">
                  <Text fontSize="$lg">⚡</Text>
                  <Text fontSize="$sm" color="$gray700">
                    Power outlet
                  </Text>
                </HStack>
              )}
            </HStack>
          </VStack>
          {onClose && (
            <TouchableOpacity onPress={onClose} style={{ padding: 8 }}>
              <Text fontSize="$xl" color="$gray400">
                ✕
              </Text>
            </TouchableOpacity>
          )}
        </HStack>

        <TouchableOpacity style={styles.fullReserveButton}>
          <Text
            fontSize="$md"
            fontWeight="$bold"
            color="$white"
            textAlign="center"
          >
            View statistics
          </Text>
        </TouchableOpacity>

      </VStack>
    </Box>
  );
};

const styles = StyleSheet.create({
  reserveButton: {
    backgroundColor: "#3B82F6",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  fullReserveButton: {
    backgroundColor: "#3B82F6",
    paddingVertical: 16,
    borderRadius: 12,
    width: "100%",
  },
});
