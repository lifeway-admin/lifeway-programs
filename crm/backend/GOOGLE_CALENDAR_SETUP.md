# Google Calendar Setup

## Steps to connect Google Calendar:

1. Go to https://console.cloud.google.com
2. Create a new project (or select existing)
3. Click "APIs & Services" → "Library"
4. Search "Google Calendar API" → Enable it
5. Click "APIs & Services" → "Credentials"
6. Click "Create Credentials" → "OAuth client ID"
7. Application type: "Desktop app"
8. Name it anything (e.g. "Lifeway CRM")
9. Click "Download JSON"
10. Rename the downloaded file to `google_credentials.json`
11. Move it to: `crm/backend/google_credentials.json`

## Set your calendar ID (optional):

In crm/backend/.env, add:
```
GOOGLE_CALENDAR_ID=your_calendar_id@group.calendar.google.com
```
Leave as "primary" to use your main Google Calendar.

## Authorize the connection:

1. Make sure the CRM backend is running
2. Visit: http://localhost:8000/google/auth (while logged in to CRM)
3. Sign in with Google and grant calendar access
4. You'll see: {"connected": true, "message": "Google Calendar connected successfully!"}

## Check status:

GET http://localhost:8000/google/status

## What syncs:

- Creating an appointment in CRM → creates Google Calendar event
- Updating an appointment → updates the event
- Deleting an appointment → deletes the event
- Event shows: client name, service type, location, 30-min popup + 24-hr email reminders
