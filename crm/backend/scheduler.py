from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.triggers.interval import IntervalTrigger

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
                except Exception:
                    pass  # Do not log PHI
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
                except Exception:
                    pass  # Do not log PHI

        db.commit()
    except Exception:
        pass  # Scheduler errors suppressed to avoid PHI in logs
        db.rollback()
    finally:
        db.close()


def close_abandoned_chats():
    """Close chat sessions with no activity for 30+ minutes. Runs every 5 minutes."""
    from database import SessionLocal
    import models
    from datetime import datetime, timedelta

    db = SessionLocal()
    try:
        cutoff = datetime.utcnow() - timedelta(minutes=30)
        stale_ids = [
            row.id
            for row in db.query(models.ChatSession.id).filter(
                models.ChatSession.status.in_(["waiting", "active"]),
                models.ChatSession.last_message_at < cutoff,
            )
        ]

        # Atomic conditional close per session: only a session this call actually
        # transitions to closed gets a summary ticket, so a manual close racing
        # with this job can't produce a duplicate ticket for the same conversation.
        closed_sessions = []
        for session_id in stale_ids:
            updated = (
                db.query(models.ChatSession)
                .filter(models.ChatSession.id == session_id, models.ChatSession.status.in_(["waiting", "active"]))
                .update({"status": "closed", "closed_at": datetime.utcnow()})
            )
            db.commit()
            if updated:
                closed_sessions.append(db.query(models.ChatSession).filter(models.ChatSession.id == session_id).first())

        if closed_sessions:
            from routers.chat import _make_summary_ticket
            for session in closed_sessions:
                try:
                    _make_summary_ticket(db, session)
                except Exception:
                    pass
    except Exception:
        db.rollback()
    finally:
        db.close()


ESCALATION_THRESHOLD_MINUTES = 5


def notify_unclaimed_chats():
    """Email staff about chats that have sat unclaimed too long. Runs every 2 minutes."""
    from database import SessionLocal
    import models
    import os
    from datetime import datetime, timedelta

    db = SessionLocal()
    try:
        cutoff = datetime.utcnow() - timedelta(minutes=ESCALATION_THRESHOLD_MINUTES)
        stale = (
            db.query(models.ChatSession)
            .filter(
                models.ChatSession.status == "waiting",
                models.ChatSession.created_at < cutoff,
                models.ChatSession.escalation_notified_at.is_(None),
            )
            .limit(50)
            .all()
        )
        staff_inbox = os.getenv("SMTP_FROM_EMAIL", "")
        for session in stale:
            # Mark and commit per-session (not once after the loop): if a later
            # session in the batch fails, earlier successful marks/sends must
            # survive rather than rolling back into a resend storm next tick.
            try:
                session.escalation_notified_at = datetime.utcnow()
                if staff_inbox:
                    first_message = (
                        db.query(models.ChatMessage)
                        .filter(models.ChatMessage.session_id == session.id)
                        .order_by(models.ChatMessage.id)
                        .first()
                    )
                    from email_service import send_chat_escalation_email
                    send_chat_escalation_email(
                        to_email=staff_inbox,
                        visitor_name=session.visitor_name,
                        visitor_email=session.visitor_email,
                        message_preview=(first_message.content if first_message else "(no message yet)"),
                        waiting_minutes=ESCALATION_THRESHOLD_MINUTES,
                    )
                db.commit()
            except Exception:
                db.rollback()
    except Exception:
        db.rollback()
    finally:
        db.close()


scheduler.add_job(check_reminders, CronTrigger(hour=8, minute=0))
scheduler.add_job(close_abandoned_chats, IntervalTrigger(minutes=5))
scheduler.add_job(notify_unclaimed_chats, IntervalTrigger(minutes=2))
