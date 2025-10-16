import studyHubEImage from 'assets/study-hub-e.jpg';
import studyHubAImage from 'assets/study-hub-a.jpg';
import libraryImage from 'assets/library.jpg';
import studyPodsImage from 'assets/study-pods.jpg';
import yardImage from 'assets/yard.jpg';
import type { ImageSourcePropType } from 'react-native';

export interface Location {
  id: string;
  name: string;
  image: ImageSourcePropType;
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
    image: studyHubEImage,
    coordinates: { latitude: 1.3521, longitude: 103.8198 },
    accessibility: ['power', 'cool', 'wifi'],
  },
  {
    id: '2',
    name: 'Study Hub A',
    image: studyHubAImage,
    coordinates: { latitude: 1.3525, longitude: 103.8200 },
    accessibility: ['power', 'quiet'],
  },
  {
    id: '3',
    name: 'Library',
    image: libraryImage,
    coordinates: { latitude: 1.3530, longitude: 103.8205 },
    accessibility: ['power', 'cool', 'wifi', 'quiet'],
  },
    {
      id: '4',
      name: 'Study Pods',
      image: studyPodsImage,
      coordinates: { latitude: 1.3518, longitude: 103.8195 },
      accessibility: ['power', 'wifi'],
    },
  {
    id: '5',
    name: 'Courtyard',
    image: yardImage,
    coordinates: { latitude: 1.3515, longitude: 103.8190 },
    accessibility: ['wifi'],
  },
];
