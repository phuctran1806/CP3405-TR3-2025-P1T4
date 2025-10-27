// store/useSelectedVenue.ts
import { create } from "zustand";
import type { ImageSourcePropType } from "react-native";

export interface VenueDisplay {
  id: string;
  code: string;
  name: string;
  image: ImageSourcePropType;
  subject: string;
  schedule: string;
  capacity: number;
  liveOccupancy?: number | null;
}

export const useSelectedVenue = create(set => ({
  selectedVenue: null as VenueDisplay | null,
  setSelectedVenue: (venue: VenueDisplay) => set({ selectedVenue: venue }),
}));
