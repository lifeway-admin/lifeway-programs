import csv
import io
import uuid
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, date, timedelta
import models, schemas
from database import get_db
from auth import get_current_user, require_staff, require_admin
import google_calendar as gcal
import models as models_module
from limiter import limiter

router = APIRouter(prefix="/appointments", tags=["appointments"])


@router.get("/my-schedule")
def my_schedule(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """Upcoming appointments and assigned clients for the logged-in staff member."""
    staff = db.query(models.Staff).filter(models.Staff.email == current_user.email).first()
    if not staff:
        return {"staff_found": False, "message": f"No staff record linked to {current_user.email}. Ask your administrator to link your account."}

    now = datetime.now()
    today_start = datetime.combine(now.date(), datetime.min.time())
    today_end = datetime.combine(now.date(), datetime.max.time())
    week_end = now + timedelta(days=7)

    upcoming = (
        db.query(models.Appointment)
        .filter(
            models.Appointment.staff_id == staff.id,
            models.Appointment.appointment_date >= now,
            models.Appointment.appointment_date <= week_end,
            models.Appointment.status != "cancelled",
        )
        .order_by(models.Appointment.appointment_date)
        .all()
    )

    my_clients = (
        db.query(models.Client)
        .filter(models.Client.assigned_staff_id == staff.id, models.Client.case_status == "active")
        .order_by(models.Client.last_name)
        .all()
    )

    def appt_out(a):
        return {
            "id": a.id,
            "client_id": a.client_id,
            "client_name": f"{a.client.first_name} {a.client.last_name}" if a.client else "Unknown",
            "appointment_date": a.appointment_date.isoformat(),
            "service_type": a.service_type or a.appointment_type,
            "status": a.status,
            "confirmation_number": a.confirmation_number,
            "is_today": today_start <= a.appointment_date <= today_end,
            "notes": a.notes,
        }

    return {
        "staff_found": True,
        "staff": {"id": staff.id, "first_name": staff.first_name, "last_name": staff.last_name,
                  "role": staff.role, "title": staff.title},
        "appointments_today": sum(1 for a in upcoming if today_start <= a.appointment_date <= today_end),
        "appointments_this_week": len(upcoming),
        "upcoming": [appt_out(a) for a in upcoming],
        "my_clients": [
            {"id": c.id, "name": f"{c.first_name} {c.last_name}", "email": c.email,
             "primary_service": c.primary_service, "case_status": c.case_status}
            for c in my_clients
        ],
    }


@router.get("/", response_model=List[schemas.AppointmentOut])
def list_appointments(
    skip: int = 0,
    limit: int = Query(default=100, le=500),
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
@limiter.limit("5/minute")
def export_appointments_csv(request: Request, db: Session = Depends(get_db), _=Depends(get_current_user)):
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
def create_appointment(appt: schemas.AppointmentCreate, db: Session = Depends(get_db), _=Depends(require_staff)):
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
        db_appt = models.Appointment(**appt_data, is_telehealth=appt.is_telehealth)
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
            pass
        # Auto-create Zoom meeting for telehealth
        if appt.is_telehealth:
            try:
                import zoom_service
                client_obj = client_obj if 'client_obj' in dir() else db.query(models_module.Client).filter(models_module.Client.id == db_appt.client_id).first()
                topic = f"Telehealth — {client_obj.first_name} {client_obj.last_name}" if client_obj else "Telehealth Appointment"
                join_url, meeting_id = zoom_service.create_meeting(topic, db_appt.appointment_date, db_appt.duration_minutes or 60)
                if join_url:
                    db_appt.zoom_join_url = join_url
                    db_appt.zoom_meeting_id = meeting_id
                    db.commit()
                    db.refresh(db_appt)
            except Exception as e:
                print(f"[appointments] Zoom creation error: {e}")
        return db_appt


@router.delete("/series/{group_id}")
def delete_appointment_series(group_id: str, db: Session = Depends(get_db), current_user=Depends(require_staff)):
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
def update_appointment(appt_id: int, updates: schemas.AppointmentUpdate, db: Session = Depends(get_db), _=Depends(require_staff)):
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


@router.post("/{appt_id}/zoom", response_model=schemas.AppointmentOut)
def create_zoom_for_appointment(appt_id: int, db: Session = Depends(get_db), _=Depends(require_staff)):
    """Create a Zoom meeting for an existing appointment and save the link."""
    appt = db.query(models.Appointment).filter(models.Appointment.id == appt_id).first()
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")

    try:
        import zoom_service
        client = db.query(models_module.Client).filter(models_module.Client.id == appt.client_id).first()
        topic = f"Telehealth — {client.first_name} {client.last_name}" if client else "Telehealth Appointment"
        if appt.confirmation_number:
            topic += f" ({appt.confirmation_number})"
        join_url, meeting_id = zoom_service.create_meeting(topic, appt.appointment_date, appt.duration_minutes or 60)
        if not join_url:
            raise HTTPException(status_code=503, detail="Zoom is not configured or failed to create meeting")
        appt.zoom_join_url = join_url
        appt.zoom_meeting_id = meeting_id
        appt.is_telehealth = True
        db.commit()
        db.refresh(appt)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Zoom error: {e}")

    return appt


@router.delete("/{appt_id}/zoom", response_model=schemas.AppointmentOut)
def remove_zoom_from_appointment(appt_id: int, db: Session = Depends(get_db), _=Depends(require_staff)):
    """Delete the Zoom meeting linked to an appointment."""
    appt = db.query(models.Appointment).filter(models.Appointment.id == appt_id).first()
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")

    if appt.zoom_meeting_id:
        try:
            import zoom_service
            zoom_service.delete_meeting(appt.zoom_meeting_id)
        except Exception:
            pass

    appt.zoom_join_url = None
    appt.zoom_meeting_id = None
    db.commit()
    db.refresh(appt)
    return appt


@router.delete("/{appt_id}", status_code=204)
def delete_appointment(appt_id: int, db: Session = Depends(get_db), _=Depends(require_admin)):
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
