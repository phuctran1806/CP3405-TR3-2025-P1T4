import React, { useState } from "react";
import { View, StyleSheet, useWindowDimensions } from "react-native";
import Svg, { Rect, Path } from "react-native-svg";
import FloorMap from "assets/mockmap.svg";

interface Chair {
  id: string;
  x: number;
  y: number;
  hasPlug?: boolean;
  occupied?: boolean;
}

const chairs: Chair[] = [
  { id: "chair1", x: 0.25, y: 0.25, hasPlug: true },
  { id: "chair2", x: 0.5, y: 0.4 },
  { id: "chair3", x: 0.75, y: 0.6, hasPlug: true },
];

const VIEWBOX_WIDTH = 2292;
const VIEWBOX_HEIGHT = 2025;
const ASPECT_RATIO = VIEWBOX_HEIGHT / VIEWBOX_WIDTH;

export default function FloorMapScreen() {
  const { width: screenWidth } = useWindowDimensions();
  const svgWidth = screenWidth;
  const svgHeight = svgWidth / ASPECT_RATIO;

  const [selectedChair, setSelectedChair] = useState<string | null>(null);

  const handleChairPress = (id: string) => {
    setSelectedChair((prev) => (prev === id ? null : id));
  };

  const seatWidth = 60;
  const seatHeight = 40;
  const seatRadius = 8;

  return (
    <View style={styles.container}>
      <Svg
        width={svgWidth}
        height={svgHeight}
        viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
      >
        {/* Floor map */}
        <FloorMap width={VIEWBOX_WIDTH} height={VIEWBOX_HEIGHT} />

        {/* Chairs */}
        {chairs.map((chair) => {
          const isSelected = selectedChair === chair.id;
          const fillColor = chair.occupied
            ? "#E0E0E0"
            : isSelected
            ? "#42A5F5"
            : "#81C784";

          const cx = chair.x * VIEWBOX_WIDTH;
          const cy = chair.y * VIEWBOX_HEIGHT;

          return (
            <React.Fragment key={chair.id}>
              {/* Rectangular seat */}
              <Rect
                x={cx - seatWidth / 2}
                y={cy - seatHeight / 2}
                width={seatWidth}
                height={seatHeight}
                rx={seatRadius}
                fill={fillColor}
                stroke={isSelected ? "#1565C0" : "transparent"}
                strokeWidth={isSelected ? 4 : 0}
                onPress={() => handleChairPress(chair.id)}
              />

              {/* Simple plug icon as Path */}
              {chair.hasPlug && (
                <Path
                  d="M7 2v6h2V2H7zm8 0v6h2V2h-2zM6 10v6c0 1.1.9 2 2 2h1v4h6v-4h1c1.1 0 2-.9 2-2v-6H6z"
                  fill="#fff"
                  scale={0.8}
                  x={cx - 10}
                  y={cy - 10}
                />
              )}
            </React.Fragment>
          );
        })}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fafafa" },
});

