import React, { useState, useMemo, useRef } from "react";
import { View, StyleSheet, useWindowDimensions, TouchableOpacity, Modal, Pressable } from "react-native";
import { VStack, Box, Text, HStack, Badge } from "@gluestack-ui/themed";
import Svg, { Rect, Path, Circle, G, Defs, LinearGradient, Stop } from "react-native-svg";
import { PanGestureHandler, PinchGestureHandler, GestureHandlerRootView, State } from "react-native-gesture-handler";
import Animated, { useSharedValue, runOnJS, useAnimatedReaction } from "react-native-reanimated"; 
import FloorMap from "assets/mockmap.svg";

interface Chair {
  id: string;
  x: number;
  y: number;
  hasPlug?: boolean;
  occupied?: boolean;
  label?: string;
}

const chairs: Chair[] = [
  { id: "chair1", x: 0.25, y: 0.25, hasPlug: true, label: "A1" },
  { id: "chair2", x: 0.5, y: 0.4, label: "A2" },
  { id: "chair3", x: 0.75, y: 0.6, hasPlug: true, label: "A3" },
  { id: "chair4", x: 0.3, y: 0.5, hasPlug: true, occupied: true, label: "B1" },
  { id: "chair5", x: 0.6, y: 0.7, label: "B2" },
];

const VIEWBOX_WIDTH = 2292;
const VIEWBOX_HEIGHT = 2025;
const ASPECT_RATIO = VIEWBOX_HEIGHT / VIEWBOX_WIDTH;

const SEAT_CONFIG = {
  width: 100,
  height: 70,
  radius: 12,
  plugIconSize: 35,
  strokeWidth: 5,
};

