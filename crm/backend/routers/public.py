from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, date, timedelta
from pydantic import BaseModel
import random
import string
import models
from database import get_db

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

class BookingResponse(BaseModel):
    success: bool
    confirmation_number: str
    client_id: int
    appointment_id: int
    appointment_datetime: str


# ── Static services list ──────────────────────────────────────────────────────

SERVICES = [
    {"id": "mental_health", "label": "Mental Health", "description": "Therapy, counseling, and psychiatric support", "icon": "brain"},
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

    # Generate 8am–5pm 1-hour slots
    slot_hours = list(range(8, 17))  # 8, 9, 10, ..., 16

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

    slots = []
    for hour in slot_hours:
        slot_dt = datetime.combine(target_date, datetime.min.time()).replace(hour=hour, minute=0, second=0)
        slots.append(SlotOut(
            time=slot_dt.strftime("%H:%M"),
            datetime=slot_dt.isoformat(),
            available=(hour not in booked_hours),
        ))

    return slots


@router.post("/book", response_model=BookingResponse, status_code=201)
def book_appointment(body: BookingRequest, db: Session = Depends(get_db)):
    # 1. Find or create client
    client = None
    if body.email:
        client = db.query(models.Client).filter(models.Client.email == body.email).first()

    if not client:
        client = models.Client(
            first_name=body.first_name,
            last_name=body.last_name,
            email=body.email,
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
    )
    db.add(appointment)
    db.commit()
    db.refresh(appointment)

    # 4. Generate confirmation number
    suffix = "".join(random.choices(string.digits, k=6))
    confirmation_number = f"LW-{suffix}"

    return BookingResponse(
        success=True,
        confirmation_number=confirmation_number,
        client_id=client.id,
        appointment_id=appointment.id,
        appointment_datetime=body.appointment_datetime.isoformat(),
    )


# ── Public intake (no appointment) ────────────────────────────────────────────

class IntakeRequest(BaseModel):
    first_name: str
    last_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    primary_service: Optional[str] = None
    notes: Optional[str] = None


@router.post("/intake")
def public_intake(req: IntakeRequest, db: Session = Depends(get_db)):
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
