import React from 'react';
import { 
  FileText, 
  Award, 
  Briefcase, 
  CheckCircle, 
  Download, 
  Sparkles, 
  User, 
  ExternalLink 
} from 'lucide-react';
import { CVAttachment, Meeting } from '../../types/meeting';
import { reportGeneratorService } from '../../services/pdfGenerator';

interface CVViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  meeting: Meeting | null;
}

export const CVViewerModal: React.FC<CVViewerModalProps> = ({
  isOpen,
  onClose,
  meeting
}) => {
  if (!isOpen || !meeting || !meeting.cvDetails) return null;

  const cv = meeting.cvDetails;

  const handleDownloadCV = () => {
    // Generate a mini PDF profile for the candidate
    const blob = reportGeneratorService.generateMeetingsPDF(
      [meeting], 
      `Candidate Dossier: ${cv.candidateName} - ${cv.roleApplied}`
    );
    reportGeneratorService.downloadBlobLocally(blob, cv.fileName);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl rounded-3xl border border-purple-500/30 bg-slate-900/95 backdrop-blur-2xl p-6 md:p-8 shadow-[0_20px_60px_rgba(168,85,247,0.2)] overflow-hidden">
        {/* Top Purple Accent line */}
        <div className="absolute inset-x-0 -top-px h-1 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500" />

        {/* Modal Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shadow-[0_0_20px_rgba(168,85,247,0.3)]">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 font-medium">
                  Verified Attachment
                </span>
                <span className="text-xs text-slate-400">• {cv.fileSize}</span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-white mt-1">
                {cv.candidateName}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/[0.05] hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-all text-sm"
          >
            ✕
          </button>
        </div>

        {/* Candidate Target Role & Match Score */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10">
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5 text-cyan-400" /> Applied Position
            </span>
            <p className="text-xs md:text-sm font-bold text-white mt-1 truncate">
              {cv.roleApplied}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10">
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-indigo-400" /> Experience
            </span>
            <p className="text-xs md:text-sm font-bold text-white mt-1">
              {cv.experienceYears} Years Professional
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.15)]">
            <span className="text-[11px] text-purple-300 flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-purple-400" /> System Match
            </span>
            <p className="text-xs md:text-sm font-bold text-purple-200 mt-1 flex items-center gap-1">
              <span>{cv.matchScore}% Compatibility</span>
            </p>
          </div>
        </div>

        {/* Candidate Bio / Executive Summary */}
        <div className="mb-6">
          <h4 className="text-xs font-semibold text-slate-300 mb-2">Executive Candidate Summary:</h4>
          <p className="text-xs md:text-sm text-slate-300 leading-relaxed p-4 rounded-2xl bg-white/[0.02] border border-white/10">
            {cv.summary}
          </p>
        </div>

        {/* Skills Stack */}
        <div className="mb-6">
          <h4 className="text-xs font-semibold text-slate-300 mb-2">Verified Skill Competencies:</h4>
          <div className="flex flex-wrap gap-2">
            {cv.skills.map((skill, i) => (
              <span
                key={i}
                className="px-3 py-1 rounded-xl text-xs font-medium bg-gradient-to-r from-purple-500/15 to-indigo-500/15 border border-purple-400/20 text-purple-200 flex items-center gap-1"
              >
                <CheckCircle className="w-3 h-3 text-cyan-400" />
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Associated Meeting Context */}
        <div className="mb-6 p-3.5 rounded-xl bg-white/[0.02] border border-white/10 flex items-center justify-between text-xs text-slate-400">
          <div>
            <span>Attached to: </span>
            <span className="text-white font-medium">{meeting.title}</span>
            <span className="ml-2 font-mono text-cyan-400">({meeting.date} @ {meeting.startTime})</span>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.08]">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/[0.06] transition-all"
          >
            Close
          </button>

          <button
            onClick={handleDownloadCV}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 shadow-[0_0_20px_rgba(168,85,247,0.35)] transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Download {cv.fileName}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

