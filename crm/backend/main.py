from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
import models, schemas
from database import engine, get_db, Base
from auth import verify_password, create_access_token, hash_password, get_current_user, require_admin, auth_router
from routers import clients, staff, appointments, donations, ai, tickets, activity, public as public_router, google_cal, docs as docs_router, hr_documents, onboarding, time_off, chat
from routers.reports import router as reports_router
from limiter import limiter
from scheduler import scheduler

Base.metadata.create_all(bind=engine, checkfirst=True)

# ── Runtime migrations (SQLite ALTER TABLE) ───────────────────────────────────
from sqlalchemy import text, inspect as sa_inspect

with engine.connect() as conn:
    _cols = [c['name'] for c in sa_inspect(engine).get_columns('clients')]
    if 'insurance_expiry' not in _cols:
        conn.execute(text("ALTER TABLE clients ADD COLUMN insurance_expiry DATE"))
        conn.commit()

with engine.connect() as conn:
    _cols = [c['name'] for c in sa_inspect(engine).get_columns('appointments')]
    if 'recurrence_group_id' not in _cols:
        conn.execute(text("ALTER TABLE appointments ADD COLUMN recurrence_group_id VARCHAR(36)"))
        conn.commit()
    if 'recurrence_index' not in _cols:
        conn.execute(text("ALTER TABLE appointments ADD COLUMN recurrence_index INTEGER"))
        conn.commit()
    if 'confirmation_number' not in _cols:
        conn.execute(text("ALTER TABLE appointments ADD COLUMN confirmation_number VARCHAR(20)"))
        conn.commit()
    if 'reminder_sent' not in _cols:
        conn.execute(text("ALTER TABLE appointments ADD COLUMN reminder_sent BOOLEAN DEFAULT 0"))
        conn.commit()
    if 'is_telehealth' not in _cols:
        conn.execute(text("ALTER TABLE appointments ADD COLUMN is_telehealth BOOLEAN DEFAULT 0"))
        conn.commit()
    if 'zoom_join_url' not in _cols:
        conn.execute(text("ALTER TABLE appointments ADD COLUMN zoom_join_url VARCHAR(500)"))
        conn.commit()
    if 'zoom_meeting_id' not in _cols:
        conn.execute(text("ALTER TABLE appointments ADD COLUMN zoom_meeting_id VARCHAR(100)"))
        conn.commit()

with engine.connect() as conn:
    conn.execute(text(
        "CREATE UNIQUE INDEX IF NOT EXISTS uix_appointments_confirmation_number "
        "ON appointments (confirmation_number) WHERE confirmation_number IS NOT NULL"
    ))
    conn.commit()

# Migrate staff table — per-therapist Google Calendar fields
with engine.connect() as conn:
    _cols = [c['name'] for c in sa_inspect(engine).get_columns('staff')]
    if 'google_refresh_token' not in _cols:
        conn.execute(text("ALTER TABLE staff ADD COLUMN google_refresh_token TEXT"))
        conn.commit()
    if 'google_calendar_id' not in _cols:
        conn.execute(text("ALTER TABLE staff ADD COLUMN google_calendar_id VARCHAR(300)"))
        conn.commit()
    if 'manager_id' not in _cols:
        conn.execute(text("ALTER TABLE staff ADD COLUMN manager_id INTEGER REFERENCES staff(id)"))
        conn.commit()
    if 'pto_balance_hours' not in _cols:
        conn.execute(text("ALTER TABLE staff ADD COLUMN pto_balance_hours FLOAT DEFAULT 0"))
        conn.commit()

# Migrate chat_sessions table — unclaimed-chat escalation tracking
with engine.connect() as conn:
    _cols = [c['name'] for c in sa_inspect(engine).get_columns('chat_sessions')]
    if 'escalation_notified_at' not in _cols:
        conn.execute(text("ALTER TABLE chat_sessions ADD COLUMN escalation_notified_at DATETIME"))
        conn.commit()

# Migrate users table — login lockout tracking
with engine.connect() as conn:
    _cols = [c['name'] for c in sa_inspect(engine).get_columns('users')]
    if 'failed_login_attempts' not in _cols:
        conn.execute(text("ALTER TABLE users ADD COLUMN failed_login_attempts INTEGER DEFAULT 0"))
        conn.commit()
    if 'locked_until' not in _cols:
        conn.execute(text("ALTER TABLE users ADD COLUMN locked_until DATETIME"))
        conn.commit()

app = FastAPI(title="Lifeway Programs CRM", version="1.0.0")


@app.on_event("startup")
def startup():
    scheduler.start()


@app.on_event("shutdown")
def shutdown():
    if scheduler.running:
        scheduler.shutdown(wait=False)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

import os as _os
_ALLOWED_ORIGINS = [o.strip() for o in _os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5173,http://localhost:5174,http://localhost:5175"
).split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept", "X-Chat-Token"],
)

_PHI_PATHS = ("/clients", "/appointments", "/staff", "/donations", "/tickets", "/public/patient", "/public/sign-forms", "/onboarding", "/time-off", "/chat", "/public/chat")


@app.middleware("http")
async def security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Content-Security-Policy"] = "default-src 'self'; frame-ancestors 'none'"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    if any(request.url.path.startswith(p) for p in _PHI_PATHS):
        response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, private"
        response.headers["Pragma"] = "no-cache"
    return response

app.include_router(public_router.router)
app.include_router(clients.router)
app.include_router(staff.router)
app.include_router(appointments.router)
app.include_router(donations.router)
app.include_router(ai.router)
app.include_router(tickets.router)
app.include_router(activity.router)
app.include_router(google_cal.router)
app.include_router(reports_router)
app.include_router(auth_router)
app.include_router(docs_router.router)
app.include_router(hr_documents.router)
app.include_router(onboarding.router)
app.include_router(time_off.router)
app.include_router(chat.router)


