from sqlalchemy import Column, Integer, String, Float, Boolean, Date, DateTime, Text, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from database import Base


class ServiceType(str, enum.Enum):
    mental_health = "mental_health"
    medical = "medical"
    social = "social"
    spiritual = "spiritual"
    food = "food"
    employment = "employment"
    housing = "housing"
    wellness = "wellness"


class CaseStatus(str, enum.Enum):
    active = "active"
    inactive = "inactive"
    closed = "closed"


class AppointmentStatus(str, enum.Enum):
    scheduled = "scheduled"
    completed = "completed"
    cancelled = "cancelled"
    no_show = "no_show"


class StaffRole(str, enum.Enum):
    therapist = "therapist"
    physician = "physician"
    social_worker = "social_worker"
    admin = "admin"
    volunteer = "volunteer"
    intern = "intern"


class DonationType(str, enum.Enum):
    one_time = "one_time"
    recurring = "recurring"
    in_kind = "in_kind"


class Client(Base):
    __tablename__ = "clients"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(200), unique=True, index=True)
    phone = Column(String(20))
    address = Column(String(500))
    date_of_birth = Column(Date)
    intake_date = Column(DateTime, server_default=func.now())
    case_status = Column(String(20), default="active")
    primary_service = Column(String(50))
    services_needed = Column(Text)  # JSON list stored as string
    assigned_staff_id = Column(Integer, ForeignKey("staff.id"), nullable=True)
    emergency_contact_name = Column(String(200))
    emergency_contact_phone = Column(String(20))
    insurance = Column(String(200))
    insurance_expiry = Column(Date, nullable=True)
    notes = Column(Text)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    appointments = relationship("Appointment", back_populates="client")
    assigned_staff = relationship("Staff", back_populates="clients")
    tickets = relationship("Ticket", back_populates="client")


class Staff(Base):
    __tablename__ = "staff"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(200), unique=True, index=True)
    phone = Column(String(20))
    role = Column(String(50), nullable=False)
    department = Column(String(100))
    title = Column(String(200))
    start_date = Column(Date)
    is_active = Column(Boolean, default=True)
    is_volunteer = Column(Boolean, default=False)
    bio = Column(Text)
    created_at = Column(DateTime, server_default=func.now())
    # Per-therapist Google Calendar (optional; separate from org-wide token)
    google_refresh_token = Column(Text, nullable=True)
    google_calendar_id = Column(String(300), nullable=True)
    manager_id = Column(Integer, ForeignKey("staff.id"), nullable=True)
    pto_balance_hours = Column(Float, nullable=False, default=0.0)

    clients = relationship("Client", back_populates="assigned_staff")
    appointments = relationship("Appointment", back_populates="staff")
    assigned_tickets = relationship("Ticket", back_populates="assigned_to")
    availability = relationship("StaffAvailability", back_populates="staff", cascade="all, delete-orphan")
    manager = relationship("Staff", remote_side=[id], backref="direct_reports")
    time_off_requests = relationship("TimeOffRequest", back_populates="staff", cascade="all, delete-orphan")


class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=False)
    staff_id = Column(Integer, ForeignKey("staff.id"), nullable=True)
    appointment_date = Column(DateTime, nullable=False)
    duration_minutes = Column(Integer, default=60)
    appointment_type = Column(String(50))
    service_type = Column(String(50))
    status = Column(String(20), default="scheduled")
    location = Column(String(200))
    notes = Column(Text)
    follow_up_needed = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())
    google_calendar_event_id = Column(String(200), nullable=True)
    recurrence_group_id = Column(String(36), nullable=True, index=True)
    recurrence_index = Column(Integer, nullable=True)
    confirmation_number = Column(String(20), nullable=True, index=True)
    reminder_sent = Column(Boolean, default=False)
    is_telehealth = Column(Boolean, default=False)
    zoom_join_url = Column(String(500), nullable=True)
    zoom_meeting_id = Column(String(100), nullable=True)

    client = relationship("Client", back_populates="appointments")
    staff = relationship("Staff", back_populates="appointments")


class Donation(Base):
    __tablename__ = "donations"

    id = Column(Integer, primary_key=True, index=True)
    donor_name = Column(String(200), nullable=False)
    donor_email = Column(String(200), index=True)
    donor_phone = Column(String(20))
    donor_organization = Column(String(200))
    amount = Column(Float, nullable=False)
    donation_date = Column(DateTime, server_default=func.now())
    donation_type = Column(String(20), default="one_time")
    campaign = Column(String(200))
    payment_method = Column(String(50))
    is_anonymous = Column(Boolean, default=False)
    tax_receipt_sent = Column(Boolean, default=False)
    notes = Column(Text)
    created_at = Column(DateTime, server_default=func.now())


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, index=True, nullable=False)
    email = Column(String(200), unique=True, index=True, nullable=False)
    hashed_password = Column(String(500), nullable=False)
    full_name = Column(String(200))
    role = Column(String(50), default="staff")  # admin, staff, readonly
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())


