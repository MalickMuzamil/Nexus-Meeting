import React, { useState, useEffect, useMemo, useRef } from 'react';
import { getLocalDateString, type Meeting, type DateFilter } from './types/meeting';
import { parseShareTokenFromURL, decodeSharePayloadFromToken } from './types/shareUtils';
import { zohoCalendarService } from './services/zohoCalendar';
import {
  getStoredZohoSession,
  zohoAuthService,
  ZOHO_SESSION_MAX_AGE_MS
} from './services/zohoAuth';
import { calendarCache } from './services/calendarCache';
import { CalendarAccessGate } from './components/auth/CalendarAccessGate';
import { DateFilterBar } from './components/controls/DateFilterBar';
import { MeetingDetailModal } from './components/dashboard/MeetingDetailModal';
import { CVViewerModal } from './components/dashboard/CVViewerModal';
import { MeetingListSkeleton } from './components/dashboard/MeetingListSkeleton';
import { DashboardSidebar } from './components/dashboard/DashboardSidebar';
import { DashboardHeader } from './components/dashboard/DashboardHeader';
import { SchedulePanel } from './components/dashboard/SchedulePanel';
import { DashboardInsights } from './components/dashboard/DashboardInsights';
import { MeetingDataSection } from './components/dashboard/MeetingDataSection';
import { CalendarSnapshot } from './components/dashboard/CalendarSnapshot';
import { ExportDialog } from './components/export/ExportDialog';
import { SharedViewPage } from './components/shared/SharedViewPage';