# ── Auth routes ───────────────────────────────────────────────────────────────

LOGIN_LOCKOUT_THRESHOLD = 3
LOGIN_LOCKOUT_MINUTES = 15


@app.post("/auth/login", response_model=schemas.Token)
@limiter.limit("10/minute")
def login(request: Request, form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == form_data.username).first()

    if user and user.locked_until and user.locked_until > datetime.utcnow():
        minutes_left = max(1, int((user.locked_until - datetime.utcnow()).total_seconds() // 60) + 1)
        raise HTTPException(
            status_code=403,
            detail=f"Account locked due to too many failed login attempts. Try again in {minutes_left} minute(s).",
        )

    if not user or not user.is_active or not verify_password(form_data.password, user.hashed_password):
        if user:
            user.failed_login_attempts = (user.failed_login_attempts or 0) + 1
            if user.failed_login_attempts >= LOGIN_LOCKOUT_THRESHOLD:
                user.locked_until = datetime.utcnow() + timedelta(minutes=LOGIN_LOCKOUT_MINUTES)
                user.failed_login_attempts = 0
            db.commit()
        raise HTTPException(status_code=401, detail="Incorrect username or password")

    user.failed_login_attempts = 0
    user.locked_until = None
    db.commit()

    token = create_access_token({"sub": user.username})
    return {"access_token": token, "token_type": "bearer", "role": user.role}


@app.post("/auth/register", response_model=schemas.UserOut, status_code=201)
@limiter.limit("5/minute")
def register(request: Request, user: schemas.UserCreate, db: Session = Depends(get_db), _admin=Depends(require_admin)):
    """Admin-only: create a new user. Role is always set to 'staff' unless caller is admin."""
    if db.query(models.User).filter(models.User.username == user.username).first():
        raise HTTPException(status_code=400, detail="Username already taken")
    # Prevent privilege escalation — only admins can create admins
    safe_role = user.role if user.role in ("admin", "staff", "readonly") else "staff"
    from auth import password_strength_check
    password_strength_check(user.password)
    db_user = models.User(
        username=user.username,
        email=user.email,
        hashed_password=hash_password(user.password),
        full_name=user.full_name,
        role=safe_role,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@app.get("/auth/me", response_model=schemas.UserOut)
def me(current_user=Depends(get_current_user)):
    return current_user


# ── Dashboard ─────────────────────────────────────────────────────────────────

@app.get("/dashboard", response_model=schemas.DashboardStats)
def dashboard(db: Session = Depends(get_db), _=Depends(get_current_user)):
    now = datetime.now()
    today_start = datetime.combine(now.date(), datetime.min.time())
    today_end = datetime.combine(now.date(), datetime.max.time())
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    return schemas.DashboardStats(
        total_clients=db.query(func.count(models.Client.id)).scalar() or 0,
        active_clients=db.query(func.count(models.Client.id)).filter(models.Client.case_status == "active").scalar() or 0,
        total_appointments=db.query(func.count(models.Appointment.id)).scalar() or 0,
        appointments_today=db.query(func.count(models.Appointment.id)).filter(
            models.Appointment.appointment_date >= today_start,
            models.Appointment.appointment_date <= today_end,
        ).scalar() or 0,
        total_donations=round(db.query(func.sum(models.Donation.amount)).scalar() or 0, 2),
        donations_this_month=round(
            db.query(func.sum(models.Donation.amount))
            .filter(models.Donation.donation_date >= month_start)
            .scalar() or 0,
            2,
        ),
        total_staff=db.query(func.count(models.Staff.id)).filter(models.Staff.is_active == True, models.Staff.is_volunteer == False).scalar() or 0,
        active_volunteers=db.query(func.count(models.Staff.id)).filter(models.Staff.is_active == True, models.Staff.is_volunteer == True).scalar() or 0,
        open_tickets=db.query(func.count(models.Ticket.id)).filter(models.Ticket.status == "open").scalar() or 0,
        total_tickets=db.query(func.count(models.Ticket.id)).scalar() or 0,
    )


@app.get("/dashboard/alerts")
def dashboard_alerts(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    from datetime import date, timedelta
    today = date.today()

    # Birthdays in next 7 days
    all_clients_with_dob = db.query(models.Client).filter(
        models.Client.date_of_birth.isnot(None),
        models.Client.case_status == "active"
    ).all()
    birthdays = []
    for c in all_clients_with_dob:
        dob = c.date_of_birth
        try:
            this_year_bday = dob.replace(year=today.year)
        except ValueError:
            this_year_bday = dob.replace(year=today.year, day=28)
        if this_year_bday < today:
            try:
                this_year_bday = dob.replace(year=today.year + 1)
            except ValueError:
                this_year_bday = dob.replace(year=today.year + 1, day=28)
        if 0 <= (this_year_bday - today).days <= 7:
            birthdays.append({"id": c.id, "name": f"{c.first_name} {c.last_name}", "dob": str(c.date_of_birth)})

    # Insurance expiring in next 30 days
    expiring = db.query(models.Client).filter(
        models.Client.insurance_expiry.isnot(None),
        models.Client.insurance_expiry >= today,
        models.Client.insurance_expiry <= today + timedelta(days=30)
    ).all()
    expiring_list = [{"id": c.id, "name": f"{c.first_name} {c.last_name}", "insurance_expiry": str(c.insurance_expiry)} for c in expiring]

    return {"birthdays_this_week": birthdays, "expiring_insurance": expiring_list}


@app.get("/")
def root():
    return {"message": "Lifeway Programs CRM API", "docs": "/docs"}
