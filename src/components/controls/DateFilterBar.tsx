import React, { useEffect, useState } from 'react';
import { ArrowRight, Calendar as CalendarIcon, Sparkles, Filter, RefreshCw } from 'lucide-react';
import { getLocalDateString, type DateFilter } from '../../types/meeting';
import { DatePicker } from './DatePicker';

interface DateFilterBarProps {
  currentFilter: DateFilter;
  onFilterChange: (newFilter: DateFilter) => void;
  isLoading: boolean;
  onRefresh: () => void;
}

export const DateFilterBar: React.FC<DateFilterBarProps> = ({
  currentFilter,
  onFilterChange,
  isLoading,
  onRefresh
}) => {
  const [isCustomMode, setIsCustomMode] = useState(currentFilter.type === 'custom');
  const [customStart, setCustomStart] = useState(currentFilter.startDate);
  const [customEnd, setCustomEnd] = useState(currentFilter.endDate);

  const getTodayStr = () => getLocalDateString();

  const getYesterdayStr = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return getLocalDateString(d);
  };

  const getWeekStartStr = () => {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    return getLocalDateString(d);
  };

  const getMonthRange = (offset: number) => {
    const date = new Date();
    date.setMonth(date.getMonth() + offset, 1);
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    return { start: getLocalDateString(start), end: getLocalDateString(end) };
  };

  const updateFilter = (nextFilter: DateFilter) => {
    setCustomStart(nextFilter.startDate);
    setCustomEnd(nextFilter.endDate);
    onFilterChange(nextFilter);
  };

  useEffect(() => {
    setCustomStart(currentFilter.startDate);
    setCustomEnd(currentFilter.endDate);
  }, [currentFilter.startDate, currentFilter.endDate]);

  const handlePresetSelect = (preset: 'today' | 'yesterday' | 'week' | 'month' | 'lastMonth') => {
    setIsCustomMode(false);
    const today = getTodayStr();

    if (preset === 'today') {
      updateFilter({
        type: 'today',
        startDate: today,
        endDate: today
      });
    } else if (preset === 'yesterday') {
      const yesterday = getYesterdayStr();
      updateFilter({
        type: 'yesterday',
        startDate: yesterday,
        endDate: yesterday
      });
    } else if (preset === 'week') {
      updateFilter({
        type: 'week',
        startDate: getWeekStartStr(),
        endDate: today
      });
    } else {
      const range = getMonthRange(preset === 'month' ? 0 : -1);
      updateFilter({
        type: 'custom',
        startDate: range.start,
        endDate: range.end
      });
    }
  };

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customStart || !customEnd) return;
    updateFilter({
      type: 'custom',
      startDate: customStart,
      endDate: customEnd
    });
  };

  const thisMonthRange = getMonthRange(0);

  return (
    <div className="relative mb-0 w-full rounded-2xl border border-[#dfe8df] bg-white/75 p-3.5 shadow-[0_8px_24px_rgba(89,117,95,0.06)] backdrop-blur-2xl sm:p-4 md:p-5">
      {/* Decorative Top Glow Line */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        {/* Title & Description */}
        <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-xl border border-[#cfe6d0] bg-[#edf8ee] flex items-center justify-center text-[#419952] shadow-inner">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base md:text-lg font-semibold text-[#1b251e] flex flex-wrap items-center gap-1.5 sm:gap-2">
              Calendar range
              <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-[#edf8ee] border border-[#cfe6d0] text-[#429151] font-normal">
                Zoho Calendar Sync
              </span>
            </h2>
            <p className="hidden sm:block text-xs text-[#728078]">
              Fetch meetings, agendas, attendee decisions, and detect attached candidate CVs
            </p>
          </div>
        </div>

        {/* Action Controls & Presets */}
        <div className="flex w-full flex-wrap items-center gap-2 lg:w-auto lg:flex-nowrap">
          {/* Preset Buttons */}
          <div className="flex max-w-full items-center gap-1.5 overflow-x-auto rounded-xl border border-[#dfe8df] bg-[#f5f8f4] p-1 lg:w-auto">
            <button
              onClick={() => handlePresetSelect('today')}
              className={`shrink-0 rounded-xl px-2.5 py-1.5 text-[11px] font-medium transition-all sm:px-3 sm:text-xs ${
                !isCustomMode && currentFilter.type === 'today'
                  ? 'bg-[#4ba556] text-white shadow-sm'
                  : 'text-[#607267] hover:bg-[#dff2d7] hover:text-[#236c37] hover:shadow-sm'
              }`}
            >
              Today
            </button>

            <button
              onClick={() => handlePresetSelect('yesterday')}
              className={`shrink-0 whitespace-nowrap rounded-xl px-2.5 py-1.5 text-[11px] font-medium transition-all sm:px-3 sm:text-xs ${
                !isCustomMode && currentFilter.type === 'yesterday'
                  ? 'bg-[#4ba556] text-white shadow-sm'
                  : 'text-[#607267] hover:bg-[#dff2d7] hover:text-[#236c37] hover:shadow-sm'
              }`}
            >
              Yesterday
            </button>

            <button
              onClick={() => handlePresetSelect('week')}
              className={`shrink-0 whitespace-nowrap rounded-xl px-2.5 py-1.5 text-[11px] font-medium transition-all sm:px-3 sm:text-xs ${
                !isCustomMode && currentFilter.type === 'week'
                  ? 'bg-[#4ba556] text-white shadow-sm'
                  : 'text-[#607267] hover:bg-[#dff2d7] hover:text-[#236c37] hover:shadow-sm'
              }`}
            >
              Last 7 Days
            </button>

            <button
              onClick={() => handlePresetSelect('month')}
              className={`shrink-0 whitespace-nowrap rounded-xl px-2.5 py-1.5 text-[11px] font-medium transition-all sm:px-3 sm:text-xs ${
                !isCustomMode && currentFilter.type === 'custom' && currentFilter.startDate === thisMonthRange.start && currentFilter.endDate === thisMonthRange.end
                  ? 'bg-[#4ba556] text-white shadow-sm'
                  : 'text-[#607267] hover:bg-[#dff2d7] hover:text-[#236c37] hover:shadow-sm'
              }`}
            >
              This Month
            </button>

            <button
              onClick={() => handlePresetSelect('lastMonth')}
              className="shrink-0 whitespace-nowrap rounded-xl px-2.5 py-1.5 text-[11px] font-medium text-[#607267] transition-all hover:bg-[#dff2d7] hover:text-[#236c37] hover:shadow-sm sm:px-3 sm:text-xs"
            >
              Last Month
            </button>

            <button
              onClick={() => setIsCustomMode(true)}
              className={`flex shrink-0 items-center gap-1 whitespace-nowrap rounded-xl px-2.5 py-1.5 text-[11px] font-medium transition-all sm:px-3 sm:text-xs ${
                isCustomMode
                  ? 'bg-[#4ba556] text-white shadow-sm'
                  : 'text-[#607267] hover:bg-[#dff2d7] hover:text-[#236c37] hover:shadow-sm'
              }`}
            >
              <Filter className="w-3 h-3" />
              Custom
            </button>
          </div>

          {/* Quick Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={isLoading}
            title="Refresh Calendar Events"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#dfe8df] bg-white p-2 text-[#607267] transition-all hover:border-[#9bcaa1] hover:bg-[#edf8ee] hover:text-[#2e713d] disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#4ba556]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Custom Date Form (Expandable) */}
      {isCustomMode && (
        <form onSubmit={handleApplyCustom} className="relative z-20 mt-4 flex flex-wrap items-end gap-3 border-t border-[#e4ece4] pt-4">
          <DatePicker label="From date" value={customStart} onChange={setCustomStart} />

          <span className="hidden h-9 w-8 items-center justify-center self-end rounded-lg text-[#6c8a74] sm:flex" aria-hidden="true">
            <ArrowRight className="h-5 w-5" strokeWidth={1.8} />
          </span>

          <DatePicker label="To date" value={customEnd} onChange={setCustomEnd} />

          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto sm:ml-auto rounded-lg bg-[#4ba556] px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-[#3f9149] disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {isLoading ? 'Scanning Calendar...' : 'Fetch Date Range'}
          </button>
        </form>
      )}

      {/* Active Range Summary Pill */}
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-400">
        <div className="flex min-w-0 items-center gap-2">
          <span className="h-2 w-2 shrink-0 rounded-full bg-[#55ae5d] animate-pulse" />
          <span>Showing calendar events:</span>
          <span className="text-[#3e914b] font-medium font-mono break-all">
            {currentFilter.startDate} {currentFilter.startDate !== currentFilter.endDate ? `to ${currentFilter.endDate}` : '(Single Day)'}
          </span>
        </div>
      </div>
    </div>
  );
};
