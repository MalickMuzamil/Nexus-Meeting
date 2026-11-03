import React from 'react';
import { CalendarDays, LayoutDashboard, Users } from 'lucide-react';

interface DashboardSidebarProps {
  ownerName: string;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ ownerName }) => {
  const firstName = ownerName.split(' ')[0] || 'there';
  const items = [{ label: 'Dashboard', icon: LayoutDashboard }];

  return (
    <aside className="sticky top-0 hidden h-screen w-[236px] shrink-0 flex-col overflow-hidden bg-[#9fbea9] px-4 py-6 text-[#173c2b] lg:flex">
      <div className="flex items-center gap-3 px-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/70 text-[#31834b] shadow-sm">
          <CalendarDays className="h-5 w-5" />
        </div>
        <span className="text-xl font-bold tracking-tight">Nexus</span>
      </div>

      <nav className="mt-12 space-y-2" aria-label="Primary navigation">
        {items.map(({ label, icon: Icon }) => (
          <button
            key={label}
            type="button"
            className="flex w-full cursor-default items-center gap-3 rounded-2xl bg-[#dff2d7] px-4 py-3 text-left text-sm font-semibold text-[#236c37] shadow-[0_8px_24px_rgba(54,111,67,0.12)]"
          >
            <Icon className="h-[18px] w-[18px]" />
            {label}
          </button>
        ))}
      </nav>

      <div className="mt-auto rounded-2xl border border-white/35 bg-white/25 p-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#eef8e9] text-xs font-bold text-[#3d8350]">
            {ownerName.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-bold text-[#173c2b]">{ownerName}</p>
            <p className="text-[11px] text-[#4c755d]">{firstName}'s workspace</p>
          </div>
          <Users className="ml-auto h-4 w-4 text-[#47765a]" />
        </div>
      </div>
    </aside>
  );
};
