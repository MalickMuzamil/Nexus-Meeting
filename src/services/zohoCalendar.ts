import type { Attendee, CVAttachment, DateFilter, Meeting } from '../types/meeting';

type ZohoCalendar = {
  uid?: string;
  name?: string;
  status?: boolean;
};

type ZohoAttendee = {
  email?: string;
  name?: string;
  status?: string;
  role?: string;
};

type ZohoAttachment = {
  file_id?: string;
  id?: string;
  file_name?: string;
  filename?: string;
  name?: string;
  title?: string;
  mime_type?: string;
  mimetype?: string;
  file_size?: number | string;
  url?: string;
  download_url?: string;
};

type ZohoEvent = {
  uid?: string;
  id?: string;
  message?: string;
  title?: string;
  description?: string;
  richtext_description?: string;
  location?: string;
  url?: string;
  status?: string;
  start?: string;
  end?: string;
  isallday?: boolean;
  duration?: number;
  rrule?: string;
  repeat?: Array<{ freq?: string }>;
  organizer?: string | { email?: string; name?: string };
  attendees?: ZohoAttendee[];
  attachments?: ZohoAttachment[];
  attachment?: ZohoAttachment[];
  dateandtime?: {
    timezone?: string;
    start?: string;
    end?: string;
  };
  caluid?: string;
};

type ZohoApiError = {
  message?: string;
  error?: string;
  code?: string | number;
};

const isCalendarEvent = (event: ZohoEvent): boolean =>
  Boolean(
    event.uid ||
    event.id ||
    event.title ||
    event.start ||
    event.end ||
    event.dateandtime?.start ||
    event.dateandtime?.end
  );

const CALENDAR_DOMAINS: Record<string, string> = {
  us: 'https://calendar.zoho.com/api/v1',
  eu: 'https://calendar.zoho.eu/api/v1',
  in: 'https://calendar.zoho.in/api/v1',
  inec: 'https://calendar.zohohq.in/api/v1',
  au: 'https://calendar.zoho.com.au/api/v1',
  jp: 'https://calendar.zoho.jp/api/v1',
  ca: 'https://calendar.zohocloud.ca/api/v1',
  sa: 'https://calendar.zoho.sa/api/v1',
  uk: 'https://calendar.zoho.uk/api/v1',
  sg: 'https://calendar.zoho.sg/api/v1',
  ae: 'https://calendar.zoho.ae/api/v1'
};

const getCalendarApiBase = (location: string): string => {
  const configuredBase = import.meta.env.VITE_ZOHO_CALENDAR_API_URL as string | undefined;
  const base = configuredBase || CALENDAR_DOMAINS[location.toLowerCase()];
  if (!base) {
    throw new Error(`Zoho Calendar API domain is not configured for the "${location}" data center.`);
  }
  let url: URL;
  try {
    url = new URL(base);
  } catch {
    throw new Error('VITE_ZOHO_CALENDAR_API_URL must be a valid HTTPS URL.');
  }
  if (url.protocol !== 'https:' && url.hostname !== 'localhost') {
    throw new Error('VITE_ZOHO_CALENDAR_API_URL must use HTTPS.');
  }
  if (import.meta.env.DEV) return `${window.location.origin}/__zoho_calendar_proxy__`;
  return url.href.replace(/\/+$/, '');
};

const requestJson = async <T>(
  url: string,
  token: string,
  accept = 'application/json'
): Promise<T> => {
  let response: Response;
  try {
    response = await fetch(url, {
      headers: {
        Authorization: `Zoho-oauthtoken ${token}`,
        Accept: accept
      }
    });
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        'The browser could not read Zoho Calendar’s response. Check the Zoho API Console JavaScript-client redirect URI and browser CORS/network errors, then reconnect.'
      );
    }
    throw error;
  }

  if (response.status === 401) throw new Error('Zoho access token expired. Reconnect your Zoho account.');

  const body = await response.text();
  let payload: T | ZohoApiError | undefined;
  if (body) {
    try {
      payload = JSON.parse(body) as T | ZohoApiError;
    } catch (error) {
      if (!(error instanceof SyntaxError)) throw error;
    }
  }

  if (!response.ok) {
    const apiError = payload as ZohoApiError | undefined;
    const message = apiError?.message || apiError?.error || apiError?.code || body.trim().slice(0, 240) || response.statusText;
    throw new Error(`Zoho Calendar returned ${response.status}: ${message}.`);
  }
  if (payload === undefined) throw new Error('Zoho Calendar returned an empty response.');
  return payload as T;
};

