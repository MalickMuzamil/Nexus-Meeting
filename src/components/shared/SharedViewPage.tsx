import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Users,
  FileText,
  Video,
  Award,
  CheckCircle,
  XCircle,
  AlertCircle,
  Layers,
  Moon,
  Sun,
  Download
} from 'lucide-react';
import type { Meeting } from '../../types/meeting';
import { reportGeneratorService } from '../../services/pdfGenerator';

interface SharedViewProps {
  meetings: Meeting[];
  ownerName?: string;
}

const rsvpIcon = (status: string) => {
  if (status === 'accepted') return <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />;
  if (status === 'declined') return <XCircle className="w-3.5 h-3.5 text-rose-400" />;
  return <AlertCircle className="w-3.5 h-3.5 text-amber-400" />;
};

export const SharedViewPage: React.FC<SharedViewProps> = ({ meetings, ownerName = 'Nexus user' }) => {
  const [darkMode, setDarkMode] = useState(() => sessionStorage.getItem('nexus_shared_theme') === 'dark');

  const toggleTheme = () => {
    setDarkMode(current => {
      const next = !current;
      sessionStorage.setItem('nexus_shared_theme', next ? 'dark' : 'light');
      return next;
    });
  };

  const downloadCSV = () => {
    const blob = reportGeneratorService.generateMeetingsCSV(meetings);
    reportGeneratorService.downloadBlobLocally(blob, `Nexus_Shared_Report_${new Date().toISOString().split('T')[0]}.csv`);
  };

  return (
    <div className={`shared-view ${darkMode ? 'shared-view-dark' : 'shared-view-light'} min-h-screen bg-[#030712] text-slate-100`}>
      {/* Ambient background */}
      <div className="shared-ambient fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-[60vw] h-[60vw] -translate-x-1/3 -translate-y-1/3 rounded-full bg-indigo-600/15 blur-[150px]" />
        <div className="absolute bottom-0 right-0 w-[50vw] h-[50vw] translate-x-1/4 translate-y-1/4 rounded-full bg-cyan-500/12 blur-[140px]" />
      </div>

      {/* Header banner */}
      <header className="sticky top-0 z-30 border-b border-white/[0.08] bg-[#030712]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="shared-logo flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 shadow-[0_0_18px_rgba(6,182,212,0.4)]">
              <Layers className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <span className="text-base font-extrabold tracking-tight text-white">Nexus</span>
              <span className="shared-badge ml-2 rounded-full border border-amber-500/30 bg-amber-500/15 px-2 py-0.5 text-[11px] font-semibold text-amber-300">
                View-Only Shared Report
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-400 hidden sm:block">
            Shared by {ownerName} · {meetings.length} meetings · read-only
          </p>
          <button type="button" onClick={toggleTheme} className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-slate-300 transition hover:bg-white/10 hover:text-white" aria-label="Toggle shared report theme">
            {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button type="button" onClick={downloadCSV} className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-[11px] font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white" aria-label="Download shared report CSV">
            <Download className="h-3.5 w-3.5" /> CSV
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { label: 'Total Meetings', value: meetings.length, icon: Calendar, color: 'text-cyan-400' },
            { label: 'Total Duration', value: `${Math.floor(meetings.reduce((a,m) => a+m.durationMinutes,0)/60)}h ${meetings.reduce((a,m) => a+m.durationMinutes,0)%60}m`, icon: Clock, color: 'text-indigo-400' },
            { label: 'CVs Detected', value: meetings.filter(m => m.hasCV).length, icon: FileText, color: 'text-purple-400' },
            { label: 'Total Attendees', value: meetings.reduce((a,m) => a + m.attendees.length, 0), icon: Users, color: 'text-emerald-400' },
          ].map((stat, i) => (
            <div key={i} className="shared-card rounded-2xl border border-white/[0.08] bg-slate-900/50 p-4 backdrop-blur-xl">
              <div className="flex items-center gap-2 mb-1.5">
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                <span className="text-[11px] text-slate-400">{stat.label}</span>
              </div>
              <div className="text-xl font-bold text-white">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Excel-style Table */}
        <div className="shared-card overflow-hidden rounded-2xl border border-white/[0.08] bg-slate-900/40 shadow-[0_8px_32px_rgba(0,0,0,0.45)] backdrop-blur-xl">
          {/* Table header */}
          <div className="shared-table-head flex items-center gap-2 border-b border-white/[0.08] bg-slate-800/60 px-4 py-3">
            <FileText className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-white">Meeting Data Spreadsheet</span>
            <span className="ml-auto text-[11px] text-slate-500">
              Shared view · cannot be edited
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/[0.08] bg-slate-800/40">
                  {['#', 'Title', 'Date', 'Time', 'Duration', 'Category', 'Attendees', 'Agenda', 'Notes', 'CV / Candidate'].map(col => (
                    <th
                      key={col}
                      className="px-4 py-3 text-left font-bold text-slate-300 whitespace-nowrap uppercase tracking-wider text-[10px]"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {meetings.map((m, idx) => (
                  <tr
                    key={m.id}
                    className={`border-b border-white/[0.05] transition-colors hover:bg-white/[0.03] ${idx % 2 === 0 ? 'bg-transparent' : 'bg-slate-800/20'}`}
                  >
                    {/* Row number */}
                    <td className="px-4 py-3 text-slate-500 font-mono">{idx + 1}</td>

                    {/* Title */}
                    <td className="px-4 py-3 min-w-[200px]">
                      <div className="font-semibold text-white leading-tight">{m.title}</div>
                      {m.meetingLink && (
                        <a
                          href={m.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-cyan-400 flex items-center gap-0.5 mt-0.5 hover:underline"
                        >
                          <Video className="w-2.5 h-2.5" /> Join meeting
                        </a>
                      )}
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3 whitespace-nowrap font-mono text-cyan-300">{m.date}</td>

                    {/* Time */}
                    <td className="px-4 py-3 whitespace-nowrap text-slate-200 font-mono">
                      {m.startTime}–{m.endTime}
                    </td>

                    {/* Duration */}
                    <td className="px-4 py-3 whitespace-nowrap text-slate-300">
                      {m.durationMinutes}m
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        m.category === 'interview'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      }`}>
                        {m.category}
                      </span>
                    </td>

                    {/* Attendees */}
                    <td className="px-4 py-3 min-w-[200px]">
                      <div className="space-y-1">
                        {m.attendees.map((att, i) => (
                          <div key={i} className="flex items-center gap-1.5 text-[11px] text-slate-300">
                            {rsvpIcon(att.status)}
                            <span className="font-medium">{att.name}</span>
                            <span className="text-slate-500">·</span>
                            <span className="text-slate-400 truncate max-w-[120px]">{att.email}</span>
                          </div>
                        ))}
                      </div>
                    </td>

                    {/* Agenda */}
                    <td className="px-4 py-3 min-w-[220px]">
                      <p className="text-slate-300 leading-relaxed line-clamp-3">{m.agenda}</p>
                    </td>

                    {/* Notes */}
                    <td className="px-4 py-3 min-w-[220px]">
                      <ul className="space-y-0.5">
                        {m.notes.slice(0, 3).map((note, i) => (
                          <li key={i} className="text-slate-400 flex items-start gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/60 mt-1.5 shrink-0" />
                            <span className="line-clamp-2">{note}</span>
                          </li>
                        ))}
                      </ul>
                    </td>

                    {/* CV */}
                    <td className="px-4 py-3 min-w-[200px]">
                      {m.hasCV && m.cvDetails ? (
                        <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/25">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <FileText className="w-3 h-3 text-purple-400" />
                            <span className="font-bold text-purple-200 text-[11px]">{m.cvDetails.candidateName}</span>
                            <span className="ml-auto px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-500/30 text-purple-200 flex items-center gap-0.5">
                              <Award className="w-2.5 h-2.5" />{m.cvDetails.matchScore}%
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 truncate">{m.cvDetails.roleApplied}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {m.cvDetails.skills.slice(0, 3).map((s, i) => (
                              <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-purple-900/50 text-purple-300 border border-purple-700/40">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-600 italic">No CV attached</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="px-4 py-3 bg-slate-800/30 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-500">
            <span>{meetings.length} rows · view-only shared report</span>
            <span>Powered by Nexus Meeting Intelligence</span>
          </div>
        </div>

        {/* View-only disclaimer */}
        <div className="shared-disclaimer mt-6 flex items-start gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs text-amber-300/80">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p>
            <span className="font-bold text-amber-300">Read-Only Access.</span> This shared link lets you view all meeting details, attendees, notes, and CV data. You cannot modify, delete, or add any data. To create your own reports, visit the Nexus dashboard.
          </p>
        </div>
      </main>
    </div>
  );
};
