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

    clients = relationship("Client", back_populates="assigned_staff")
    appointments = relationship("Appointment", back_populates="staff")
    assigned_tickets = relationship("Ticket", back_populates="assigned_to")


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
    type = Column(String(50))  # call, email, inquiry, complaint, follow_up, internal, walk_in
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


class ActivityLog(Base):
    __tablename__ = "activity_log"

    id = Column(Integer, primary_key=True, index=True)
    entity_type = Column(String(50))  # client, ticket, appointment, donation
    entity_id = Column(Integer)
    action = Column(String(50))  # created, updated, note_added, status_changed, assigned
    actor = Column(String(100))
    detail = Column(Text)
    created_at = Column(DateTime, server_default=func.now())