export const App: React.FC = () => {
  // ── Shared-view: detect #view=TOKEN in URL ────────────────────────────────
  const sharedToken = useMemo(() => parseShareTokenFromURL(), []);
  const sharedPayload = useMemo(() =>
    sharedToken ? decodeSharePayloadFromToken(sharedToken) : null,
    [sharedToken]
  );

  // If this is a shared read-only link, render the SharedViewPage immediately
  if (sharedPayload) {
    return <SharedViewPage meetings={sharedPayload.meetings} ownerName={sharedPayload.ownerName} />;
  }

  // ── Zoho Calendar authorization ────────────────────────────────────────────
  const [authorizationResponse] = useState(() => zohoAuthService.consumeAuthorizationResponse());
  const [storedZohoSession] = useState(() => {
    const storedSession = getStoredZohoSession();
    if (!storedSession) calendarCache.clear();
    return storedSession;
  });
  const [zohoToken, setZohoToken] = useState<string>(storedZohoSession?.accessToken || '');
  const [zohoLocation, setZohoLocation] = useState(storedZohoSession?.location || 'us');
  const [ownerName, setOwnerName] = useState(storedZohoSession?.profile.name || 'Nexus user');
  const [ownerEmail, setOwnerEmail] = useState(storedZohoSession?.profile.email || '');
  const [authError, setAuthError] = useState(authorizationResponse?.error || '');
  const [isAuthorizing, setIsAuthorizing] = useState(Boolean(authorizationResponse?.accessToken));
  const [connectionState, setConnectionState] = useState<'connected' | 'connecting' | 'error'>(() =>
    storedZohoSession ? 'connected' : authorizationResponse?.error ? 'error' : 'connecting'
  );
  const authorizationHandled = useRef(false);
  const [darkMode, setDarkMode] = useState(() => sessionStorage.getItem('nexus_theme') === 'dark');

  // ── Date Filter (defaults to today) ──────────────────────────────────────
  const todayStr = useMemo(() => getLocalDateString(), []);
  const [currentFilter, setCurrentFilter] = useState<DateFilter>({
    type: 'today',
    startDate: todayStr,
    endDate: todayStr
  });

  // ── Meetings State ────────────────────────────────────────────────────────
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // ── Search / Filter ───────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<'all' | 'cv_only' | 'interview' | 'lead'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // ── Modals ────────────────────────────────────────────────────────────────
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [selectedMeetingForExport, setSelectedMeetingForExport] = useState<Meeting | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedMeetingForDetail, setSelectedMeetingForDetail] = useState<Meeting | null>(null);
  const [cvModalOpen, setCvModalOpen] = useState(false);
  const [selectedMeetingForCV, setSelectedMeetingForCV] = useState<Meeting | null>(null);

  const handleThemeToggle = () => {
    setDarkMode(current => {
      const next = !current;
      sessionStorage.setItem('nexus_theme', next ? 'dark' : 'light');
      return next;
    });
  };

  const handleZohoConnect = () => {
    setAuthError('');
    setIsAuthorizing(true);
    setConnectionState('connecting');
    try {
      zohoAuthService.startAuthorization();
    } catch (error) {
      setIsAuthorizing(false);
      setConnectionState('error');
      setAuthError(error instanceof Error ? error.message : 'Zoho Calendar authorization failed.');
    }
  };

  useEffect(() => {
    if (!zohoToken) return;

    const sessionStartedAt = Number(sessionStorage.getItem('nexus_zoho_session_started_at'));
    const tokenExpiresAt = Number(sessionStorage.getItem('nexus_zoho_token_expires_at'));
    const expiresIn = Math.min(
      sessionStartedAt + ZOHO_SESSION_MAX_AGE_MS,
      tokenExpiresAt
    ) - Date.now();
    const expireSession = () => {
      zohoAuthService.clearSession();
      calendarCache.clear();
      setZohoToken('');
      setZohoLocation('us');
      setOwnerName('Nexus user');
      setOwnerEmail('');
      setMeetings([]);
      setConnectionState('error');
      setAuthError('Your Zoho Calendar access expired. Reconnect to continue.');
    };

    if (!Number.isFinite(expiresIn) || expiresIn <= 0) {
      expireSession();
      return;
    }

    const timeoutId = window.setTimeout(expireSession, expiresIn);
    return () => window.clearTimeout(timeoutId);
  }, [zohoToken]);

  // ── Load Meetings ─────────────────────────────────────────────────────────
  const loadMeetings = async (filter: DateFilter, forceRefresh = false) => {
    const userEmail = ownerEmail;
    let calendarMeetings: Meeting[] | null = null;
    if (!forceRefresh) {
      const cached = calendarCache.get(filter, userEmail);
      if (cached) {
        calendarMeetings = cached;
      }
    }
    setIsLoading(true);
    try {
      if (!calendarMeetings) {
        calendarMeetings = await zohoCalendarService.fetchMeetings(filter, zohoToken, zohoLocation);
        setMeetings(calendarMeetings);
      }
      setMeetings(calendarMeetings);
      calendarCache.set(filter, userEmail, calendarMeetings);
      setAuthError('');
    } catch (err) {
      console.error('Error fetching meetings:', err);
      if (err instanceof Error && (err.message.includes('401') || err.message.includes('access expired'))) {
        zohoAuthService.clearSession();
        calendarCache.clear();
        setMeetings([]);
        setZohoToken('');
        setConnectionState('error');
      }
      setAuthError(err instanceof Error ? err.message : 'Unable to load Zoho Calendar.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!authorizationResponse || authorizationHandled.current) return;
    authorizationHandled.current = true;
    if (!authorizationResponse.accessToken) {
      setIsAuthorizing(false);
      setConnectionState('error');
      return;
    }

    setIsAuthorizing(true);
    setConnectionState('connecting');
    zohoAuthService.completeAuthorization(authorizationResponse)
      .then(result => {
        setZohoToken(result.accessToken);
        setZohoLocation(result.location);
        setOwnerName(result.profile.name);
        setOwnerEmail(result.profile.email);
        setConnectionState('connected');
      })
      .catch(err => {
        setConnectionState('error');
        setAuthError(err instanceof Error ? err.message : 'Zoho Calendar authorization failed.');
      })
      .finally(() => setIsAuthorizing(false));
  }, [authorizationResponse]);

  useEffect(() => {
    if (zohoToken) loadMeetings(currentFilter);
  }, [currentFilter, zohoToken, zohoLocation]);

  // ── Filtered list ─────────────────────────────────────────────────────────
  const filteredMeetings = useMemo(() => {
    return meetings.filter(m => {
      const q = searchQuery.toLowerCase();
      const matchesQuery =
        m.title.toLowerCase().includes(q) ||
        m.agenda.toLowerCase().includes(q) ||
        m.attendees.some(a =>
          a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q)
        ) ||
        (m.hasCV && m.cvDetails?.candidateName.toLowerCase().includes(q));

      if (!matchesQuery) return false;
      if (activeCategoryFilter === 'cv_only') return m.hasCV;
      if (activeCategoryFilter === 'interview') return m.category === 'interview';
      if (activeCategoryFilter === 'lead') return m.category === 'lead';
      return true;
    });
  }, [meetings, searchQuery, activeCategoryFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredMeetings.length / pageSize));
  const paginatedMeetings = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredMeetings.slice(start, start + pageSize);
  }, [filteredMeetings, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeCategoryFilter, currentFilter]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  // ── Main Dashboard UI ─────────────────────────────────────────────────────
  const rangeLabel = currentFilter.startDate === currentFilter.endDate
    ? currentFilter.startDate
    : `${currentFilter.startDate} - ${currentFilter.endDate}`;

  const meetingDataProps = {
    meetings,
    filteredMeetings,
    paginatedMeetings,
    currentPage,
    totalPages,
    searchQuery,
    activeCategoryFilter,
    onSearchChange: setSearchQuery,
    onFilterChange: setActiveCategoryFilter,
    onPageChange: setCurrentPage,
    onOpenExportAll: () => { setSelectedMeetingForExport(null); setExportModalOpen(true); },
    onOpenDetails: (meeting: Meeting) => { setSelectedMeetingForDetail(meeting); setDetailModalOpen(true); },
    onOpenCVModal: (meeting: Meeting) => { setSelectedMeetingForCV(meeting); setCvModalOpen(true); }
  };

  if (isAuthorizing || !zohoToken) {
    return (
      <CalendarAccessGate
        darkMode={darkMode}
        isConnecting={isAuthorizing}
        error={authError}
        onToggleTheme={handleThemeToggle}
        onRetry={handleZohoConnect}
      />
    );
  }

  return (
    <div className={`${darkMode ? 'dashboard-dark' : ''} min-h-screen bg-[#f3f6f3] text-[#17211b] selection:bg-[#b9e3b2] selection:text-[#173c2b]`}>
      <div className="flex min-h-screen">
        <DashboardSidebar ownerName={ownerName} />
        <div className="min-w-0 flex-1">
          <div className="border-b border-[#dfe8df] bg-[#f3f6f3] px-4 py-3 lg:hidden">
            <div className="flex items-center justify-between"><span className="text-lg font-bold text-[#244b33]">Nexus</span><span className="rounded-full bg-[#e3f2df] px-2.5 py-1 text-[10px] font-bold text-[#3d8b4c]">{connectionState === 'connected' ? 'Connected' : connectionState === 'error' ? 'Not connected' : 'Connecting...'}</span></div>
          </div>
          <main className="mx-auto w-full max-w-[1440px] px-4 py-5 sm:px-6 sm:py-7 xl:px-8">
            <div id="dashboard"><DashboardHeader ownerName={ownerName} isLoading={isLoading} onRefresh={() => loadMeetings(currentFilter, true)} rangeLabel={rangeLabel} darkMode={darkMode} onToggleTheme={handleThemeToggle} connectionState={connectionState} /></div>
            <div className="mt-5 rounded-2xl border border-[#dfe8df] bg-white/55 p-3 sm:p-4">
              <DateFilterBar currentFilter={currentFilter} onFilterChange={setCurrentFilter} isLoading={isLoading} onRefresh={() => loadMeetings(currentFilter, true)} />
            </div>

            {authError && (
              <p role="status" className="mt-4 rounded-xl border border-[#efddbb] bg-[#fff9ed] px-4 py-3 text-xs text-[#85622b]">
                {authError}
              </p>
            )}

            {isLoading ? (
              <div className="mt-5"><MeetingListSkeleton darkMode={darkMode} /></div>
            ) : (
              <>
                <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)]">
                  <SchedulePanel meetings={meetings} onOpenDetails={meeting => { setSelectedMeetingForDetail(meeting); setDetailModalOpen(true); }} />
                  <CalendarSnapshot rangeLabel={rangeLabel} />
                </div>
                <div className="mt-4"><DashboardInsights meetings={meetings} /></div>
                <MeetingDataSection {...meetingDataProps} />
              </>
            )}
          </main>
        </div>
      </div>

      {/* ── Modals ── */}
      <ExportDialog
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        meeting={selectedMeetingForExport}
        allMeetings={filteredMeetings}
        ownerName={ownerName}
        ownerEmail={ownerEmail}
        darkMode={darkMode}
        dateLabel={
          currentFilter.startDate === currentFilter.endDate
            ? currentFilter.startDate
            : `${currentFilter.startDate}_to_${currentFilter.endDate}`
        }
      />

      <MeetingDetailModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        meeting={selectedMeetingForDetail}
        onOpenCVModal={m => { setSelectedMeetingForCV(m); setCvModalOpen(true); }}
        onOpenExport={m => {
          setSelectedMeetingForExport(m);
          setDetailModalOpen(false);
          setExportModalOpen(true);
        }}
        darkMode={darkMode}
      />

      <CVViewerModal
        isOpen={cvModalOpen}
        onClose={() => setCvModalOpen(false)}
        meeting={selectedMeetingForCV}
      />

    </div>
  );
};

export default App;
