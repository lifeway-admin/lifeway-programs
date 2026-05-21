from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
import models, schemas
from database import engine, get_db, Base
from auth import authenticate_user, create_access_token, hash_password, get_current_user, auth_router
from routers import clients, staff, appointments, donations, ai, tickets, activity, public as public_router, google_cal
from routers.reports import router as reports_router

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

app = FastAPI(title="Lifeway Programs CRM", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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


# ── Auth routes ───────────────────────────────────────────────────────────────

@app.post("/auth/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    token = create_access_token({"sub": user.username})
    return {"access_token": token, "token_type": "bearer"}


@app.post("/auth/register", response_model=schemas.UserOut, status_code=201)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    if db.query(models.User).filter(models.User.username == user.username).first():
        raise HTTPException(status_code=400, detail="Username already taken")
    db_user = models.User(
        username=user.username,
        email=user.email,
        hashed_password=hash_password(user.password),
        full_name=user.full_name,
        role=user.role,
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
