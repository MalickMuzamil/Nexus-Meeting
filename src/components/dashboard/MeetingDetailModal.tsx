import React from 'react';
import { 
  AlertCircle,
  CheckCircle2,
  CircleHelp,
  Share2,
  Video, 
  Users, 
  FileText, 
  ExternalLink,
  Sparkles
} from 'lucide-react';
import type { Attendee, Meeting } from '../../types/meeting';

interface MeetingDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  meeting: Meeting | null;
  onOpenCVModal: (meeting: Meeting) => void;
  onOpenExport: (meeting: Meeting) => void;
  darkMode?: boolean;
}

const attendeeStatus: Record<Attendee['status'], { label: string; className: string; icon: typeof CheckCircle2 }> = {
  accepted: { label: 'Accepted', className: 'border-[#c6e4c9] bg-[#edf8ee] text-[#378b47]', icon: CheckCircle2 },
  needsAction: { label: 'Needs action', className: 'border-[#f0dfb8] bg-[#fff8e9] text-[#9b7128]', icon: AlertCircle },
  declined: { label: 'Declined', className: 'border-[#efcaca] bg-[#fff0f0] text-[#ad4f4f]', icon: AlertCircle },
  tentative: { label: 'Tentative', className: 'border-[#d5e0d7] bg-[#f3f6f3] text-[#718078]', icon: CircleHelp }
};

export const MeetingDetailModal: React.FC<MeetingDetailModalProps> = ({
  isOpen,
  onClose,
  meeting,
  onOpenCVModal,
  onOpenExport,
  darkMode = false
}) => {
  if (!isOpen || !meeting) return null;

  return (
    <div className={`meeting-detail-modal ${darkMode ? 'meeting-detail-modal-dark' : 'meeting-detail-modal-light'} fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-fadeIn`}>
      <div className="meeting-detail-surface scrollbar-none relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-white/10 bg-slate-900/95 p-6 shadow-[0_25px_70px_rgba(0,0,0,0.85)] backdrop-blur-2xl md:p-8">
        {/* Top Glow bar */}
        <div className="absolute inset-x-0 -top-px h-1 bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500" />

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[11px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-semibold">
                {meeting.category}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {meeting.date} • {meeting.startTime} - {meeting.endTime}
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white">
              {meeting.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/[0.05] hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-all text-sm"
          >
            ✕
          </button>
        </div>

        {/* Quick Links & Join Row */}
        {(meeting.meetingLink || meeting.hasCV) && (
          <div className="flex flex-wrap items-center gap-3 mb-6 p-3.5 rounded-2xl bg-white/[0.02] border border-white/10">
            {meeting.meetingLink && (
              <a
                href={meeting.meetingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5 transition-all"
              >
                <Video className="w-4 h-4" />
                <span>Open meeting link</span>
                <ExternalLink className="w-3 h-3 opacity-70" />
              </a>
            )}

            {meeting.hasCV && (
              <button
                onClick={() => onOpenCVModal(meeting)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-500/40 flex items-center gap-1.5 transition-all"
              >
                <Sparkles className="w-4 h-4 text-purple-300" />
                <span>Candidate CV: {meeting.cvDetails?.candidateName}</span>
              </button>
            )}
          </div>
        )}

        {/* Agenda & Description */}
        <div className="space-y-4 mb-6">
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Official Agenda
            </h4>
            <p className="text-sm text-slate-200 bg-white/[0.02] p-3.5 rounded-xl border border-white/[0.06]">
              {meeting.agenda}
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Description & Context
            </h4>
            <p className="text-sm text-slate-300 bg-white/[0.02] p-3.5 rounded-xl border border-white/[0.06] leading-relaxed">
              {meeting.description}
            </p>
          </div>
        </div>

        {/* Attendees List */}
        <div className="mb-6">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            Attendees ({meeting.attendees.length})
          </h4>
          {meeting.attendees.length > 0 ? (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {meeting.attendees.map((att, i) => (
                <div
                  key={i}
                  className="flex min-w-0 flex-col items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 w-full flex-1 items-center gap-2.5 sm:w-auto">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500/30 to-purple-500/30 border border-white/20 flex items-center justify-center font-bold text-xs text-white">
                      {att.name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="break-words text-xs font-bold text-white">{att.name}</p>
                      <p className="break-all text-[11px] text-slate-400">{att.email}</p>
                    </div>
                  </div>
                  {(() => {
                    const status = attendeeStatus[att.status];
                    const StatusIcon = status.icon;
                    return (
                      <span className={`inline-flex max-w-full shrink-0 items-center gap-1 whitespace-nowrap rounded-full border px-2.5 py-1 text-[10px] font-semibold sm:self-auto ${status.className}`}>
                        <StatusIcon className="h-3 w-3" />
                        {status.label}
                      </span>
                    );
                  })()}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400">No attendees in this calendar event.</p>
          )}
        </div>

        {/* Event description and attendee notes */}
        <div className="mb-6">
          <h4 className="text-xs font-semibold text-cyan-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" />
            Meeting notes
          </h4>

          {meeting.notes.length > 0 ? (
            <ul className="space-y-2">
              {meeting.notes.map((note, idx) => (
                <li
                  key={idx}
                  className="p-3 rounded-xl bg-white/[0.03] border border-white/10 text-xs md:text-sm text-slate-200 flex items-start gap-2.5"
                >
                  <span className="w-2 h-2 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                  <span className="leading-relaxed">{note}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-400">No event or attendee notes were provided.</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between gap-3 pt-4 border-t border-white/[0.08]">
          <button
            type="button"
            onClick={() => onOpenExport(meeting)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#c6e4c9] bg-[#edf8ee] px-4 py-2 text-xs font-semibold text-[#378b47] transition hover:bg-[#dff2d7]"
          >
            <Share2 className="h-3.5 w-3.5" />
            Export / Share
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#edf8ee] hover:bg-[#dff2d7] text-[#26342b] transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
