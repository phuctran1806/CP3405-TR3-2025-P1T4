export interface BookingRequest {
  id: string;
  venue: string;
  lecturerName: string;
  lecturerRole?: string;
  purpose: string;
  date: string; // ISO or human-readable
  startTime: string;
  endTime: string;
  status: 'pending' | 'approved' | 'rejected';
}

export const bookingRequests: BookingRequest[] = [
  {
    id: 'BR001',
    venue: 'Seminar Room 2A',
    lecturerName: 'Dr. Sarah Chen',
    lecturerRole: 'Lecturer',
    purpose: 'Guest Lecture',
    date: 'March 25, 2025',
    startTime: '3:00 PM',
    endTime: '5:00 PM',
    status: 'pending',
  },
  {
    id: 'BR002',
    venue: 'Lecture Theatre C1',
    lecturerName: 'Prof. Michael Wong',
    lecturerRole: 'Senior Lecturer',
    purpose: 'Midterm Review',
    date: 'March 27, 2025',
    startTime: '9:00 AM',
    endTime: '11:00 AM',
    status: 'approved',
  },
  {
    id: 'BR003',
    venue: 'Tutorial Room 3B',
    lecturerName: 'Dr. Farah Noor',
    lecturerRole: 'Associate Professor',
    purpose: 'Exam Consultation',
    date: 'March 28, 2025',
    startTime: '1:00 PM',
    endTime: '3:00 PM',
    status: 'pending',
  },
  {
    id: 'BR004',
    venue: 'C2-14',
    lecturerName: 'Dr. Jason Koh',
    lecturerRole: 'Lecturer',
    purpose: 'Project Presentation',
    date: 'March 30, 2025',
    startTime: '10:00 AM',
    endTime: '12:00 PM',
    status: 'rejected',
  },
];
