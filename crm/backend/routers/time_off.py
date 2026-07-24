from datetime import datetime, timedelta
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import models
import schemas
from auth import get_current_user, require_staff, require_admin
from database import get_db

router = APIRouter(prefix="/time-off", tags=["time-off"])

HOURS_PER_DAY = 8.0


def _business_hours(start_date, end_date) -> float:
    if end_date < start_date:
        raise ValueError("end_date must be on or after start_date")
    days = 0
    d = start_date
    while d <= end_date:
        if d.weekday() < 5:  # Mon-Fri
            days += 1
        d += timedelta(days=1)
    if days == 0:
        raise ValueError("Date range contains no weekdays")
    return days * HOURS_PER_DAY


def _resolve(req: models.TimeOffRequest) -> schemas.TimeOffOut:
    out = schemas.TimeOffOut.model_validate(req)
    if req.staff:
        out.staff_name = f"{req.staff.first_name} {req.staff.last_name}"
    return out


def _my_staff(db: Session, current_user) -> Optional[models.Staff]:
    return db.query(models.Staff).filter(models.Staff.email == current_user.email).first()


@router.get("/", response_model=List[schemas.TimeOffOut])
def list_requests(
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    q = db.query(models.TimeOffRequest)
    if status:
        q = q.filter(models.TimeOffRequest.status == status)
    requests = q.order_by(models.TimeOffRequest.created_at.desc()).all()
    return [_resolve(r) for r in requests]


@router.get("/me", response_model=schemas.TimeOffMe)
def my_time_off(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    staff = _my_staff(db, current_user)
    if not staff:
        raise HTTPException(status_code=404, detail="No staff record linked to your account")
    requests = (
        db.query(models.TimeOffRequest)
        .filter(models.TimeOffRequest.staff_id == staff.id)
        .order_by(models.TimeOffRequest.created_at.desc())
        .all()
    )
    return schemas.TimeOffMe(
        balance_hours=staff.pto_balance_hours,
        requests=[_resolve(r) for r in requests],
    )


@router.post("/", response_model=schemas.TimeOffOut, status_code=201)
def create_request(
    body: schemas.TimeOffCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_staff),
):
    staff = _my_staff(db, current_user)
    if not staff:
        raise HTTPException(status_code=404, detail="No staff record linked to your account")
    if body.end_date < body.start_date:
        raise HTTPException(status_code=400, detail="End date must be on or after start date")
    try:
        hours = _business_hours(body.start_date, body.end_date)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    req = models.TimeOffRequest(
        staff_id=staff.id,
        request_type=body.request_type,
        start_date=body.start_date,
        end_date=body.end_date,
        hours_requested=hours,
        notes=body.notes,
        status="pending",
    )
    db.add(req)
    db.commit()
    db.refresh(req)
    return _resolve(req)


@router.patch("/{request_id}/approve", response_model=schemas.TimeOffOut)
def approve_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin),
):
    req = db.query(models.TimeOffRequest).filter(models.TimeOffRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    if req.status != "pending":
        raise HTTPException(status_code=400, detail=f"Request is already {req.status}")

    staff = db.query(models.Staff).filter(models.Staff.id == req.staff_id).first()
    if not staff:
        raise HTTPException(status_code=404, detail="Staff member for this request no longer exists")
    if req.hours_requested > staff.pto_balance_hours:
        raise HTTPException(status_code=400, detail="Insufficient PTO balance — adjust the staff record first")

    staff.pto_balance_hours -= req.hours_requested
    req.status = "approved"
    req.reviewed_by = current_user.full_name or current_user.username
    req.reviewed_at = datetime.utcnow()
    db.commit()
    db.refresh(req)
    return _resolve(req)


@router.patch("/{request_id}/deny", response_model=schemas.TimeOffOut)
def deny_request(
    request_id: int,
    body: schemas.TimeOffReview,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin),
):
    req = db.query(models.TimeOffRequest).filter(models.TimeOffRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    if req.status != "pending":
        raise HTTPException(status_code=400, detail=f"Request is already {req.status}")

    req.status = "denied"
    req.reviewed_by = current_user.full_name or current_user.username
    req.reviewed_at = datetime.utcnow()
    req.admin_notes = body.admin_notes
    db.commit()
    db.refresh(req)
    return _resolve(req)


@router.delete("/{request_id}", status_code=204)
def cancel_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_staff),
):
    req = db.query(models.TimeOffRequest).filter(models.TimeOffRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    if current_user.role != "admin":
        staff = _my_staff(db, current_user)
        if not staff or staff.id != req.staff_id:
            raise HTTPException(status_code=403, detail="Not authorized to cancel this request")
        if req.status != "pending":
            raise HTTPException(status_code=400, detail="Only pending requests can be cancelled")
    db.delete(req)
    db.commit()
