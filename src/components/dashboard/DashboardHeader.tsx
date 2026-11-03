import React from 'react';
import { CalendarDays, Cloud, Moon, RefreshCw, Sun } from 'lucide-react';

interface DashboardHeaderProps {
  ownerName: string;
  isLoading: boolean;
  onRefresh: () => void;
  rangeLabel: string;
  darkMode: boolean;
  onToggleTheme: () => void;
  connectionState: 'connected' | 'connecting' | 'error';
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ ownerName, isLoading, onRefresh, rangeLabel, darkMode, onToggleTheme, connectionState }) => (
  <header className="flex flex-col gap-5 border-b border-[#dfe8df] pb-5 sm:flex-row sm:items-start sm:justify-between">
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6b8c76]">Calendar overview</p>
      <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#17211b] sm:text-[30px]">
        {getGreeting()}, {ownerName || 'there'} <span aria-hidden="true">&#128075;</span>
      </h1>
      <p className="mt-1 text-sm text-[#718078]">Here is your calendar overview and closer insights.</p>
    </div>

    <div className="flex flex-wrap items-center gap-2 sm:justify-end">
      <div className="flex items-center gap-2 rounded-2xl border border-white/80 bg-white/75 px-3.5 py-2 shadow-[0_8px_22px_rgba(85,112,92,0.08)]">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#edf6ee] text-[#3a9952]">
          <Cloud className="h-4 w-4" />
        </span>
        <span>
          <span className="block text-xs font-bold text-[#26352c]">Google Calendar</span>
          <span className={`block text-[10px] font-semibold ${connectionState === 'connected' ? 'text-[#43a158]' : connectionState === 'error' ? 'text-[#c56b63]' : 'text-[#b18432]'}`}>
            {connectionState === 'connected' ? 'Connected' : connectionState === 'error' ? 'Not connected' : 'Connecting...'}
          </span>
        </span>
      </div>
      <button
        type="button"
        onClick={onRefresh}
        disabled={isLoading}
        className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/80 bg-white/75 text-[#304239] shadow-[0_8px_22px_rgba(85,112,92,0.08)] transition hover:bg-white disabled:opacity-50"
        aria-label="Refresh calendar"
      >
        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
      </button>
      <button type="button" onClick={onToggleTheme} className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/80 bg-white/75 text-[#304239] shadow-[0_8px_22px_rgba(85,112,92,0.08)] transition hover:bg-white" aria-label="Toggle dark theme">
        {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>
      <div className="flex items-center gap-3 rounded-2xl border border-[#d5e0d7] bg-white/80 px-4 py-3 text-sm font-bold text-[#27342c] shadow-[0_8px_22px_rgba(85,112,92,0.08)]">
        <CalendarDays className="h-4 w-4 text-[#4ba556]" />
        <span>{rangeLabel}</span>
      </div>
    </div>
  </header>
);

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};
