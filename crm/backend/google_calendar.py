"""
Google Calendar two-way sync for Lifeway CRM appointments.

Setup required:
1. Go to https://console.cloud.google.com
2. Create a project (or use existing)
3. Enable "Google Calendar API"
4. Create OAuth 2.0 credentials (Desktop app type)
5. Download credentials JSON → save as crm/backend/google_credentials.json
6. Set GOOGLE_CALENDAR_ID in crm/backend/.env (e.g. 'primary' or your calendar ID)
7. Visit http://localhost:8000/google/auth to complete OAuth
"""

import os
import json
from pathlib import Path
from datetime import datetime, timedelta
from typing import Optional

CREDENTIALS_FILE = Path(__file__).parent / "google_credentials.json"
TOKEN_FILE = Path(__file__).parent / "google_token.json"
SCOPES = ["https://www.googleapis.com/auth/calendar"]
CALENDAR_ID = os.environ.get("GOOGLE_CALENDAR_ID", "primary")

def get_credentials():
    """Get valid Google credentials, refreshing if needed."""
    try:
        from google.oauth2.credentials import Credentials
        from google.auth.transport.requests import Request
    except ImportError:
        return None

    creds = None
    if TOKEN_FILE.exists():
        creds = Credentials.from_authorized_user_file(str(TOKEN_FILE), SCOPES)

    if creds and creds.expired and creds.refresh_token:
        try:
            creds.refresh(Request())
            TOKEN_FILE.write_text(creds.to_json())
        except Exception:
            creds = None

    return creds if (creds and creds.valid) else None


def get_service():
    """Get Google Calendar service instance."""
    try:
        from googleapiclient.discovery import build
    except ImportError:
        return None

    creds = get_credentials()
    if not creds:
        return None
    return build("calendar", "v3", credentials=creds)


def is_connected() -> bool:
    return get_credentials() is not None


def build_event(appointment, client_name: str, staff_name: str) -> dict:
    """Build a Google Calendar event dict from a CRM appointment."""
    start_dt = appointment.appointment_date
    if isinstance(start_dt, str):
        start_dt = datetime.fromisoformat(start_dt)

    end_dt = start_dt + timedelta(minutes=appointment.duration_minutes or 60)

    description_parts = []
    if appointment.service_type:
        description_parts.append(f"Service: {appointment.service_type.replace('_', ' ').title()}")
    if appointment.appointment_type:
        description_parts.append(f"Type: {appointment.appointment_type}")
    if appointment.notes:
        description_parts.append(f"Notes: {appointment.notes}")
    description_parts.append(f"CRM Appointment ID: {appointment.id}")

    return {
        "summary": f"{client_name} — {appointment.service_type or appointment.appointment_type or 'Appointment'}",
        "description": "\n".join(description_parts),
        "location": appointment.location or "Lifeway Programs",
        "start": {"dateTime": start_dt.isoformat(), "timeZone": "America/New_York"},
        "end": {"dateTime": end_dt.isoformat(), "timeZone": "America/New_York"},
        "colorId": "6",  # Tangerine for Lifeway
        "reminders": {
            "useDefault": False,
            "overrides": [
                {"method": "email", "minutes": 24 * 60},
                {"method": "popup", "minutes": 30},
            ],
        },
    }


def create_event(appointment, client_name: str, staff_name: str) -> Optional[str]:
    """Create a Google Calendar event. Returns event ID or None."""
    service = get_service()
    if not service:
        return None
    try:
        event = build_event(appointment, client_name, staff_name)
        result = service.events().insert(calendarId=CALENDAR_ID, body=event).execute()
        return result.get("id")
    except Exception as e:
        print(f"Google Calendar create error: {e}")
        return None


def update_event(event_id: str, appointment, client_name: str, staff_name: str) -> bool:
    """Update an existing Google Calendar event."""
    service = get_service()
    if not service or not event_id:
        return False
    try:
        event = build_event(appointment, client_name, staff_name)
        service.events().update(calendarId=CALENDAR_ID, eventId=event_id, body=event).execute()
        return True
    except Exception as e:
        print(f"Google Calendar update error: {e}")
        return False


def delete_event(event_id: str) -> bool:
    """Delete a Google Calendar event."""
    service = get_service()
    if not service or not event_id:
        return False
    try:
        service.events().delete(calendarId=CALENDAR_ID, eventId=event_id).execute()
        return True
    except Exception as e:
        print(f"Google Calendar delete error: {e}")
        return False


def get_staff_credentials(google_token_json: str):
    """Build Credentials from a per-staff stored token JSON string."""
    try:
        from google.oauth2.credentials import Credentials
        from google.auth.transport.requests import Request
        import json
        data = json.loads(google_token_json)
        creds = Credentials.from_authorized_user_info(data, SCOPES)
        if creds.expired and creds.refresh_token:
            creds.refresh(Request())
        return creds if creds.valid else None
    except Exception:
        return None


def get_staff_busy_hours(google_token_json: str, target_date) -> set:
    """Return a set of hours (0-23) that are busy on target_date for a specific therapist."""
    try:
        from googleapiclient.discovery import build
        from datetime import date as _date
        import pytz

        creds = get_staff_credentials(google_token_json)
        if not creds:
            return set()
        service = build("calendar", "v3", credentials=creds)

        tz = pytz.timezone("America/New_York")
        if isinstance(target_date, _date):
            from datetime import datetime as _dt
            day_start = tz.localize(_dt.combine(target_date, _dt.min.time()))
            day_end = tz.localize(_dt.combine(target_date, _dt.max.time()))
        else:
            day_start = target_date
            day_end = target_date

        result = service.freebusy().query(body={
            "timeMin": day_start.isoformat(),
            "timeMax": day_end.isoformat(),
            "items": [{"id": "primary"}],
        }).execute()

        busy = result.get("calendars", {}).get("primary", {}).get("busy", [])
        busy_hours = set()
        for period in busy:
            from datetime import datetime as _dt
            start = _dt.fromisoformat(period["start"].replace("Z", "+00:00")).astimezone(tz)
            end = _dt.fromisoformat(period["end"].replace("Z", "+00:00")).astimezone(tz)
            h = start.hour
            while h < end.hour or (h == end.hour and end.minute > 0):
                busy_hours.add(h)
                h += 1
        return busy_hours
    except Exception as e:
        print(f"Google Calendar free/busy error: {e}")
        return set()


def list_upcoming_events(days: int = 7) -> list:
    """Fetch upcoming events from Google Calendar."""
    service = get_service()
    if not service:
        return []
    try:
        now = datetime.utcnow().isoformat() + "Z"
        until = (datetime.utcnow() + timedelta(days=days)).isoformat() + "Z"
        result = service.events().list(
            calendarId=CALENDAR_ID,
            timeMin=now,
            timeMax=until,
            maxResults=50,
            singleEvents=True,
            orderBy="startTime",
        ).execute()
        return result.get("items", [])
    except Exception as e:
        print(f"Google Calendar list error: {e}")
        return []
