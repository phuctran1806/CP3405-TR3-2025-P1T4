import React, { useState, useEffect } from "react";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  runOnJS,
  useAnimatedReaction,
  withTiming,
} from "react-native-reanimated";
import Svg, { Defs, LinearGradient, Stop, G, SvgXml } from "react-native-svg";
import { SeatMarker } from "./SeatMarker";
import { VIEWBOX_WIDTH, VIEWBOX_HEIGHT, ASPECT_RATIO } from "./MapConfig";
import type { SeatResponse } from "@/api/seats";
import { API_BASE_URL } from "@/api/config";

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
    if (!map_url) {
      setSvgXml(null);
      return;
    }

    const resolveMapUrl = () => {
      if (map_url.startsWith("http")) return map_url;
      const cleaned = map_url.replace(/^\/+/, "");
      return `${API_BASE_URL}/${cleaned}`;
    };

    async function loadSvg() {
      try {
        const res = await fetch(resolveMapUrl());
        if (!res.ok) throw new Error("Failed to load map");
        const text = await res.text();
        setSvgXml(text);
      } catch (err) {
        console.warn("Unable to load floor map", err);
        setSvgXml(null);
      }
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

  const clampPosition = (x: number, y: number, w: number) => {
    "worklet";
    const currH = w * ASPECT_RATIO;
    
    const clampedX = Math.max(0, Math.min(x, VIEWBOX_WIDTH - w));
    const clampedY = Math.max(0, Math.min(y, VIEWBOX_HEIGHT - currH));

    viewBoxXAnim.value = withTiming(clampedX, { duration: 100 });
    viewBoxYAnim.value = withTiming(clampedY, { duration: 100 });
  };

  // --- Pinch Gesture ---
  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
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
      clampPosition(viewBoxXAnim.value, viewBoxYAnim.value, viewBoxWidthAnim.value);
    });

  // --- Pan Gesture ---
  const panGesture = Gesture.Pan()
    .minPointers(1)
    .maxPointers(1)
    .onStart(() => {
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
      clampPosition(viewBoxXAnim.value, viewBoxYAnim.value, viewBoxWidthAnim.value);
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
          <Stop offset="100%" stopColor="#DC2626" stopOpacity="1" />
        </LinearGradient>
      </Defs>

      {svgXml && <SvgXml xml={svgXml} width={VIEWBOX_WIDTH} height={VIEWBOX_HEIGHT} />}

      <G>
        {seats.map((seat) => (
          <SeatMarker
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
