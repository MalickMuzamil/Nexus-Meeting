import type { Meeting, DateFilter, Attendee, CVAttachment } from '../types/meeting';

type GoogleEvent = {
  id?: string;
  summary?: string;
  description?: string;
  location?: string;
  hangoutLink?: string;
  status?: 'confirmed' | 'tentative' | 'cancelled';
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
  organizer?: { email?: string; displayName?: string };
  attendees?: Array<{ displayName?: string; email: string; responseStatus?: string; organizer?: boolean }>;
  attachments?: Array<{ fileId?: string; title?: string; mimeType?: string; fileUrl?: string }>;
  conferenceData?: { entryPoints?: Array<{ entryPointType?: string; uri?: string }> };
};

const attachmentLooksLikeProfile = (attachment: NonNullable<GoogleEvent['attachments']>[number]) => {
  const text = `${attachment.title || ''} ${attachment.mimeType || ''}`.toLowerCase();
  return /cv|resume|curriculum|portfolio|job description|jd|application|candidate|\.pdf|msword|document/.test(text);
};

const splitNotes = (description = '') => description
  .split(/\r?\n+/)
  .map(line => line.replace(/^\s*[-*•]\s*/, '').trim())
  .filter(Boolean);

export const googleCalendarService = {
  async fetchMeetings(filter: DateFilter, googleAccessToken?: string): Promise<Meeting[]> {
    if (!googleAccessToken) return [];

    const timeMin = new Date(`${filter.startDate}T00:00:00`).toISOString();
    const timeMax = new Date(`${filter.endDate}T23:59:59`).toISOString();
    const params = new URLSearchParams({
      timeMin,
      timeMax,
      singleEvents: 'true',
      orderBy: 'startTime',
      maxResults: '2500'
    });
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`,
      { headers: { Authorization: `Bearer ${googleAccessToken}`, Accept: 'application/json' } }
    );

    if (response.status === 401) throw new Error('Google Calendar access expired. Please reconnect.');
    if (!response.ok) throw new Error(`Google Calendar returned ${response.status}.`);

    const data = await response.json() as { items?: GoogleEvent[] };
    return this.transformGoogleEvents(data.items || [], filter.startDate);
  },

  transformGoogleEvents(items: GoogleEvent[], dateFallback: string): Meeting[] {
    return items.map((item, index) => {
      const startValue = item.start?.dateTime || item.start?.date || `${dateFallback}T00:00:00`;
      const endValue = item.end?.dateTime || item.end?.date || startValue;
      const start = new Date(startValue);
      const end = new Date(endValue);
      const description = item.description?.trim() || '';
      const profileAttachment = (item.attachments || []).find(attachmentLooksLikeProfile);
      const profileText = `${item.summary || ''} ${description} ${profileAttachment?.title || ''}`.toLowerCase();
      const hasCV = Boolean(profileAttachment) || /\b(cv|resume|curriculum vitae|portfolio|job description|\bjd\b)\b/i.test(profileText);
      const attendees: Attendee[] = (item.attendees || []).map(attendee => ({
        name: attendee.displayName || attendee.email.split('@')[0],
        email: attendee.email,
        status: attendee.responseStatus === 'accepted' ? 'accepted' : attendee.responseStatus === 'declined' ? 'declined' : 'tentative',
        role: attendee.organizer ? 'organizer' : 'participant'
      }));

      if (attendees.length === 0 && item.organizer?.email) {
        attendees.push({
          name: item.organizer.displayName || item.organizer.email.split('@')[0],
          email: item.organizer.email,
          status: 'accepted',
          role: 'organizer'
        });
      }

      const cvDetails: CVAttachment | undefined = hasCV ? {
        id: profileAttachment?.fileId || `${item.id || index}-profile`,
        fileName: profileAttachment?.title || 'Calendar profile / job description',
        fileSize: profileAttachment?.mimeType || 'Calendar attachment',
        candidateName: attendees.find(attendee => attendee.role !== 'organizer')?.name || 'Calendar attendee',
        roleApplied: item.summary || 'Role details from calendar event',
        skills: [],
        experienceYears: 0,
        matchScore: 0,
        summary: description || 'No additional notes were provided in this calendar event.',
        downloadUrl: profileAttachment?.fileUrl
      } : undefined;
      const meetLink = item.hangoutLink || item.conferenceData?.entryPoints?.find(entry => entry.entryPointType === 'video')?.uri;

      return {
        id: item.id || `calendar-${index}`,
        title: item.summary || 'Untitled calendar event',
        date: startValue.split('T')[0],
        startTime: start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        endTime: end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        durationMinutes: Math.max(0, Math.round((end.getTime() - start.getTime()) / 60000)),
        location: item.location,
        meetLink,
        status: item.status || 'confirmed',
        isCompleted: end.getTime() < Date.now(),
        category: hasCV ? 'interview' : 'lead',
        agenda: item.summary || 'No agenda provided.',
        description: description || 'No description provided.',
        notes: splitNotes(description),
        actionItems: [],
        attendees,
        hasCV,
        cvDetails
      };
    });
  }
};
