import type { ImageSourcePropType } from 'react-native';
import it_subjectImage from 'assets/subjects/it-subject.jpg';
import business_subjectImage from 'assets/subjects/business-subject.jpg';
import psychology_subjectImage from 'assets/subjects/psychology-subject.jpg';

export interface LocationLecturers {
  id: string;
  code: string;
  name: string;
  image: ImageSourcePropType;
  capacity: number;
  subject: string;
  schedule: string; // e.g. "Monday 10:00–12:00"
  liveOccupancy: number | null; // percentage during lecture time
}

// Utility: check if current time falls within the scheduled range
const isLectureOngoing = (schedule: string): boolean => {
  const now = new Date();
  const [dayName, timeRange] = schedule.split(' ');
  const [start, end] = timeRange.split('–');
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const currentDay = days[now.getDay()];
  if (currentDay !== dayName) return false;

  const toMinutes = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  return currentMinutes >= toMinutes(start) && currentMinutes <= toMinutes(end);
};

// Assign random occupancy during lecture time
const getLiveOccupancy = (schedule: string): number | null => {
  return isLectureOngoing(schedule) ? Math.floor(70 + Math.random() * 30) : null;
};

export const locations: LocationLecturers[] = [
  {
    id: 'L1',
    code: 'A1-03',
    name: 'Lecture Room A1-03',
    image: it_subjectImage,
    capacity: 60,
    subject: 'Introduction to Programming',
    schedule: 'Monday 10:00–12:00',
    liveOccupancy: getLiveOccupancy('Monday 10:00–12:00'),
  },
  {
    id: 'L2',
    code: 'B2-12',
    name: 'Lecture Room B2-12',
    image: business_subjectImage,
    capacity: 80,
    subject: 'Business Communication',
    schedule: 'Tuesday 14:00–16:00',
    liveOccupancy: getLiveOccupancy('Tuesday 14:00–16:00'),
  },
  {
    id: 'L3',
    code: 'C3-07',
    name: 'Lecture Room C3-07',
    image: it_subjectImage,
    capacity: 100,
    subject: 'Data Structures and Algorithms',
    schedule: 'Wednesday 09:00–11:00',
    liveOccupancy: getLiveOccupancy('Wednesday 09:00–11:00'),
  },
  {
    id: 'L4',
    code: 'E2-05',
    name: 'Lecture Room E2-05',
    image: psychology_subjectImage,
    capacity: 50,
    subject: 'Psychology of Learning',
    schedule: 'Thursday 13:00–15:00',
    liveOccupancy: getLiveOccupancy('Thursday 13:00–15:00'),
  },
  {
    id: 'L5',
    code: 'C4-10',
    name: 'Lecture Room C4-10',
    image: it_subjectImage,
    capacity: 120,
    subject: 'Database Systems',
    schedule: 'Thursday 17:00–19:00',
    liveOccupancy: getLiveOccupancy('Thursday 17:00–19:00'),
  },
  {
    id: 'L6',
    code: 'B3-02',
    name: 'Lecture Room B3-02',
    image: business_subjectImage,
    capacity: 40,
    subject: 'Professional Ethics',
    schedule: 'Monday 15:00–17:00',
    liveOccupancy: getLiveOccupancy('Monday 15:00–17:00'),
  },
];
