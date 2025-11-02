import React, { useState, useEffect } from "react";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  runOnJS,
  useAnimatedReaction,
} from "react-native-reanimated";
import Svg, { Defs, LinearGradient, Stop, G, SvgXml } from "react-native-svg";
import { ChairMarker } from "./ChairMarker";
import { VIEWBOX_WIDTH, VIEWBOX_HEIGHT, ASPECT_RATIO } from "./MapConfig";
import type { SeatResponse } from "@/api/seats";

interface FloorMapContentProps {
  width: number;
  height?: number;
  seats: SeatResponse[];
  selectedSeat: SeatResponse | null;
  map_url?: string | null;
  onChairPress: (next: SeatResponse) => void;
  compact?: boolean;
}

export const FloorMapContent: React.FC<FloorMapContentProps> = ({
  width,
  height,
  seats,
  selectedSeat,
  map_url,
  onChairPress,
  compact = false,
}) => {
  const svgWidth = width;
  const svgHeight = compact ? 250 : height || width * ASPECT_RATIO;
  const minZoom = 1;
  const maxZoom = 4;

  const [viewBox, setViewBox] = useState(`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`);

  const viewBoxXAnim = useSharedValue(0);
  const viewBoxYAnim = useSharedValue(0);
  const viewBoxWidthAnim = useSharedValue(VIEWBOX_WIDTH);

  const lastX = useSharedValue(0);
  const lastY = useSharedValue(0);
  const lastW = useSharedValue(VIEWBOX_WIDTH);

  const [svgXml, setSvgXml] = useState<string | null>(null);

  useEffect(() => {
    async function loadSvg() {
      const res = await fetch(`http://localhost:8080/${map_url}`);
      const text = await res.text();
      setSvgXml(text);
    }
    loadSvg();
  }, [map_url]);

  useAnimatedReaction(
    () => [viewBoxXAnim.value, viewBoxYAnim.value, viewBoxWidthAnim.value],
    ([vbX, vbY, vbW]) => {
      const vbH = vbW * ASPECT_RATIO;
      runOnJS(setViewBox)(`${vbX} ${vbY} ${vbW} ${vbH}`);
    }
  );

  const clampPosition = () => {
    "worklet";
    const currW = viewBoxWidthAnim.value;
    const currH = currW * ASPECT_RATIO;
    let currX = viewBoxXAnim.value;
    let currY = viewBoxYAnim.value;

    currX = Math.max(0, Math.min(currX, VIEWBOX_WIDTH - currW));
    currY = Math.max(0, Math.min(currY, VIEWBOX_HEIGHT - currH));

    viewBoxXAnim.value = currX;
    viewBoxYAnim.value = currY;
  };

  // --- Pinch Gesture ---
  const pinchGesture = Gesture.Pinch()
    .onBegin(() => {
      lastX.value = viewBoxXAnim.value;
      lastY.value = viewBoxYAnim.value;
      lastW.value = viewBoxWidthAnim.value;
    })
    .onUpdate((event) => {
      "worklet";
      const gScale = event.scale;
      let newW = lastW.value / gScale;
      newW = Math.max(VIEWBOX_WIDTH / maxZoom, Math.min(newW, VIEWBOX_WIDTH / minZoom));

      const oldW = lastW.value;
      const oldH = oldW * ASPECT_RATIO;
      const newH = newW * ASPECT_RATIO;

      const ratioX = event.focalX / svgWidth;
      const ratioY = event.focalY / svgHeight;

      const mapX = lastX.value + ratioX * oldW;
      const mapY = lastY.value + ratioY * oldH;

      const newX = mapX - ratioX * newW;
      const newY = mapY - ratioY * newH;

      viewBoxWidthAnim.value = newW;
      viewBoxXAnim.value = newX;
      viewBoxYAnim.value = newY;
    })
    .onEnd(() => {
      runOnJS(clampPosition)();
    })
    .onFinalize(() => {
      runOnJS(clampPosition)();
    });

  // --- Pan Gesture ---
  const panGesture = Gesture.Pan()
    .minPointers(1)
    .maxPointers(1)
    .onBegin(() => {
      lastX.value = viewBoxXAnim.value;
      lastY.value = viewBoxYAnim.value;
    })
    .onUpdate((event) => {
      "worklet";
      const ratio = viewBoxWidthAnim.value / svgWidth;
      const deltaViewX = event.translationX * ratio;
      const deltaViewY = event.translationY * ratio;

      viewBoxXAnim.value = lastX.value - deltaViewX;
      viewBoxYAnim.value = lastY.value - deltaViewY;
    })
    .onEnd(() => {
      runOnJS(clampPosition)();
    })
    .onFinalize(() => {
      runOnJS(clampPosition)();
    });

  // Combine both gestures to allow simultaneous pan + pinch
  const composedGesture = Gesture.Simultaneous(pinchGesture, panGesture);

  // --- SVG content ---
  const content = (
    <Svg width={svgWidth} height={svgHeight} viewBox={viewBox}>
      <Defs>
        <LinearGradient id="availableGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#10B981" stopOpacity="1" />
          <Stop offset="100%" stopColor="#059669" stopOpacity="1" />
        </LinearGradient>
        <LinearGradient id="selectedGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#3B82F6" stopOpacity="1" />
          <Stop offset="100%" stopColor="#2563EB" stopOpacity="1" />
        </LinearGradient>
        <LinearGradient id="occupiedGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#EF4444" stopOpacity="1" />
          <Stop offset="100%" stopColor="#D1D5DB" stopOpacity="1" />
        </LinearGradient>
      </Defs>

      {svgXml && <SvgXml xml={svgXml} width={VIEWBOX_WIDTH} height={VIEWBOX_HEIGHT} />}

      <G>
        {seats.map((seat) => (
          <ChairMarker
            key={seat.id}
            seat={seat}
            isSelected={selectedSeat?.id === seat.id}
            onPress={() => onChairPress(seat)}
          />
        ))}
      </G>
    </Svg>
  );

  if (compact) {
    return content;
  }

  return (
    <GestureDetector gesture={composedGesture}>
      <Animated.View style={{ width: svgWidth, height: svgHeight }}>
        {content}
      </Animated.View>
    </GestureDetector>
  );
};

