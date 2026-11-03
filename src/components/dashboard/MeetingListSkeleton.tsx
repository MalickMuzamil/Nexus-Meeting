import React from 'react';

const SkeletonLine: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse rounded bg-white/[0.08] ${className}`} />
);

export const MeetingListSkeleton: React.FC = () => (
  <div className="space-y-4" aria-label="Loading meetings">
    {[1, 2, 3].map(item => (
      <div key={item} className="rounded-2xl border border-white/10 bg-slate-900/50 p-4 sm:p-5 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div className="flex gap-2">
            <SkeletonLine className="h-7 w-32" />
            <SkeletonLine className="h-7 w-20" />
          </div>
          <SkeletonLine className="h-5 w-24" />
        </div>
        <SkeletonLine className="h-6 w-3/4 max-w-md mb-2" />
        <SkeletonLine className="h-4 w-full max-w-2xl mb-5" />
        <SkeletonLine className="h-16 w-full mb-4" />
        <div className="flex flex-wrap gap-2 pt-3 border-t border-white/[0.06]">
          <SkeletonLine className="h-7 w-28" />
          <SkeletonLine className="h-7 w-36" />
          <SkeletonLine className="h-7 w-24" />
        </div>
      </div>
    ))}
  </div>
);