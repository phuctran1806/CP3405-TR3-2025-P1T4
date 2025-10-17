// InteractiveMap.tsx
import React, { useState, useMemo } from "react";
import { useWindowDimensions } from "react-native";
import { VStack, Box } from "@gluestack-ui/themed";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { MapHeader } from "./MapHeader";
import { MapPreview } from "./MapPreview";
import { MapLegend } from "./MapLegend";
import { SelectedChairInfo } from "./SelectedChairInfo";
import { FullscreenMapModal } from "./FullscreenMapModal";
import { chairs } from "./Chair";

interface InteractiveMapProps {}

const InteractiveMap: React.FC<InteractiveMapProps> = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedChair, setSelectedChair] = useState<string | null>(null);
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  const handleChairPress = (id: string) => {
    setSelectedChair((prev) => (prev === id ? null : id));
  };

  const selectedChairData = useMemo(
    () => chairs.find((c) => c.id === selectedChair),
    [selectedChair]
  );

  const availableSeats = chairs.filter((c) => !c.occupied).length;
  const seatsWithPlugs = chairs.filter((c) => c.hasPlug && !c.occupied).length;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <VStack space="md">
        {/* Location Image Placeholder */}
        <Box
          bg="$white"
          borderRadius="$2xl"
          overflow="hidden"
          shadowColor="#000"
          shadowOffset={{ width: 0, height: 2 }}
          shadowOpacity={0.08}
          shadowRadius={8}
        />

        {/* Interactive Map Container */}
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

            <MapPreview
              screenWidth={screenWidth}
              selectedChair={selectedChair}
              onChairPress={handleChairPress}
              onPress={() => setIsFullscreen(true)}
            />

            <MapLegend />

            {selectedChairData && (
              <SelectedChairInfo
                chairData={selectedChairData}
                compact
              />
            )}
          </VStack>
        </Box>

        {/* Fullscreen Modal */}
        <FullscreenMapModal
          visible={isFullscreen}
          onClose={() => setIsFullscreen(false)}
          selectedChair={selectedChair}
          selectedChairData={selectedChairData}
          onChairPress={handleChairPress}
          onDeselectChair={() => setSelectedChair(null)}
          availableSeats={availableSeats}
          seatsWithPlugs={seatsWithPlugs}
          screenWidth={screenWidth}
          screenHeight={screenHeight}
        />
      </VStack>
    </GestureHandlerRootView>
  );
};

export default InteractiveMap;
