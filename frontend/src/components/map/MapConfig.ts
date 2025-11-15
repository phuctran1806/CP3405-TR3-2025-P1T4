// TODO: I still don't know how to fetch aspect ratio from the svg file, I would probably need to get tell the server to save it
export const VIEWBOX_WIDTH = 2400;
export const VIEWBOX_HEIGHT = 1500;
export const ASPECT_RATIO = VIEWBOX_HEIGHT / VIEWBOX_WIDTH;

export const SEAT_CONFIG = {
  radius: 40,
  plugIconSize: 35,
  strokeWidth: 5,
}

export const SEAT_TYPES = ['individual', 'group', 'quiet', 'computer', 'study_pod'];
export const SEAT_STATUSES = ['available', 'occupied', 'reserved', 'maintenance', 'blocked'];
