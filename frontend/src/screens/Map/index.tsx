import React, { useState } from "react";
import { View, StyleSheet, useWindowDimensions } from "react-native";
import Svg, { Circle } from "react-native-svg";
import SvgPanZoom from "react-native-svg-pan-zoom";
import FloorMap from "assets/mockmap.svg";

interface Chair {
  id: string;
  x: number; // normalized 0–1 relative to SVG viewBox
  y: number; // normalized 0–1 relative to SVG viewBox
}

// TODO: import the data on backend
// Example chairs
const chairs: Chair[] = [
  { id: "chair1", x: 0.25, y: 0.25 },
  { id: "chair2", x: 0.5, y: 0.4 },
  { id: "chair3", x: 0.75, y: 0.6 },
];

// TODO: move this to backend to process
// Manual aspect ratio from SVG
const VIEWBOX_WIDTH = 2292;
const VIEWBOX_HEIGHT = 2025;
const ASPECT_RATIO = VIEWBOX_HEIGHT / VIEWBOX_WIDTH;

export default function FloorMapScreen() {
  const { width: screenWidth } = useWindowDimensions();
  const svgWidth = screenWidth;
  const svgHeight = svgWidth / ASPECT_RATIO;

  const [selectedChair, setSelectedChair] = useState<string | null>(null);
  const handleChairPress = (id: string) => setSelectedChair(id);

  const chairRadius = 20;

  return (
    <View style={styles.container}>
      <SvgPanZoom
        canvasWidth={svgWidth}
        canvasHeight={svgHeight}
        minScale={1}
        maxScale={4}
        initialZoom={1}
      >
        <Svg
          width={svgWidth}
          height={svgHeight}
          viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
        >
          {/* Floor map */}
          <FloorMap width={VIEWBOX_WIDTH} height={VIEWBOX_HEIGHT} />

          {/* Chairs */}
          {chairs.map((chair) => (
            <Circle
              key={chair.id}
              cx={chair.x * VIEWBOX_WIDTH}
              cy={chair.y * VIEWBOX_HEIGHT}
              r={chairRadius}
              fill={selectedChair === chair.id ? "#ff5252" : "#4CAF50"}
              onPress={() => handleChairPress(chair.id)}
            />
          ))}
        </Svg>
      </SvgPanZoom>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
});

