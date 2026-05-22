import csv
import io
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy import func
from sqlalchemy.orm import Session

import models
import schemas
from auth import get_current_user, require_staff, require_admin
from database import get_db

router = APIRouter(prefix="/tickets", tags=["tickets"])


def _resolve_ticket(ticket: models.Ticket) -> schemas.TicketOut:
    out = schemas.TicketOut.model_validate(ticket)
    if ticket.client:
        out.client_name = f"{ticket.client.first_name} {ticket.client.last_name}"
    if ticket.assigned_to:
        out.assignee_name = f"{ticket.assigned_to.first_name} {ticket.assigned_to.last_name}"
    return out


# ── List / count ──────────────────────────────────────────────────────────────

@router.get("/count")
def count_tickets(
    status: Optional[str] = None,
    priority: Optional[str] = None,
    type: Optional[str] = None,
    assigned_to_id: Optional[int] = None,
    client_id: Optional[int] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    q = db.query(models.Ticket)
    if status:
        q = q.filter(models.Ticket.status == status)
    if priority:
        q = q.filter(models.Ticket.priority == priority)
    if type:
        q = q.filter(models.Ticket.type == type)
    if assigned_to_id:
        q = q.filter(models.Ticket.assigned_to_id == assigned_to_id)
    if client_id:
        q = q.filter(models.Ticket.client_id == client_id)
    if search:
        term = f"%{search}%"
        q = q.filter(
            models.Ticket.title.ilike(term) | models.Ticket.description.ilike(term)
        )
    return {"count": q.count()}


@router.get("/stats", response_model=schemas.TicketStats)
def ticket_stats(db: Session = Depends(get_db), _=Depends(get_current_user)):
    # counts by status
    status_rows = (
        db.query(models.Ticket.status, func.count(models.Ticket.id))
        .group_by(models.Ticket.status)
        .all()
    )
    by_status = {row[0]: row[1] for row in status_rows}

    # counts by priority
    priority_rows = (
        db.query(models.Ticket.priority, func.count(models.Ticket.id))
        .group_by(models.Ticket.priority)
        .all()
    )
    by_priority = {row[0]: row[1] for row in priority_rows}

    # average resolution time in hours (only resolved tickets with resolved_at set)
    resolved = (
        db.query(models.Ticket)
        .filter(models.Ticket.resolved_at.isnot(None))
        .all()
    )
    avg_hours = None
    if resolved:
        total_seconds = sum(
            (t.resolved_at - t.created_at).total_seconds()
            for t in resolved
            if t.resolved_at and t.created_at
        )
        avg_hours = round(total_seconds / len(resolved) / 3600, 2)

    return schemas.TicketStats(
        by_status=by_status,
        by_priority=by_priority,
        avg_resolution_hours=avg_hours,
    )


@router.get("/export/csv")
def export_tickets_csv(db: Session = Depends(get_db), _=Depends(get_current_user)):
    tickets = db.query(models.Ticket).order_by(models.Ticket.created_at.desc()).all()

    def generate():
        buf = io.StringIO()
        writer = csv.writer(buf)
        writer.writerow([
            "id", "ticket_number", "title", "type", "status", "priority",
            "channel", "client_id", "assigned_to_id", "created_by",
            "resolution", "resolved_at", "created_at", "updated_at",
        ])
        for t in tickets:
            writer.writerow([
                t.id, t.ticket_number, t.title, t.type, t.status, t.priority,
                t.channel, t.client_id, t.assigned_to_id, t.created_by,
                t.resolution, t.resolved_at, t.created_at, t.updated_at,
            ])
        yield buf.getvalue()

    return StreamingResponse(
        generate(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=tickets.csv"},
    )


@router.get("/", response_model=List[schemas.TicketOut])
def list_tickets(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    type: Optional[str] = None,
    assigned_to_id: Optional[int] = None,
    client_id: Optional[int] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    q = db.query(models.Ticket)
    if status:
        q = q.filter(models.Ticket.status == status)
    if priority:
        q = q.filter(models.Ticket.priority == priority)
    if type:
        q = q.filter(models.Ticket.type == type)
    if assigned_to_id:
        q = q.filter(models.Ticket.assigned_to_id == assigned_to_id)
    if client_id:
        q = q.filter(models.Ticket.client_id == client_id)
    if search:
        term = f"%{search}%"
        q = q.filter(
            models.Ticket.title.ilike(term) | models.Ticket.description.ilike(term)
        )
    tickets = q.order_by(models.Ticket.created_at.desc()).offset(skip).limit(limit).all()
    return [_resolve_ticket(t) for t in tickets]


# ── Create ────────────────────────────────────────────────────────────────────

@router.post("/", response_model=schemas.TicketOut, status_code=201)
def create_ticket(
    ticket: schemas.TicketCreate,
    db: Session = Depends(get_db),
    _=Depends(require_staff),
):
    db_ticket = models.Ticket(**ticket.model_dump())
    db.add(db_ticket)
    db.commit()
    db.refresh(db_ticket)
    # Auto-generate ticket_number after we have the id
    db_ticket.ticket_number = f"TKT-{db_ticket.id:04d}"
    db.commit()
    db.refresh(db_ticket)
    return _resolve_ticket(db_ticket)


# ── Single ticket ─────────────────────────────────────────────────────────────

@router.get("/{ticket_id}", response_model=schemas.TicketOut)
def get_ticket(ticket_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    ticket = db.query(models.Ticket).filter(models.Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return _resolve_ticket(ticket)


@router.patch("/{ticket_id}", response_model=schemas.TicketOut)
def update_ticket(
    ticket_id: int,
    updates: schemas.TicketUpdate,
    db: Session = Depends(get_db),
    _=Depends(require_staff),
):
    ticket = db.query(models.Ticket).filter(models.Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    data = updates.model_dump(exclude_unset=True)
    # Auto-set resolved_at when status transitions to resolved
    if data.get("status") == "resolved" and ticket.status != "resolved":
        data["resolved_at"] = datetime.utcnow()

    for field, value in data.items():
        setattr(ticket, field, value)

    db.commit()
    db.refresh(ticket)
    return _resolve_ticket(ticket)


@router.delete("/{ticket_id}", status_code=204)
def delete_ticket(ticket_id: int, db: Session = Depends(get_db), _=Depends(require_admin)):
    ticket = db.query(models.Ticket).filter(models.Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    db.delete(ticket)
    db.commit()


# ── Comments ──────────────────────────────────────────────────────────────────

@router.post("/{ticket_id}/comments", response_model=schemas.TicketCommentOut, status_code=201)
def add_comment(
    ticket_id: int,
    comment: schemas.TicketCommentCreate,
    db: Session = Depends(get_db),
    _=Depends(require_staff),
):
    ticket = db.query(models.Ticket).filter(models.Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    db_comment = models.TicketComment(ticket_id=ticket_id, **comment.model_dump())
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    return db_comment


@router.get("/{ticket_id}/comments", response_model=List[schemas.TicketCommentOut])
def list_comments(
    ticket_id: int,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    ticket = db.query(models.Ticket).filter(models.Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return (
        db.query(models.TicketComment)
        .filter(models.TicketComment.ticket_id == ticket_id)
        .order_by(models.TicketComment.created_at)
        .all()
    )
