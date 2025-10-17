import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { HStack, VStack, Text } from "@gluestack-ui/themed";

interface MapHeaderProps {
  availableSeats: number;
  onExpandPress: () => void;
}

export const MapHeader: React.FC<MapHeaderProps> = ({ availableSeats, onExpandPress }) => (
  <HStack justifyContent="space-between" alignItems="center">
    <VStack space="xs">
      <Text fontSize="$lg" fontWeight="$bold" color="$black">
        Interactive Seat Map
      </Text>
      <HStack space="sm">
        <Text fontSize="$xs" color="$white">
          {availableSeats} Available
        </Text>
      </HStack>
    </VStack>
    <TouchableOpacity onPress={onExpandPress} style={styles.expandButton}>
      <Text fontSize="$2xl">⛶</Text>
    </TouchableOpacity>
  </HStack>
);

const styles = StyleSheet.create({
  expandButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
  },
});
