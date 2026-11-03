import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Meeting } from '../../types/meeting';
import { MeetingCard } from './MeetingCard';
import { SearchBar } from '../controls/SearchBar';

interface MeetingDataSectionProps {
  meetings: Meeting[];
  filteredMeetings: Meeting[];
  paginatedMeetings: Meeting[];
  currentPage: number;
  totalPages: number;
  searchQuery: string;
  activeCategoryFilter: 'all' | 'cv_only' | 'interview' | 'lead';
  onSearchChange: (value: string) => void;
  onFilterChange: (value: 'all' | 'cv_only' | 'interview' | 'lead') => void;
  onPageChange: (page: number) => void;
  onOpenExportAll: () => void;
  onOpenDetails: (meeting: Meeting) => void;
  onOpenCVModal: (meeting: Meeting) => void;
}

export const MeetingDataSection: React.FC<MeetingDataSectionProps> = ({
  meetings,
  filteredMeetings,
  paginatedMeetings,
  currentPage,
  totalPages,
  searchQuery,
  activeCategoryFilter,
  onSearchChange,
  onFilterChange,
  onPageChange,
  onOpenExportAll,
  onOpenDetails,
  onOpenCVModal
}) => (
  <section className="meeting-data-section mt-6">
    <div className="mb-4 flex items-end justify-between gap-3">
      <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#6b8c76]">Full calendar data</p><h2 className="mt-1 text-xl font-bold text-[#1b251e]">All meetings</h2></div>
      <span className="text-xs text-[#728078]">{filteredMeetings.length} matching events</span>
    </div>
    <SearchBar searchQuery={searchQuery} onSearchChange={onSearchChange} activeFilter={activeCategoryFilter} onFilterChange={onFilterChange} totalFiltered={filteredMeetings.length} onOpenExportAll={onOpenExportAll} />
    {filteredMeetings.length > 0 ? (
      <>
        <div className="mb-3 flex items-center justify-between text-xs text-[#728078]"><span>Showing {((currentPage - 1) * 10) + 1}-{Math.min(currentPage * 10, filteredMeetings.length)} of {filteredMeetings.length}</span><span>10 per page</span></div>
        <div className="space-y-4">
          {paginatedMeetings.map(meeting => <MeetingCard key={meeting.id} meeting={meeting} onOpenDetails={onOpenDetails} onOpenCVModal={onOpenCVModal} />)}
        </div>
        {totalPages > 1 && <nav className="mt-5 flex items-center justify-between rounded-2xl border border-[#dfe8df] bg-white/70 p-3 text-xs text-[#52645a]" aria-label="Meeting pages">
          <button type="button" onClick={() => onPageChange(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 hover:bg-[#eaf4e9] disabled:opacity-40"><ChevronLeft className="h-4 w-4" />Previous</button>
          <span>Page {currentPage} of {totalPages}</span>
          <button type="button" onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 hover:bg-[#eaf4e9] disabled:opacity-40">Next<ChevronRight className="h-4 w-4" /></button>
        </nav>}
      </>
    ) : <div className="rounded-[22px] border border-dashed border-[#cbd9ce] bg-white/60 py-16 text-center text-sm text-[#728078]">No meetings found for this view.</div>}
  </section>
);
