import React, { useState, useRef } from "react";
import { PanGestureHandler, PinchGestureHandler, State } from "react-native-gesture-handler";
import Animated, { useSharedValue, runOnJS, useAnimatedReaction } from "react-native-reanimated";
import Svg, { Defs, LinearGradient, Stop, G } from "react-native-svg";
import FloorMap from "assets/mockmap.svg";
import { ChairMarker } from "./ChairMarker";
import { chairs, VIEWBOX_WIDTH, VIEWBOX_HEIGHT, ASPECT_RATIO } from "./Chair";

interface FloorMapContentProps {
  width: number;
  height?: number;
  selectedChair: string | null;
  onChairPress: (id: string) => void;
  compact?: boolean;
}

export const FloorMapContent: React.FC<FloorMapContentProps> = ({
  width,
  height,
  selectedChair,
  onChairPress,
  compact = false,
}) => {
  const svgWidth = width;
  const svgHeight = compact ? 250 : (height || width * ASPECT_RATIO);
  const minZoom = 1;
  const maxZoom = 4;

  const [viewBox, setViewBox] = useState(`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`);

  const viewBoxXAnim = useSharedValue(0);
  const viewBoxYAnim = useSharedValue(0);
  const viewBoxWidthAnim = useSharedValue(VIEWBOX_WIDTH);

  const pinchRef = useRef(null);
  const panRef = useRef(null);

  const lastX = useSharedValue(0);
  const lastY = useSharedValue(0);
  const lastW = useSharedValue(VIEWBOX_WIDTH);

  useAnimatedReaction(
    () => [viewBoxXAnim.value, viewBoxYAnim.value, viewBoxWidthAnim.value],
    ([vbX, vbY, vbW]) => {
      const vbH = vbW * ASPECT_RATIO;
      runOnJS(setViewBox)(`${vbX} ${vbY} ${vbW} ${vbH}`);
    }
  );

  const clampPosition = () => {
    'worklet';
    const currW = viewBoxWidthAnim.value;
    const currH = currW * ASPECT_RATIO;
    let currX = viewBoxXAnim.value;
    let currY = viewBoxYAnim.value;

    currX = Math.max(0, Math.min(currX, VIEWBOX_WIDTH - currW));
    currY = Math.max(0, Math.min(currY, VIEWBOX_HEIGHT - currH));

    viewBoxXAnim.value = currX;
    viewBoxYAnim.value = currY;
  };

  const onPinchGesture = (event: any) => {
    'worklet';
    const { scale: gScale, focalX, focalY, state } = event.nativeEvent;
    if (state === State.ACTIVE) {
      let newW = lastW.value / gScale;
      newW = Math.max(VIEWBOX_WIDTH / maxZoom, Math.min(newW, VIEWBOX_WIDTH / minZoom));

      const oldW = lastW.value;
      const oldH = oldW * ASPECT_RATIO;
      const newH = newW * ASPECT_RATIO;

      const ratioX = focalX / svgWidth;
      const ratioY = focalY / svgHeight;

      const mapX = lastX.value + ratioX * oldW;
      const mapY = lastY.value + ratioY * oldH;

      const newX = mapX - ratioX * newW;
      const newY = mapY - ratioY * newH;

      viewBoxWidthAnim.value = newW;
      viewBoxXAnim.value = newX;
      viewBoxYAnim.value = newY;
    }
  };

  const onPinchStateChange = (event: any) => {
    'worklet';
    const { state } = event.nativeEvent;
    if (state === State.BEGAN) {
      lastX.value = viewBoxXAnim.value;
      lastY.value = viewBoxYAnim.value;
      lastW.value = viewBoxWidthAnim.value;
    }
    if (state === State.END || state === State.CANCELLED) {
      runOnJS(clampPosition)();
    }
  };

  const onPanGesture = (event: any) => {
    'worklet';
    const { translationX, translationY, state } = event.nativeEvent;
    if (state === State.ACTIVE) {
      const ratio = viewBoxWidthAnim.value / svgWidth;
      const deltaViewX = translationX * ratio;
      const deltaViewY = translationY * ratio;

      viewBoxXAnim.value = lastX.value - deltaViewX;
      viewBoxYAnim.value = lastY.value - deltaViewY;
    }
  };

  const onPanStateChange = (event: any) => {
    'worklet';
    const { state } = event.nativeEvent;
    if (state === State.BEGAN) {
      lastX.value = viewBoxXAnim.value;
      lastY.value = viewBoxYAnim.value;
    }
    if (state === State.END || state === State.CANCELLED) {
      runOnJS(clampPosition)();
    }
  };

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

      <FloorMap width={VIEWBOX_WIDTH} height={VIEWBOX_HEIGHT} />

      <G>
        {chairs.map((chair) => (
          <ChairMarker
            key={chair.id}
            chair={chair}
            isSelected={selectedChair === chair.id}
            onPress={() => !chair.occupied && onChairPress(chair.id)}
          />
        ))}
      </G>
    </Svg>
  );

  if (compact) {
    return content;
  }

  return (
    <PinchGestureHandler
      ref={pinchRef}
      simultaneousHandlers={panRef}
      onGestureEvent={onPinchGesture}
      onHandlerStateChange={onPinchStateChange}
    >
      <Animated.View style={{ width: svgWidth, height: svgHeight }}>
        <PanGestureHandler
          ref={panRef}
          simultaneousHandlers={pinchRef}
          onGestureEvent={onPanGesture}
          onHandlerStateChange={onPanStateChange}
          minPointers={1}
          maxPointers={1}
          activeOffsetX={[-10, 10]}
          activeOffsetY={[-10, 10]}
        >
          <Animated.View style={{ width: '100%', height: '100%' }}>
            {content}
          </Animated.View>
        </PanGestureHandler>
      </Animated.View>
    </PinchGestureHandler>
  );
};
