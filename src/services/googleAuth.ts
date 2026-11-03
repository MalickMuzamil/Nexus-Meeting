const GOOGLE_IDENTITY_SCRIPT = 'https://accounts.google.com/gsi/client';
const CALENDAR_SCOPE = 'openid profile email https://www.googleapis.com/auth/calendar.readonly';

type TokenResponse = {
  access_token?: string;
  error?: string;
  error_description?: string;
};

type TokenClient = {
  requestAccessToken: (options?: { prompt?: string }) => void;
};

export interface GoogleUserProfile {
  name: string;
  email: string;
  picture?: string;
}

export interface GoogleAuthResult {
  accessToken: string;
  profile: GoogleUserProfile;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (options: {
            client_id: string;
            scope: string;
            callback: (response: TokenResponse) => void;
          }) => TokenClient;
        };
      };
    };
  }
}

const loadGoogleIdentityScript = (): Promise<void> => new Promise((resolve, reject) => {
  if (window.google?.accounts.oauth2) {
    resolve();
    return;
  }

  const existingScript = document.querySelector<HTMLScriptElement>(`script[src="${GOOGLE_IDENTITY_SCRIPT}"]`);
  if (existingScript) {
    existingScript.addEventListener('load', () => resolve(), { once: true });
    existingScript.addEventListener('error', () => reject(new Error('Google Identity Services failed to load.')), { once: true });
    return;
  }

  const script = document.createElement('script');
  script.src = GOOGLE_IDENTITY_SCRIPT;
  script.async = true;
  script.defer = true;
  script.onload = () => resolve();
  script.onerror = () => reject(new Error('Google Identity Services failed to load.'));
  document.head.appendChild(script);
});

export const googleAuthService = {
  async requestCalendarAccess(): Promise<GoogleAuthResult> {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
    if (!clientId) {
      throw new Error('Google Calendar is not configured. Add VITE_GOOGLE_CLIENT_ID to the environment.');
    }

    await loadGoogleIdentityScript();
    if (!window.google?.accounts.oauth2) {
      throw new Error('Google Identity Services is unavailable.');
    }

    const accessToken = await new Promise<string>((resolve, reject) => {
      let settled = false;
      let timeoutId: number | undefined;
      let focusTimer: number | undefined;

      const cleanup = () => {
        window.removeEventListener('focus', handleWindowFocus);
        if (timeoutId) window.clearTimeout(timeoutId);
        if (focusTimer) window.clearTimeout(focusTimer);
      };

      const finish = (callback: () => void) => {
        if (settled) return;
        settled = true;
        cleanup();
        callback();
      };

      const handleWindowFocus = () => {
        focusTimer = window.setTimeout(() => {
          finish(() => reject(new Error('Google Calendar access was cancelled. Click Connect Google Calendar to try again.')));
        }, 700);
      };

      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: CALENDAR_SCOPE,
        callback: response => {
          if (response.access_token) {
            finish(() => resolve(response.access_token as string));
          } else {
            if (response.error === 'access_denied') {
              finish(() => reject(new Error('Google Calendar access was denied. Click Connect Google Calendar to try again.')));
              return;
            }
            finish(() => reject(new Error(response.error_description || response.error || 'Google Calendar authorization was not completed.')));
          }
        }
      });
      window.addEventListener('focus', handleWindowFocus, { once: true });
      timeoutId = window.setTimeout(() => {
        finish(() => reject(new Error('Google Calendar authorization timed out. Click Connect Google Calendar to try again.')));
      }, 60000);
      client.requestAccessToken({ prompt: 'consent' });
    });

    const profile = await this.fetchUserProfile(accessToken);
    sessionStorage.setItem('nexus_google_token', accessToken);
    sessionStorage.setItem('nexus_google_user_name', profile.name);
    sessionStorage.setItem('nexus_google_user_email', profile.email);
    sessionStorage.setItem('nexus_google_scope_version', '2');
    return { accessToken, profile };
  },

  async fetchUserProfile(accessToken: string): Promise<GoogleUserProfile> {
    const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    if (response.status === 401) throw new Error('Google access token expired. Reconnecting your Google account...');
    if (!response.ok) throw new Error('Unable to read the Google account profile.');
    const profile = await response.json() as { name?: string; email?: string; picture?: string };
    return {
      name: profile.name || profile.email?.split('@')[0] || 'Google user',
      email: profile.email || '',
      picture: profile.picture
    };
  }
};