import html
import hmac
import os
import pytz
from fastapi import APIRouter, Depends, Header, HTTPException, Query, Request
from fastapi.responses import PlainTextResponse
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, date, timedelta
from pydantic import BaseModel
import secrets
import string
import models
import schemas
from database import get_db
from limiter import limiter
from security_utils import safe_join
from auth import password_strength_check

_FORMS_DIR = os.path.normpath(
    os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), "docs", "patient-forms")
)

router = APIRouter(prefix="/public", tags=["public"])

# ── Schemas ───────────────────────────────────────────────────────────────────

class ServiceOut(BaseModel):
    id: str
    label: str
    description: str
    icon: str

class ProviderOut(BaseModel):
    id: int
    first_name: str
    last_name: str
    title: Optional[str]
    role: str
    bio: Optional[str]

class SlotOut(BaseModel):
    time: str
    datetime: str
    available: bool

class BookingRequest(BaseModel):
    first_name: str
    last_name: str
    email: str
    phone: Optional[str] = None
    date_of_birth: Optional[date] = None
    insurance: Optional[str] = None
    service: str
    staff_id: Optional[int] = None
    appointment_datetime: datetime
    notes: Optional[str] = None
    is_telehealth: bool = False

class BookingResponse(BaseModel):
    success: bool
    confirmation_number: str
    client_id: int
    appointment_id: int
    appointment_datetime: str
    zoom_join_url: Optional[str] = None


# ── Static services list ──────────────────────────────────────────────────────

SERVICES = [
    {"id": "mental_health", "label": "Mental Health", "description": "Therapy and counseling support", "icon": "brain"},
    {"id": "medical", "label": "Medical Care", "description": "Primary care, wellness, and IV therapy", "icon": "heart-pulse"},
    {"id": "social", "label": "Social Services", "description": "Case management, housing, and resource support", "icon": "users"},
    {"id": "spiritual", "label": "Spiritual Support", "description": "Faith-based counseling and prayer", "icon": "sun"},
    {"id": "employment", "label": "Employment Support", "description": "Job placement and career coaching", "icon": "briefcase"},
    {"id": "food", "label": "Food Support", "description": "Food assistance and nutrition programs", "icon": "apple"},
    {"id": "wellness", "label": "Wellness", "description": "Holistic health and IV therapy", "icon": "activity"},
]

SERVICE_TO_ROLE = {
    "mental_health": "therapist",
    "medical": "physician",
    "social": "social_worker",
    "wellness": "physician",
}


# ── Business hours (live chat) ─────────────────────────────────────────────────

BUSINESS_TIMEZONE = pytz.timezone("America/New_York")
BUSINESS_HOURS = {  # 0=Monday ... 6=Sunday; None = closed all day
    0: (9, 17), 1: (9, 17), 2: (9, 17), 3: (9, 17), 4: (9, 17), 5: None, 6: None,
}
BUSINESS_HOURS_TEXT = {
    "en": "Monday-Friday, 9am-5pm ET",
    "es": "Lunes a Viernes, 9am-5pm hora del Este",
}


def _is_within_business_hours() -> bool:
    now = datetime.now(BUSINESS_TIMEZONE)
    hours = BUSINESS_HOURS.get(now.weekday())
    if hours is None:
        return False
    start, end = hours
    return start <= now.hour < end


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.get("/services", response_model=List[ServiceOut])
def get_services():
    return SERVICES


@router.get("/providers", response_model=List[ProviderOut])
def get_providers(service: Optional[str] = None, db: Session = Depends(get_db)):
    q = db.query(models.Staff).filter(
        models.Staff.is_active == True,
        models.Staff.is_volunteer == False,
    )
    if service and service in SERVICE_TO_ROLE:
        role = SERVICE_TO_ROLE[service]
        q = q.filter(models.Staff.role == role)
    # For unmapped services, return all active non-volunteer staff
    providers = q.order_by(models.Staff.last_name).all()
    return [
        ProviderOut(
            id=p.id,
            first_name=p.first_name,
            last_name=p.last_name,
            title=p.title,
            role=p.role,
            bio=p.bio,
        )
        for p in providers
    ]


