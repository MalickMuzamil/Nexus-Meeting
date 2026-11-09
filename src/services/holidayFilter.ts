/**
 * Holiday & Observance Filter Service
 * Filters out national, religious, cultural, and public holidays/observances
 * (e.g., Iqbal Day, Diwali, Guru Nanak's Birthday, Eid, Christmas, etc.)
 * so the dashboard only displays legitimate professional meetings.
 */

// Calendar names that represent holiday or observance subscriptions
const HOLIDAY_CALENDAR_REGEX = /holiday|observance|festival|commemoration|bank\s*holiday|public\s*holiday|gazetted|national\s*holiday|religious|birthdays?/i;

// Comprehensive regex list for holidays, festivals, gurpurabs, and observances
const HOLIDAY_TITLE_PATTERNS: RegExp[] = [
  // ── Pakistani National & Commemorative Days ──
  /\b(allama\s+)?iqbal(\s+day)?\b/i,
  /\bquaid(-e-azam)?(\s+day|\s+birthday|\s+death)?\b/i,
  /\bjinnah(\s+day)?\b/i,
  /\bpakistan\s+day\b/i,
  /\bindependence\s+day\b/i,
  /\bdefence\s+day\b/i,
  /\byoum[- ]e[- ](difa|azadi|takbeer|shuhada|ali|ashura)\b/i,
  /\bkashmir(\s+solidarity)?\s+day\b/i,
  /\blabo?ur\s+day\b/i,
  /\bmay\s+day\b/i,
  /\brepublic\s+day\b/i,

  // ── Islamic Holidays & Observances ──
  /\beid([ -]ul[ -]| al-| ul | )[a-z]+\b/i, // eid-ul-fitr, eid-ul-adha, eid milad-un-nabi, etc.
  /\b(eid|eed)\s+(mubarak|holiday|celebration|day|al-fitr|ul-fitr|al-adha|ul-adha)?\b/i,
  /\bmilad[- ]un[- ]nabi\b/i,
  /\bmawlid(\s+al[- ]nabi)?\b/i,
  /\b12\s+rabi[- ]ul[- ]aw+al\b/i,
  /\bashura\b/i,
  /\b(10th\s+of\s+)?muharram\b/i,
  /\bshab[- ]e[- ](barat|miraj|qadr)\b/i,
  /\blaylat\s+al[- ]qadr\b/i,
  /\b(first\s+day\s+of\s+|start\s+of\s+)?rama(d|z)an\b/i,
  /\bchand\s+raat\b/i,

  // ── Sikh, Hindu, and South Asian Festivals / Birthdays / Gurpurabs ──
  /\bguru\s+nanak(\s+dev)?(\s+ji)?(\s+jayanti|\s+birthday|\s+'s\s+birthday|\s+b'day|\s+gurpurab)?\b/i,
  /\bguru\s+(gobind|angad|amar|ram|arjan|har|tegh)(\s+singh)?(\s+jayanti|\s+birthday|\s+gurpurab)?\b/i,
  /\bgurpurab\b/i,
  /\bdiwali\b/i,
  /\bdeepavali\b/i,
  /\bdussehra\b/i,
  /\bvijayadashami\b/i,
  /\bdurga\s+puja\b/i,
  /\bnavratri\b/i,
  /\bram\s+navami\b/i,
  /\bhanuman\s+jayanti\b/i,
  /\bkrishna\s+janmashtami\b/i,
  /\bjanmashtami\b/i,
  /\bgokulashtami\b/i,
  /\bmaha\s+shivratri\b/i,
  /\bshivratri\b/i,
  /\bganesh(\s+chaturthi)?\b/i,
  /\bvinayaka\s+chaturthi\b/i,
  /\bholi\b/i,
  /\bholika\s+dahan\b/i,
  /\braksha\s+bandhan\b/i,
  /\brakhi\b/i,
  /\bmahavir\s+jayanti\b/i,
  /\bbuddha\s+purnima\b/i,
  /\bguru\s+purnima\b/i,
  /\bmakar\s+sankranti\b/i,
  /\bpongal\b/i,
  /\b(baisakhi|vaisakhi)\b/i,
  /\bonam\b/i,
  /\blohri\b/i,
  /\bchhat?h\s+puja\b/i,
  /\bgandhi\s+jayanti\b/i,
  /\bambedkar\s+jayanti\b/i,

  // ── Christian & Global Holidays & Observances ──
  /\bchristmas(\s+day|\s+eve)?\b/i,
  /\bboxing\s+day\b/i,
  /\bnew\s+year('s)?(\s+day|\s+eve)?\b/i,
  /\bgood\s+friday\b/i,
  /\beaster(\s+sunday|\s+monday)?\b/i,
  /\bholy\s+saturday\b/i,
  /\bpalm\s+sunday\b/i,
  /\bash\s+wednesday\b/i,
  /\bthanksgiving(\s+day)?\b/i,
  /\bhalloween\b/i,
  /\bvalentine('s)?\s+day\b/i,
  /\bst\.?\s+patrick('s)?\s+day\b/i,
  /\bpresidents'?\s+day\b/i,
  /\bmemorial\s+day\b/i,
  /\bveterans\s+day\b/i,
  /\bcolumbus\s+day\b/i,
  /\bjuneteenth\b/i,
  /\bmartin\s+luther\s+king(\s+jr\.?)?(\s+day)?\b/i,

  // ── General Holiday & Observance Terms ──
  /\b(public|national|bank|gazetted|optional|restricted|statutory|government)\s+holiday\b/i,
  /\b(national|international|world)\s+(day|observance)\s+of\b/i,
  /\bobservance\b/i,
  /\bpublic\s+holiday\b/i,
  /\bbank\s+holiday\b/i,
  /\bgazetted\s+holiday\b/i,
  /\b(birth|death)\s+anniversary\s+of\b/i,
  /\bbirth\s+anniversary\b/i,
  /\bdeath\s+anniversary\b/i,
  /\bjayanti\b/i,
  /\bgurpurab\b/i
];

/**
 * Checks if a calendar's name indicates that it is a dedicated holiday / observance calendar.
 */
export const isHolidayCalendar = (calendarName?: string): boolean => {
  if (!calendarName) return false;
  return HOLIDAY_CALENDAR_REGEX.test(calendarName.trim());
};

/**
 * Checks if text (e.g., event title or description) matches known holiday / observance patterns.
 */
export const matchesHolidayPattern = (title?: string, description?: string): boolean => {
  const cleanTitle = (title || '').trim();
  const cleanDesc = (description || '').trim();
  const combined = `${cleanTitle} ${cleanDesc}`;

  if (!cleanTitle && !cleanDesc) return false;

  for (const pattern of HOLIDAY_TITLE_PATTERNS) {
    if (pattern.test(cleanTitle) || pattern.test(combined)) {
      return true;
    }
  }

  // Check standalone "Holiday" or "Day Off" or "Office Closed" if it looks like a public holiday
  if (/^(holiday|public holiday|national holiday|bank holiday|gazetted holiday|office closed|day off)$/i.test(cleanTitle)) {
    return true;
  }

  return false;
};

/**
 * Checks if an event is a holiday or non-work commemorative event.
 * An event is identified as a holiday if:
 * 1. Title matches any known holiday/observance pattern (Iqbal Day, Diwali, Guru Nanak Jayanti, Eid, etc.)
 * 2. It is an all-day event with no attendees and no meeting link matching holiday/observance keywords.
 * 3. Calendar name indicates a holiday calendar.
 */
export const isHolidayEvent = (params: {
  title?: string;
  description?: string;
  isAllDay?: boolean;
  attendeesCount?: number;
  hasMeetingLink?: boolean;
  calendarName?: string;
}): boolean => {
  // If sourced from a holiday calendar, always exclude
  if (isHolidayCalendar(params.calendarName)) {
    return true;
  }

  const title = params.title || '';
  const desc = params.description || '';

  // Direct title match with known holidays
  if (matchesHolidayPattern(title, desc)) {
    return true;
  }

  // All-day generic events with no attendees and no meeting link
  if (params.isAllDay && (params.attendeesCount === 0 || !params.attendeesCount) && !params.hasMeetingLink) {
    if (/\b(holiday|observance|anniversary|celebration|closed|festival)\b/i.test(title)) {
      return true;
    }
  }

  return false;
};

