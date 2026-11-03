import React, { useState, useEffect, useMemo } from 'react';
import { Calendar } from 'lucide-react';
import type { Meeting, DateFilter } from './types/meeting';
import { parseShareTokenFromURL, decodeSharePayloadFromToken } from './types/shareUtils';
import { googleCalendarService } from './services/googleCalendar';
import { googleAuthService } from './services/googleAuth';
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

  // ── Google Calendar authorization ─────────────────────────────────────────
  const [googleToken, setGoogleToken] = useState<string>(() => {
    const storedToken = sessionStorage.getItem('nexus_google_token');
    const storedProfile = sessionStorage.getItem('nexus_google_user_email');
    const currentScope = sessionStorage.getItem('nexus_google_scope_version');
    return storedToken && storedProfile && currentScope === '2' ? storedToken : '';
  });
  const [ownerName, setOwnerName] = useState(() => sessionStorage.getItem('nexus_google_user_name') || 'Nexus user');
  const [ownerEmail, setOwnerEmail] = useState(() => sessionStorage.getItem('nexus_google_user_email') || '');
  const [authError, setAuthError] = useState('');
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [connectionState, setConnectionState] = useState<'connected' | 'connecting' | 'error'>(() =>
    sessionStorage.getItem('nexus_google_scope_version') === '2' ? 'connected' : 'connecting'
  );
  const [darkMode, setDarkMode] = useState(() => sessionStorage.getItem('nexus_theme') === 'dark');

  // ── Date Filter (defaults to today) ──────────────────────────────────────
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
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

  // ── Load Meetings ─────────────────────────────────────────────────────────
  const loadMeetings = async (filter: DateFilter, forceRefresh = false) => {
    const userEmail = sessionStorage.getItem('nexus_google_user_email') || ownerEmail;
    if (!forceRefresh) {
      const cached = calendarCache.get(filter, userEmail);
      if (cached) {
        setMeetings(cached);
        setIsLoading(false);
        return;
      }
    }
    setIsLoading(true);
    try {
      const fetched = await googleCalendarService.fetchMeetings(filter, googleToken);
      setMeetings(fetched);
      calendarCache.set(filter, userEmail, fetched);
    } catch (err) {
      console.error('Error fetching meetings:', err);
      if (err instanceof Error && (err.message.includes('401') || err.message.includes('access expired'))) {
        sessionStorage.removeItem('nexus_google_token');
        sessionStorage.removeItem('nexus_google_user_name');
        sessionStorage.removeItem('nexus_google_user_email');
        sessionStorage.removeItem('nexus_google_scope_version');
        setGoogleToken('');
        setConnectionState('connecting');
      }
      setAuthError(err instanceof Error ? err.message : 'Unable to load Google Calendar.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (googleToken) {
      loadMeetings(currentFilter);
      return;
    }

    setIsAuthorizing(true);
    setConnectionState('connecting');
    googleAuthService.requestCalendarAccess()
      .then(result => {
        setGoogleToken(result.accessToken);
        setOwnerName(result.profile.name);
        setOwnerEmail(result.profile.email);
        setConnectionState('connected');
      })
      .catch(err => {
        setConnectionState('error');
        setAuthError(err instanceof Error ? err.message : 'Google Calendar authorization failed.');
      })
      .finally(() => setIsAuthorizing(false));
  }, [currentFilter, googleToken]);

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

  if (isAuthorizing || (!googleToken && !authError)) {
    return <CalendarAccessGate darkMode={darkMode} isConnecting={isAuthorizing} onToggleTheme={handleThemeToggle} onRetry={() => {
      setAuthError('');
      setIsAuthorizing(true);
      setConnectionState('connecting');
      googleAuthService.requestCalendarAccess()
        .then(result => {
          setGoogleToken(result.accessToken);
          setOwnerName(result.profile.name);
          setOwnerEmail(result.profile.email);
          setConnectionState('connected');
        })
        .catch(err => {
          setConnectionState('error');
          setAuthError(err instanceof Error ? err.message : 'Google Calendar authorization failed.');
        })
        .finally(() => setIsAuthorizing(false));
    }} />;
  }

  if (authError && !googleToken) {
    return <CalendarAccessGate darkMode={darkMode} isConnecting={isAuthorizing} error={authError} onToggleTheme={handleThemeToggle} onRetry={() => {
      setAuthError('');
      setIsAuthorizing(true);
      setConnectionState('connecting');
      googleAuthService.requestCalendarAccess()
        .then(result => {
          setGoogleToken(result.accessToken);
          setOwnerName(result.profile.name);
          setOwnerEmail(result.profile.email);
          setConnectionState('connected');
        })
        .catch(err => {
          setConnectionState('error');
          setAuthError(err instanceof Error ? err.message : 'Google Calendar authorization failed.');
        })
        .finally(() => setIsAuthorizing(false));
    }} />;
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

            {isAuthorizing || (!googleToken && !authError) ? (
              <div className="mt-5 rounded-[22px] border border-white/70 bg-white/80 py-20 text-center shadow-[0_12px_34px_rgba(89,117,95,0.10)]"><p className="text-sm font-semibold text-[#2c4735]">Connecting Google Calendar...</p><p className="mt-1 text-xs text-[#728078]">Calendar access is required to load your meetings.</p></div>
            ) : authError && !googleToken ? (
              <div className="mt-5 rounded-[22px] border border-[#f0caca] bg-[#fff7f7] p-8 text-center"><h2 className="text-base font-bold text-[#763b3b]">Google Calendar access required</h2><p className="mx-auto mt-2 max-w-xl text-xs leading-5 text-[#996363]">{authError}</p><button type="button" onClick={() => { setAuthError(''); setIsAuthorizing(true); setConnectionState('connecting'); googleAuthService.requestCalendarAccess().then(result => { setGoogleToken(result.accessToken); setOwnerName(result.profile.name); setOwnerEmail(result.profile.email); setConnectionState('connected'); }).catch(err => { setConnectionState('error'); setAuthError(err instanceof Error ? err.message : 'Authorization failed.'); }).finally(() => setIsAuthorizing(false)); }} className="mt-4 rounded-xl bg-[#4ba556] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#3f9149]">Connect Google Calendar</button></div>
            ) : isLoading ? (
              <div className="mt-5"><MeetingListSkeleton /></div>
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
