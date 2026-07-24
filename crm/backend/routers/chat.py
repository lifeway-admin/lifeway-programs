from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import or_
from sqlalchemy.orm import Session

import models
import schemas
from auth import get_current_user, require_staff
from database import get_db

router = APIRouter(prefix="/chat", tags=["chat"])


def _resolve_session(session: models.ChatSession) -> schemas.ChatSessionOut:
    out = schemas.ChatSessionOut.model_validate(session)
    if session.assigned_staff:
        out.assigned_staff_name = f"{session.assigned_staff.first_name} {session.assigned_staff.last_name}"
    return out


def _my_staff(db: Session, current_user) -> Optional[models.Staff]:
    return db.query(models.Staff).filter(models.Staff.email == current_user.email).first()


def _make_summary_ticket(db: Session, session: models.ChatSession):
    transcript = "\n".join(
        f"[{m.created_at.strftime('%H:%M') if m.created_at else ''}] {m.sender_name}: {m.content}"
        for m in session.messages
    )
    has_staff_reply = any(m.sender_role == "staff" for m in session.messages)
    ticket = models.Ticket(
        title=f"Chat with {session.visitor_name}",
        description=transcript or "(no messages)",
        type="chat",
        status="resolved" if has_staff_reply else "open",
        priority="medium",
        channel="chat",
        assigned_to_id=session.assigned_staff_id,
        created_by="system",
    )
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    ticket.ticket_number = f"TKT-{ticket.id:04d}"
    db.commit()


@router.get("/sessions", response_model=List[schemas.ChatSessionOut])
def list_sessions(
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    q = db.query(models.ChatSession)
    if status:
        q = q.filter(models.ChatSession.status == status)
    sessions = q.order_by(
        (models.ChatSession.status != "waiting"),
        models.ChatSession.last_message_at.desc(),
    ).offset(skip).limit(limit).all()
    return [_resolve_session(s) for s in sessions]


@router.get("/sessions/count")
def count_sessions(
    status: str = "waiting",
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    count = db.query(models.ChatSession).filter(models.ChatSession.status == status).count()
    return {"count": count}


@router.get("/sessions/{session_id}", response_model=schemas.ChatSessionOut)
def get_session(session_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    session = db.query(models.ChatSession).filter(models.ChatSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Chat session not found")
    return _resolve_session(session)


@router.get("/sessions/{session_id}/messages", response_model=List[schemas.ChatMessageOut])
def poll_messages(
    session_id: int,
    after_id: int = Query(0, ge=0, le=9223372036854775807),
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    session = db.query(models.ChatSession).filter(models.ChatSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Chat session not found")
    return (
        db.query(models.ChatMessage)
        .filter(models.ChatMessage.session_id == session_id, models.ChatMessage.id > after_id)
        .order_by(models.ChatMessage.id)
        .all()
    )


@router.post("/sessions/{session_id}/claim", response_model=schemas.ChatSessionOut)
def claim_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_staff),
):
    session = db.query(models.ChatSession).filter(models.ChatSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Chat session not found")
    staff = _my_staff(db, current_user)
    if not staff:
        raise HTTPException(status_code=404, detail="No staff record linked to your account")

    # Atomic conditional claim: the WHERE clause only matches if the session is
    # still unclaimed or already claimed by this same staff member, so two staff
    # racing to claim at once can't both succeed.
    updated = (
        db.query(models.ChatSession)
        .filter(
            models.ChatSession.id == session_id,
            or_(models.ChatSession.assigned_staff_id.is_(None), models.ChatSession.assigned_staff_id == staff.id),
        )
        .update({"assigned_staff_id": staff.id, "status": "active"})
    )
    db.commit()
    if updated == 0:
        raise HTTPException(status_code=409, detail="This conversation is already claimed by another staff member")
    db.refresh(session)
    return _resolve_session(session)


@router.post("/sessions/{session_id}/messages", response_model=schemas.ChatMessageOut, status_code=201)
def send_staff_message(
    session_id: int,
    body: schemas.ChatMessageCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_staff),
):
    session = db.query(models.ChatSession).filter(models.ChatSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Chat session not found")
    if session.status == "closed":
        raise HTTPException(status_code=400, detail="This conversation has ended")

    staff = _my_staff(db, current_user)
    if not staff:
        raise HTTPException(status_code=404, detail="No staff record linked to your account")

    if not session.assigned_staff_id:
        # Atomic conditional auto-claim, same reasoning as claim_session: only one
        # of two racing first-replies actually wins the assignment.
        db.query(models.ChatSession).filter(
            models.ChatSession.id == session_id,
            models.ChatSession.assigned_staff_id.is_(None),
        ).update({"assigned_staff_id": staff.id, "status": "active"})
        db.commit()
        db.refresh(session)

    if session.assigned_staff_id != staff.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="This conversation is claimed by another staff member")

    message = models.ChatMessage(
        session_id=session.id,
        sender_role="staff",
        sender_name=f"{staff.first_name} {staff.last_name}",
        content=body.content,
    )
    db.add(message)
    session.last_message_at = datetime.utcnow()
    db.commit()
    db.refresh(message)
    return message


@router.patch("/sessions/{session_id}/close", response_model=schemas.ChatSessionOut)
def close_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_staff),
):
    session = db.query(models.ChatSession).filter(models.ChatSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Chat session not found")

    staff = _my_staff(db, current_user)
    if current_user.role != "admin" and (not staff or session.assigned_staff_id != staff.id):
        raise HTTPException(status_code=403, detail="Only the assigned staff member or an admin can close this conversation")

    # Atomic conditional close: only the caller that actually flips a still-open
    # session to closed creates the summary ticket, so a double-click or a race
    # with the scheduler's cleanup job can't create duplicate tickets.
    updated = (
        db.query(models.ChatSession)
        .filter(models.ChatSession.id == session_id, models.ChatSession.status != "closed")
        .update({"status": "closed", "closed_at": datetime.utcnow()})
    )
    db.commit()
    if updated == 0:
        raise HTTPException(status_code=400, detail="This conversation is already closed")
    db.refresh(session)
    _make_summary_ticket(db, session)
    return _resolve_session(session)
