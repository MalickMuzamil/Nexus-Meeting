<h1 align="center">📅 Nexus Meeting Intelligence</h1>

<h3 align="center">
Google Calendar Meeting Dashboard • Attendee Insights • CV / JD Detection • PDF & CSV Export
</h3>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-6-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Google_Calendar-Read--only-4285F4?style=for-the-badge&logo=googlecalendar&logoColor=white" alt="Google Calendar read-only" />
  <img src="https://img.shields.io/badge/Export-PDF_%2B_CSV-EA4335?style=for-the-badge" alt="PDF and CSV export" />
</p>

---

## 🚀 Overview

**Nexus Meeting Intelligence** is a browser-based dashboard for viewing and organizing events from Google Calendar. It brings meeting schedules, attendee responses, event descriptions, and possible CV / job-description attachments into one searchable view.

The app connects directly to Google Calendar using read-only access. It does not create, edit, or delete calendar events. Export reports as PDF or CSV, or create a read-only link to share the currently selected events.

---

## ✨ Features

### 📆 Calendar Dashboard

- Connect a Google account through Google Identity Services
- View calendar events for today, yesterday, the last seven days, or a custom date range
- See scheduled time, duration, status, agenda, meeting link, and attendees
- Review attendee RSVP status and event descriptions
- See completed-time, upcoming-event, and CV / JD summary metrics
- Switch between light and dark themes

### 🔎 Meeting Search & Organization

- Search by meeting title, agenda, attendee name, email, or detected candidate name
- Filter events by all events, CV / JD, interviews, or leads
- Browse results with pagination
- Expand a meeting card for calendar notes and any available action items
- Open a full brief with the event description, attendees, and meeting links

### 📄 CV / JD Indicators

- Flag events when Google Calendar includes a matching attachment or the event text contains CV / resume / job-description keywords
- View available attachment and candidate details in the dashboard

> CV / JD identification is based on calendar event and attachment text; it is not an AI resume analysis.

### 📤 Export & Share

- Download the selected events as a PDF report
- Download event details as a CSV file for spreadsheet apps
- Generate a read-only share link for the currently filtered events
- Open shared events in a separate read-only view without signing in

---

## 🔄 Workflow

1. Connect a Google account and grant read-only Calendar access.
2. Choose a date range to load matching events.
3. Search or filter the list to find meetings, interviews, leads, or CV / JD events.
4. Open a meeting card or full brief to review calendar-provided details.
5. Export the visible events as PDF / CSV or generate a read-only share link.

---

## 🧰 Tech Stack

- **UI:** React 19, TypeScript, Tailwind CSS
- **Build tooling:** Vite
- **Calendar integration:** Google Identity Services and Google Calendar API
- **Reports:** jsPDF and browser-generated CSV
- **Share links:** Compressed URL-fragment payloads with fflate
- **Icons:** Lucide React

---

## 📂 Project Structure

```text
src/
├── components/
│   ├── auth/          # Google Calendar access gate
│   ├── controls/      # Date filters, date picker, and search
│   ├── dashboard/    # Schedule, insights, meeting cards, and briefs
│   ├── export/       # PDF / CSV export and share dialog
│   └── shared/       # Read-only shared-event view
├── services/
│   ├── googleAuth.ts      # Google sign-in and token handling
│   ├── googleCalendar.ts  # Calendar event loading and transformation
│   ├── calendarCache.ts   # Per-session event cache
│   └── pdfGenerator.ts    # Local PDF and CSV generation
├── types/             # Meeting and share-link types/utilities
├── App.tsx
└── index.css
```

---

## ⚙️ Getting Started

### Requirements

- Node.js 20 or newer
- npm
- A Google Cloud project with the Google Calendar API enabled
- A Google OAuth web client ID

### Install and run

```bash
npm install
npm run dev
```

### Configure Google Calendar

Create a **Web application** OAuth client in Google Cloud Console. Enable the Google Calendar API, add your local app origin (usually `http://localhost:5173`) to **Authorized JavaScript origins**, and create a `.env` file in the project root:

```env
VITE_GOOGLE_CLIENT_ID=your-web-client-id.apps.googleusercontent.com
```

Restart the Vite development server after changing environment variables.

The app requests the `calendar.readonly` scope along with basic profile information. For local OAuth testing, add the Google account under **Google Auth Platform → Audience → Test users** while the consent screen is in Testing mode.

---

## 🔐 Privacy & Access

- Calendar permissions are read-only; the app cannot change calendar events.
- The temporary Google access token and event cache are kept in browser `sessionStorage`.
- PDF and CSV files are generated and downloaded in the browser; this app does not upload those reports to a server or Google Drive.
- Share links contain compressed event data in the URL fragment. Anyone with the link can view that data, so only share it with intended recipients. The payload is encoded for transport, not encrypted.
- Avoid sharing links that include sensitive event details.

---

## 🏗️ Build

```bash
npm run build
npm run preview
```

---

## 👨‍💻 Author

**Muzamil Saleem**  
Associate Software Engineer • Full Stack Developer • Data Engineer

<p align="center">
  Built to make calendar meetings easier to review, search, and share.
</p>
