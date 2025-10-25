export interface LecturerAssignment {
  id: string;
  lecturerName: string;
  totalSubjects: number;
  totalVenues: number;
  subjects: string[];
  venues: string[];
  faculty: 'IT' | 'Business' | 'Psychology';
}

export const lecturerAssignments: LecturerAssignment[] = [
  {
    id: 'LA001',
    lecturerName: 'Dr. Sarah Chen',
    totalSubjects: 2,
    totalVenues: 2,
    subjects: ['CP2411', 'CP1423'],
    venues: ['Lecture Theatre A', 'Tutorial Room 3B'],
    faculty: 'IT',
  },
  {
    id: 'LA002',
    lecturerName: 'Prof. Tan Wei Ming',
    totalSubjects: 3,
    totalVenues: 2,
    subjects: ['BU1204', 'BX2312', 'BU3408'],
    venues: ['B2-12', 'C4-10'],
    faculty: 'Business',
  },
  {
    id: 'LA003',
    lecturerName: 'Dr. Farah Noor',
    totalSubjects: 2,
    totalVenues: 1,
    subjects: ['PY1201', 'PY2406'],
    venues: ['E2-05'],
    faculty: 'Psychology',
  },
  {
    id: 'LA004',
    lecturerName: 'Dr. Michael Lee',
    totalSubjects: 2,
    totalVenues: 2,
    subjects: ['CP2302', 'CP3509'],
    venues: ['C3-07', 'A1-03'],
    faculty: 'IT',
  },
  {
    id: 'LA005',
    lecturerName: 'Dr. Anita Rao',
    totalSubjects: 3,
    totalVenues: 2,
    subjects: ['PY1105', 'PY2408', 'PY3502'],
    venues: ['C2-14', 'E1-10'],
    faculty: 'Psychology',
  },
];
