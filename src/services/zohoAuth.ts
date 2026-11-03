const SESSION_STARTED_AT_KEY = 'nexus_zoho_session_started_at';
const TOKEN_EXPIRES_AT_KEY = 'nexus_zoho_token_expires_at';
const ZOHO_LOCATION_KEY = 'nexus_zoho_location';
const ZOHO_SCOPE_VERSION = '1';

export const ZOHO_SESSION_MAX_AGE_MS = 2 * 24 * 60 * 60 * 1000;

const SCOPES = [
  'AaaServer.profile.READ',
  'ZohoCalendar.calendar.READ',
  'ZohoCalendar.event.READ'
];

const ACCOUNTS_DOMAINS: Record<string, string> = {
  us: 'https://accounts.zoho.com',
  eu: 'https://accounts.zoho.eu',
  in: 'https://accounts.zoho.in',
  inec: 'https://accounts.zohohq.in',
  au: 'https://accounts.zoho.com.au',
  jp: 'https://accounts.zoho.jp',
  ca: 'https://accounts.zohocloud.ca',
  sa: 'https://accounts.zoho.sa',
  uk: 'https://accounts.zoho.uk',
  sg: 'https://accounts.zoho.sg',
  ae: 'https://accounts.zoho.ae'
};

const clearLegacyGoogleSession = () => {
  [
    'nexus_google_token',
    'nexus_google_user_name',
    'nexus_google_user_email',
    'nexus_google_user_sub',
    'nexus_google_scope_version',
    'nexus_google_session_started_at',
    'nexus_calendar_session_cache_v2'
  ].forEach(key => sessionStorage.removeItem(key));
};

export interface ZohoUserProfile {
  sub: string;
  name: string;
  email: string;
}

export interface ZohoAuthResult {
  accessToken: string;
  expiresAt: number;
  sessionStartedAt: number;
  location: string;
  profile: ZohoUserProfile;
}

export interface ZohoAuthorizationResponse {
  accessToken?: string;
  expiresInSeconds?: number;
  location?: string;
  error?: string;
}

let consumedAuthorizationResponse: ZohoAuthorizationResponse | null | undefined;

const getZohoClientId = (): string | undefined => import.meta.env.VITE_ZOHO_CLIENT_ID;

const getRedirectUri = (): string =>
  import.meta.env.VITE_ZOHO_REDIRECT_URI || `${window.location.origin}${window.location.pathname}`;

const normalizeBaseUrl = (value: string, label: string): string => {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`${label} must be a valid HTTPS URL.`);
  }
  if (url.protocol !== 'https:' && url.hostname !== 'localhost') {
    throw new Error(`${label} must use HTTPS.`);
  }
  return url.href.replace(/\/+$/, '');
};

const getConfiguredAccountsUrl = (): string =>
  normalizeBaseUrl(
    import.meta.env.VITE_ZOHO_ACCOUNTS_URL || ACCOUNTS_DOMAINS.us,
    'VITE_ZOHO_ACCOUNTS_URL'
  );

const getAccountsUrlForLocation = (location: string): string =>
  ACCOUNTS_DOMAINS[location.toLowerCase()] || getConfiguredAccountsUrl();

const clearZohoSession = () => {
  [
    'nexus_zoho_token',
    'nexus_zoho_user_name',
    'nexus_zoho_user_email',
    'nexus_zoho_user_sub',
    'nexus_zoho_scope_version',
    SESSION_STARTED_AT_KEY,
    TOKEN_EXPIRES_AT_KEY,
    ZOHO_LOCATION_KEY
  ].forEach(key => sessionStorage.removeItem(key));
  clearLegacyGoogleSession();
};

export const getStoredZohoSession = (): ZohoAuthResult | null => {
  clearLegacyGoogleSession();

  const accessToken = sessionStorage.getItem('nexus_zoho_token');
  const name = sessionStorage.getItem('nexus_zoho_user_name');
  const email = sessionStorage.getItem('nexus_zoho_user_email');
  const sub = sessionStorage.getItem('nexus_zoho_user_sub');
  const scopeVersion = sessionStorage.getItem('nexus_zoho_scope_version');
  const sessionStartedAt = Number(sessionStorage.getItem(SESSION_STARTED_AT_KEY));
  const expiresAt = Number(sessionStorage.getItem(TOKEN_EXPIRES_AT_KEY));
  const location = sessionStorage.getItem(ZOHO_LOCATION_KEY) || 'us';
  const now = Date.now();

  if (
    !accessToken ||
    !name ||
    !email ||
    !sub ||
    scopeVersion !== ZOHO_SCOPE_VERSION ||
    !Number.isFinite(sessionStartedAt) ||
    !Number.isFinite(expiresAt) ||
    sessionStartedAt > now ||
    now - sessionStartedAt >= ZOHO_SESSION_MAX_AGE_MS ||
    expiresAt <= now
  ) {
    if (accessToken || name || email || scopeVersion) clearZohoSession();
    return null;
  }

  return {
    accessToken,
    expiresAt,
    sessionStartedAt,
    location,
    profile: { sub, name, email }
  };
};

