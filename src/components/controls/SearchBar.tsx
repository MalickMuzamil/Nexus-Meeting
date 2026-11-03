import React from 'react';
import { Search, Share2, SlidersHorizontal } from 'lucide-react';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeFilter: 'all' | 'cv_only' | 'interview' | 'lead';
  onFilterChange: (filter: 'all' | 'cv_only' | 'interview' | 'lead') => void;
  totalFiltered: number;
  onOpenExportAll: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange,
  totalFiltered,
  onOpenExportAll
}) => {
  const filters = [
    { key: 'all' as const, label: `All (${totalFiltered})` },
    { key: 'cv_only' as const, label: 'CV / JD' },
    { key: 'interview' as const, label: 'Interviews' },
    { key: 'lead' as const, label: 'Leads' }
  ];

  return (
    <div className="mb-6 flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-start">
      <div className="min-w-0 flex-1 sm:max-w-md">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#84948a]" />
          <input
            type="search"
            value={searchQuery}
            onChange={event => onSearchChange(event.target.value)}
            placeholder="Search by title, attendee, keyword..."
            className="w-full rounded-xl border border-[#d5e0d7] bg-white/80 py-2.5 pl-10 pr-10 text-sm text-[#26342b] placeholder-[#94a198] shadow-sm outline-none transition focus:border-[#79b982] focus:ring-1 focus:ring-[#79b982]"
          />
          {searchQuery && (
            <button type="button" onClick={() => onSearchChange('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#718078] hover:text-[#236c37]" aria-label="Clear search">×</button>
          )}
        </div>
        <div className="mt-2 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <span className="flex shrink-0 items-center gap-1 text-[10px] uppercase tracking-wider text-[#84948a]"><SlidersHorizontal className="h-3 w-3" />Quick views</span>
          <button type="button" onClick={() => { onSearchChange(''); onFilterChange('cv_only'); }} className="shrink-0 rounded-lg border border-[#d9d3f5] bg-[#f0effb] px-2 py-1 text-[10px] font-medium text-[#625bb0] hover:bg-[#e6e2fb]">CV / JD</button>
          <button type="button" onClick={() => { onSearchChange(''); onFilterChange('lead'); }} className="shrink-0 rounded-lg border border-[#c6e4c9] bg-[#edf8ee] px-2 py-1 text-[10px] font-medium text-[#378b47] hover:bg-[#dff2d7]">Leads</button>
          <button type="button" onClick={() => { onSearchChange(''); onFilterChange('interview'); }} className="shrink-0 rounded-lg border border-[#c6e4c9] bg-[#edf8ee] px-2 py-1 text-[10px] font-medium text-[#378b47] hover:bg-[#dff2d7]">Interviews</button>
          <button type="button" onClick={() => { onSearchChange(''); onFilterChange('all'); }} className="shrink-0 rounded-lg border border-[#d5e0d7] bg-white px-2 py-1 text-[10px] font-medium text-[#718078] hover:bg-[#edf8ee] hover:text-[#236c37]">Reset</button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
        <div className="flex max-w-full items-center gap-1 overflow-x-auto rounded-xl border border-[#d5e0d7] bg-white/75 p-1">
          {filters.map(filter => (
            <button
              key={filter.key}
              type="button"
              onClick={() => onFilterChange(filter.key)}
              className={`shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${activeFilter === filter.key ? 'bg-[#4ba556] text-white shadow-sm' : 'text-[#607267] hover:bg-[#dff2d7] hover:text-[#236c37]'}`}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <button type="button" onClick={onOpenExportAll} className="flex items-center gap-1.5 rounded-xl bg-[#4ba556] px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#3f9149]"><Share2 className="h-3.5 w-3.5" />Export / Share</button>
      </div>
    </div>
  );
};
