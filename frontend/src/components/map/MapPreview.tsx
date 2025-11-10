import React from "react";
import { Pressable } from "react-native";
import { Box } from "@gluestack-ui/themed";
import { FloorMapContent } from "./FloorMapContent";
import type { SeatResponse } from "@/api/seats";

interface MapPreviewProps {
  screenWidth: number;
  selectedSeat: SeatResponse | null;
  seats: SeatResponse[];
  map_url?: string | null;
  onChairPress: (next: SeatResponse) => void;
  onPress: () => void;
}

export const MapPreview: React.FC<MapPreviewProps> = ({
  screenWidth,
  selectedSeat,
  seats,
  map_url,
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
        selectedSeat={selectedSeat}
        seats={seats}
        onChairPress={onChairPress}
        map_url={map_url}
        compact
      />
    </Box>
  </Pressable>
);

