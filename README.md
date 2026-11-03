<h1 align="center">📅 Nexus Meeting Intelligence</h1>

<h3 align="center">
Zoho Calendar Meeting Dashboard • Attendee Insights • CV / JD Detection • PDF & CSV Export
</h3>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-6-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Zoho_Calendar-Read--only-E42527?style=for-the-badge&logo=zoho&logoColor=white" alt="Zoho Calendar read-only" />
  <img src="https://img.shields.io/badge/Export-PDF_%2B_CSV-EA4335?style=for-the-badge" alt="PDF and CSV export" />
</p>

---

## Overview

**Nexus Meeting Intelligence** is a browser-based dashboard for viewing events from Zoho Calendar. It brings schedules, attendee responses, event descriptions, meeting links, and available CV / job-description attachment details into one searchable view.

The app uses Zoho OAuth with read-only calendar permissions. It does not create, edit, or delete calendar events. Export reports as PDF or CSV, or create a read-only link to share selected events.

## Features

### Zoho Calendar dashboard

- Connect a Zoho account using OAuth 2.0
- View events across accessible Zoho calendars
- Filter events by today, yesterday, the last seven days, or a custom date range
- Review scheduled time, duration, status, description, attendees, and RSVP responses
- Open meeting links included in calendar events
- Search and filter meetings, interviews, leads, and CV / JD references
- Switch between light and dark themes

### CV / JD indicators

- Identify possible CV or job-description events from calendar descriptions and attachment metadata
- View attachment and candidate details provided by the calendar event

> Detection is based on calendar event text and available attachment metadata; it is not AI resume analysis.

### Export and sharing

- Download selected events as PDF or CSV
- Generate read-only share links for filtered events
- Open shared events in a separate read-only view

## Attendance data

Zoho Calendar provides scheduled events, not participant attendance records. The dashboard does not infer actual attendance from a scheduled event's duration; actual attended time is shown as unavailable.

## Workflow

1. Connect a Zoho account and grant read-only Calendar access.
2. Select a date range to load accessible calendar events.
3. Search or filter events to find meetings, interviews, leads, or CV / JD references.
4. Open a meeting card or brief to review calendar-provided details.
5. Export visible events or create a read-only share link.

## Tech stack

- **UI:** React 19, TypeScript, Tailwind CSS
- **Build tooling:** Vite
- **Calendar integration:** Zoho Calendar REST API and OAuth 2.0
- **Reports:** jsPDF and browser-generated CSV
- **Share links:** Compressed URL-fragment payloads with fflate
- **Icons:** Lucide React

## Project structure

```text
src/
├── components/
│   ├── auth/          # Zoho Calendar access gate
│   ├── controls/      # Date filters, date picker, and search
│   ├── dashboard/     # Schedule, insights, meeting cards, and briefs
│   ├── export/        # PDF / CSV export and share dialog
│   └── shared/        # Read-only shared-event view
├── services/
│   ├── zohoAuth.ts       # Zoho OAuth and session handling
│   ├── zohoCalendar.ts   # Calendar loading and event transformation
│   ├── calendarCache.ts  # Per-session event cache
│   └── pdfGenerator.ts   # Local PDF and CSV generation
├── types/             # Meeting and share-link types/utilities
├── App.tsx
└── index.css
```

## Getting started

### Requirements

- Node.js 20 or newer
- npm
- A Zoho API Console **JavaScript** client
- Read access to the user's Zoho Calendar

### Install and run

```bash
npm install
npm run dev
```

### Configure Zoho Calendar

Create a **JavaScript** client in the [Zoho API Console](https://api-console.zoho.com/). Register the exact redirect URI used by the app (usually `http://localhost:5173/`), then create a `.env` file in the project root:

```env
VITE_ZOHO_CLIENT_ID=your-zoho-client-id
VITE_ZOHO_ACCOUNTS_URL=https://accounts.zoho.com
VITE_ZOHO_CALENDAR_API_URL=https://calendar.zoho.com/api/v1
VITE_ZOHO_REDIRECT_URI=http://localhost:5173/
```

Set the Accounts and Calendar API URLs for the Zoho data center where the account and OAuth client are registered. For example, Zoho India uses `https://accounts.zoho.in` and `https://calendar.zoho.in/api/v1`. The redirect URI in Zoho must match `VITE_ZOHO_REDIRECT_URI` exactly. Restart Vite after changing environment variables.

The app requests `AaaServer.profile.READ`, `ZohoCalendar.calendar.READ`, and `ZohoCalendar.event.READ`. It uses Zoho's browser OAuth flow; **do not put a client secret in frontend environment variables**. Zoho access tokens expire after one hour, so reconnect when prompted. App session data and its calendar cache are cleared on token expiry or after 48 hours, whichever comes first.

## Privacy and access

- Calendar permissions are read-only; Nexus cannot change calendar events.
- The temporary Zoho access token and event cache are kept in browser `sessionStorage`.
- This app reads calendar data only. It does not read Zoho Mail; Mail has a separate API and is not required for this dashboard.
- PDF and CSV files are generated and downloaded in the browser; reports are not uploaded to a server.
- Share links contain compressed event data in the URL fragment. Anyone with the link can view that data; it is encoded for transport, not encrypted. Share only with intended recipients.

## Build

```bash
npm run build
npm run preview
```

## Author

**Muzamil Saleem**  
Associate Software Engineer • Full Stack Developer • Data Engineer

<p align="center">
  Built to make calendar meetings easier to review, search, and share.
</p>
