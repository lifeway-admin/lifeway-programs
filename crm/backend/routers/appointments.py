import csv
import io
import uuid
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, date, timedelta
import models, schemas
from database import get_db
from auth import get_current_user
import google_calendar as gcal
import models as models_module

router = APIRouter(prefix="/appointments", tags=["appointments"])


@router.get("/", response_model=List[schemas.AppointmentOut])
def list_appointments(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    client_id: Optional[int] = None,
    staff_id: Optional[int] = None,
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    q = db.query(models.Appointment)
    if status:
        q = q.filter(models.Appointment.status == status)
    if client_id:
        q = q.filter(models.Appointment.client_id == client_id)
    if staff_id:
        q = q.filter(models.Appointment.staff_id == staff_id)
    if date_from:
        q = q.filter(models.Appointment.appointment_date >= date_from)
    if date_to:
        q = q.filter(models.Appointment.appointment_date <= date_to)
    return q.order_by(models.Appointment.appointment_date).offset(skip).limit(limit).all()


@router.get("/today", response_model=List[schemas.AppointmentOut])
def appointments_today(db: Session = Depends(get_db), _=Depends(get_current_user)):
    today = datetime.now().date()
    return (
        db.query(models.Appointment)
        .filter(
            models.Appointment.appointment_date >= datetime.combine(today, datetime.min.time()),
            models.Appointment.appointment_date < datetime.combine(today, datetime.max.time()),
        )
        .order_by(models.Appointment.appointment_date)
        .all()
    )


@router.get("/export/csv")
def export_appointments_csv(db: Session = Depends(get_db), _=Depends(get_current_user)):
    appts = db.query(models.Appointment).order_by(models.Appointment.appointment_date.desc()).all()

    def generate():
        buf = io.StringIO()
        writer = csv.writer(buf)
        writer.writerow([
            "id", "client_id", "staff_id", "appointment_date", "duration_minutes",
            "appointment_type", "service_type", "status", "location",
            "notes", "follow_up_needed", "created_at",
        ])
        for a in appts:
            writer.writerow([
                a.id, a.client_id, a.staff_id, a.appointment_date, a.duration_minutes,
                a.appointment_type, a.service_type, a.status, a.location,
                a.notes, a.follow_up_needed, a.created_at,
            ])
        yield buf.getvalue()

    return StreamingResponse(
        generate(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=appointments.csv"},
    )


@router.post("/", response_model=schemas.AppointmentOut, status_code=201)
def create_appointment(appt: schemas.AppointmentCreate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    client = db.query(models.Client).filter(models.Client.id == appt.client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    # Strip recurrence fields before building Appointment kwargs
    appt_data = appt.model_dump(exclude={"is_recurring", "recurrence_count", "recurrence_interval_days"})

    if appt.is_recurring and appt.recurrence_count > 1:
        count = min(appt.recurrence_count, 52)
        group_id = str(uuid.uuid4())
        created_appts = []
        for i in range(count):
            new_date = appt.appointment_date + timedelta(days=i * appt.recurrence_interval_days)
            db_appt = models.Appointment(
                **appt_data,
                appointment_date=new_date,
                recurrence_group_id=group_id,
                recurrence_index=i,
            )
            db.add(db_appt)
            created_appts.append(db_appt)
        db.commit()
        for db_appt in created_appts:
            db.refresh(db_appt)
        # Sync each to Google Calendar
        client_obj = db.query(models_module.Client).filter(models_module.Client.id == appt.client_id).first()
        staff_member = db.query(models_module.Staff).filter(models_module.Staff.id == appt.staff_id).first() if appt.staff_id else None
        client_name = f"{client_obj.first_name} {client_obj.last_name}" if client_obj else "Unknown Client"
        staff_name = f"{staff_member.first_name} {staff_member.last_name}" if staff_member else "Unassigned"
        for db_appt in created_appts:
            try:
                event_id = gcal.create_event(db_appt, client_name, staff_name)
                if event_id:
                    db_appt.google_calendar_event_id = event_id
                    db.commit()
            except Exception:
                pass
        db.refresh(created_appts[0])
        return created_appts[0]
    else:
        db_appt = models.Appointment(**appt_data)
        db.add(db_appt)
        db.commit()
        db.refresh(db_appt)
        # Sync to Google Calendar
        try:
            client_obj = db.query(models_module.Client).filter(models_module.Client.id == db_appt.client_id).first()
            staff_member = db.query(models_module.Staff).filter(models_module.Staff.id == db_appt.staff_id).first() if db_appt.staff_id else None
            client_name = f"{client_obj.first_name} {client_obj.last_name}" if client_obj else "Unknown Client"
            staff_name = f"{staff_member.first_name} {staff_member.last_name}" if staff_member else "Unassigned"
            event_id = gcal.create_event(db_appt, client_name, staff_name)
            if event_id:
                db_appt.google_calendar_event_id = event_id
                db.commit()
                db.refresh(db_appt)
        except Exception:
            pass  # Don't fail appointment creation if calendar sync fails
        return db_appt


@router.delete("/series/{group_id}")
def delete_appointment_series(group_id: str, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    deleted = db.query(models.Appointment).filter(models.Appointment.recurrence_group_id == group_id).delete()
    db.commit()
    return {"deleted": deleted}


@router.get("/{appt_id}", response_model=schemas.AppointmentOut)
def get_appointment(appt_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    appt = db.query(models.Appointment).filter(models.Appointment.id == appt_id).first()
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return appt


@router.patch("/{appt_id}", response_model=schemas.AppointmentOut)
def update_appointment(appt_id: int, updates: schemas.AppointmentUpdate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    appt = db.query(models.Appointment).filter(models.Appointment.id == appt_id).first()
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")
    for field, value in updates.model_dump(exclude_unset=True).items():
        setattr(appt, field, value)
    db.commit()
    db.refresh(appt)
    # Sync to Google Calendar
    try:
        client = db.query(models_module.Client).filter(models_module.Client.id == appt.client_id).first()
        staff_member = db.query(models_module.Staff).filter(models_module.Staff.id == appt.staff_id).first() if appt.staff_id else None
        client_name = f"{client.first_name} {client.last_name}" if client else "Unknown Client"
        staff_name = f"{staff_member.first_name} {staff_member.last_name}" if staff_member else "Unassigned"
        if appt.google_calendar_event_id:
            gcal.update_event(appt.google_calendar_event_id, appt, client_name, staff_name)
        else:
            event_id = gcal.create_event(appt, client_name, staff_name)
            if event_id:
                appt.google_calendar_event_id = event_id
                db.commit()
    except Exception:
        pass
    return appt


@router.delete("/{appt_id}", status_code=204)
def delete_appointment(appt_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    appt = db.query(models.Appointment).filter(models.Appointment.id == appt_id).first()
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")
    # Remove from Google Calendar
    try:
        if appt.google_calendar_event_id:
            gcal.delete_event(appt.google_calendar_event_id)
    except Exception:
        pass
    db.delete(appt)
    db.commit()
