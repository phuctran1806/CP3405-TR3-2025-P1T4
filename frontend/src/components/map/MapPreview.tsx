import React from "react";
import { Pressable } from "react-native";
import { Box } from "@gluestack-ui/themed";
import { FloorMapContent } from "./FloorMapContent";

interface MapPreviewProps {
  screenWidth: number;
  selectedChair: string | null;
  onChairPress: (id: string) => void;
  onPress: () => void;
}

export const MapPreview: React.FC<MapPreviewProps> = ({
  screenWidth,
  selectedChair,
  onChairPress,
  onPress,
}) => (
  <Pressable onPress={onPress}>
    <Box
      borderRadius="$xl"
      overflow="hidden"
      borderWidth={1}
      borderColor="$gray200"
      bg="$gray50"
    >
      <FloorMapContent
        width={screenWidth - 60}
        selectedChair={selectedChair}
        onChairPress={onChairPress}
        compact
      />
    </Box>
  </Pressable>
);

