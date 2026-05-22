# Lifeway Programs — Project Workspace

Full digital infrastructure for Lifeway Programs: a custom CRM, a public patient booking platform, an AI marketing agent, and a static site mirror.

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
├── booking/                  # Public patient booking app (port 5174)
├── ai_agent/                 # Standalone AI marketing agent CLI
└── docs/                     # Internal documentation
```

---

## Quick Start

```bash
cd /Users/jeff/Desktop/LP
./start.sh
```

Starts all four services. Default CRM login: `admin` / `lifeway2024` (change on first deploy).

---

## Services

| Service | URL | Description |
|---------|-----|-------------|
| CRM Dashboard | http://localhost:5173 | Staff-facing CRM (login required) |
| Public Booking | http://localhost:5174 | Patient-facing appointment booking |
| API | http://localhost:8000 | REST API + Swagger docs at `/docs` |
| Site Mirror | http://localhost:8080 | Local copy of lifewayprograms.org |

---

## CRM Features

### Client Management
- Intake, case management, service tracking
- Client profiles with contact info, insurance, emergency contact, case notes
- Duplicate detection on intake
- Insurance expiry alerts on dashboard
- Birthday alerts dashboard widget
- CSV export

### Appointments
- Create single or recurring appointments (up to 52 occurrences)
- Telehealth mode — auto-creates Zoom meeting on booking
- Google Calendar sync (per-therapist OAuth, pending credentials)
- Confirmation numbers auto-generated
- 24-hour email + SMS reminders via APScheduler
- Today view, staff schedule view, CSV export

### Donations
- Track one-time and recurring giving
- Campaign tagging
- Tax receipt tracking
- Stripe-powered donation page on booking site
- CSV export

### Staff & Volunteers
- Role-based access: `admin`, `staff`, `readonly`
- Staff invite flow — email invite link → accept page → auto-creates CRM login
- Per-therapist weekly availability schedule
- Per-therapist Google Calendar OAuth (connect/disconnect from My Schedule page)
- Volunteer flag

### Tickets / Call Log
- Create tickets linked to clients
- Priority, status, type, channel tracking
- Comments thread per ticket
- Ticket number (auto-generated)
- Stats dashboard

### Payments (Stripe)
- Send payment request links directly to clients from their profile (email + SMS)
- Stripe Checkout sessions for service fees
- Public donation checkout on booking site
- Webhook records completed payments as Donation records

### Zoom Integration
- Auto-create Zoom meetings for telehealth appointments
- Join links in confirmation email + SMS
- Manage Zoom from client profile appointments tab (create / remove)
- Requires `ZOOM_ACCOUNT_ID`, `ZOOM_CLIENT_ID`, `ZOOM_CLIENT_SECRET` in `.env`

### Other
- Dark mode
- Global search (clients + tickets, keyboard shortcut `/`)
- Keyboard navigation shortcuts (`g h`, `g d`, `g c`, etc.)
- HIPAA-oriented audit log for client record access
- Rate limiting on sensitive endpoints (slowapi)
- Security headers middleware
- Session timeout warning
- PDF signing certificate generated on intake form submission
- E-SIGN / UETA compliant electronic signatures

---

## Public Booking Platform

Patients visit http://localhost:5174 to:
1. Choose a service and provider
2. Pick an available date and time (respects therapist schedule + Google Calendar busy times)
3. Choose in-person or telehealth (virtual auto-creates Zoom)
4. Submit contact info and sign intake forms electronically
5. Receive confirmation email + SMS with Zoom link if telehealth

On submission, a client record and appointment are automatically created in the CRM.

---

## AI Marketing Agent

Uses Claude (Anthropic) to generate marketing content branded for Lifeway Programs.
Currently listed under **Under Development** in the CRM sidebar.

**CRM:** `/ai-agent` page in CRM dashboard.

**CLI:**
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

- Appointments created in the CRM or via the booking site sync automatically once configured
- Per-therapist OAuth: each therapist connects their own Google Calendar from the My Schedule page
- Free/busy API used to exclude already-busy slots on the booking site

---

## Environment Variables

All backend variables go in `crm/backend/.env`.

| Variable | Description |
|----------|-------------|
| `ANTHROPIC_API_KEY` | Enables AI features in CRM |
| `GOOGLE_CALENDAR_ID` | Google Calendar to sync to (default: `primary`) |
| `SMTP_HOST` | SMTP server for outbound email |
| `SMTP_PORT` | SMTP port (default: 587) |
| `SMTP_USER` | SMTP login username |
| `SMTP_PASSWORD` | SMTP login password |
| `SMTP_FROM_NAME` | Display name for outbound email |
| `SMTP_FROM_EMAIL` | From address for outbound email |
| `TWILIO_ACCOUNT_SID` | Twilio → Account SID |
| `TWILIO_AUTH_TOKEN` | Twilio → Auth Token |
| `TWILIO_FROM_NUMBER` | Twilio phone number (+1xxxxxxxxxx) |
| `ZOOM_ACCOUNT_ID` | Zoom Marketplace → Server-to-Server OAuth |
| `ZOOM_CLIENT_ID` | Zoom Server-to-Server OAuth app |
| `ZOOM_CLIENT_SECRET` | Zoom Server-to-Server OAuth app |
| `STRIPE_SECRET_KEY` | Stripe Dashboard → Developers → API keys |
| `STRIPE_WEBHOOK_SECRET` | Stripe Dashboard → Webhooks → signing secret |
| `STRIPE_SUCCESS_URL` | e.g. `https://yourdomain.com/donate/thank-you` |
| `STRIPE_CANCEL_URL` | e.g. `https://yourdomain.com` |
| `CRM_BASE_URL` | e.g. `https://crm.yourdomain.com` (for invite links) |
| `API_BASE_URL` | e.g. `https://api.yourdomain.com` (for Google OAuth callbacks) |

`ai_agent/.env` also needs `ANTHROPIC_API_KEY`.

All integrations (Twilio, Zoom, Stripe, Google Calendar) fail silently if not configured — the app continues to work without them.

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Backend | Python 3.11, FastAPI, SQLAlchemy, SQLite (→ PostgreSQL for prod) |
| Frontend (CRM) | React 18, Vite, Tailwind CSS, Recharts, Lucide icons |
| Frontend (Booking) | React 18, Vite, Tailwind CSS |
| AI | Anthropic Claude API (claude-sonnet-4-6) |
| Auth | JWT (python-jose), sha256_crypt, RBAC (admin/staff/readonly) |
| Calendar | Google Calendar API v3 |
| SMS | Twilio REST API |
| Video | Zoom Server-to-Server OAuth |
| Payments | Stripe Checkout Sessions + Webhooks |
| PDF | fpdf2 (signing certificates) |
| Scheduling | APScheduler (appointment reminders) |
| Rate limiting | slowapi |

---

## Deployment Checklist

See `CLAUDE.md` for the full deployment checklist. Key items:

- [ ] Set all environment variables
- [ ] Replace `SECRET_KEY` in `crm/backend/auth.py` with a strong random value
- [ ] Configure Google Calendar credentials (`google_credentials.json`)
- [ ] Change default admin password (`admin` / `lifeway2024`)
- [ ] Update CORS origins in `crm/backend/main.py` to deployed domains
- [ ] Migrate database from SQLite to PostgreSQL
