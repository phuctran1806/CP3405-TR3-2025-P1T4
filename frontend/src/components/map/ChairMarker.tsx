import React from "react";
import { Rect, Path, Circle, G } from "react-native-svg";
import { VIEWBOX_WIDTH, VIEWBOX_HEIGHT, SEAT_CONFIG } from "./Chair";
import type { Chair } from "./Chair";

interface ChairMarkerProps {
  chair: Chair;
  isSelected: boolean;
  onPress: () => void;
}

export const ChairMarker: React.FC<ChairMarkerProps> = ({ chair, isSelected, onPress }) => {
  const cx = chair.x * VIEWBOX_WIDTH;
  const cy = chair.y * VIEWBOX_HEIGHT;

  const fillGradient = chair.occupied
    ? "url(#occupiedGrad)"
    : isSelected
      ? "url(#selectedGrad)"
      : "url(#availableGrad)";

  return (
    <G>
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
        onPress={onPress}
        opacity={chair.occupied ? 0.6 : 1}
      />

      {/* Plug icon */}
      {chair.hasPlug && (
        <G>
          <Circle
            cx={cx + SEAT_CONFIG.width / 2 - 25}
            cy={cy - SEAT_CONFIG.height / 2 + 20}
            r={18}
            fill="#FCD34D"
          />
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
};
