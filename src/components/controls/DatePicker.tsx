import React, { useEffect, useMemo, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';

interface DatePickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

const pad = (value: number) => String(value).padStart(2, '0');

const toDateString = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const parseDate = (value: string) => {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const formatDate = (value: string) => {
  if (!value) return 'Select date';
  return parseDate(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export const DatePicker: React.FC<DatePickerProps> = ({ label, value, onChange }) => {
  const selectedDate = useMemo(() => value ? parseDate(value) : new Date(), [value]);
  const [isOpen, setIsOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(() => new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));

  useEffect(() => {
    if (isOpen) setVisibleMonth(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
  }, [isOpen, selectedDate]);

  const monthLabel = visibleMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  const firstDay = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1).getDay();
  const daysInMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0).getDate();
  const days = Array.from({ length: firstDay + daysInMonth }, (_, index) => {
    if (index < firstDay) return null;
    return index - firstDay + 1;
  });

  return (
    <div className="relative w-full min-w-0 sm:w-[200px] sm:flex-none">
      <span className="block mb-1 text-[10px] uppercase tracking-wider text-slate-500">{label}</span>
      <button
        type="button"
        onClick={() => setIsOpen(open => !open)}
        className="flex w-full min-w-[150px] items-center justify-between gap-3 rounded-xl border border-[#d5e0d7] bg-white px-3 py-2 text-left text-xs text-[#27342c] transition-colors hover:border-[#78b982] focus:outline-none focus:ring-1 focus:ring-[#78b982]"
        aria-expanded={isOpen}
      >
        <span className="truncate">{formatDate(value)}</span>
        <CalendarDays className="h-4 w-4 shrink-0 text-cyan-300" />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-2 w-[min(286px,calc(100vw-2rem))] rounded-2xl border border-[#d5e5d7] bg-white p-3 shadow-[0_20px_50px_rgba(47,77,53,0.16)]">
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setVisibleMonth(month => new Date(month.getFullYear(), month.getMonth() - 1, 1))}
              className="rounded-lg p-1.5 text-[#6d7f72] hover:bg-[#edf6ed] hover:text-[#2f7b3d]"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-semibold text-[#26342b]">{monthLabel}</span>
            <button
              type="button"
              onClick={() => setVisibleMonth(month => new Date(month.getFullYear(), month.getMonth() + 1, 1))}
              className="rounded-lg p-1.5 text-[#6d7f72] hover:bg-[#edf6ed] hover:text-[#2f7b3d]"
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase tracking-wider text-[#819087]">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => <span key={day}>{day}</span>)}
          </div>
          <div className="mt-2 grid grid-cols-7 gap-1">
            {days.map((day, index) => {
              if (!day) return <span key={`empty-${index}`} className="h-8" />;
              const date = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), day);
              const dateString = toDateString(date);
              const isSelected = dateString === value;
              const isToday = dateString === toDateString(new Date());
              return (
                <button
                  key={dateString}
                  type="button"
                  onClick={() => { onChange(dateString); setIsOpen(false); }}
                  className={`h-8 rounded-lg text-xs transition-colors ${
                    isSelected
                      ? 'bg-[#4ba556] font-bold text-white shadow-sm'
                      : isToday
                        ? 'border border-[#70b97a] text-[#328344] hover:bg-[#edf8ee]'
                        : 'text-[#5d6e63] hover:bg-[#edf6ed] hover:text-[#263f2d]'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-[#e3ece4] pt-2">
            <button
              type="button"
              onClick={() => { onChange(''); setIsOpen(false); }}
              className="text-[11px] font-medium text-[#718078] hover:text-[#263f2d]"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => { onChange(toDateString(new Date())); setIsOpen(false); }}
              className="text-[11px] font-semibold text-[#3d914b] hover:text-[#2d733a]"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
