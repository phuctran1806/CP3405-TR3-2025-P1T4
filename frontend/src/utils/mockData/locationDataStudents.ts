import studyHubEImage from 'assets/locations/study-hub-e.jpg';
import studyHubAImage from 'assets/locations/study-hub-a.jpg';
import libraryImage from 'assets/locations/library.jpg';
import studyPodsImage from 'assets/locations/study-pods.jpg';
import yardImage from 'assets/locations/yard.jpg';
import type { ImageSourcePropType } from 'react-native';

export interface LocationStudents {
  id: string;
  name: string;
  image: ImageSourcePropType;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  accessibility: ('power' | 'cool' | 'wifi' | 'quiet')[];
  occupancy: number;
  capacity: number;
  averageOccupancy: {
    monday: number;
    tuesday: number;
    wednesday: number;
    thursday: number;
    friday: number;
    saturday: number;
  };

  lineChartData?: { time: string; value: number }[];
  occupancyBreakdown?: { label: string; value: number }[];
  state: ('active' | 'maintenance');
}

export const locations: LocationStudents[] = [
  {
    id: '1',
    name: 'Study Hub E',
    image: studyHubEImage,
    coordinates: { latitude: 1.3521, longitude: 103.8198 },
    accessibility: ['power', 'cool', 'wifi'],
    occupancy: 94,
    capacity: 130,
    averageOccupancy: {
      monday: 70,
      tuesday: 75,
      wednesday: 78,
      thursday: 80,
      friday: 65,
      saturday: 60,
    },
    occupancyBreakdown: [
      { label: 'Occupied', value: 94 },
      { label: 'Available', value: 36 },
    ],
    lineChartData: [
      { time: '08:00', value: 30 },
      { time: '10:00', value: 55 },
      { time: '12:00', value: 70 },
      { time: '14:00', value: 75 },
      { time: '16:00', value: 68 },
      { time: '18:00', value: 50 },
      { time: '20:00', value: 35 },
    ],
    state: 'active',
  },
  {
    id: '2',
    name: 'Study Hub A',
    image: studyHubAImage,
    coordinates: { latitude: 1.3525, longitude: 103.82 },
    accessibility: ['power', 'quiet'],
    occupancy: 65,
    capacity: 120,
    averageOccupancy: {
      monday: 55,
      tuesday: 60,
      wednesday: 62,
      thursday: 58,
      friday: 52,
      saturday: 40,
    },
    occupancyBreakdown: [
      { label: 'Occupied', value: 65 },
      { label: 'Available', value: 55 },
    ],
    lineChartData: [
      { time: '08:00', value: 20 },
      { time: '10:00', value: 40 },
      { time: '12:00', value: 55 },
      { time: '14:00', value: 60 },
      { time: '16:00', value: 58 },
      { time: '18:00', value: 45 },
      { time: '20:00', value: 30 },
    ],
    state: 'active',
  },
  {
    id: '3',
    name: 'Library',
    image: libraryImage,
    coordinates: { latitude: 1.353, longitude: 103.8205 },
    accessibility: ['power', 'cool', 'wifi', 'quiet'],
    occupancy: 85,
    capacity: 100,
    averageOccupancy: {
      monday: 80,
      tuesday: 82,
      wednesday: 88,
      thursday: 90,
      friday: 75,
      saturday: 68,
    },
    occupancyBreakdown: [
      { label: 'Occupied', value: 85 },
      { label: 'Available', value: 15 },
    ],
    lineChartData: [
      { time: '08:00', value: 50 },
      { time: '10:00', value: 70 },
      { time: '12:00', value: 85 },
      { time: '14:00', value: 90 },
      { time: '16:00', value: 88 },
      { time: '18:00', value: 75 },
      { time: '20:00', value: 60 },
    ],
    state: 'active',
  },
  {
    id: '4',
    name: 'Study Pods',
    image: studyPodsImage,
    coordinates: { latitude: 1.3518, longitude: 103.8195 },
    accessibility: ['power', 'wifi'],
    occupancy: 18,
    capacity: 40,
    averageOccupancy: {
      monday: 50,
      tuesday: 48,
      wednesday: 52,
      thursday: 55,
      friday: 43,
      saturday: 35,
    },
    occupancyBreakdown: [
      { label: 'Occupied', value: 18 },
      { label: 'Available', value: 22 },
    ],
    lineChartData: [
      { time: '08:00', value: 15 },
      { time: '10:00', value: 30 },
      { time: '12:00', value: 45 },
      { time: '14:00', value: 50 },
      { time: '16:00', value: 48 },
      { time: '18:00', value: 40 },
      { time: '20:00', value: 25 },
    ],
    state: 'active',
  },
  {
    id: '5',
    name: 'Courtyard',
    image: yardImage,
    coordinates: { latitude: 1.3515, longitude: 103.819 },
    accessibility: ['wifi'],
    occupancy: 7,
    capacity: 24,
    averageOccupancy: {
      monday: 30,
      tuesday: 32,
      wednesday: 28,
      thursday: 25,
      friday: 20,
      saturday: 18,
    },
    occupancyBreakdown: [
      { label: 'Occupied', value: 7 },
      { label: 'Available', value: 17 },
    ],
    lineChartData: [
      { time: '08:00', value: 10 },
      { time: '10:00', value: 15 },
      { time: '12:00', value: 25 },
      { time: '14:00', value: 30 },
      { time: '16:00', value: 28 },
      { time: '18:00', value: 20 },
      { time: '20:00', value: 12 },
    ],
    state: 'maintenance',
  },
];
