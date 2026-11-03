import React from 'react';
import { 
  Video, 
  Users, 
  FileText, 
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { Meeting } from '../../types/meeting';

interface MeetingDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  meeting: Meeting | null;
  onOpenCVModal: (meeting: Meeting) => void;
  darkMode?: boolean;
}

export const MeetingDetailModal: React.FC<MeetingDetailModalProps> = ({
  isOpen,
  onClose,
  meeting,
  onOpenCVModal,
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
        {(meeting.meetLink || meeting.hasCV) && (
          <div className="flex flex-wrap items-center gap-3 mb-6 p-3.5 rounded-2xl bg-white/[0.02] border border-white/10">
            {meeting.meetLink && (
              <a
                href={meeting.meetLink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5 transition-all"
              >
                <Video className="w-4 h-4" />
                <span>Launch Google Meet</span>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {meeting.attendees.map((att, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500/30 to-purple-500/30 border border-white/20 flex items-center justify-center font-bold text-xs text-white">
                      {att.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{att.name}</p>
                      <p className="text-[11px] text-slate-400">{att.email}</p>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full uppercase font-mono font-semibold bg-white/[0.05] text-slate-300 border border-white/10">
                    {att.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400">No attendees in this calendar event.</p>
          )}
        </div>

        {/* Calendar-provided notes only */}
        <div className="mb-6">
          <h4 className="text-xs font-semibold text-cyan-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" />
            Calendar Notes
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
            <p className="text-sm text-slate-400">No notes provided in this calendar event.</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-4 border-t border-white/[0.08]">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
