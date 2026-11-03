import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Video, 
  FileText, 
  Users, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  Download, 
  CloudUpload, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  Award
} from 'lucide-react';
import { Meeting } from '../../types/meeting';
import { GlassCard } from '../aura/GlassCard';

interface MeetingCardProps {
  meeting: Meeting;
  onOpenDetails: (meeting: Meeting) => void;
  onOpenCVModal: (meeting: Meeting) => void;
}

export const MeetingCard: React.FC<MeetingCardProps> = ({
  meeting,
  onOpenDetails,
  onOpenCVModal
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getRSVPBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-0.5"><CheckCircle2 className="w-3 h-3" /> Accepted</span>;
      case 'declined':
        return <span className="text-[10px] text-rose-400 font-medium flex items-center gap-0.5"><AlertCircle className="w-3 h-3" /> Declined</span>;
      default:
        return <span className="text-[10px] text-amber-400 font-medium">Tentative</span>;
    }
  };

  return (
    <GlassCard glow="none" className="meeting-card p-4 sm:p-5 md:p-6 mb-4 overflow-hidden group">
      {/* Top Banner Row: Time, Category & Drive Sync Badge */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          {/* Time & Duration Pill */}
          <div className="flex max-w-full items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-lg bg-white/[0.05] border border-white/10 text-[11px] sm:text-xs font-mono text-cyan-300">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span className="truncate">{meeting.startTime} - {meeting.endTime}</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-300 font-sans">{meeting.durationMinutes}m</span>
          </div>

          {/* Category Tag */}
          <span className={`text-[11px] uppercase tracking-wider font-semibold px-2.5 py-0.5 rounded-full border ${
            meeting.category === 'interview'
              ? 'bg-purple-500/15 border-purple-500/30 text-purple-300'
              : 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300'
          }`}>
            {meeting.category}
          </span>
        </div>

        {/* Sync Status Badge */}
        {meeting.syncedToDrive && (
          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center gap-1">
            <CloudUpload className="w-3 h-3" />
            Drive Synced ({meeting.lastDriveSync || 'Updated'})
          </span>
        )}
      </div>

      {/* Main Title & Meet Link */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 mb-4">
        <div className="flex-1">
          <h3 
            onClick={() => onOpenDetails(meeting)}
            className="text-base sm:text-lg md:text-xl font-bold text-white group-hover:text-cyan-300 transition-colors cursor-pointer break-words flex items-center gap-2"
          >
            {meeting.title}
          </h3>
          <p className="text-xs md:text-sm text-slate-300 mt-1 line-clamp-2">
            {meeting.agenda}
          </p>
        </div>

        {/* Join Video Call Button */}
        {meeting.meetLink && !meeting.isCompleted && meeting.status !== 'cancelled' && (
          <a
            href={meeting.meetLink}
            target="_blank"
            rel="noopener noreferrer"
            className="self-start px-3.5 py-2 rounded-xl text-xs font-medium bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 transition-all flex items-center gap-1.5 shrink-0"
          >
            <Video className="w-3.5 h-3.5" />
            <span>Join Meet</span>
            <ExternalLink className="w-3 h-3 opacity-60" />
          </a>
        )}
      </div>

      {/* CV / Resume Highlight Banner (Requested Feature) */}
      {meeting.hasCV && meeting.cvDetails ? (
        <div className="mb-4 p-3.5 rounded-xl bg-gradient-to-r from-purple-900/40 via-indigo-900/30 to-purple-900/20 border border-purple-500/30 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.3)] shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">CV / JD attached:</span>
                <span className="text-xs text-purple-200 font-medium break-words">{meeting.cvDetails.candidateName}</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-500/30 text-purple-200 border border-purple-400/40 flex items-center gap-1">
                  <Award className="w-2.5 h-2.5" />
                  {meeting.cvDetails.matchScore}% Match
                </span>
              </div>
              <p className="text-[11px] text-slate-300 line-clamp-1 mt-0.5">
                {meeting.cvDetails.roleApplied} • {meeting.cvDetails.skills.slice(0, 3).join(', ')}
              </p>
            </div>
          </div>

          <button
            onClick={() => onOpenCVModal(meeting)}
            className="self-start sm:self-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-500/30 hover:bg-purple-500/50 text-purple-100 border border-purple-400/40 transition-all flex items-center gap-1.5 shadow-[0_0_12px_rgba(168,85,247,0.25)]"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-300" />
            View Candidate Profile & CV
          </button>
        </div>
      ) : (
        <div className="mb-4 py-1 px-3 rounded-lg bg-white/[0.02] border border-white/[0.05] inline-flex items-center gap-1.5 text-[11px] text-slate-400">
          <FileText className="w-3 h-3 text-slate-500" />
          <span>No CV attached for this meeting</span>
        </div>
      )}

      {/* Attendees Row */}
      <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-white/[0.06] mb-3">
        <div className="flex items-center gap-1 text-xs text-slate-400 mr-2">
          <Users className="w-3.5 h-3.5" />
          <span>Attendees ({meeting.attendees.length}):</span>
        </div>

        {meeting.attendees.map((att, i) => (
          <div 
            key={i}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06] text-xs text-slate-200"
          >
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-cyan-500/40 to-indigo-500/40 border border-white/20 flex items-center justify-center text-[10px] font-bold text-white">
              {att.name.charAt(0)}
            </div>
            <span className="font-medium">{att.name}</span>
            {getRSVPBadge(att.status)}
          </div>
        ))}
      </div>

      {/* Expandable Notes & Action Items */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-white/[0.08] space-y-3 animate-fadeIn">
          {/* Notes */}
          <div>
            <h4 className="text-xs font-semibold text-cyan-300 mb-1.5">Meeting Notes & Key Takeaways:</h4>
            <ul className="space-y-1">
              {meeting.notes.map((note, idx) => (
                <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Action Items */}
          {meeting.actionItems && meeting.actionItems.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-purple-300 mb-1.5">Decisions & Action Items:</h4>
              <div className="space-y-1">
                {meeting.actionItems.map((action, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                    <input
                      type="checkbox"
                      defaultChecked={action.done}
                      className="rounded border-white/20 bg-slate-800 text-cyan-500 focus:ring-0"
                    />
                    <span className={action.done ? 'line-through text-slate-500' : ''}>
                      {action.text}
                    </span>
                    {action.assignee && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.06] text-slate-400">
                        @{action.assignee}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bottom Footer Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-white/[0.06]">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="w-3.5 h-3.5" />
              <span>Hide Details</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5" />
              <span>Notes & attendees ({meeting.notes.length})</span>
            </>
          )}
        </button>

        <button
          onClick={() => onOpenDetails(meeting)}
          className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-white/[0.06] transition-all"
        >
          Full Brief
        </button>
      </div>
    </GlassCard>
  );
};
