export interface Chair {
  id: string;
  x: number;
  y: number;
  hasPlug?: boolean;
  occupied?: boolean;
  label?: string;
}

export const chairs: Chair[] = [
  { id: "chair1", x: 0.25, y: 0.25, hasPlug: true, label: "A1" },
  { id: "chair2", x: 0.5, y: 0.4, label: "A2" },
  { id: "chair3", x: 0.75, y: 0.6, hasPlug: true, label: "A3" },
  { id: "chair4", x: 0.3, y: 0.5, hasPlug: true, occupied: true, label: "B1" },
  { id: "chair5", x: 0.6, y: 0.7, label: "B2" },
];

export const VIEWBOX_WIDTH = 2292;
export const VIEWBOX_HEIGHT = 2025;
export const ASPECT_RATIO = VIEWBOX_HEIGHT / VIEWBOX_WIDTH;

export const SEAT_CONFIG = {
  width: 100,
  height: 70,
  radius: 12,
  plugIconSize: 35,
  strokeWidth: 5,
}
