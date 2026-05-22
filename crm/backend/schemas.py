from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import date, datetime


# ── Auth ──────────────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    full_name: Optional[str] = None
    role: str = "staff"

class UserOut(BaseModel):
    id: int
    username: str
    email: str
    full_name: Optional[str]
    role: str
    is_active: bool
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None


# ── Staff ─────────────────────────────────────────────────────────────────────

class StaffBase(BaseModel):
    first_name: str
    last_name: str
    email: str
    phone: Optional[str] = None
    role: str
    department: Optional[str] = None
    title: Optional[str] = None
    start_date: Optional[date] = None
    is_active: bool = True
    is_volunteer: bool = False
    bio: Optional[str] = None

class StaffCreate(StaffBase):
    pass

class StaffUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    role: Optional[str] = None
    department: Optional[str] = None
    title: Optional[str] = None
    is_active: Optional[bool] = None
    is_volunteer: Optional[bool] = None
    bio: Optional[str] = None

class StaffOut(StaffBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True


# ── Client ────────────────────────────────────────────────────────────────────

class ClientBase(BaseModel):
    first_name: str
    last_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    date_of_birth: Optional[date] = None
    case_status: str = "active"
    primary_service: Optional[str] = None
    services_needed: Optional[str] = None
    assigned_staff_id: Optional[int] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    insurance: Optional[str] = None
    insurance_expiry: Optional[date] = None
    notes: Optional[str] = None

class ClientCreate(ClientBase):
    pass

class ClientUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    case_status: Optional[str] = None
    primary_service: Optional[str] = None
    services_needed: Optional[str] = None
    assigned_staff_id: Optional[int] = None
    insurance: Optional[str] = None
    notes: Optional[str] = None

class ClientOut(ClientBase):
    id: int
    intake_date: Optional[datetime]
    created_at: datetime
    class Config:
        from_attributes = True


# ── Appointment ───────────────────────────────────────────────────────────────

class AppointmentBase(BaseModel):
    client_id: int
    staff_id: Optional[int] = None
    appointment_date: datetime
    duration_minutes: int = 60
    appointment_type: Optional[str] = None
    service_type: Optional[str] = None
    status: str = "scheduled"
    location: Optional[str] = None
    notes: Optional[str] = None
    follow_up_needed: bool = False

class AppointmentCreate(AppointmentBase):
    is_recurring: bool = False
    recurrence_count: int = 1
    recurrence_interval_days: int = 7
    is_telehealth: bool = False

class AppointmentUpdate(BaseModel):
    staff_id: Optional[int] = None
    appointment_date: Optional[datetime] = None
    duration_minutes: Optional[int] = None
    status: Optional[str] = None
    location: Optional[str] = None
    notes: Optional[str] = None
    follow_up_needed: Optional[bool] = None
    is_telehealth: Optional[bool] = None

class AppointmentOut(AppointmentBase):
    id: int
    created_at: datetime
    google_calendar_event_id: Optional[str] = None
    recurrence_group_id: Optional[str] = None
    recurrence_index: Optional[int] = None
    confirmation_number: Optional[str] = None
    is_telehealth: bool = False
    zoom_join_url: Optional[str] = None
    zoom_meeting_id: Optional[str] = None
    class Config:
        from_attributes = True


# ── Donation ──────────────────────────────────────────────────────────────────

class DonationBase(BaseModel):
    donor_name: str
    donor_email: Optional[str] = None
    donor_phone: Optional[str] = None
    donor_organization: Optional[str] = None
    amount: float
    donation_type: str = "one_time"
    campaign: Optional[str] = None
    payment_method: Optional[str] = None
    is_anonymous: bool = False
    notes: Optional[str] = None

class DonationCreate(DonationBase):
    pass

class DonationUpdate(BaseModel):
    amount: Optional[float] = None
    campaign: Optional[str] = None
    tax_receipt_sent: Optional[bool] = None
    notes: Optional[str] = None

class DonationOut(DonationBase):
    id: int
    donation_date: datetime
    tax_receipt_sent: bool
    created_at: datetime
    class Config:
        from_attributes = True


# ── Dashboard Stats ───────────────────────────────────────────────────────────

class DashboardStats(BaseModel):
    total_clients: int
    active_clients: int
    total_appointments: int
    appointments_today: int
    total_donations: float
    donations_this_month: float
    total_staff: int
    active_volunteers: int
    open_tickets: int = 0
    total_tickets: int = 0


# ── Ticket ────────────────────────────────────────────────────────────────────

class TicketCommentCreate(BaseModel):
    author: str
    content: str

class TicketCommentOut(BaseModel):
    id: int
    ticket_id: int
    author: str
    content: str
    created_at: datetime
    class Config:
        from_attributes = True

class TicketCreate(BaseModel):
    title: str
    description: Optional[str] = None
    type: Optional[str] = None
    priority: str = "medium"
    channel: Optional[str] = None
    client_id: Optional[int] = None
    assigned_to_id: Optional[int] = None
    created_by: str

class TicketUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    type: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    channel: Optional[str] = None
    client_id: Optional[int] = None
    assigned_to_id: Optional[int] = None
    resolution: Optional[str] = None

class TicketOut(BaseModel):
    id: int
    ticket_number: Optional[str]
    title: str
    description: Optional[str]
    type: Optional[str]
    status: str
    priority: str
    channel: Optional[str]
    client_id: Optional[int]
    assigned_to_id: Optional[int]
    created_by: Optional[str]
    resolution: Optional[str]
    resolved_at: Optional[datetime]
    created_at: datetime
    updated_at: Optional[datetime]
    comments: List[TicketCommentOut] = []
    client_name: Optional[str] = None
    assignee_name: Optional[str] = None
    class Config:
        from_attributes = True

class TicketStats(BaseModel):
    by_status: dict
    by_priority: dict
    avg_resolution_hours: Optional[float]


# ── Activity Log ──────────────────────────────────────────────────────────────

class ActivityLogCreate(BaseModel):
    entity_type: str
    entity_id: int
    action: str
    actor: str
    detail: Optional[str] = None

class ActivityLogOut(BaseModel):
    id: int
    entity_type: str
    entity_id: int
    action: str
    actor: str
    detail: Optional[str]
    created_at: datetime
    class Config:
        from_attributes = True