interface InteractiveMapProps { }

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
        {/* Location Image */}
        <Box
          bg="$white"
          borderRadius="$2xl"
          overflow="hidden"
          shadowColor="#000"
          shadowOffset={{ width: 0, height: 2 }}
          shadowOpacity={0.08}
          shadowRadius={8}
        >
        </Box>

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
            {/* Header */}
            <HStack justifyContent="space-between" alignItems="center">
              <VStack space="xs">
                <Text fontSize="$lg" fontWeight="$bold" color="$black">
                  Interactive Seat Map
                </Text>
                <HStack space="sm">
                  <Text fontSize="$xs" color="$white">
                    {availableSeats} Available
                  </Text>
                </HStack>
              </VStack>
              <TouchableOpacity
                onPress={() => setIsFullscreen(true)}
                style={styles.expandButton}
              >
                <Text fontSize="$2xl">⛶</Text>
              </TouchableOpacity>
            </HStack>

            {/* Compact Map Preview */}
            <Pressable onPress={() => setIsFullscreen(true)}>
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
                  onChairPress={handleChairPress}
                  compact
                />
              </Box>
            </Pressable>

            {/* Legend */}
            <HStack space="lg" justifyContent="center" flexWrap="wrap">
              <HStack space="xs" alignItems="center">
                <Box w={16} h={16} bg="#10B981" borderRadius="$sm" />
                <Text fontSize="$xs" color="$gray600">
                  Available
                </Text>
              </HStack>
              <HStack space="xs" alignItems="center">
                <Box w={16} h={16} bg="#E5E7EB" borderRadius="$sm" />
                <Text fontSize="$xs" color="$gray600">
                  Occupied
                </Text>
              </HStack>
              <HStack space="xs" alignItems="center">
                <Box w={16} h={16} bg="#10B981" borderRadius="$sm" />
                <Text fontSize="$xs" color="$gray600">
                  ⚡ Power
                </Text>
              </HStack>
            </HStack>

            {/* Selected Chair Info */}
            {selectedChairData && (
              <Box
                bg="$blue50"
                p="$3"
                borderRadius="$lg"
                borderWidth={1}
                borderColor="$blue200"
              >
                <HStack justifyContent="space-between" alignItems="center">
                  <VStack space="xs">
                    <Text fontSize="$sm" fontWeight="$semibold" color="$blue900">
                      Seat {selectedChairData.label}
                    </Text>
                    <HStack space="sm">
                      {selectedChairData.hasPlug && (
                        <Text fontSize="$xs" color="$blue700">
                          ⚡ Power outlet available
                        </Text>
                      )}
                      <Text fontSize="$xs" color="$blue700">
                        {selectedChairData.occupied ? "Occupied" : "Available"}
                      </Text>
                    </HStack>
                  </VStack>
                  {!selectedChairData.occupied && (
                    <TouchableOpacity style={styles.reserveButton}>
                      <Text fontSize="$sm" fontWeight="$semibold" color="$white">
                        View statistics
                      </Text>
                    </TouchableOpacity>
                  )}
                </HStack>
              </Box>
            )}
          </VStack>
        </Box>

        {/* Fullscreen Modal */}
        <Modal
          visible={isFullscreen}
          animationType="slide"
          onRequestClose={() => setIsFullscreen(false)}
        >
          <View style={styles.fullscreenContainer}>
            {/* Header */}
            <Box
              bg="$white"
              borderBottomWidth={1}
              borderBottomColor="$gray200"
              p="$4"
            >
              <HStack justifyContent="space-between" alignItems="center">
                <VStack space="xs">
                  <Text fontSize="$xl" fontWeight="$bold" color="$black">
                    Floor Map
                  </Text>
                  <HStack space="sm">
                    <Badge
                      size="sm"
                      variant="solid"
                      action="success"
                      borderRadius="$full"
                    >
                      <Text fontSize="$xs" color="$white">
                        {availableSeats} Available
                      </Text>
                    </Badge>
                    {seatsWithPlugs > 0 && (
                      <Badge
                        size="sm"
                        variant="solid"
                        action="info"
                        borderRadius="$full"
                      >
                        <Text fontSize="$xs" color="$white">
                          ⚡ {seatsWithPlugs} with Power
                        </Text>
                      </Badge>
                    )}
                  </HStack>
                </VStack>
                <TouchableOpacity
                  onPress={() => setIsFullscreen(false)}
                  style={styles.closeButton}
                >
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
                onChairPress={handleChairPress}
              />
            </View>

            {/* Bottom Sheet for Selected Chair */}
            {selectedChairData && (
              <Box
                bg="$white"
                p="$5"
                borderTopLeftRadius="$3xl"
                borderTopRightRadius="$3xl"
                shadowColor="#000"
                shadowOffset={{ width: 0, height: -4 }}
                shadowOpacity={0.1}
                shadowRadius={12}
              >
                <VStack space="md">
                  <HStack justifyContent="space-between" alignItems="center">
                    <VStack space="xs">
                      <Text fontSize="$xl" fontWeight="$bold" color="$black">
                        Seat {selectedChairData.label}
                      </Text>
                      <HStack space="md">
                        {selectedChairData.hasPlug && (
                          <HStack space="xs" alignItems="center">
                            <Text fontSize="$lg">⚡</Text>
                            <Text fontSize="$sm" color="$gray700">
                              Power outlet
                            </Text>
                          </HStack>
                        )}
                        <Badge
                          size="md"
                          variant="solid"
                          action={
                            selectedChairData.occupied ? "muted" : "success"
                          }
                          borderRadius="$full"
                        >
                          <Text fontSize="$sm" color="$white">
                            {selectedChairData.occupied ? "Occupied" : "Available"}
                          </Text>
                        </Badge>
                      </HStack>
                    </VStack>
                    <TouchableOpacity
                      onPress={() => setSelectedChair(null)}
                      style={{ padding: 8 }}
                    >
                      <Text fontSize="$xl" color="$gray400">
                        ✕
                      </Text>
                    </TouchableOpacity>
                  </HStack>

                  {!selectedChairData.occupied && (
                    <TouchableOpacity style={styles.fullReserveButton}>
                      <Text
                        fontSize="$md"
                        fontWeight="$bold"
                        color="$white"
                        textAlign="center"
                      >
                        View statistics
                      </Text>
                    </TouchableOpacity>
                  )}
                </VStack>
              </Box>
            )}
          </View>
        </Modal>
      </VStack>
    </GestureHandlerRootView>
  );
};

interface FloorMapContentProps {
  width: number;
  height?: number;
  selectedChair: string | null;
  onChairPress: (id: string) => void;
  compact?: boolean;
}

