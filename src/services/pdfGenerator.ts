/**
 * Export Service: PDF + CSV only
 * No JSON or Drive; clean local device exports.
 */
import { jsPDF } from 'jspdf';
import type { Meeting } from '../types/meeting';

export const reportGeneratorService = {
  // ── PDF ──────────────────────────────────────────────────────────────────
  generateMeetingsPDF(meetings: Meeting[], title = 'Nexus Meeting Intelligence Report'): Blob {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20;

    // Header strip
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, pageWidth, 32, 'F');
    doc.setFillColor(6, 182, 212);
    doc.rect(0, 30, pageWidth, 2, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(17);
    doc.setTextColor(248, 250, 252);
    doc.text(title, 14, 14);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text(`Generated: ${new Date().toLocaleString()} · Events: ${meetings.length}`, 14, 23);

    y = 42;

    meetings.forEach((m, idx) => {
      if (y > 240) { doc.addPage(); y = 20; }

      // Card background
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(12, y, pageWidth - 24, 58, 3, 3, 'FD');

      // Left accent strip (purple = CV, cyan = other)
      if (m.hasCV) {
        doc.setFillColor(168, 85, 247);
      } else {
        doc.setFillColor(6, 182, 212);
      }
      doc.rect(12, y, 4, 58, 'F');

      // Title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text(`${idx + 1}. ${m.title}`, 20, y + 9);

      // Time row
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      doc.text(`${m.date}  ·  ${m.startTime} – ${m.endTime}  (${m.durationMinutes} min)  ·  ${m.location || 'Virtual'}`, 20, y + 17);

      // Agenda
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 41, 59);
      doc.text('Agenda:', 20, y + 25);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      const agendaLines = doc.splitTextToSize(m.agenda, pageWidth - 52);
      doc.text(agendaLines.slice(0, 2), 38, y + 25);

      // Attendees
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 41, 59);
      doc.text('Attendees:', 20, y + 35);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      const attLine = m.attendees.map(a => `${a.name} (${a.status})`).join(', ');
      doc.text(doc.splitTextToSize(attLine, pageWidth - 52).slice(0, 1), 42, y + 35);

      // CV badge
      if (m.hasCV && m.cvDetails) {
        doc.setFillColor(243, 232, 255);
        doc.roundedRect(20, y + 42, 94, 11, 2, 2, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(126, 34, 206);
        doc.setFontSize(8);
        doc.text(`[CV] ${m.cvDetails.candidateName} | ${m.cvDetails.matchScore}% match | ${m.cvDetails.roleApplied}`, 24, y + 49);
      }

      y += 65;
    });

    return doc.output('blob');
  },

  // ── CSV ──────────────────────────────────────────────────────────────────
  generateMeetingsCSV(meetings: Meeting[]): Blob {
    const headers = [
      'Meeting Title',
      'Date',
      'Start Time',
      'End Time',
      'Duration (min)',
      'Category',
      'Location',
      'Agenda',
      'Attendees',
      'Has CV',
      'Candidate Name',
      'CV Match Score',
      'Role Applied',
      'Notes',
      'Pending Action Items'
    ];

    const escape = (val: string | number | boolean | undefined) => {
      if (val === null || val === undefined) return '';
      const s = String(val);
      return s.includes(',') || s.includes('"') || s.includes('\n')
        ? `"${s.replace(/"/g, '""')}"`
        : s;
    };

    const rows = meetings.map(m => [
      escape(m.title),
      escape(m.date),
      escape(m.startTime),
      escape(m.endTime),
      escape(m.durationMinutes),
      escape(m.category),
      escape(m.location),
      escape(m.agenda),
      escape(m.attendees.map(a => `${a.name} <${a.email}> [${a.status}]`).join(' | ')),
      escape(m.hasCV),
      escape(m.cvDetails?.candidateName),
      escape(m.cvDetails ? m.cvDetails.matchScore + '%' : ''),
      escape(m.cvDetails?.roleApplied),
      escape(m.notes.join(' | ')),
      escape(m.actionItems.filter(a => !a.done).map(a => a.text).join(' | '))
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    return new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  },

  // ── Local Download ────────────────────────────────────────────────────────
  downloadBlobLocally(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }
};
