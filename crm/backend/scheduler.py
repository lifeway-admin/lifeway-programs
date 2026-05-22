from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger

scheduler = BackgroundScheduler(timezone="America/New_York")


def check_reminders():
    """Send 24-hour appointment reminders. Runs daily at 8 AM ET."""
    from database import SessionLocal
    import models
    from email_service import send_appointment_reminder
    from datetime import datetime, timedelta

    db = SessionLocal()
    try:
        now = datetime.now()
        window_start = now + timedelta(hours=23)
        window_end = now + timedelta(hours=25)

        appts = (
            db.query(models.Appointment)
            .filter(
                models.Appointment.appointment_date >= window_start,
                models.Appointment.appointment_date <= window_end,
                models.Appointment.status == "scheduled",
                models.Appointment.reminder_sent == False,
            )
            .all()
        )

        for appt in appts:
            appt.reminder_sent = True  # mark first to avoid double-send on error
            client = db.query(models.Client).filter(models.Client.id == appt.client_id).first()
            if not client:
                continue
            provider_name = "To Be Assigned"
            if appt.staff_id:
                staff = db.query(models.Staff).filter(models.Staff.id == appt.staff_id).first()
                if staff:
                    provider_name = f"{staff.first_name} {staff.last_name}"
            appt_dt = appt.appointment_date.strftime("%A, %B %d, %Y at %I:%M %p")
            patient_name = f"{client.first_name} {client.last_name}"
            if client.email:
                try:
                    send_appointment_reminder(
                        to_email=client.email,
                        patient_name=patient_name,
                        confirmation_number=appt.confirmation_number or "",
                        appointment_datetime=appt_dt,
                        service=appt.service_type or appt.appointment_type or "Appointment",
                        provider=provider_name,
                    )
                except Exception as e:
                    print(f"[scheduler] Email reminder failed for appointment {appt.id}: {e}")
            if client.phone:
                try:
                    from sms_service import send_appointment_reminder_sms
                    send_appointment_reminder_sms(
                        to_phone=client.phone,
                        patient_name=patient_name,
                        confirmation_number=appt.confirmation_number or "",
                        appointment_datetime=appt_dt,
                        zoom_join_url=appt.zoom_join_url,
                    )
                except Exception as e:
                    print(f"[scheduler] SMS reminder failed for appointment {appt.id}: {e}")

        db.commit()
    except Exception as e:
        print(f"[scheduler] check_reminders error: {e}")
        db.rollback()
    finally:
        db.close()


scheduler.add_job(check_reminders, CronTrigger(hour=8, minute=0))