const FloorMapContent: React.FC<FloorMapContentProps> = ({
  width,
  height,
  selectedChair,
  onChairPress,
  compact = false,
}) => {
  const svgWidth = width;
  const aspect = ASPECT_RATIO;
  const svgHeight = compact ? 250 : (height || width * aspect);
  const originalWidth = VIEWBOX_WIDTH;
  const originalHeight = VIEWBOX_HEIGHT;
  const minZoom = 1;
  const maxZoom = 4;

  // ✅ FIXED: React state for viewBox string
  const [viewBox, setViewBox] = useState(`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`);

  // ✅ FIXED: useSharedValue for animations
  const viewBoxXAnim = useSharedValue(0);
  const viewBoxYAnim = useSharedValue(0);
  const viewBoxWidthAnim = useSharedValue(VIEWBOX_WIDTH);

  const pinchRef = useRef(null);
  const panRef = useRef(null);

  // ✅ FIXED: SharedValues for last values (worklet compatible)
  const lastX = useSharedValue(0);
  const lastY = useSharedValue(0);
  const lastW = useSharedValue(VIEWBOX_WIDTH);

  // ✅ FIXED: useAnimatedReaction replaces listeners
  useAnimatedReaction(
    () => [viewBoxXAnim.value, viewBoxYAnim.value, viewBoxWidthAnim.value],
    ([vbX, vbY, vbW]) => {
      const vbH = vbW * aspect;
      runOnJS(setViewBox)(`${vbX} ${vbY} ${vbW} ${vbH}`);
    }
  );

  const clampPosition = () => {
    'worklet';
    const currW = viewBoxWidthAnim.value;
    const currH = currW * aspect;
    let currX = viewBoxXAnim.value;
    let currY = viewBoxYAnim.value;

    currX = Math.max(0, Math.min(currX, originalWidth - currW));
    currY = Math.max(0, Math.min(currY, originalHeight - currH));

    viewBoxXAnim.value = currX;
    viewBoxYAnim.value = currY;
  };

  const onPinchGesture = (event: any) => {
    'worklet';
    const { scale: gScale, focalX, focalY, state } = event.nativeEvent;
    if (state === State.ACTIVE) {
      let newW = lastW.value / gScale;
      newW = Math.max(originalWidth / maxZoom, Math.min(newW, originalWidth / minZoom));

      const oldW = lastW.value;
      const oldH = oldW * aspect;
      const newH = newW * aspect;

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
      // ✅ FIXED: Update sharedValues in worklet
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
      // ✅ FIXED: Update sharedValues in worklet
      lastX.value = viewBoxXAnim.value;
      lastY.value = viewBoxYAnim.value;
    }
    if (state === State.END || state === State.CANCELLED) {
      runOnJS(clampPosition)();
    }
  };

  const content = (
    <Svg
      width={svgWidth}
      height={svgHeight}
      viewBox={viewBox}
    >
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
          <Stop offset="0%" stopColor="#E5E7EB" stopOpacity="1" />
          <Stop offset="100%" stopColor="#D1D5DB" stopOpacity="1" />
        </LinearGradient>
      </Defs>

      {/* Floor map background */}
      <FloorMap width={VIEWBOX_WIDTH} height={VIEWBOX_HEIGHT} />

      {/* Chairs */}
      {chairs.map((chair) => {
        const isSelected = selectedChair === chair.id;
        const cx = chair.x * VIEWBOX_WIDTH;
        const cy = chair.y * VIEWBOX_HEIGHT;

        const fillGradient = chair.occupied
          ? "url(#occupiedGrad)"
          : isSelected
            ? "url(#selectedGrad)"
            : "url(#availableGrad)";

        return (
          <G key={chair.id}>
            {/* Glow effect for selected */}
            {isSelected && (
              <Rect
                x={cx - SEAT_CONFIG.width / 2 - 10}
                y={cy - SEAT_CONFIG.height / 2 - 10}
                width={SEAT_CONFIG.width + 20}
                height={SEAT_CONFIG.height + 20}
                rx={SEAT_CONFIG.radius + 4}
                fill="#3B82F6"
                opacity={0.3}
              />
            )}

            {/* Main seat */}
            <Rect
              x={cx - SEAT_CONFIG.width / 2}
              y={cy - SEAT_CONFIG.height / 2}
              width={SEAT_CONFIG.width}
              height={SEAT_CONFIG.height}
              rx={SEAT_CONFIG.radius}
              fill={fillGradient}
              stroke={isSelected ? "#1E40AF" : chair.hasPlug ? "#FCD34D" : "transparent"}
              strokeWidth={SEAT_CONFIG.strokeWidth}
              onPress={() => !chair.occupied && onChairPress(chair.id)}
              opacity={chair.occupied ? 0.6 : 1}
            />

            {/* Plug icon - enhanced and larger */}
            {chair.hasPlug && (
              <G>
                {/* Plug background circle */}
                <Circle
                  cx={cx + SEAT_CONFIG.width / 2 - 25}
                  cy={cy - SEAT_CONFIG.height / 2 + 20}
                  r={18}
                  fill="#FCD34D"
                />
                {/* Plug icon */}
                <Path
                  d="M -3 -6 L -3 0 L -1 0 L -1 -6 Z M 1 -6 L 1 0 L 3 0 L 3 -6 Z M -4 1 L -4 5 C -4 6.1 -3.1 7 -2 7 L -1 7 L -1 9 L 1 9 L 1 7 L 2 7 C 3.1 7 4 6.1 4 5 L 4 1 Z"
                  fill="#ffffff"
                  scale={1.2}
                  x={cx + SEAT_CONFIG.width / 2 - 25}
                  y={cy - SEAT_CONFIG.height / 2 + 20}
                />
              </G>
            )}

            {/* Seat label */}
            {chair.label && (
              <Path
                d={`M ${cx - 15} ${cy + 5} L ${cx + 15} ${cy + 5}`}
                stroke="#FFFFFF"
                strokeWidth={3}
                strokeLinecap="round"
              />
            )}
          </G>
        );
      })}
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
  expandButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
  },
  closeButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
  },
  reserveButton: {
    backgroundColor: "#3B82F6",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  fullReserveButton: {
    backgroundColor: "#3B82F6",
    paddingVertical: 16,
    borderRadius: 12,
    width: "100%",
  },
});

export default InteractiveMap;
