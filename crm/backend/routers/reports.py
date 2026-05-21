from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, text
from database import get_db
from auth import get_current_user
from models import Client, Appointment, Donation, Ticket, Staff
from datetime import datetime, date, timedelta
from typing import Optional

router = APIRouter(prefix="/reports", tags=["reports"])


def parse_date(s: Optional[str]) -> Optional[date]:
    if not s:
        return None
    return datetime.strptime(s, "%Y-%m-%d").date()


@router.get("/clients")
def report_clients(start_date: Optional[str] = None, end_date: Optional[str] = None,
                   db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    q = db.query(Client)
    if start_date:
        q = q.filter(Client.created_at >= parse_date(start_date))
    if end_date:
        q = q.filter(Client.created_at <= parse_date(end_date))
    clients = q.all()

    by_month = {}
    by_service = {}
    for c in clients:
        if c.created_at:
            m = c.created_at.strftime("%Y-%m")
            by_month[m] = by_month.get(m, 0) + 1
        s = c.primary_service or "Unknown"
        by_service[s] = by_service.get(s, 0) + 1

    return {
        "by_month": sorted([{"month": k, "count": v} for k, v in by_month.items()], key=lambda x: x["month"]),
        "by_service": [{"service": k, "count": v} for k, v in sorted(by_service.items(), key=lambda x: -x[1])],
        "total": len(clients)
    }


@router.get("/appointments")
def report_appointments(start_date: Optional[str] = None, end_date: Optional[str] = None,
                        db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    q = db.query(Appointment)
    if start_date:
        q = q.filter(Appointment.appointment_date >= parse_date(start_date))
    if end_date:
        q = q.filter(Appointment.appointment_date <= parse_date(end_date))
    appts = q.all()

    by_month = {}
    by_provider = {}
    for a in appts:
        if a.appointment_date:
            m = a.appointment_date.strftime("%Y-%m")
            by_month[m] = by_month.get(m, 0) + 1
        if a.staff_id:
            staff = db.query(Staff).filter(Staff.id == a.staff_id).first()
            name = f"{staff.first_name} {staff.last_name}" if staff else "Unknown"
        else:
            name = "Unassigned"
        by_provider[name] = by_provider.get(name, 0) + 1

    return {
        "by_month": sorted([{"month": k, "count": v} for k, v in by_month.items()], key=lambda x: x["month"]),
        "by_provider": [{"provider": k, "count": v} for k, v in sorted(by_provider.items(), key=lambda x: -x[1])],
        "total": len(appts)
    }


@router.get("/donations")
def report_donations(start_date: Optional[str] = None, end_date: Optional[str] = None,
                     db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    q = db.query(Donation)
    if start_date:
        q = q.filter(Donation.donation_date >= parse_date(start_date))
    if end_date:
        q = q.filter(Donation.donation_date <= parse_date(end_date))
    donations = q.all()

    by_month = {}
    for d in donations:
        if d.donation_date:
            m = d.donation_date.strftime("%Y-%m")
            if m not in by_month:
                by_month[m] = {"amount": 0.0, "count": 0}
            by_month[m]["amount"] += d.amount or 0
            by_month[m]["count"] += 1

    return {
        "by_month": sorted([{"month": k, "amount": round(v["amount"], 2), "count": v["count"]} for k, v in by_month.items()], key=lambda x: x["month"]),
        "total_amount": round(sum(d.amount or 0 for d in donations), 2),
        "total_count": len(donations)
    }


@router.get("/tickets")
def report_tickets(start_date: Optional[str] = None, end_date: Optional[str] = None,
                   db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    q = db.query(Ticket)
    if start_date:
        q = q.filter(Ticket.created_at >= parse_date(start_date))
    if end_date:
        q = q.filter(Ticket.created_at <= parse_date(end_date))
    tickets = q.all()

    by_status = {"open": 0, "in_progress": 0, "resolved": 0, "closed": 0}
    by_priority = {"low": 0, "medium": 0, "high": 0, "urgent": 0}
    resolution_hours = []
    for t in tickets:
        s = t.status or "open"
        by_status[s] = by_status.get(s, 0) + 1
        p = t.priority or "medium"
        by_priority[p] = by_priority.get(p, 0) + 1
        if t.resolved_at and t.created_at:
            diff = (t.resolved_at - t.created_at).total_seconds() / 3600
            resolution_hours.append(diff)

    avg = round(sum(resolution_hours) / len(resolution_hours), 1) if resolution_hours else None
    return {
        "by_status": by_status,
        "by_priority": by_priority,
        "avg_resolution_hours": avg,
        "total": len(tickets)
    }
