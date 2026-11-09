import type { DateFilter, Meeting } from '../types/meeting';

const CACHE_KEY = 'nexus_zoho_calendar_session_cache_v4';

type CacheStore = Record<string, Meeting[]>;

const makeKey = (filter: DateFilter, userEmail: string) =>
  `${userEmail || 'zoho-user'}:${filter.startDate}:${filter.endDate}`;

const readStore = (): CacheStore => {
  try {
    return JSON.parse(sessionStorage.getItem(CACHE_KEY) || '{}') as CacheStore;
  } catch {
    return {};
  }
};

export const calendarCache = {
  get(filter: DateFilter, userEmail: string): Meeting[] | null {
    const cached = readStore()[makeKey(filter, userEmail)];
    return Array.isArray(cached) ? cached : null;
  },

  set(filter: DateFilter, userEmail: string, meetings: Meeting[]): void {
    try {
      const store = readStore();
      store[makeKey(filter, userEmail)] = meetings;
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(store));
    } catch {
      // A full or restricted session storage must not block Calendar loading.
    }
  },

  clear(): void {
    sessionStorage.removeItem(CACHE_KEY);
    sessionStorage.removeItem('nexus_calendar_session_cache_v2');
  }
};
