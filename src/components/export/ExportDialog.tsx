import React, { useState } from 'react';
import {
  Laptop,
  FileText,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Download,
  FileSpreadsheet,
  Share2,
  Copy,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { Meeting } from '../../types/meeting';
import { reportGeneratorService } from '../../services/pdfGenerator';
import { buildShareableURL } from '../../types/shareUtils';

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  meeting?: Meeting | null;
  allMeetings?: Meeting[];
  dateLabel: string;
  ownerName?: string;
  ownerEmail?: string;
  darkMode?: boolean;
}

export const ExportDialog: React.FC<ExportDialogProps> = ({
  isOpen,
  onClose,
  meeting,
  allMeetings = [],
  dateLabel,
  ownerName = 'Nexus user',
  ownerEmail = '',
  darkMode = false
}) => {
  const [fileFormat, setFileFormat] = useState<'pdf' | 'csv'>('pdf');
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [shareURL, setShareURL] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const targetMeetings = meeting ? [meeting] : allMeetings;
  const targetTitle = meeting
    ? `Meeting Report: ${meeting.title}`
    : `Nexus Calendar Digest (${dateLabel})`;

  const sanitizedName = (meeting
    ? `Nexus_Meeting_${meeting.title.replace(/[^a-zA-Z0-9_-]/g, '_')}_${meeting.date}`
    : `Nexus_Digest_${dateLabel.replace(/[^a-zA-Z0-9_-]/g, '_')}`);

  const fileName = `${sanitizedName}.${fileFormat}`;

  // ── Download Handler ──────────────────────────────────────────────────────
  const handleDownload = async () => {
    setIsProcessing(true);
    setDownloadSuccess(false);
    try {
      let blob: Blob;
      if (fileFormat === 'pdf') {
        blob = reportGeneratorService.generateMeetingsPDF(targetMeetings, targetTitle);
      } else {
        blob = reportGeneratorService.generateMeetingsCSV(targetMeetings);
      }
      reportGeneratorService.downloadBlobLocally(blob, fileName);
      setDownloadSuccess(true);
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
    } catch (err) {
      console.error('Export error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // ── Share Link Handler ────────────────────────────────────────────────────
  const handleGenerateShareLink = () => {
    const url = buildShareableURL(targetMeetings, ownerName, ownerEmail);
    setShareURL(url);
  };

  const handleCopyLink = async () => {
    if (!shareURL) return;
    try {
      await navigator.clipboard.writeText(shareURL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
      const el = document.createElement('textarea');
      el.value = shareURL;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className={`dashboard-export-modal fixed inset-0 z-50 flex items-center justify-center bg-[#203326]/35 p-4 backdrop-blur-md ${darkMode ? 'dashboard-export-modal-dark' : ''}`}>
      <div className="export-surface relative max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-[24px] border border-[#d6e4d7] bg-[#f7faf6] p-5 shadow-[0_24px_70px_rgba(47,77,53,0.22)] sm:p-7">
        {/* Top accent glow */}
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <span className="export-label rounded bg-[#eaf3e9] px-2 py-0.5 text-[11px] font-mono font-semibold uppercase tracking-widest text-[#3d914b] border border-[#c6e4c9]">
              Export & Share
            </span>
            <h2 className="mt-1.5 text-xl font-bold text-[#1b2b20] md:text-2xl">
              Download or Share Report
            </h2>
            <p className="mt-1 text-xs text-[#718078]">
              {targetMeetings.length} event(s) · "{targetTitle}"
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#eaf3e9] text-[#6b7d70] transition-all hover:bg-[#dff2d7] hover:text-[#236c37]"
          >
            ✕
          </button>
        </div>

        {/* Format Selector */}
        <div className="mb-6">
          <label className="mb-2 block text-xs font-semibold text-[#52645a]">
            Choose Export Format:
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFileFormat('pdf')}
              className={`py-3 px-4 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                fileFormat === 'pdf'
                  ? 'border-[#e4a4b0] bg-[#fff0f2] text-[#9c4a59] shadow-sm'
                  : 'border-[#d5e0d7] bg-white/70 text-[#718078] hover:border-[#9bcaa1] hover:text-[#2e713d]'
              }`}
            >
              <FileText className="w-4 h-4 text-rose-400" />
              PDF Report
            </button>

            <button
              type="button"
              onClick={() => setFileFormat('csv')}
              className={`py-3 px-4 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                fileFormat === 'csv'
                  ? 'border-[#9bcaa1] bg-[#eaf7eb] text-[#2e713d] shadow-sm'
                  : 'border-[#d5e0d7] bg-white/70 text-[#718078] hover:border-[#9bcaa1] hover:text-[#2e713d]'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              CSV / Excel
            </button>
          </div>
          <p className="mt-2 text-[11px] text-[#839087]">
            {fileFormat === 'csv'
              ? '💡 CSV opens directly in Microsoft Excel or Google Sheets'
              : '💡 PDF is formatted for printing and sharing as attachments'}
          </p>
        </div>

        {/* Download Success */}
        {downloadSuccess && (
          <div className="mb-5 flex items-center gap-3 rounded-2xl border border-[#bfe1c2] bg-[#edf8ee] p-4 text-xs text-[#378b47]">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <p className="font-semibold text-[#2e713d]">Downloaded Successfully!</p>
              <p className="mt-0.5 text-[#5b8d64]">
                Saved as <span className="font-mono">{fileName}</span>
              </p>
            </div>
          </div>
        )}

        {/* Shareable Link Section */}
        <div className="mb-6 rounded-2xl border border-[#cbd9f1] bg-[#f0f4fc] p-4">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <Share2 className="h-4 w-4 text-[#6175c2]" />
              <span className="text-xs font-bold text-[#28364b]">Share Read-Only View Link</span>
            </div>
            {!shareURL && (
              <button
                onClick={handleGenerateShareLink}
                className="flex items-center gap-1.5 rounded-lg border border-[#b7c5ed] bg-[#e4e9fb] px-3 py-1.5 text-xs font-semibold text-[#5369b8] transition-all hover:bg-[#d8e0fa]"
              >
                <Sparkles className="w-3 h-3" />
                Generate Link
              </button>
            )}
          </div>

          {!shareURL ? (
            <p className="text-xs leading-relaxed text-[#6f7f75]">
              Generate a shareable link anyone can open. They will see the meetings in a clean
              <span className="font-semibold text-[#5e6fba]"> Excel-style table view</span>.
              No login required. <span className="font-medium text-[#b17d26]">View-only</span>. They cannot edit any data.
            </p>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={shareURL}
                  className="flex-1 truncate rounded-xl border border-[#cbd9f1] bg-white px-3 py-2 text-[11px] font-mono text-[#5369b8] focus:outline-none"
                />
                <button
                  onClick={handleCopyLink}
                  className={`shrink-0 px-3 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                    copied
                      ? 'border-[#bfe1c2] bg-[#edf8ee] text-[#378b47]'
                      : 'border-[#b7c5ed] bg-[#e4e9fb] text-[#5369b8] hover:bg-[#d8e0fa]'
                  }`}
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <p className="text-[11px] text-[#839087]">
                Shared by {ownerName}. Anyone with this link sees a view-only spreadsheet.
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            onClick={onClose}
            className="rounded-xl px-4 py-2.5 text-xs font-semibold text-[#718078] transition-all hover:bg-[#eaf3e9] hover:text-[#2e713d]"
          >
            {downloadSuccess ? 'Close' : 'Cancel'}
          </button>

          <button
            onClick={handleDownload}
            disabled={isProcessing}
            className="flex items-center gap-2 rounded-xl bg-[#4ba556] px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-[#3f9149] disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download {fileFormat.toUpperCase()}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
