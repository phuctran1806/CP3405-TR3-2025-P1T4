// ===== components/SelectedChairInfo.tsx =====
import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { Box, VStack, HStack, Text, Badge } from "@gluestack-ui/themed";
import type { Chair } from "./Chair";

interface SelectedChairInfoProps {
  chairData: Chair;
  compact?: boolean;
  onClose?: () => void;
}

export const SelectedChairInfo: React.FC<SelectedChairInfoProps> = ({
  chairData,
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
              Seat {chairData.label}
            </Text>
            <HStack space="sm">
              {chairData.hasPlug && (
                <Text fontSize="$xs" color="$blue700">
                  ⚡ Power outlet available
                </Text>
              )}
              <Text fontSize="$xs" color="$blue700">
                {chairData.occupied ? "Occupied" : "Available"}
              </Text>
            </HStack>
          </VStack>
          {!chairData.occupied && (
            <TouchableOpacity style={styles.reserveButton}>
              <Text fontSize="$sm" fontWeight="$semibold" color="$white">
                View statistics
              </Text>
            </TouchableOpacity>
          )}
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
              Seat {chairData.label}
            </Text>
            <HStack space="md">
              {chairData.hasPlug && (
                <HStack space="xs" alignItems="center">
                  <Text fontSize="$lg">⚡</Text>
                  <Text fontSize="$sm" color="$gray700">
                    Power outlet
                  </Text>
                </HStack>
              )}
              <Badge
                size="md"
                variant="solid"
                action={chairData.occupied ? "muted" : "success"}
                borderRadius="$full"
              >
                <Text fontSize="$sm" color="$white">
                  {chairData.occupied ? "Occupied" : "Available"}
                </Text>
              </Badge>
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

        {!chairData.occupied && (
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
        )}
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
