import React from 'react';
import { CalendarDays } from 'lucide-react';

interface CalendarSnapshotProps {
  rangeLabel: string;
}

export const CalendarSnapshot: React.FC<CalendarSnapshotProps> = ({ rangeLabel }) => {
  const today = new Date().getDate();
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getDay();
  const days = Array.from({ length: firstDay + daysInMonth }, (_, index) => index < firstDay ? null : index - firstDay + 1);

  return (
    <section className="rounded-[22px] border border-white/70 bg-white/80 p-5 shadow-[0_12px_34px_rgba(89,117,95,0.10)]">
      <div className="flex items-start justify-between gap-3"><div><h2 className="text-lg font-bold text-[#1b251e]">Calendar</h2><p className="mt-1 text-xs text-[#728078]">{rangeLabel}</p></div><CalendarDays className="h-5 w-5 text-[#4ba556]" /></div>
      <div className="mt-6 grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-[#748078]">{['S','M','T','W','T','F','S'].map((day, index) => <span key={`${day}-${index}`}>{day}</span>)}</div>
      <div className="mt-3 grid grid-cols-7 gap-1 text-center text-xs">{days.map((day, index) => day === null ? <span key={`empty-${index}`} className="py-1.5" /> : <span key={day} className={`rounded-lg py-1.5 ${day === today ? 'bg-[#4ba556] font-bold text-white' : 'text-[#5d6e63]'}`}>{day}</span>)}</div>
    </section>
  );
};
