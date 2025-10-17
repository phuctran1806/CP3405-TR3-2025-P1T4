import React from "react";
import { Modal, View, TouchableOpacity, StyleSheet } from "react-native";
import { Box, VStack, HStack, Text, Badge } from "@gluestack-ui/themed";
import { FloorMapContent } from "./FloorMapContent";
import { SelectedChairInfo } from "./SelectedChairInfo";
import type { Chair } from "./Chair";

interface FullscreenMapModalProps {
  visible: boolean;
  onClose: () => void;
  selectedChair: string | null;
  selectedChairData: Chair | undefined;
  onChairPress: (id: string) => void;
  onDeselectChair: () => void;
  availableSeats: number;
  seatsWithPlugs: number;
  screenWidth: number;
  screenHeight: number;
}

export const FullscreenMapModal: React.FC<FullscreenMapModalProps> = ({
  visible,
  onClose,
  selectedChair,
  selectedChairData,
  onChairPress,
  onDeselectChair,
  availableSeats,
  seatsWithPlugs,
  screenWidth,
  screenHeight,
}) => (
  <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
    <View style={styles.fullscreenContainer}>
      {/* Header */}
      <Box bg="$white" borderBottomWidth={1} borderBottomColor="$gray200" p="$4">
        <HStack justifyContent="space-between" alignItems="center">
          <VStack space="xs">
            <Text fontSize="$xl" fontWeight="$bold" color="$black">
              Floor Map
            </Text>
            <HStack space="sm">
              <Badge size="sm" variant="solid" action="success" borderRadius="$full">
                <Text fontSize="$xs" color="$white">
                  {availableSeats} Available
                </Text>
              </Badge>
              {seatsWithPlugs > 0 && (
                <Badge size="sm" variant="solid" action="info" borderRadius="$full">
                  <Text fontSize="$xs" color="$white">
                    ⚡ {seatsWithPlugs} with Power
                  </Text>
                </Badge>
              )}
            </HStack>
          </VStack>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text fontSize="$2xl" color="$gray700">
              ✕
            </Text>
          </TouchableOpacity>
        </HStack>
      </Box>

      {/* Fullscreen Map */}
      <View style={styles.mapContainer}>
        <FloorMapContent
          width={screenWidth}
          height={screenHeight}
          selectedChair={selectedChair}
          onChairPress={onChairPress}
        />
      </View>

      {/* Bottom Sheet for Selected Chair */}
      {selectedChairData && (
        <SelectedChairInfo
          chairData={selectedChairData}
          onClose={onDeselectChair}
        />
      )}
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  fullscreenContainer: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  mapContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  closeButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
  },
  expandButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
  },
});
