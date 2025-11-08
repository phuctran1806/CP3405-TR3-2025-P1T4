import React from "react";
import { G, Circle, Text as SvgText, Path } from "react-native-svg";
import { VIEWBOX_WIDTH, VIEWBOX_HEIGHT, SEAT_CONFIG } from "./MapConfig";
import type { Seat } from "@/api/seats";

interface SeatMarkerProps {
  seat: Seat;
  isSelected: boolean;
  onPress: (e: React.PointerEvent) => void;
}

export const SeatMarker = React.forwardRef<any, SeatMarkerProps>(
  ({ seat, isSelected, onPress }, ref) => {
    const cx = seat.x_coordinate * VIEWBOX_WIDTH;
    const cy = seat.y_coordinate * VIEWBOX_HEIGHT;
    const radius = SEAT_CONFIG.radius;
    const fillGradient =
      seat.status === "occupied"
        ? "url(#occupiedGrad)"
        : isSelected
          ? "url(#selectedGrad)"
          : "url(#availableGrad)";

    const iconSize = 18;
    const iconSpacing = 6;
    const featureIcons: { path: string; color: string; viewBox: string }[] = [];

    if (seat.has_power_outlet)
      featureIcons.push({
        path: "M7 12v4h10v-4M7 6v2h10V6M12 2v4M8 2v4M16 2v4",
        color: "#FCD34D",
        viewBox: "0 0 100 100",
      });
    if (seat.has_wifi)
      featureIcons.push({
        path: "M12 18h.01M8.5 14.5c1.5-1.5 4-1.5 5.5 0M5.5 11.5c3-3 8-3 11 0M2.5 8.5c4.5-4.5 13-4.5 17.5 0",
        color: "#60A5FA",
        viewBox: "0 0 24 24",
      });
    if (seat.has_ac)
      featureIcons.push({
        path: "M12 2v20M17 7l-5 5-5-5M17 17l-5-5-5 5M7 12h10",
        color: "#34D399",
        viewBox: "0 0 24 24",
      });
    if (seat.accessibility)
      featureIcons.push({
        path: "M12 6a2 2 0 110-4 2 2 0 010 4zM10 22a6 6 0 110-12 6 6 0 010 12zm0-2a4 4 0 100-8 4 4 0 000 8zm4-6h4l2 5M14 14v-3a1 1 0 011-1h2",
        color: "#EF4444",
        viewBox: "0 0 24 24",
      });

    return (
      <G ref={ref} onPress={onPress}>
        {isSelected && (
          <Circle cx={cx} cy={cy} r={radius + 10} fill="#3B82F6" opacity={0.3} />
        )}
        <Circle
          cx={cx}
          cy={cy}
          r={radius}
          fill={fillGradient}
          stroke="transparent"
          strokeWidth={SEAT_CONFIG.strokeWidth}
          opacity={seat.status === "occupied" ? 0.6 : 1}
        />
        {seat.seat_number && (
          <SvgText
            x={cx}
            y={cy + radius + 25}
            textAnchor="middle"
            fontSize={28}
            fontWeight="bold"
            fill="#FFFFFF"
          >
            {seat.seat_number}
          </SvgText>
        )}
        {featureIcons.map((icon, i) => {
          const iconX =
            cx -
            ((featureIcons.length - 1) * (iconSize + iconSpacing)) / 2 +
            i * (iconSize + iconSpacing);
          const iconY = cy - radius - iconSize - 6;
          return (
            <G key={i} transform={`translate(${iconX - iconSize / 2}, ${iconY})`}>
              <Path
                d={icon.path}
                stroke={icon.color}
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                scale={iconSize / 24}
              />
            </G>
          );
        })}
      </G>
    );
  }
);

SeatMarker.displayName = "SeatMarker";
