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
  durationMinutes: number;
  location?: string;
  meetLink?: string;
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
  syncedToDrive?: boolean;
  lastDriveSync?: string;
  driveFileId?: string;
}

export interface DateFilter {
  type: 'today' | 'yesterday' | 'week' | 'custom';
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
}

export interface DriveSyncRecord {
  fileId: string;
  fileName: string;
  lastUpdated: string;
  version: number;
  mimeType: string;
  webViewLink?: string;
}