@router.get("/slots", response_model=List[SlotOut])
def get_slots(
    staff_id: int = Query(...),
    date: str = Query(..., description="YYYY-MM-DD"),
    db: Session = Depends(get_db),
):
    try:
        target_date = datetime.strptime(date, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD.")

    # Determine allowed hours from staff availability schedule (0=Mon…6=Sun)
    day_of_week = target_date.weekday()
    avail_rows = db.query(models.StaffAvailability).filter(
        models.StaffAvailability.staff_id == staff_id,
        models.StaffAvailability.day_of_week == day_of_week,
    ).all()

    if avail_rows:
        # Union of all availability windows for that day
        available_hours: set[int] = set()
        for row in avail_rows:
            available_hours.update(range(row.start_hour, row.end_hour))
    else:
        # No schedule set — fall back to default 8am–5pm
        available_hours = set(range(8, 17))

    # Fetch existing appointments for that staff on that date (not cancelled)
    day_start = datetime.combine(target_date, datetime.min.time())
    day_end = datetime.combine(target_date, datetime.max.time())

    booked = db.query(models.Appointment).filter(
        models.Appointment.staff_id == staff_id,
        models.Appointment.appointment_date >= day_start,
        models.Appointment.appointment_date <= day_end,
        models.Appointment.status != "cancelled",
    ).all()
    booked_hours = {a.appointment_date.hour for a in booked}

    # Check per-therapist Google Calendar if they've linked one
    gcal_busy: set[int] = set()
    staff = db.query(models.Staff).filter(models.Staff.id == staff_id).first()
    if staff and staff.google_refresh_token:
        try:
            import google_calendar as gcal
            gcal_busy = gcal.get_staff_busy_hours(staff.google_refresh_token, target_date)
        except Exception:
            pass

    slots = []
    for hour in sorted(available_hours):
        slot_dt = datetime.combine(target_date, datetime.min.time()).replace(hour=hour, minute=0, second=0)
        is_available = hour not in booked_hours and hour not in gcal_busy
        slots.append(SlotOut(
            time=slot_dt.strftime("%H:%M"),
            datetime=slot_dt.isoformat(),
            available=is_available,
        ))

    return slots


_CONFNUM_CHARS = string.ascii_uppercase + string.digits


def _generate_confirmation_number(db) -> str:
    for _ in range(10):
        candidate = "LW-" + "".join(secrets.choice(_CONFNUM_CHARS) for _ in range(12))
        exists = db.query(models.Appointment).filter(
            models.Appointment.confirmation_number == candidate
        ).first()
        if not exists:
            return candidate
    raise RuntimeError("Could not generate a unique confirmation number")


@router.post("/book", response_model=BookingResponse, status_code=201)
@limiter.limit("20/hour")
def book_appointment(request: Request, body: BookingRequest, db: Session = Depends(get_db)):
    # Reject past-dated appointments
    if body.appointment_datetime <= datetime.now():
        raise HTTPException(status_code=400, detail="Appointment must be scheduled in the future")

    # 1. Find or create client — normalize email to lowercase
    normalized_email = body.email.strip().lower()
    client = None
    if normalized_email:
        client = db.query(models.Client).filter(models.Client.email == normalized_email).first()

    if not client:
        client = models.Client(
            first_name=body.first_name,
            last_name=body.last_name,
            email=normalized_email,
            phone=body.phone,
            date_of_birth=body.date_of_birth,
            insurance=body.insurance,
            primary_service=body.service,
            case_status="active",
        )
        db.add(client)
        db.commit()
        db.refresh(client)
    else:
        # Update any new info provided
        if body.phone and not client.phone:
            client.phone = body.phone
        if body.insurance and not client.insurance:
            client.insurance = body.insurance
        if body.date_of_birth and not client.date_of_birth:
            client.date_of_birth = body.date_of_birth
        db.commit()
        db.refresh(client)

    # 2. Determine staff_id — if None, pick any active non-volunteer staff
    staff_id = body.staff_id
    if not staff_id:
        role = SERVICE_TO_ROLE.get(body.service)
        q = db.query(models.Staff).filter(
            models.Staff.is_active == True,
            models.Staff.is_volunteer == False,
        )
        if role:
            q = q.filter(models.Staff.role == role)
        staff_member = q.first()
        if staff_member:
            staff_id = staff_member.id

    # 3. Create appointment
    appointment = models.Appointment(
        client_id=client.id,
        staff_id=staff_id,
        appointment_date=body.appointment_datetime,
        duration_minutes=60,
        service_type=body.service,
        appointment_type="intake",
        status="scheduled",
        notes=body.notes,
        is_telehealth=body.is_telehealth,
    )
    db.add(appointment)
    db.commit()
    db.refresh(appointment)

    # 4. Generate and persist a unique confirmation number
    confirmation_number = _generate_confirmation_number(db)
    appointment.confirmation_number = confirmation_number
    db.commit()

    # 5. Create Zoom meeting if telehealth
    zoom_join_url = None
    if body.is_telehealth:
        try:
            import zoom_service
            patient_name_str = f"{body.first_name} {body.last_name}"
            topic = f"Telehealth — {patient_name_str} ({confirmation_number})"
            join_url, meeting_id = zoom_service.create_meeting(topic, body.appointment_datetime, 60)
            if join_url:
                zoom_join_url = join_url
                appointment.zoom_join_url = join_url
                appointment.zoom_meeting_id = meeting_id
                db.commit()
        except Exception as e:
            pass

    # 6. Look up provider name for notifications
    provider_name = "To Be Assigned"
    if staff_id:
        s = db.query(models.Staff).filter(models.Staff.id == staff_id).first()
        if s:
            provider_name = f"{s.title + ' ' if s.title else ''}{s.first_name} {s.last_name}"

    appt_dt_str = body.appointment_datetime.strftime("%A, %B %d, %Y at %I:%M %p")
    patient_name = f"{body.first_name} {body.last_name}"

    # 7. Send confirmation email
    try:
        from email_service import send_booking_confirmation
        send_booking_confirmation(
            to_email=normalized_email,
            patient_name=patient_name,
            confirmation_number=confirmation_number,
            appointment_datetime=appt_dt_str,
            service=body.service,
            provider=provider_name,
            zoom_join_url=zoom_join_url,
        )
    except Exception:
        pass

    # 8. Send confirmation SMS
    try:
        from sms_service import send_booking_confirmation_sms
        if body.phone:
            send_booking_confirmation_sms(
                to_phone=body.phone,
                patient_name=patient_name,
                confirmation_number=confirmation_number,
                appointment_datetime=appt_dt_str,
                provider=provider_name,
                zoom_join_url=zoom_join_url,
            )
    except Exception:
        pass

    return BookingResponse(
        success=True,
        confirmation_number=confirmation_number,
        client_id=client.id,
        appointment_id=appointment.id,
        appointment_datetime=body.appointment_datetime.isoformat(),
        zoom_join_url=zoom_join_url,
    )


# ── Public intake (no appointment) ────────────────────────────────────────────

class IntakeRequest(BaseModel):
    first_name: str
    last_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    primary_service: Optional[str] = None
    notes: Optional[str] = None


class AppointmentLookupRequest(BaseModel):
    confirmation: str


@router.post("/lookup")
@limiter.limit("5/minute")
def lookup_appointment(request: Request, body: AppointmentLookupRequest, db: Session = Depends(get_db)):
    """Look up an appointment by confirmation number (e.g. LW-123456)."""
    normalized = body.confirmation.strip().upper()
    if not normalized.startswith("LW-"):
        raise HTTPException(status_code=404, detail="Invalid confirmation number format")

    appt = (
        db.query(models.Appointment)
        .filter(models.Appointment.confirmation_number == normalized)
        .first()
    )
    if not appt:
        raise HTTPException(status_code=404, detail="No appointment found with that confirmation number")

    client = db.query(models.Client).filter(models.Client.id == appt.client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="No appointment found")

    return {
        "client_name": f"{client.first_name} {client.last_name}",
        "appointment_id": appt.id,
        "appointment_date": str(appt.appointment_date),
        "service_type": appt.service_type or appt.appointment_type,
        "status": appt.status,
        "confirmation_number": normalized,
    }


class PatientLookupRequest(BaseModel):
    email: str
    dob: str


@router.post("/patient-lookup")
@limiter.limit("10/minute")
def patient_lookup(
    request: Request,
    body: PatientLookupRequest,
    db: Session = Depends(get_db),
):
    """Look up a patient by email + DOB to pre-fill the public booking form.
    Requires both factors to match — a client record with no DOB on file
    cannot be looked up this way (there'd be nothing to verify against)."""
    from sqlalchemy import func as sa_func
    client = db.query(models.Client).filter(
        sa_func.lower(models.Client.email) == body.email.strip().lower()
    ).first()
    # Generic error — don't reveal whether email exists
    not_found = HTTPException(status_code=404, detail="No record found. Please check your email and date of birth.")
    if not client:
        raise not_found
    # DOB is always required and must match — no fallback to email-only match
    if not client.date_of_birth:
        raise not_found
    try:
        provided = date.fromisoformat(body.dob.strip())
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD.")
    if provided != client.date_of_birth:
        raise not_found
    return {
        "first_name": client.first_name or "",
        "last_name": client.last_name or "",
        "email": client.email or "",
        "phone": client.phone or "",
        "date_of_birth": str(client.date_of_birth) if client.date_of_birth else "",
        "insurance": client.insurance or "",
        "notes": "",
    }


@router.get("/forms-content/{filename}", response_class=PlainTextResponse)
@limiter.limit("60/minute")
def get_form_content(request: Request, filename: str):
    """Serve patient form markdown for the in-browser signing flow."""
    if not filename.endswith(".md"):
        raise HTTPException(status_code=400, detail="Invalid filename")
    try:
        path = safe_join(_FORMS_DIR, filename)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid filename")
    if not os.path.isfile(path):
        raise HTTPException(status_code=404, detail="Form not found")
    with open(path, "r", encoding="utf-8") as f:
        return f.read()


class SignatureItem(BaseModel):
    form_filename: str
    form_title: str
    signer_name: str


class SignFormsRequest(BaseModel):
    client_id: int
    appointment_id: int
    signatures: List[SignatureItem]
    patient_email: str
    patient_name: str


@router.post("/sign-forms")
@limiter.limit("10/hour")
def sign_forms(request: Request, body: SignFormsRequest, db: Session = Depends(get_db)):
    # Verify client exists and that the provided email matches the record
    client = db.query(models.Client).filter(models.Client.id == body.client_id).first()
    if not client:
        raise HTTPException(status_code=400, detail="Invalid request")
    # Email verification is mandatory — must match what's on file (case-insensitive)
    if not client.email or client.email.strip().lower() != body.patient_email.strip().lower():
        raise HTTPException(status_code=400, detail="Invalid request")

    # appointment_id is mandatory and must belong to this client
    appt = db.query(models.Appointment).filter(
        models.Appointment.id == body.appointment_id,
        models.Appointment.client_id == body.client_id,
    ).first()
    if not appt:
        raise HTTPException(status_code=400, detail="Invalid request")

    signer_ip = request.client.host if request.client else None
    signed_at = datetime.now().strftime("%B %d, %Y at %I:%M %p")
    saved = []
    sig_details = []
    for sig in body.signatures:
        fs = models.FormSignature(
            client_id=body.client_id,
            appointment_id=body.appointment_id,
            form_filename=sig.form_filename,
            form_title=sig.form_title,
            signer_name=sig.signer_name,
            signer_ip=signer_ip,
        )
        db.add(fs)
        saved.append({"form_title": sig.form_title})
        sig_details.append({"form_title": sig.form_title, "signer_name": sig.signer_name})
    db.commit()

    if saved:
        try:
            from pdf_service import generate_signing_certificate
            pdf_bytes = generate_signing_certificate(
                patient_name=body.patient_name,
                signed_at=signed_at,
                signer_ip=signer_ip or "Not recorded",
                signatures=sig_details,
            )
        except Exception:
            pdf_bytes = None

        try:
            from email_service import send_signed_forms_receipt
            send_signed_forms_receipt(
                to_email=body.patient_email,
                patient_name=body.patient_name,
                signed_forms=saved,
                signed_at=signed_at,
                pdf_bytes=pdf_bytes if pdf_bytes else None,
            )
        except Exception:
            pass

    return {"success": True, "signed_count": len(saved)}


class ContactRequest(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    subject: Optional[str] = None
    message: str


@router.post("/contact")
@limiter.limit("5/hour")
def contact_form(request: Request, body: ContactRequest):
    """Receives website contact form submissions and forwards to staff inbox."""
    try:
        from email_service import _send
        safe_name = html.escape(body.name)
        safe_email = html.escape(body.email)
        safe_phone = html.escape(body.phone) if body.phone else None
        safe_subject = html.escape(body.subject) if body.subject else None
        safe_message = html.escape(body.message)
        subject_line = f"[Contact Form] {safe_subject or 'General Inquiry'} — {safe_name}"
        email_html = f"""
        <div style="font-family:sans-serif;max-width:600px;color:#1f2937;">
          <h2 style="color:#e91e8c;">New Contact Form Submission</h2>
          <table style="width:100%;border-collapse:collapse;font-size:14px;">
            <tr><td style="padding:8px 0;color:#6b7280;border-bottom:1px solid #f3f4f6;width:120px;">Name</td>
                <td style="padding:8px 0;font-weight:600;border-bottom:1px solid #f3f4f6;">{safe_name}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280;border-bottom:1px solid #f3f4f6;">Email</td>
                <td style="padding:8px 0;font-weight:600;border-bottom:1px solid #f3f4f6;">{safe_email}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280;border-bottom:1px solid #f3f4f6;">Phone</td>
                <td style="padding:8px 0;font-weight:600;border-bottom:1px solid #f3f4f6;">{safe_phone or '—'}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280;border-bottom:1px solid #f3f4f6;">Topic</td>
                <td style="padding:8px 0;font-weight:600;border-bottom:1px solid #f3f4f6;">{safe_subject or '—'}</td></tr>
          </table>
          <div style="margin-top:20px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px;">
            <p style="margin:0 0 8px;font-size:12px;text-transform:uppercase;color:#9ca3af;letter-spacing:1px;">Message</p>
            <p style="margin:0;font-size:14px;white-space:pre-wrap;">{safe_message}</p>
          </div>
          <p style="margin-top:16px;font-size:12px;color:#9ca3af;">Sent via lifewayprograms.org contact form</p>
        </div>"""
        import os
        staff_inbox = os.getenv("SMTP_FROM_EMAIL", "")
        if staff_inbox:
            _send(staff_inbox, subject_line, email_html)
    except Exception:
        pass
    return {"success": True}


class InviteAcceptRequest(BaseModel):
    first_name: str
    last_name: str
    username: str
    password: str


@router.get("/invite/{token}")
@limiter.limit("20/minute")
def get_invite(request: Request, token: str, db: Session = Depends(get_db)):
    """Validate an invite token and return the associated email/role."""
    invite = db.query(models.StaffInvite).filter(
        models.StaffInvite.token == token,
        models.StaffInvite.accepted_at == None,
    ).first()
    if not invite:
        raise HTTPException(status_code=404, detail="Invitation not found or already used")
    if invite.expires_at < datetime.now():
        raise HTTPException(status_code=410, detail="This invitation has expired")
    return {"email": invite.email, "role": invite.role, "invited_by": invite.invited_by}


@router.post("/invite/{token}/accept")
@limiter.limit("10/hour")
def accept_invite(request: Request, token: str, body: InviteAcceptRequest, db: Session = Depends(get_db)):
    """Complete account setup from an invite link."""
    invite = db.query(models.StaffInvite).filter(
        models.StaffInvite.token == token,
        models.StaffInvite.accepted_at == None,
    ).first()
    if not invite:
        raise HTTPException(status_code=404, detail="Invitation not found or already used")
    if invite.expires_at < datetime.now():
        raise HTTPException(status_code=410, detail="This invitation has expired")

    # Enforce the same password policy used everywhere else in the app
    password_strength_check(body.password)

    # Check username / email uniqueness
    if db.query(models.User).filter(models.User.username == body.username).first():
        raise HTTPException(status_code=400, detail="Username already taken")
    if db.query(models.User).filter(models.User.email == invite.email).first():
        raise HTTPException(status_code=400, detail="An account with this email already exists")

    # Atomically claim the invite before creating the account — closes a race
    # where two concurrent requests both pass the accepted_at==None check above
    # and each create an account from the same single-use invite.
    claimed = db.query(models.StaffInvite).filter(
        models.StaffInvite.id == invite.id,
        models.StaffInvite.accepted_at == None,
    ).update({"accepted_at": datetime.now()})
    if not claimed:
        db.rollback()
        raise HTTPException(status_code=404, detail="Invitation not found or already used")

    from passlib.context import CryptContext
    _bcrypt = CryptContext(schemes=["bcrypt"], deprecated="auto")
    hashed = _bcrypt.hash(body.password)
    user = models.User(
        username=body.username,
        email=invite.email,
        hashed_password=hashed,
        full_name=f"{body.first_name} {body.last_name}",
        role=invite.role,
        is_active=True,
    )
    db.add(user)
    db.commit()

    return {"success": True, "message": "Account created. You can now log in."}


@router.post("/intake")
@limiter.limit("10/hour")
def public_intake(request: Request, req: IntakeRequest, db: Session = Depends(get_db)):
    client = models.Client(
        first_name=req.first_name,
        last_name=req.last_name,
        email=req.email,
        phone=req.phone,
        primary_service=req.primary_service,
        notes=req.notes,
        case_status="active",
    )
    db.add(client)
    db.commit()
    db.refresh(client)
    return {"id": client.id, "name": f"{client.first_name} {client.last_name}", "message": "Your information has been received. We will contact you shortly."}


# ── Stripe Donations ───────────────────────────────────────────────────────────

class DonateRequest(BaseModel):
    amount_cents: int          # e.g. 2500 = $25.00
    donor_name: Optional[str] = None
    donor_email: Optional[str] = None
    campaign: Optional[str] = "general"


@router.post("/donate/checkout")
@limiter.limit("20/hour")
def create_donation_checkout(request: Request, body: DonateRequest):
    """Create a Stripe Checkout session for a donation."""
    import os
    stripe_key = os.getenv("STRIPE_SECRET_KEY", "")
    if not stripe_key:
        raise HTTPException(status_code=503, detail="Online donations are not configured yet.")

    if body.amount_cents < 100:
        raise HTTPException(status_code=400, detail="Minimum donation is $1.00")
    if body.amount_cents > 100_000_00:
        raise HTTPException(status_code=400, detail="Maximum donation is $100,000")

    try:
        import stripe
        stripe.api_key = stripe_key

        success_url = os.getenv("STRIPE_SUCCESS_URL", "http://localhost:5174/donate/thank-you")
        cancel_url = os.getenv("STRIPE_CANCEL_URL", "http://localhost:5174")

        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[{
                "price_data": {
                    "currency": "usd",
                    "product_data": {
                        "name": "Donation — Lifeway Programs",
                        "description": "Your donation helps provide mental health, medical, and social services to our community.",
                    },
                    "unit_amount": body.amount_cents,
                },
                "quantity": 1,
            }],
            mode="payment",
            success_url=success_url + "?session_id={CHECKOUT_SESSION_ID}",
            cancel_url=cancel_url,
            customer_email=body.donor_email or None,
            metadata={
                "donor_name": body.donor_name or "",
                "donor_email": body.donor_email or "",
                "campaign": body.campaign or "general",
            },
        )
        return {"checkout_url": session.url, "session_id": session.id}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Could not create checkout session.")


@router.post("/stripe/webhook")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    """Handle Stripe webhook events. Records completed donations in the DB."""
    import os
    stripe_key = os.getenv("STRIPE_SECRET_KEY", "")
    webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET", "")
    if not stripe_key:
        raise HTTPException(status_code=503, detail="Stripe not configured")

    if not webhook_secret:
        # Fail closed: without a webhook secret we cannot verify the payload
        # actually came from Stripe, so refuse rather than trusting it blindly.
        raise HTTPException(status_code=503, detail="Webhook signing secret not configured")

    payload = await request.body()
    sig_header = request.headers.get("stripe-signature", "")

    try:
        import stripe
        stripe.api_key = stripe_key
        event = stripe.Webhook.construct_event(payload, sig_header, webhook_secret)
    except Exception:
        raise HTTPException(status_code=400, detail="Webhook signature verification failed")

    if event.get("type") == "checkout.session.completed":
        session = event["data"]["object"]
        meta = session.get("metadata", {})
        amount_cents = session.get("amount_total", 0)
        payment_type = meta.get("payment_type", "donation")

        if payment_type == "service_fee":
            client_name = meta.get("client_name") or "Unknown Client"
            donor_email = None
            client_id_str = meta.get("client_id")
            if client_id_str:
                try:
                    client_obj = db.query(models.Client).filter(models.Client.id == int(client_id_str)).first()
                    if client_obj:
                        donor_email = client_obj.email
                except Exception:
                    pass
            donation = models.Donation(
                donor_name=client_name,
                donor_email=donor_email,
                amount=round(amount_cents / 100, 2),
                donation_type="one_time",
                campaign="service_fee",
                payment_method="stripe",
                notes=meta.get("description", ""),
            )
        else:
            donor_name = meta.get("donor_name") or "Anonymous"
            donor_email = meta.get("donor_email") or None
            campaign = meta.get("campaign") or "general"
            donation = models.Donation(
                donor_name=donor_name,
                donor_email=donor_email,
                amount=round(amount_cents / 100, 2),
                donation_type="one_time",
                campaign=campaign,
                payment_method="stripe",
                is_anonymous=(not donor_name or donor_name == "Anonymous"),
            )

        db.add(donation)
        db.commit()

    return {"received": True}


# ── Live Chat (visitor) ────────────────────────────────────────────────────────

def _get_chat_session_or_404(db: Session, session_id: int) -> models.ChatSession:
    session = db.query(models.ChatSession).filter(models.ChatSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Chat session not found")
    return session


def _verify_visitor_token(session: models.ChatSession, provided: Optional[str]):
    if not provided or not hmac.compare_digest(session.visitor_token, provided):
        raise HTTPException(status_code=403, detail="Invalid chat session token")


@router.get("/chat/hours")
@limiter.limit("60/minute")
def chat_hours(request: Request, lang: str = "en"):
    hours_text = BUSINESS_HOURS_TEXT.get(lang, BUSINESS_HOURS_TEXT["en"])
    return {"is_open": _is_within_business_hours(), "hours_text": hours_text}


@router.post("/chat/sessions", response_model=schemas.ChatSessionStartOut, status_code=201)
@limiter.limit("10/hour")
def start_chat_session(
    request: Request,
    body: schemas.ChatSessionStart,
    db: Session = Depends(get_db),
):
    session = models.ChatSession(
        visitor_token=secrets.token_urlsafe(32),
        visitor_name=body.visitor_name,
        visitor_email=body.visitor_email,
        status="waiting",
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return schemas.ChatSessionStartOut(
        session_id=session.id,
        visitor_token=session.visitor_token,
        status=session.status,
    )


@router.get("/chat/sessions/{session_id}", response_model=schemas.ChatSessionOut)
@limiter.limit("120/minute")
def get_chat_session_status(
    request: Request,
    session_id: int,
    x_chat_token: Optional[str] = Header(None),
    db: Session = Depends(get_db),
):
    session = _get_chat_session_or_404(db, session_id)
    _verify_visitor_token(session, x_chat_token)
    out = schemas.ChatSessionOut.model_validate(session)
    out.visitor_email = None  # not needed by the widget; keep the field staff-only
    if session.assigned_staff:
        out.assigned_staff_name = session.assigned_staff.first_name
    return out


@router.post("/chat/sessions/{session_id}/messages", response_model=schemas.ChatMessageOut, status_code=201)
@limiter.limit("30/minute")
def send_visitor_chat_message(
    request: Request,
    session_id: int,
    body: schemas.ChatMessageCreate,
    x_chat_token: Optional[str] = Header(None),
    db: Session = Depends(get_db),
):
    session = _get_chat_session_or_404(db, session_id)
    _verify_visitor_token(session, x_chat_token)
    if session.status == "closed":
        raise HTTPException(status_code=400, detail="This conversation has ended")

    message = models.ChatMessage(
        session_id=session.id,
        sender_role="visitor",
        sender_name=session.visitor_name,
        content=body.content,
    )
    db.add(message)
    session.last_message_at = datetime.utcnow()
    db.commit()
    db.refresh(message)
    return message


@router.get("/chat/sessions/{session_id}/messages", response_model=List[schemas.ChatMessageOut])
@limiter.limit("120/minute")
def poll_visitor_chat_messages(
    request: Request,
    session_id: int,
    after_id: int = Query(0, ge=0, le=9223372036854775807),
    x_chat_token: Optional[str] = Header(None),
    db: Session = Depends(get_db),
):
    session = _get_chat_session_or_404(db, session_id)
    _verify_visitor_token(session, x_chat_token)
    return (
        db.query(models.ChatMessage)
        .filter(models.ChatMessage.session_id == session_id, models.ChatMessage.id > after_id)
        .order_by(models.ChatMessage.id)
        .all()
    )