const getDateRanges = (startDate: string, endDate: string): Array<{ start: string; end: string }> => {
  const start = Date.parse(`${startDate}T00:00:00Z`);
  const end = Date.parse(`${endDate}T00:00:00Z`);
  if (!Number.isFinite(start) || !Number.isFinite(end) || start > end) {
    throw new Error('Choose a valid calendar date range.');
  }

  const ranges: Array<{ start: string; end: string }> = [];
  const dayMs = 24 * 60 * 60 * 1000;
  for (let cursor = start; cursor <= end;) {
    const rangeEnd = Math.min(cursor + 30 * dayMs, end);
    ranges.push({
      start: new Date(cursor).toISOString().slice(0, 10).replace(/-/g, ''),
      end: new Date(rangeEnd).toISOString().slice(0, 10).replace(/-/g, '')
    });
    cursor = rangeEnd + dayMs;
  }
  return ranges;
};

const parseZohoDateTime = (value?: string): number | undefined => {
  if (!value) return undefined;
  const match = value.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z|[+-]\d{4})?$/);
  if (!match) {
    const parsed = Date.parse(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  const [, year, month, day, hour, minute, second, zone = ''] = match;
  const formattedZone = zone && zone !== 'Z' ? `${zone.slice(0, 3)}:${zone.slice(3)}` : zone;
  const parsed = Date.parse(`${year}-${month}-${day}T${hour}:${minute}:${second}${formattedZone}`);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const getEventDate = (event: ZohoEvent, timestamp: number | undefined): string => {
  const rawDate = event.start || event.dateandtime?.start;
  const match = rawDate?.match(/^(\d{4})(\d{2})(\d{2})/);
  if (match) return `${match[1]}-${match[2]}-${match[3]}`;
  if (timestamp !== undefined) return new Date(timestamp).toISOString().slice(0, 10);
  return new Date().toISOString().slice(0, 10);
};

const formatEventTime = (timestamp: number | undefined, timezone?: string, allDay = false): string => {
  if (allDay) return 'All day';
  if (timestamp === undefined) return '—';
  try {
    return new Intl.DateTimeFormat(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      ...(timezone ? { timeZone: timezone } : {})
    }).format(timestamp);
  } catch {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
};

const mapAttendeeStatus = (status = ''): Attendee['status'] => {
  switch (status.toUpperCase()) {
    case 'ACCEPTED': return 'accepted';
    case 'DECLINED': return 'declined';
    case 'NEEDS-ACTION': return 'needsAction';
    default: return 'tentative';
  }
};

const splitNotes = (description = '') => description
  .split(/\r?\n+/)
  .map(line => line.replace(/^\s*[-*•]\s*/, '').trim())
  .filter(Boolean);

const getAttachments = (event: ZohoEvent): ZohoAttachment[] =>
  event.attachments || event.attachment || [];

const attachmentLooksLikeProfile = (attachment: ZohoAttachment) => {
  const text = `${attachment.file_name || attachment.filename || attachment.name || attachment.title || ''} ${attachment.mime_type || attachment.mimetype || ''}`.toLowerCase();
  return /cv|resume|curriculum|portfolio|job description|(?:^|\W)jd(?:\W|$)|application|candidate|\.pdf|msword|document/.test(text);
};

const getMeetingLink = (event: ZohoEvent, description: string): string | undefined => {
  const explicitLink = event.url?.match(/^https?:\/\/\S+$/i)?.[0];
  if (explicitLink) return explicitLink;
  return description.match(/https?:\/\/[^\s<>"']+/i)?.[0];
};

const mapZohoEvent = (event: ZohoEvent, calendar: ZohoCalendar, index: number): Meeting => {
  const startTimestamp = parseZohoDateTime(event.dateandtime?.start || event.start);
  const endTimestamp = parseZohoDateTime(event.dateandtime?.end || event.end);
  const description = (event.description || event.richtext_description || '').trim();
  const attachments = getAttachments(event);
  const profileAttachment = attachments.find(attachmentLooksLikeProfile);
  const profileText = `${event.title || ''} ${description} ${profileAttachment?.file_name || profileAttachment?.filename || profileAttachment?.title || ''}`.toLowerCase();
  const hasCV = Boolean(profileAttachment) || /\b(cv|resume|curriculum vitae|portfolio|job description|\bjd\b)\b/i.test(profileText);
  const attendees: Attendee[] = (event.attendees || [])
    .filter((attendee): attendee is ZohoAttendee & { email: string } => Boolean(attendee.email))
    .map(attendee => ({
      name: attendee.name || attendee.email.split('@')[0],
      email: attendee.email,
      status: mapAttendeeStatus(attendee.status),
      role: attendee.role?.toLowerCase() === 'organizer' ? 'organizer' : 'participant'
    }));

  const organizer = typeof event.organizer === 'string'
    ? { email: event.organizer }
    : event.organizer;
  if (!attendees.length && organizer?.email) {
    attendees.push({
      name: organizer.name || organizer.email.split('@')[0],
      email: organizer.email,
      status: 'accepted',
      role: 'organizer'
    });
  }

  const attachmentName = profileAttachment?.file_name || profileAttachment?.filename || profileAttachment?.name || profileAttachment?.title;
  const cvDetails: CVAttachment | undefined = hasCV ? {
    id: profileAttachment?.file_id || profileAttachment?.id || `${event.uid || event.id || index}-profile`,
    fileName: attachmentName || 'Calendar profile / job description',
    fileSize: String(profileAttachment?.file_size || profileAttachment?.mime_type || 'Calendar attachment'),
    candidateName: attendees.find(attendee => attendee.role !== 'organizer')?.name || 'Calendar attendee',
    roleApplied: event.title || 'Role details from calendar event',
    skills: [],
    experienceYears: 0,
    matchScore: 0,
    summary: description || 'No additional notes were provided in this calendar event.',
    downloadUrl: profileAttachment?.download_url || profileAttachment?.url
  } : undefined;
  const isAllDay = Boolean(event.isallday);
  const status = event.status?.toLowerCase();
  const meetingLink = getMeetingLink(event, description);
  const eventId = event.uid || event.id || `event-${index}`;
  const calendarId = event.caluid || calendar.uid || 'calendar';

  return {
    id: `${calendarId}:${eventId}:${event.start || event.dateandtime?.start || index}`,
    title: event.title || 'Untitled calendar event',
    date: getEventDate(event, startTimestamp),
    startTime: formatEventTime(startTimestamp, event.dateandtime?.timezone, isAllDay),
    endTime: isAllDay ? 'All day' : formatEventTime(endTimestamp, event.dateandtime?.timezone),
    startTimestamp,
    durationMinutes: startTimestamp !== undefined && endTimestamp !== undefined
      ? Math.max(0, Math.round((endTimestamp - startTimestamp) / 60000))
      : Math.max(0, Math.round((event.duration || 0) / 60000)),
    endTimestamp,
    attendedMinutes: null,
    location: event.location,
    meetingLink,
    status: status === 'cancelled' || status === 'canceled'
      ? 'cancelled'
      : status === 'tentative'
        ? 'tentative'
        : 'confirmed',
    isCompleted: endTimestamp !== undefined && endTimestamp <= Date.now(),
    category: hasCV ? 'interview' : 'lead',
    agenda: event.title || 'No agenda provided.',
    description: description || 'No description provided.',
    notes: splitNotes(description),
    actionItems: [],
    attendees,
    hasCV,
    cvDetails
  };
};

const fetchEventsForCalendar = async (
  apiBase: string,
  calendar: ZohoCalendar,
  token: string,
  ranges: Array<{ start: string; end: string }>
): Promise<Meeting[]> => {
  if (!calendar.uid) return [];
  const meetings: Meeting[] = [];

  for (const range of ranges) {
    const url = new URL(`${apiBase}/calendars/${encodeURIComponent(calendar.uid)}/events`);
    url.searchParams.set('range', JSON.stringify(range));
    url.searchParams.set('timezone', Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC');
    const response = await requestJson<{ events?: ZohoEvent[] }>(
      url.toString(),
      token,
      'application/json+large'
    );
    const detailedEvents = (response.events || []).filter(isCalendarEvent);
    const instanceUrl = new URL(url);
    instanceUrl.searchParams.set('byinstance', 'true');
    const instanceResponse = await requestJson<{ events?: ZohoEvent[] }>(
      instanceUrl.toString(),
      token,
      'application/json+large'
    );
    const instances = (instanceResponse.events || []).filter(isCalendarEvent);
    const hasRecurringEvents = [...detailedEvents, ...instances].some(event =>
      Boolean(event.rrule || event.repeat?.length)
    );

    if (!hasRecurringEvents) {
      meetings.push(...detailedEvents.map((event, index) => mapZohoEvent(event, calendar, index)));
      continue;
    }

    const detailsByUid = new Map<string, ZohoEvent>();
    detailedEvents.forEach(event => {
      if (event.uid) detailsByUid.set(event.uid, event);
    });
    const recurringUids = Array.from(new Set(
      instances
        .filter(event => event.uid && (event.rrule || event.repeat?.length))
        .map(event => event.uid as string)
    ));
    const missingDetails = recurringUids.filter(uid => !detailsByUid.has(uid));
    const detailResults = await Promise.all(missingDetails.map(async uid => {
      const detailUrl = `${apiBase}/calendars/${encodeURIComponent(calendar.uid!)}/events/${encodeURIComponent(uid)}`;
      const detail = await requestJson<{ events?: ZohoEvent[] }>(
        detailUrl,
        token,
        'application/json+large'
      );
      return [uid, detail.events?.[0]] as const;
    }));
    detailResults.forEach(([uid, event]) => {
      if (event) detailsByUid.set(uid, event);
    });

    const mergedInstances = instances.map(event => {
      const details = event.uid ? detailsByUid.get(event.uid) : undefined;
      if (!details) return event;
      return {
        ...details,
        ...event,
        description: event.description || details.description,
        richtext_description: event.richtext_description || details.richtext_description,
        attendees: event.attendees?.length ? event.attendees : details.attendees,
        attachments: event.attachments || details.attachments,
        attachment: event.attachment || details.attachment,
        organizer: event.organizer || details.organizer,
        location: event.location || details.location,
        url: event.url || details.url
      };
    });
    const instanceKeys = new Set(mergedInstances.map(event =>
      `${event.uid || event.id || ''}:${event.start || event.dateandtime?.start || ''}`
    ));
    const missingNonRecurring = detailedEvents.filter(event =>
      !event.rrule &&
      !event.repeat?.length &&
      !instanceKeys.has(`${event.uid || event.id || ''}:${event.start || event.dateandtime?.start || ''}`)
    );
    const completeEvents = [...mergedInstances, ...missingNonRecurring];
    meetings.push(...completeEvents.map((event, index) => mapZohoEvent(event, calendar, index)));
  }

  return meetings;
};

export const zohoCalendarService = {
  async fetchMeetings(filter: DateFilter, accessToken: string, location: string): Promise<Meeting[]> {
    if (!accessToken) throw new Error('Zoho Calendar access is required to load events.');

    const apiBase = getCalendarApiBase(location);
    const calendarsUrl = new URL(`${apiBase}/calendars`);
    const calendarResponse = await requestJson<{ calendars?: ZohoCalendar[] }>(
      calendarsUrl.toString(),
      accessToken
    );
    const calendars = (calendarResponse.calendars || []).filter(calendar => calendar.uid && calendar.status !== false);
    const ranges = getDateRanges(filter.startDate, filter.endDate);
    let nextIndex = 0;
    const results: Meeting[][] = [];
    const worker = async () => {
      while (nextIndex < calendars.length) {
        const index = nextIndex++;
        results[index] = await fetchEventsForCalendar(apiBase, calendars[index], accessToken, ranges);
      }
    };
    await Promise.all(Array.from({ length: Math.min(4, calendars.length) }, worker));

    const uniqueMeetings = new Map<string, Meeting>();
    results.flat().forEach(meeting => uniqueMeetings.set(meeting.id, meeting));
    return Array.from(uniqueMeetings.values()).sort((a, b) =>
      (a.startTimestamp || 0) - (b.startTimestamp || 0)
    );
  }
};