class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(Integer, primary_key=True, index=True)
    ticket_number = Column(String(20), unique=True, index=True)
    title = Column(String(500), nullable=False)
    description = Column(Text)
    type = Column(String(50))  # call, email, inquiry, complaint, follow_up, internal, walk_in, chat
    status = Column(String(20), default="open")  # open, in_progress, resolved, closed
    priority = Column(String(20), default="medium")  # low, medium, high, urgent
    channel = Column(String(50))  # phone, email, walk_in, website, referral
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=True)
    assigned_to_id = Column(Integer, ForeignKey("staff.id"), nullable=True)
    created_by = Column(String(100))
    resolution = Column(Text, nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    comments = relationship("TicketComment", back_populates="ticket", cascade="all, delete-orphan")
    client = relationship("Client", back_populates="tickets")
    assigned_to = relationship("Staff", back_populates="assigned_tickets")


class TicketComment(Base):
    __tablename__ = "ticket_comments"

    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(Integer, ForeignKey("tickets.id"), nullable=False)
    author = Column(String(100), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    ticket = relationship("Ticket", back_populates="comments")


class FormSignature(Base):
    __tablename__ = "form_signatures"

    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=False)
    appointment_id = Column(Integer, ForeignKey("appointments.id"), nullable=True)
    form_filename = Column(String(200), nullable=False)
    form_title = Column(String(500), nullable=False)
    signer_name = Column(String(200), nullable=False)
    signer_ip = Column(String(50))
    signed_at = Column(DateTime, server_default=func.now())


class ActivityLog(Base):
    __tablename__ = "activity_log"

    id = Column(Integer, primary_key=True, index=True)
    entity_type = Column(String(50))  # client, ticket, appointment, donation
    entity_id = Column(Integer)
    action = Column(String(50))  # created, updated, note_added, status_changed, assigned
    actor = Column(String(100))
    detail = Column(Text)
    created_at = Column(DateTime, server_default=func.now())


class StaffInvite(Base):
    __tablename__ = "staff_invites"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(200), nullable=False, index=True)
    role = Column(String(50), nullable=False, default="staff")
    token = Column(String(64), unique=True, nullable=False, index=True)
    invited_by = Column(String(100))
    expires_at = Column(DateTime, nullable=False)
    accepted_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now())


class StaffAvailability(Base):
    """Weekly recurring availability for a staff member (day-of-week slots)."""
    __tablename__ = "staff_availability"

    id = Column(Integer, primary_key=True, index=True)
    staff_id = Column(Integer, ForeignKey("staff.id"), nullable=False)
    day_of_week = Column(Integer, nullable=False)  # 0=Monday … 6=Sunday
    start_hour = Column(Integer, nullable=False)   # 0-23
    end_hour = Column(Integer, nullable=False)     # exclusive: 9,17 means 9am-4pm last slot

    staff = relationship("Staff", back_populates="availability")


class HRDocument(Base):
    """Internal document library (handbook, SOPs, onboarding packets, HR forms) — admin-uploaded, staff-readable."""
    __tablename__ = "hr_documents"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(300), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(100), nullable=False)  # Handbook, SOP, Onboarding, HR Forms, Other
    original_filename = Column(String(255), nullable=False)  # display only, never used as a disk path
    stored_filename = Column(String(255), nullable=False, unique=True)  # uuid4().hex + ext
    content_type = Column(String(150), nullable=True)
    file_size_bytes = Column(Integer, nullable=False)
    uploaded_by = Column(String(100), nullable=False)
    created_at = Column(DateTime, server_default=func.now())


class OnboardingChecklist(Base):
    __tablename__ = "onboarding_checklists"

    id = Column(Integer, primary_key=True, index=True)
    staff_id = Column(Integer, ForeignKey("staff.id"), nullable=False)
    notes = Column(Text, nullable=True)
    created_by = Column(String(100))
    created_at = Column(DateTime, server_default=func.now())

    staff = relationship("Staff")
    tasks = relationship(
        "OnboardingTask",
        back_populates="checklist",
        cascade="all, delete-orphan",
        order_by="OnboardingTask.sort_order",
    )


class OnboardingTask(Base):
    __tablename__ = "onboarding_tasks"

    id = Column(Integer, primary_key=True, index=True)
    checklist_id = Column(Integer, ForeignKey("onboarding_checklists.id"), nullable=False)
    label = Column(String(300), nullable=False)
    sort_order = Column(Integer, default=0)
    is_custom = Column(Boolean, default=False)
    is_done = Column(Boolean, default=False)
    completed_by = Column(String(100), nullable=True)
    completed_at = Column(DateTime, nullable=True)

    checklist = relationship("OnboardingChecklist", back_populates="tasks")


class TimeOffRequest(Base):
    __tablename__ = "time_off_requests"

    id = Column(Integer, primary_key=True, index=True)
    staff_id = Column(Integer, ForeignKey("staff.id"), nullable=False)
    request_type = Column(String(20), default="vacation")  # vacation, sick, personal, unpaid, bereavement
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    hours_requested = Column(Float, nullable=False)  # server-computed, never client-trusted
    notes = Column(Text, nullable=True)
    status = Column(String(20), default="pending")  # pending, approved, denied
    reviewed_by = Column(String(100), nullable=True)
    reviewed_at = Column(DateTime, nullable=True)
    admin_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    staff = relationship("Staff", back_populates="time_off_requests")


class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id = Column(Integer, primary_key=True, index=True)
    visitor_token = Column(String(64), unique=True, nullable=False, index=True)
    visitor_name = Column(String(200), nullable=False)
    visitor_email = Column(String(200), nullable=False)
    status = Column(String(20), default="waiting")  # waiting, active, closed
    assigned_staff_id = Column(Integer, ForeignKey("staff.id"), nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    last_message_at = Column(DateTime, server_default=func.now())
    closed_at = Column(DateTime, nullable=True)
    escalation_notified_at = Column(DateTime, nullable=True)

    assigned_staff = relationship("Staff")
    messages = relationship(
        "ChatMessage",
        back_populates="session",
        cascade="all, delete-orphan",
        order_by="ChatMessage.id",
    )


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("chat_sessions.id"), nullable=False)
    sender_role = Column(String(20), nullable=False)  # visitor, staff, system
    sender_name = Column(String(200), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    session = relationship("ChatSession", back_populates="messages")
