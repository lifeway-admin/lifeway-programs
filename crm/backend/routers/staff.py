import os
import secrets
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from typing import List, Optional
import models, schemas
from database import get_db
from auth import get_current_user, require_admin, require_staff
from limiter import limiter
from pydantic import BaseModel

router = APIRouter(prefix="/staff", tags=["staff"])

_CRM_BASE_URL = os.getenv("CRM_BASE_URL", "http://localhost:5173")
_CREDENTIALS_FILE_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "google_credentials.json")


# ── Schemas ───────────────────────────────────────────────────────────────────

class InviteRequest(BaseModel):
    email: str
    role: str = "staff"

class AvailabilitySlot(BaseModel):
    day_of_week: int   # 0=Mon … 6=Sun
    start_hour: int    # 0-23
    end_hour: int      # exclusive end

class AvailabilityUpdate(BaseModel):
    slots: List[AvailabilitySlot]


# ── Staff CRUD ────────────────────────────────────────────────────────────────

@router.get("/", response_model=List[schemas.StaffOut])
def list_staff(
    role: Optional[str] = None,
    volunteers_only: bool = False,
    active_only: bool = True,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    q = db.query(models.Staff)
    if active_only:
        q = q.filter(models.Staff.is_active == True)
    if role:
        q = q.filter(models.Staff.role == role)
    if volunteers_only:
        q = q.filter(models.Staff.is_volunteer == True)
    return q.all()


@router.post("/", response_model=schemas.StaffOut, status_code=201)
def create_staff(staff: schemas.StaffCreate, db: Session = Depends(get_db), _=Depends(require_admin)):
    db_staff = models.Staff(**staff.model_dump())
    db.add(db_staff)
    db.commit()
    db.refresh(db_staff)
    return db_staff


@router.get("/{staff_id}", response_model=schemas.StaffOut)
def get_staff(staff_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    staff = db.query(models.Staff).filter(models.Staff.id == staff_id).first()
    if not staff:
        raise HTTPException(status_code=404, detail="Staff member not found")
    return staff


@router.patch("/{staff_id}", response_model=schemas.StaffOut)
def update_staff(staff_id: int, updates: schemas.StaffUpdate, db: Session = Depends(get_db), _=Depends(require_admin)):
    staff = db.query(models.Staff).filter(models.Staff.id == staff_id).first()
    if not staff:
        raise HTTPException(status_code=404, detail="Staff member not found")
    for field, value in updates.model_dump(exclude_unset=True).items():
        setattr(staff, field, value)
    db.commit()
    db.refresh(staff)
    return staff


@router.delete("/{staff_id}", status_code=204)
def delete_staff(staff_id: int, db: Session = Depends(get_db), _=Depends(require_admin)):
    staff = db.query(models.Staff).filter(models.Staff.id == staff_id).first()
    if not staff:
        raise HTTPException(status_code=404, detail="Staff member not found")
    db.delete(staff)
    db.commit()


# ── Invite ────────────────────────────────────────────────────────────────────

@router.post("/invite")
@limiter.limit("20/hour")
def invite_staff(request: Request, body: InviteRequest, db: Session = Depends(get_db), current_user=Depends(require_admin)):
    email = body.email.strip().lower()
    if not email:
        raise HTTPException(status_code=400, detail="Email is required")

    # Expire any previous unused invites for this email
    db.query(models.StaffInvite).filter(
        models.StaffInvite.email == email,
        models.StaffInvite.accepted_at == None,
    ).delete()
    db.commit()

    token = secrets.token_urlsafe(32)
    invite = models.StaffInvite(
        email=email,
        role=body.role,
        token=token,
        invited_by=current_user.full_name or current_user.username,
        expires_at=datetime.now() + timedelta(hours=48),
    )
    db.add(invite)
    db.commit()

    invite_url = f"{_CRM_BASE_URL}/accept-invite/{token}"
    try:
        from email_service import send_staff_invite
        send_staff_invite(
            to_email=email,
            invited_by=current_user.full_name or current_user.username,
            role=body.role,
            invite_url=invite_url,
        )
    except Exception:
        pass

    return {"success": True, "invite_url": invite_url, "expires_at": invite.expires_at.isoformat()}


# ── Availability ──────────────────────────────────────────────────────────────

@router.get("/{staff_id}/availability")
def get_availability(staff_id: int, db: Session = Depends(get_db)):
    """Public — called by the booking page to know a therapist's hours."""
    slots = db.query(models.StaffAvailability).filter(
        models.StaffAvailability.staff_id == staff_id
    ).order_by(models.StaffAvailability.day_of_week, models.StaffAvailability.start_hour).all()
    return [{"day_of_week": s.day_of_week, "start_hour": s.start_hour, "end_hour": s.end_hour} for s in slots]


@router.put("/{staff_id}/availability")
def set_availability(
    staff_id: int,
    body: AvailabilityUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Staff can set their own; admins can set anyone's."""
    staff = db.query(models.Staff).filter(models.Staff.id == staff_id).first()
    if not staff:
        raise HTTPException(status_code=404, detail="Staff member not found")

    # Only admins can change someone else's schedule
    matching_staff = db.query(models.Staff).filter(models.Staff.email == current_user.email).first()
    if current_user.role != "admin" and (not matching_staff or matching_staff.id != staff_id):
        raise HTTPException(status_code=403, detail="You can only edit your own availability")

    # Validate hours
    for s in body.slots:
        if not (0 <= s.day_of_week <= 6):
            raise HTTPException(status_code=400, detail="day_of_week must be 0-6")
        if not (0 <= s.start_hour < s.end_hour <= 24):
            raise HTTPException(status_code=400, detail="start_hour must be < end_hour, both 0-24")

    # Replace all existing availability
    db.query(models.StaffAvailability).filter(models.StaffAvailability.staff_id == staff_id).delete()
    for s in body.slots:
        db.add(models.StaffAvailability(
            staff_id=staff_id,
            day_of_week=s.day_of_week,
            start_hour=s.start_hour,
            end_hour=s.end_hour,
        ))
    db.commit()
    return {"success": True, "slots_saved": len(body.slots)}


# ── Per-therapist Google Calendar OAuth ───────────────────────────────────────

@router.get("/me/google/status")
def my_google_status(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    staff = db.query(models.Staff).filter(models.Staff.email == current_user.email).first()
    if not staff:
        return {"connected": False, "error": "No staff record linked to your account"}
    return {
        "connected": bool(staff.google_refresh_token),
        "calendar_id": staff.google_calendar_id or "primary",
    }


@router.get("/me/google/auth")
def my_google_auth(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Start per-therapist Google OAuth. Encodes staff_id in state param."""
    from pathlib import Path
    creds_file = Path(_CREDENTIALS_FILE_PATH)
    if not creds_file.exists():
        raise HTTPException(status_code=400, detail="google_credentials.json not found. Contact your administrator.")

    staff = db.query(models.Staff).filter(models.Staff.email == current_user.email).first()
    if not staff:
        raise HTTPException(status_code=400, detail="No staff record linked to your account")

    try:
        from google_auth_oauthlib.flow import Flow
        import google_calendar as gcal
        flow = Flow.from_client_secrets_file(
            str(creds_file),
            scopes=gcal.SCOPES,
            redirect_uri=f"{os.getenv('API_BASE_URL', 'http://localhost:8000')}/staff/google/callback",
        )
        state = secrets.token_urlsafe(16) + f".{staff.id}"
        auth_url, _ = flow.authorization_url(prompt="consent", access_type="offline", state=state)
        return RedirectResponse(auth_url)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/google/callback")
def staff_google_callback(code: str, state: str, db: Session = Depends(get_db)):
    """Receives Google OAuth callback; stores refresh token on the Staff record."""
    from pathlib import Path
    creds_file = Path(_CREDENTIALS_FILE_PATH)
    if not creds_file.exists():
        raise HTTPException(status_code=400, detail="Credentials file missing")

    # Decode staff_id from state
    try:
        staff_id = int(state.rsplit(".", 1)[-1])
    except (ValueError, IndexError):
        raise HTTPException(status_code=400, detail="Invalid state parameter")

    staff = db.query(models.Staff).filter(models.Staff.id == staff_id).first()
    if not staff:
        raise HTTPException(status_code=404, detail="Staff member not found")

    try:
        from google_auth_oauthlib.flow import Flow
        import google_calendar as gcal
        flow = Flow.from_client_secrets_file(
            str(creds_file),
            scopes=gcal.SCOPES,
            redirect_uri=f"{os.getenv('API_BASE_URL', 'http://localhost:8000')}/staff/google/callback",
        )
        flow.fetch_token(code=code)
        creds = flow.credentials
        import json
        staff.google_refresh_token = creds.to_json()
        db.commit()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return RedirectResponse(f"{_CRM_BASE_URL}/my-schedule?calendar=connected")


@router.delete("/me/google/disconnect")
def my_google_disconnect(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    staff = db.query(models.Staff).filter(models.Staff.email == current_user.email).first()
    if not staff:
        raise HTTPException(status_code=404, detail="Staff member not found")
    staff.google_refresh_token = None
    staff.google_calendar_id = None
    db.commit()
    return {"disconnected": True}
