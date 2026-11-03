import React from 'react';

interface MeetingListSkeletonProps {
  darkMode?: boolean;
}

const SkeletonLine: React.FC<{ className?: string; darkMode: boolean }> = ({ className = '', darkMode }) => (
  <div className={`glass-skeleton ${darkMode ? 'glass-skeleton-dark' : ''} ${className}`} />
);

export const MeetingListSkeleton: React.FC<MeetingListSkeletonProps> = ({ darkMode = false }) => (
  <div className="space-y-4" aria-label="Loading meetings" aria-busy="true">
    {[1, 2, 3].map(item => (
      <div
        key={item}
        className={`rounded-2xl border p-4 shadow-[0_8px_24px_rgba(89,117,95,0.06)] sm:p-5 md:p-6 ${
          darkMode
            ? 'border-[#2b4431]/80 bg-[#17241a]/75 backdrop-blur-xl'
            : 'border-white/80 bg-white/65 backdrop-blur-xl'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div className="flex gap-2">
            <SkeletonLine darkMode={darkMode} className="h-7 w-32 rounded-lg" />
            <SkeletonLine darkMode={darkMode} className="h-7 w-20 rounded-full" />
          </div>
          <SkeletonLine darkMode={darkMode} className="h-5 w-24 rounded-full" />
        </div>
        <SkeletonLine darkMode={darkMode} className="mb-2 h-6 w-3/4 max-w-md" />
        <SkeletonLine darkMode={darkMode} className="mb-5 h-4 w-full max-w-2xl" />
        <SkeletonLine darkMode={darkMode} className="mb-4 h-16 w-full rounded-xl" />
        <div className={`flex flex-wrap gap-2 border-t pt-3 ${darkMode ? 'border-[#2b4431]' : 'border-[#e7eee8]'}`}>
          <SkeletonLine darkMode={darkMode} className="h-7 w-28 rounded-lg" />
          <SkeletonLine darkMode={darkMode} className="h-7 w-36 rounded-lg" />
          <SkeletonLine darkMode={darkMode} className="h-7 w-24 rounded-lg" />
        </div>
      </div>
    ))}
  </div>
);