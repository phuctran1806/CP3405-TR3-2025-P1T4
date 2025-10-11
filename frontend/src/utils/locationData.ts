export interface Location {
  id: string;
  name: string;
  image: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  accessibility: ('power' | 'cool' | 'wifi' | 'quiet')[];
}

export const locations: Location[] = [
  {
    id: '1',
    name: 'Study Hub E',
    image: 'placeholder',
    coordinates: { latitude: 1.3521, longitude: 103.8198 },
    accessibility: ['power', 'cool', 'wifi'],
  },
  {
    id: '2',
    name: 'Study Hub A',
    image: 'placeholder',
    coordinates: { latitude: 1.3525, longitude: 103.8200 },
    accessibility: ['power', 'quiet'],
  },
  {
    id: '3',
    name: 'Library',
    image: 'placeholder',
    coordinates: { latitude: 1.3530, longitude: 103.8205 },
    accessibility: ['power', 'cool', 'wifi', 'quiet'],
  },
  {
    id: '4',
    name: 'Study Pods',
    image: 'placeholder',
    coordinates: { latitude: 1.3518, longitude: 103.8195 },
    accessibility: ['power', 'wifi'],
  },
  {
    id: '5',
    name: 'Courtyard',
    image: 'placeholder',
    coordinates: { latitude: 1.3515, longitude: 103.8190 },
    accessibility: ['wifi'],
  },
];