import os
import base64
from datetime import datetime
from typing import Optional, Tuple

ZOOM_ACCOUNT_ID = os.getenv("ZOOM_ACCOUNT_ID", "")
ZOOM_CLIENT_ID = os.getenv("ZOOM_CLIENT_ID", "")
ZOOM_CLIENT_SECRET = os.getenv("ZOOM_CLIENT_SECRET", "")


def _get_token() -> Optional[str]:
    if not ZOOM_ACCOUNT_ID or not ZOOM_CLIENT_ID or not ZOOM_CLIENT_SECRET:
        return None
    try:
        import requests
        creds = base64.b64encode(f"{ZOOM_CLIENT_ID}:{ZOOM_CLIENT_SECRET}".encode()).decode()
        resp = requests.post(
            f"https://zoom.us/oauth/token?grant_type=account_credentials&account_id={ZOOM_ACCOUNT_ID}",
            headers={"Authorization": f"Basic {creds}"},
            timeout=10,
        )
        resp.raise_for_status()
        return resp.json().get("access_token")
    except Exception as e:
        pass
        return None


def create_meeting(topic: str, start_dt: datetime, duration_minutes: int = 60) -> Tuple[Optional[str], Optional[str]]:
    """Create a Zoom meeting. Returns (join_url, meeting_id) or (None, None)."""
    token = _get_token()
    if not token:
        return None, None
    try:
        import requests
        # Zoom expects UTC ISO 8601
        start_iso = start_dt.strftime("%Y-%m-%dT%H:%M:%S")
        resp = requests.post(
            "https://api.zoom.us/v2/users/me/meetings",
            headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
            json={
                "topic": topic,
                "type": 2,  # Scheduled
                "start_time": start_iso,
                "duration": duration_minutes,
                "timezone": "America/New_York",
                "settings": {
                    "host_video": True,
                    "participant_video": True,
                    "waiting_room": True,
                    "join_before_host": False,
                    "audio": "voip",
                },
            },
            timeout=10,
        )
        resp.raise_for_status()
        data = resp.json()
        return data.get("join_url"), str(data.get("id", ""))
    except Exception:
        return None, None


def delete_meeting(meeting_id: str) -> bool:
    """Delete a Zoom meeting (e.g. when appointment is cancelled)."""
    if not meeting_id:
        return False
    token = _get_token()
    if not token:
        return False
    try:
        import requests
        resp = requests.delete(
            f"https://api.zoom.us/v2/meetings/{meeting_id}",
            headers={"Authorization": f"Bearer {token}"},
            timeout=10,
        )
        return resp.status_code == 204
    except Exception:
        return False


def is_configured() -> bool:
    return bool(ZOOM_ACCOUNT_ID and ZOOM_CLIENT_ID and ZOOM_CLIENT_SECRET)