const randomState = (): string => {
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
};

const clearOAuthFragment = () => {
  window.history.replaceState(
    null,
    document.title,
    `${window.location.pathname}${window.location.search}`
  );
};

export const zohoAuthService = {
  startAuthorization(): void {
    const clientId = getZohoClientId();
    if (!clientId) {
      throw new Error('Zoho Calendar is not configured. Add VITE_ZOHO_CLIENT_ID to the environment.');
    }

    const redirectUri = getRedirectUri();
    const state = randomState();
    sessionStorage.setItem('nexus_zoho_oauth_state', state);

    const authorizationUrl = new URL(`${getConfiguredAccountsUrl()}/oauth/v2/auth`);
    authorizationUrl.search = new URLSearchParams({
      response_type: 'token',
      client_id: clientId,
      scope: SCOPES.join(','),
      redirect_uri: redirectUri,
      state
    }).toString();

    window.location.assign(authorizationUrl.toString());
  },

  consumeAuthorizationResponse(): ZohoAuthorizationResponse | null {
    if (consumedAuthorizationResponse !== undefined) return consumedAuthorizationResponse;
    const fragment = window.location.hash.slice(1);
    if (!fragment || (!fragment.includes('access_token=') && !fragment.includes('error='))) {
      consumedAuthorizationResponse = null;
      return null;
    }

    const params = new URLSearchParams(fragment);
    const returnedState = params.get('state');
    const expectedState = sessionStorage.getItem('nexus_zoho_oauth_state');
    sessionStorage.removeItem('nexus_zoho_oauth_state');
    clearOAuthFragment();

    if (!returnedState || !expectedState || returnedState !== expectedState) {
      consumedAuthorizationResponse = { error: 'Zoho authorization could not be verified. Please connect again.' };
      return consumedAuthorizationResponse;
    }

    const error = params.get('error');
    if (error) {
      consumedAuthorizationResponse = {
        error: params.get('error_description') || `Zoho authorization failed: ${error}.`
      };
      return consumedAuthorizationResponse;
    }

    const accessToken = params.get('access_token') || undefined;
    const expiresInSeconds = Number(params.get('expires_in'));
    if (!accessToken || !Number.isFinite(expiresInSeconds) || expiresInSeconds <= 0) {
      consumedAuthorizationResponse = { error: 'Zoho did not return a valid access token. Please connect again.' };
      return consumedAuthorizationResponse;
    }

    consumedAuthorizationResponse = {
      accessToken,
      expiresInSeconds,
      location: (params.get('location') || 'us').toLowerCase()
    };
    return consumedAuthorizationResponse;
  },

  async completeAuthorization(response: ZohoAuthorizationResponse): Promise<ZohoAuthResult> {
    if (!response.accessToken || !response.expiresInSeconds) {
      throw new Error(response.error || 'Zoho authorization was not completed.');
    }

    const location = response.location || 'us';
    const profile = await this.fetchUserProfile(response.accessToken, location);
    const sessionStartedAt = Date.now();
    const expiresAt = sessionStartedAt + Math.min(response.expiresInSeconds * 1000, 60 * 60 * 1000);

    sessionStorage.setItem('nexus_zoho_token', response.accessToken);
    sessionStorage.setItem('nexus_zoho_user_name', profile.name);
    sessionStorage.setItem('nexus_zoho_user_email', profile.email);
    sessionStorage.setItem('nexus_zoho_user_sub', profile.sub);
    sessionStorage.setItem('nexus_zoho_scope_version', ZOHO_SCOPE_VERSION);
    sessionStorage.setItem(SESSION_STARTED_AT_KEY, String(sessionStartedAt));
    sessionStorage.setItem(TOKEN_EXPIRES_AT_KEY, String(expiresAt));
    sessionStorage.setItem(ZOHO_LOCATION_KEY, location);

    return { accessToken: response.accessToken, expiresAt, sessionStartedAt, location, profile };
  },

  async fetchUserProfile(accessToken: string, location: string): Promise<ZohoUserProfile> {
    const response = await fetch(`${getAccountsUrlForLocation(location)}/oauth/user/info`, {
      headers: { Authorization: `Zoho-oauthtoken ${accessToken}` }
    });

    if (response.status === 401) throw new Error('Zoho access token expired. Reconnect your Zoho account.');
    if (!response.ok) throw new Error(`Zoho profile request returned ${response.status}.`);

    const profile = await response.json() as {
      ZUID?: string;
      Email?: string;
      email?: string;
      Display_Name?: string;
      First_Name?: string;
      Last_Name?: string;
      name?: string;
    };
    const email = profile.Email || profile.email || '';
    const name = profile.Display_Name ||
      profile.name ||
      [profile.First_Name, profile.Last_Name].filter(Boolean).join(' ') ||
      email.split('@')[0];

    if (!email || !name) {
      throw new Error('Zoho did not return the account name and email needed for this dashboard.');
    }

    return { sub: profile.ZUID || email, name, email };
  },

  clearSession: clearZohoSession
};
