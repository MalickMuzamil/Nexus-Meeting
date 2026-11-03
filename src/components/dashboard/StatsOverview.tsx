import React from 'react';
import { Calendar, Clock, FileCheck, Users } from 'lucide-react';
import { Meeting } from '../../types/meeting';
import { GlassCard } from '../aura/GlassCard';

interface StatsOverviewProps {
  meetings: Meeting[];
  isLoading?: boolean;
  onFilterCVOnly: () => void;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  meetings,
  isLoading = false,
  onFilterCVOnly
}) => {
  const totalMeetings = meetings.length;
  
  const completedMeetings = meetings.filter(m => m.isCompleted);
  const totalDurationMins = completedMeetings.reduce((acc, m) => acc + (m.durationMinutes || 0), 0);
  const hours = Math.floor(totalDurationMins / 60);
  const mins = totalDurationMins % 60;
  const durationFormatted = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  const cvAttachedCount = meetings.filter(m => m.hasCV).length;

  const totalActionItems = meetings.reduce((acc, m) => acc + (m.actionItems?.length || 0), 0);
  const pendingActions = meetings.reduce(
    (acc, m) => acc + (m.actionItems?.filter(a => !a.done)?.length || 0),
    0
  );

  return (
    <div className="grid min-w-0 grid-cols-1 gap-3 mb-6 sm:grid-cols-2 md:gap-4 lg:mb-8 lg:grid-cols-4">
      {/* Metric 1: Total Meetings */}
      <GlassCard glow="cyan" interactive className="min-w-0 p-4 md:p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-400">Total Events</span>
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Calendar className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl md:text-3xl font-bold text-white tracking-tight">
          {isLoading ? <span className="inline-block h-9 w-12 animate-pulse rounded bg-white/[0.08]" /> : totalMeetings}
        </div>
        <div className="mt-1 text-[11px] text-slate-400 flex items-center gap-1">
          <span className="text-cyan-400 font-medium">Calendar</span> Synced
        </div>
      </GlassCard>

      {/* Metric 2: Total Duration */}
      <GlassCard glow="indigo" interactive className="min-w-0 p-4 md:p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-400">Time Completed</span>
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl md:text-3xl font-bold text-white tracking-tight">
          {isLoading ? <span className="inline-block h-9 w-16 animate-pulse rounded bg-white/[0.08]" /> : durationFormatted}
        </div>
        <div className="mt-1 text-[11px] text-slate-400">
          Across {completedMeetings.length} completed meetings
        </div>
      </GlassCard>

      {/* Metric 3: CVs & Resumes Detected */}
      <GlassCard glow="purple" interactive onClick={onFilterCVOnly} className="min-w-0 p-4 md:p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-purple-300">CVs & Resumes</span>
          <div className="w-8 h-8 rounded-lg bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <FileCheck className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl md:text-3xl font-bold text-purple-300 tracking-tight flex items-baseline gap-2">
          {isLoading ? <span className="inline-block h-9 w-8 animate-pulse rounded bg-purple-300/20" /> : cvAttachedCount}
          <span className="text-xs text-purple-400/80 font-normal">Found</span>
        </div>
        <div className="mt-1 text-[11px] text-purple-300/70">
          Click to filter candidate CVs
        </div>
      </GlassCard>

      {/* Metric 4: Leads */}
      <GlassCard glow="emerald" interactive className="min-w-0 p-4 md:p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-400">Leads</span>
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div className="text-base md:text-lg font-bold text-emerald-400 tracking-tight flex items-center gap-1.5">
          {isLoading ? <span className="inline-block h-7 w-8 animate-pulse rounded bg-emerald-300/20" /> : meetings.filter(m => !m.isCompleted && m.category === 'lead').length}
        </div>
        <div className="mt-1 text-[11px] text-slate-400">
          Upcoming lead conversations
        </div>
      </GlassCard>
    </div>
  );
};

