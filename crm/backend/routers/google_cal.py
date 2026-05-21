from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import RedirectResponse
from pathlib import Path
import os
from auth import get_current_user
import google_calendar as gcal

router = APIRouter(prefix="/google", tags=["google-calendar"])

CREDENTIALS_FILE = Path(__file__).parent.parent / "google_credentials.json"


@router.get("/status")
def calendar_status(_=Depends(get_current_user)):
    connected = gcal.is_connected()
    creds_exist = CREDENTIALS_FILE.exists()
    return {
        "connected": connected,
        "credentials_file_exists": creds_exist,
        "calendar_id": gcal.CALENDAR_ID,
        "setup_url": "http://localhost:8000/google/auth" if creds_exist and not connected else None,
        "instructions": None if creds_exist else (
            "Download OAuth credentials from Google Cloud Console and save as "
            "crm/backend/google_credentials.json, then visit /google/auth"
        ),
    }


@router.get("/auth")
def google_auth(_=Depends(get_current_user)):
    """Initiate Google OAuth flow."""
    if not CREDENTIALS_FILE.exists():
        raise HTTPException(
            status_code=400,
            detail="google_credentials.json not found. Download from Google Cloud Console."
        )
    try:
        from google_auth_oauthlib.flow import Flow
        flow = Flow.from_client_secrets_file(
            str(CREDENTIALS_FILE),
            scopes=gcal.SCOPES,
            redirect_uri="http://localhost:8000/google/callback",
        )
        auth_url, _ = flow.authorization_url(prompt="consent", access_type="offline")
        return RedirectResponse(auth_url)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/callback")
def google_callback(code: str, _=Depends(get_current_user)):
    """Handle Google OAuth callback, save token."""
    try:
        from google_auth_oauthlib.flow import Flow
        flow = Flow.from_client_secrets_file(
            str(CREDENTIALS_FILE),
            scopes=gcal.SCOPES,
            redirect_uri="http://localhost:8000/google/callback",
        )
        flow.fetch_token(code=code)
        creds = flow.credentials
        gcal.TOKEN_FILE.write_text(creds.to_json())
        return {"connected": True, "message": "Google Calendar connected successfully!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/events")
def upcoming_events(days: int = 7, _=Depends(get_current_user)):
    """Fetch upcoming events from Google Calendar."""
    if not gcal.is_connected():
        raise HTTPException(status_code=400, detail="Google Calendar not connected")
    return {"events": gcal.list_upcoming_events(days)}


@router.delete("/disconnect")
def disconnect(_=Depends(get_current_user)):
    """Remove saved Google token."""
    if gcal.TOKEN_FILE.exists():
        gcal.TOKEN_FILE.unlink()
    return {"disconnected": True}
