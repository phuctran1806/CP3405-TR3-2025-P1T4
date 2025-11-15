// store/useSelectedVenue.ts
import { create } from "zustand";

export interface VenueDisplay {
  id: string;
  name: string;
  image: string | null | undefined;
  subject: string;
  schedule: {
    start_time: Date;
    end_time: Date;
  };
  capacity: number;
  liveOccupancy?: number | null;
}

export const useSelectedVenue = create(set => ({
  selectedVenue: null as VenueDisplay | null,
  setSelectedVenue: (venue: VenueDisplay) => set({ selectedVenue: venue }),
}));
