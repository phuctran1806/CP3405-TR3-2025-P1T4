import React, { useState, useEffect } from "react";
import { useWindowDimensions, ActivityIndicator } from "react-native";
import { VStack, Box, Text } from "@gluestack-ui/themed";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { MapHeader } from "./MapHeader";
import { MapPreview } from "./MapPreview";
import { MapLegend } from "./MapLegend";
import { SelectedChairInfo } from "./SelectedChairInfo";
import { FullscreenMapModal } from "./FullscreenMapModal";

import { getSeats, type SeatResponse } from "@/api/seats";
import type { FloorResponse } from "@/api/floors";

interface InteractiveMapProps {
  floor?: FloorResponse; // optional: to filter seats by floor
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({ floor }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedSeat, setSelectedSeat] = useState<SeatResponse | null>(null);
  const [seats, setSeats] = useState<SeatResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  useEffect(() => {
    if (!floor) return;

    let active = true;

    async function loadSeats() {
      try {
        setError(null);
        setLoading(true);

        const result = await getSeats({ floor_id: floor?.id });
        if (!active) return;

        if (!result.ok) throw result.error;

        setSeats(result.data);
      } catch (err: any) {
        console.error("Failed to fetch seats:", err);
        if (active) setError("Failed to load seats");
        setSeats([]);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadSeats();
    return () => {
      active = false;
    };
  }, [floor]);

  const handleChairPress = (next: SeatResponse) => {
    setSelectedSeat((prev) => (prev?.id === next.id ? null : next));
  };

  const availableSeats = seats.filter((s) => s.status === "available").length;
  const seatsWithPlugs = seats.filter(
    (s) => s.has_power_outlet && s.status === "available"
  ).length;

  if (loading) {
    return (
      <Box flex={1} justifyContent="center" alignItems="center">
        <ActivityIndicator size="large" color="#007AFF" />
        <Text mt="$2">Loading seats...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box flex={1} justifyContent="center" alignItems="center">
        <Text color="red">{error}</Text>
      </Box>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <VStack space="md">
        {/* Optional location image placeholder */}
        <Box
          bg="$white"
          borderRadius="$2xl"
          overflow="hidden"
          shadowColor="#000"
          shadowOffset={{ width: 0, height: 2 }}
          shadowOpacity={0.08}
          shadowRadius={8}
        />

        {/* Interactive map container */}
        <Box
          bg="$white"
          borderRadius="$2xl"
          shadowColor="#000"
          shadowOffset={{ width: 0, height: 2 }}
          shadowOpacity={0.08}
          shadowRadius={8}
          overflow="hidden"
        >
          <VStack space="md" p="$5">
            <MapHeader
              availableSeats={availableSeats}
              onExpandPress={() => setIsFullscreen(true)}
            />

            {/* Map preview showing clickable seats */}
            <MapPreview
              screenWidth={screenWidth}
              seats={seats}
              selectedSeat={selectedSeat}
              onChairPress={handleChairPress}
              map_url={floor?.floor_map_url}
              onPress={() => setIsFullscreen(true)}
            />

            <MapLegend />

            {selectedSeat && (
              <SelectedChairInfo
                seat={selectedSeat}
                compact
              />
            )}
          </VStack>
        </Box>

        {/* Fullscreen seat map modal */}
        <FullscreenMapModal
          visible={isFullscreen}
          onClose={() => setIsFullscreen(false)}
          selectedSeat={selectedSeat}
          onChairPress={handleChairPress}
          onDeselectChair={() => setSelectedSeat(null)}
          availableSeats={availableSeats}
          seatsWithPlugs={seatsWithPlugs}
          screenWidth={screenWidth}
          screenHeight={screenHeight}
          map_url={floor?.floor_map_url}
          seats={seats}
        />
      </VStack>
    </GestureHandlerRootView>
  );
};

export default InteractiveMap;

