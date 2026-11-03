export interface Attendee {
  name: string;
  email: string;
  avatar?: string;
  status: 'accepted' | 'declined' | 'tentative' | 'needsAction';
  role?: 'organizer' | 'interviewer' | 'candidate' | 'client' | 'participant';
}

export interface CVAttachment {
  id: string;
  fileName: string;
  fileSize: string;
  candidateName: string;
  roleApplied: string;
  skills: string[];
  experienceYears: number;
  matchScore: number; // 0-100%
  summary: string;
  downloadUrl?: string;
}

export interface Meeting {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string; // e.g. "10:00 AM"
  endTime: string; // e.g. "11:00 AM"
  startTimestamp?: number;
  durationMinutes: number;
  endTimestamp?: number;
  attendedMinutes?: number | null;
  location?: string;
  meetingLink?: string;
  status: 'confirmed' | 'tentative' | 'cancelled';
  category: 'interview' | 'lead' | 'sprint' | 'board' | '1-on-1';
  isCompleted: boolean;
  agenda: string;
  description: string;
  notes: string[];
  actionItems: { text: string; done: boolean; assignee?: string }[];
  attendees: Attendee[];
  hasCV: boolean;
  cvDetails?: CVAttachment;
}

export const isMeetingCompleted = (meeting: Meeting, now = Date.now()): boolean =>
  meeting.endTimestamp !== undefined ? meeting.endTimestamp <= now : meeting.isCompleted;

export const getAttendedMinutes = (meeting: Meeting): number =>
  meeting.attendedMinutes ?? 0;

export interface DateFilter {
  type: 'today' | 'yesterday' | 'week' | 'custom';
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
}
