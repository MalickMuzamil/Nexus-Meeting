import React from 'react';
import { CalendarDays, Video } from 'lucide-react';
import { isMeetingCompleted, type Meeting } from '../../types/meeting';

interface SchedulePanelProps {
  meetings: Meeting[];
  onOpenDetails: (meeting: Meeting) => void;
}

const accents = ['green', 'purple', 'amber', 'blue'] as const;

export const SchedulePanel: React.FC<SchedulePanelProps> = ({ meetings, onOpenDetails }) => {
  const today = new Date().toISOString().split('T')[0];
  const upcoming = meetings
    .filter(meeting => meeting.date === today && !isMeetingCompleted(meeting) && meeting.status !== 'cancelled')
    .slice(0, 10);

  return (
    <section className="rounded-[22px] border border-white/70 bg-white/80 p-4 shadow-[0_12px_34px_rgba(89,117,95,0.10)] sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-[#1b251e]">Your schedule</h2>
          <p className="mt-0.5 text-xs text-[#728078]">Today&apos;s upcoming events from Zoho Calendar</p>
        </div>
        <span className="rounded-xl bg-[#eef8ee] p-2 text-[#3c9b51]"><CalendarDays className="h-4 w-4" /></span>
      </div>

      <div className="mt-5 space-y-2.5">
        {upcoming.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#cbd9ce] px-4 py-10 text-center">
            <p className="text-sm font-semibold text-[#52645a]">No upcoming events today.</p>
            <p className="mt-1 text-xs text-[#87938b]">Events from Zoho Calendar will appear here when available.</p>
          </div>
        ) : upcoming.map((meeting, index) => {
          const accent = accents[index % accents.length];
          const palette = {
            green: 'border-l-[#58af52] bg-[#edf8e9]',
            purple: 'border-l-[#8179e1] bg-[#f0effb]',
            amber: 'border-l-[#eab353] bg-[#fff7e9]',
            blue: 'border-l-[#6f8fe5] bg-[#eef2fc]'
          }[accent];
          return (
            <button
              key={meeting.id}
              type="button"
              onClick={() => onOpenDetails(meeting)}
              className={`group flex w-full items-center gap-3 rounded-xl border-l-[3px] px-3 py-3 text-left transition hover:-translate-y-0.5 hover:shadow-sm ${palette}`}
            >
              <span className="w-[62px] shrink-0 text-[11px] font-semibold text-[#77827a]">{meeting.startTime}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold text-[#27332b]">{meeting.title}</span>
                <span className="mt-0.5 block truncate text-[11px] text-[#728078]">{meeting.startTime} - {meeting.endTime}</span>
              </span>
              {meeting.meetingLink && <Video className="h-4 w-4 shrink-0 text-[#4c9d57]" />}
            </button>
          );
        })}
      </div>
    </section>
  );
};
