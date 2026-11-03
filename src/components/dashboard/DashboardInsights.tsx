import React from 'react';
import { CalendarDays, CheckCircle2, Clock3, FileText, Users } from 'lucide-react';
import type { Meeting } from '../../types/meeting';

interface DashboardInsightsProps {
  meetings: Meeting[];
}

export const DashboardInsights: React.FC<DashboardInsightsProps> = ({ meetings }) => {
  const completed = meetings.filter(meeting => meeting.isCompleted);
  const upcoming = meetings.filter(meeting => !meeting.isCompleted && meeting.status !== 'cancelled');
  const duration = completed.reduce((total, meeting) => total + meeting.durationMinutes, 0);
  const cvCount = meetings.filter(meeting => meeting.hasCV).length;
  const dayCounts = meetings.reduce<Record<string, number>>((counts, meeting) => {
    const day = new Date(`${meeting.date}T12:00:00`).toLocaleDateString(undefined, { weekday: 'short' });
    counts[day] = (counts[day] || 0) + 1;
    return counts;
  }, {});
  const maxDayCount = Math.max(1, ...Object.values(dayCounts));
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <section className="rounded-[22px] border border-white/70 bg-white/80 p-5 shadow-[0_12px_34px_rgba(89,117,95,0.10)] lg:col-span-2">
        <div className="flex items-start justify-between">
          <div><h2 className="text-lg font-bold text-[#1b251e]">Events overview</h2><p className="mt-0.5 text-xs text-[#728078]">A quick view of your current calendar range</p></div>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#edf8ee] text-[#3f9c51]"><CalendarDays className="h-4 w-4" /></div>
        </div>
        <div className="mt-5 flex flex-col items-center gap-5 sm:flex-row">
          <div className="relative flex h-32 w-32 shrink-0 items-center justify-center rounded-full" style={{ background: `conic-gradient(#4aa953 0 ${Math.min(100, meetings.length * 5)}%, #cfe8c8 ${Math.min(100, meetings.length * 5)}% 72%, #dcdff5 72% 88%, #eef0ef 88%)` }}>
            <div className="flex h-20 w-20 flex-col items-center justify-center rounded-full bg-white text-center"><strong className="text-2xl text-[#1d2b22]">{meetings.length}</strong><span className="text-[11px] text-[#718078]">Events</span></div>
          </div>
          <div className="grid flex-1 grid-cols-2 gap-3 text-xs text-[#68766d]">
            <InsightLegend color="bg-[#4aa953]" label="Meetings" value={meetings.length} />
            <InsightLegend color="bg-[#a9df9e]" label="Completed" value={completed.length} />
            <InsightLegend color="bg-[#aaa5ef]" label="CV / JD" value={cvCount} />
            <InsightLegend color="bg-[#dfe4df]" label="Leads" value={upcoming.filter(meeting => meeting.category === 'lead').length} />
          </div>
        </div>
      </section>

      <section className="rounded-[22px] border border-white/70 bg-white/80 p-5 shadow-[0_12px_34px_rgba(89,117,95,0.10)]">
        <div className="flex items-start justify-between"><div><h2 className="text-lg font-bold text-[#1b251e]">Today&apos;s summary</h2><p className="mt-0.5 text-xs text-[#728078]">Live from your calendar</p></div><Clock3 className="h-5 w-5 text-[#e2a63b]" /></div>
        <div className="mt-4 divide-y divide-[#e7eee8]">
          <SummaryRow icon={CalendarDays} label="Events" value={String(meetings.length)} />
          <SummaryRow icon={Clock3} label="Completed time" value={`${Math.floor(duration / 60)}h ${duration % 60}m`} />
          <SummaryRow icon={Users} label="Upcoming" value={String(upcoming.length)} />
          <SummaryRow icon={FileText} label="CV / JD files" value={String(cvCount)} />
        </div>
      </section>

      <section className="rounded-[22px] border border-white/70 bg-white/80 p-5 shadow-[0_12px_34px_rgba(89,117,95,0.10)] sm:col-span-2 lg:col-span-3">
        <div className="flex items-start justify-between"><div><h2 className="text-lg font-bold text-[#1b251e]">Events by day</h2><p className="mt-0.5 text-xs text-[#728078]">Number of events in this range</p></div><CheckCircle2 className="h-5 w-5 text-[#4da358]" /></div>
        <div className="mt-5 grid grid-cols-7 items-end gap-2 sm:gap-4">
          {days.map(day => { const count = dayCounts[day] || 0; return <div key={day} className="flex min-w-0 flex-col items-center gap-2"><div className="flex h-24 items-end"><div className="w-5 rounded-t-md bg-[#8bcf7a] transition-all sm:w-8" style={{ height: `${Math.max(8, (count / maxDayCount) * 100)}%` }} /></div><span className="text-[10px] font-medium text-[#748078]">{day}</span><span className="text-[10px] text-[#a0aaa2]">{count}</span></div>; })}
        </div>
      </section>
    </div>
  );
};

const InsightLegend: React.FC<{ color: string; label: string; value: number }> = ({ color, label, value }) => <div className="flex items-center gap-2"><span className={`h-2.5 w-2.5 rounded-full ${color}`} /><span className="flex-1">{label}</span><strong className="text-[#26342b]">{value}</strong></div>;
const SummaryRow: React.FC<{ icon: React.ComponentType<{ className?: string }>; label: string; value: string }> = ({ icon: Icon, label, value }) => <div className="flex items-center gap-3 py-3"><span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#eff8ef] text-[#4b9e57]"><Icon className="h-4 w-4" /></span><span className="flex-1 text-xs text-[#728078]">{label}</span><strong className="text-sm text-[#26342b]">{value}</strong></div>;
