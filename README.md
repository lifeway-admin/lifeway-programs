# Lifeway Programs — Project Workspace

This workspace contains the full Lifeway Programs digital infrastructure: a static site mirror, a custom CRM, a public booking platform, and an AI marketing agent.

---

## Folder Structure

```
LP/
├── start.sh                  # Start all services at once
├── mirror.py                 # Site crawler + local server
├── site_mirror/              # Static mirror of lifewayprograms.org
├── crm/
│   ├── backend/              # FastAPI + SQLite REST API (port 8000)
│   └── frontend/             # React + Tailwind CRM dashboard (port 5173)
├── booking/                  # Public appointment booking app (port 5174)
└── ai_agent/                 # Standalone AI marketing agent CLI
```

---

## Services

| Service | URL | Description |
|---------|-----|-------------|
| CRM Dashboard | http://localhost:5173 | Staff-facing CRM (login required) |
| Public Booking | http://localhost:5174 | Patient-facing appointment booking |
| API | http://localhost:8000 | REST API + Swagger docs at /docs |
| Site Mirror | http://localhost:8080 | Local copy of lifewayprograms.org |

---

## Quick Start

```bash
cd /Users/jeff/Desktop/LP
./start.sh
```

This starts all four services. Default CRM login: `admin` / `lifeway2024`.

---

## CRM Features

- **Clients** — Intake, case management, service tracking, client profiles
- **Appointments** — Schedule, list/calendar view, Google Calendar sync
- **Donations** — Track giving, campaigns, tax receipts, CSV export
- **Staff & Volunteers** — Roles, departments, assignments
- **Tickets** — Call log, inquiry management, comments, priority tracking
- **AI Marketing** — Generate social posts, emails, blog content, Google Ads, content calendars
- **Dark mode** — Toggle in sidebar
- **Global search** — Search clients and tickets across the CRM
- **CSV export** — Clients, appointments, donations, tickets

---

## Public Booking Platform

Patients visit http://localhost:5174 (or the deployed domain) to:
1. Choose a service
2. Choose a provider
3. Pick a date and time
4. Submit their info

On submission, a client record and appointment are automatically created in the CRM.

---

## AI Marketing Agent

The agent uses Claude (Anthropic API) to generate marketing content branded for Lifeway Programs.

**CLI usage:**
```bash
cd ai_agent
python3 agent.py social facebook "mental health awareness"
python3 agent.py email "donation appeal" donors
python3 agent.py blog "community mental health resources"
python3 agent.py lead "mental health services"
python3 agent.py ads "mental health therapy"
python3 agent.py calendar "June 2026"
```

Requires `ANTHROPIC_API_KEY` in `ai_agent/.env`.

---

## Google Calendar Sync

> **PENDING — Complete before/during deployment**
> See `crm/backend/GOOGLE_CALENDAR_SETUP.md` for full instructions.

Appointments created in the CRM (or via the booking site) sync automatically to Google Calendar once configured.

---

## Environment Variables

| File | Variable | Description |
|------|----------|-------------|
| `crm/backend/.env` | `ANTHROPIC_API_KEY` | Enables AI features in CRM |
| `crm/backend/.env` | `GOOGLE_CALENDAR_ID` | Google Calendar to sync to (default: `primary`) |
| `ai_agent/.env` | `ANTHROPIC_API_KEY` | Enables standalone AI agent |

Copy `.env.example` → `.env` in each directory and fill in values.

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Backend | Python 3.9, FastAPI, SQLAlchemy, SQLite |
| Frontend (CRM) | React 18, Vite, Tailwind CSS, Recharts |
| Frontend (Booking) | React 18, Vite, Tailwind CSS |
| AI | Anthropic Claude API (claude-sonnet-4-6) |
| Auth | JWT (python-jose), sha256_crypt |
| Calendar | Google Calendar API v3 |

---

## Deployment Notes

See `CLAUDE.md` for deployment checklist and pending items.
