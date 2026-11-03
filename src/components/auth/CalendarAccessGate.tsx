import React from 'react';
import { CalendarDays, Moon, RefreshCw, Sun } from 'lucide-react';

interface CalendarAccessGateProps {
  darkMode: boolean;
  isConnecting: boolean;
  error?: string;
  onRetry: () => void;
  onToggleTheme: () => void;
}

export const CalendarAccessGate: React.FC<CalendarAccessGateProps> = ({ darkMode, isConnecting, error, onRetry, onToggleTheme }) => (
  <div className={`${darkMode ? 'dashboard-dark' : ''} flex min-h-screen items-center justify-center bg-[#f3f6f3] px-4 py-8 text-[#17211b]`}>
    <div className="w-full max-w-md rounded-[28px] border border-[#d5e0d7] bg-white/85 p-6 text-center shadow-[0_24px_70px_rgba(89,117,95,0.16)] backdrop-blur-xl sm:p-8">
      <div className="flex justify-end">
        <button type="button" onClick={onToggleTheme} className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#d5e0d7] bg-white text-[#52645a]" aria-label="Toggle theme">
          {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </div>
      <div className="mx-auto mt-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#dff2d7] text-[#3d914b] shadow-[0_10px_26px_rgba(75,165,86,0.18)]"><CalendarDays className="h-8 w-8" /></div>
      <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-[#6b8c76]">Nexus Calendar</p>
      <h1 className="mt-2 text-2xl font-bold text-[#1b2b20]">Connect your calendar</h1>
      <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[#718078]">Nexus reads your Zoho calendars to show events, attendees, descriptions, and available meeting links. It cannot change your calendar.</p>
      {error && <div className="mt-5 rounded-2xl border border-[#f0caca] bg-[#fff7f7] p-3 text-left text-xs leading-5 text-[#996363]">{error}</div>}
      <button type="button" onClick={onRetry} disabled={isConnecting} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#4ba556] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#3f9149] disabled:cursor-wait disabled:opacity-70">
        {isConnecting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CalendarDays className="h-4 w-4" />}
        {isConnecting ? 'Connecting to Zoho Calendar...' : 'Connect Zoho Calendar'}
      </button>
      <p className="mt-4 text-[11px] text-[#8a988f]">Your dashboard will appear after access is granted.</p>
    </div>
  </div>
);
