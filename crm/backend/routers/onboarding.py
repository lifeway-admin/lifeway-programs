from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import models
import schemas
from auth import get_current_user, require_staff, require_admin
from database import get_db

router = APIRouter(prefix="/onboarding", tags=["onboarding"])

DEFAULT_TASKS = [
    "Sign and return offer letter",
    "Complete I-9 / W-4 and direct deposit paperwork",
    "Read and sign Employee Handbook acknowledgment",
    "Complete HIPAA Workforce Training and sign acknowledgment",
    "IT account created (email, CRM login)",
    "Review Statement of Faith / mission alignment orientation",
    "Complete background check / licensure verification (clinical roles)",
    "Meet with supervisor to review job description and 90-day goals",
    "Tour office / meet care team",
    "Enroll in benefits (if applicable) or confirm volunteer/intern status paperwork",
]


def _resolve_checklist(checklist: models.OnboardingChecklist) -> schemas.OnboardingChecklistOut:
    out = schemas.OnboardingChecklistOut.model_validate(checklist)
    if checklist.staff:
        out.staff_name = f"{checklist.staff.first_name} {checklist.staff.last_name}"
    total = len(checklist.tasks)
    done = sum(1 for t in checklist.tasks if t.is_done)
    out.percent_complete = round(done / total * 100, 1) if total else 0.0
    return out


def _my_staff(db: Session, current_user) -> Optional[models.Staff]:
    return db.query(models.Staff).filter(models.Staff.email == current_user.email).first()


@router.get("/", response_model=List[schemas.OnboardingChecklistOut])
def list_checklists(
    in_progress_only: bool = False,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    checklists = db.query(models.OnboardingChecklist).order_by(models.OnboardingChecklist.created_at.desc()).all()
    resolved = [_resolve_checklist(c) for c in checklists]
    if in_progress_only:
        resolved = [c for c in resolved if c.percent_complete < 100]
    return resolved


@router.post("/", response_model=schemas.OnboardingChecklistOut, status_code=201)
def create_checklist(
    body: schemas.OnboardingChecklistCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin),
):
    staff = db.query(models.Staff).filter(models.Staff.id == body.staff_id).first()
    if not staff:
        raise HTTPException(status_code=404, detail="Staff member not found")
    existing = db.query(models.OnboardingChecklist).filter(models.OnboardingChecklist.staff_id == body.staff_id).first()
    if existing:
        raise HTTPException(status_code=409, detail="This staff member already has an onboarding checklist")

    checklist = models.OnboardingChecklist(
        staff_id=body.staff_id,
        notes=body.notes,
        created_by=current_user.full_name or current_user.username,
    )
    db.add(checklist)
    db.commit()
    db.refresh(checklist)

    for i, label in enumerate(DEFAULT_TASKS):
        db.add(models.OnboardingTask(checklist_id=checklist.id, label=label, sort_order=i, is_custom=False))
    db.commit()
    db.refresh(checklist)
    return _resolve_checklist(checklist)


@router.get("/me", response_model=schemas.OnboardingChecklistOut)
def my_checklist(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    staff = _my_staff(db, current_user)
    if not staff:
        raise HTTPException(status_code=404, detail="No staff record linked to your account")
    checklist = db.query(models.OnboardingChecklist).filter(models.OnboardingChecklist.staff_id == staff.id).first()
    if not checklist:
        raise HTTPException(status_code=404, detail="No onboarding checklist assigned yet")
    return _resolve_checklist(checklist)


@router.get("/{checklist_id}", response_model=schemas.OnboardingChecklistOut)
def get_checklist(checklist_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    checklist = db.query(models.OnboardingChecklist).filter(models.OnboardingChecklist.id == checklist_id).first()
    if not checklist:
        raise HTTPException(status_code=404, detail="Checklist not found")
    if current_user.role != "admin":
        staff = _my_staff(db, current_user)
        if not staff or staff.id != checklist.staff_id:
            raise HTTPException(status_code=403, detail="Not authorized to view this checklist")
    return _resolve_checklist(checklist)


@router.post("/{checklist_id}/tasks", response_model=schemas.OnboardingTaskOut, status_code=201)
def add_task(
    checklist_id: int,
    body: schemas.OnboardingTaskCreate,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    checklist = db.query(models.OnboardingChecklist).filter(models.OnboardingChecklist.id == checklist_id).first()
    if not checklist:
        raise HTTPException(status_code=404, detail="Checklist not found")
    max_order = max([t.sort_order for t in checklist.tasks], default=-1)
    task = models.OnboardingTask(checklist_id=checklist_id, label=body.label, sort_order=max_order + 1, is_custom=True)
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.patch("/tasks/{task_id}", response_model=schemas.OnboardingTaskOut)
def update_task(
    task_id: int,
    body: schemas.OnboardingTaskUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_staff),
):
    task = db.query(models.OnboardingTask).filter(models.OnboardingTask.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if current_user.role != "admin":
        staff = _my_staff(db, current_user)
        if not staff or staff.id != task.checklist.staff_id:
            raise HTTPException(status_code=403, detail="Not authorized to update this task")

    task.is_done = body.is_done
    if body.is_done:
        task.completed_by = current_user.full_name or current_user.username
        task.completed_at = datetime.utcnow()
    else:
        task.completed_by = None
        task.completed_at = None
    db.commit()
    db.refresh(task)
    return task


@router.delete("/tasks/{task_id}", status_code=204)
def delete_task(task_id: int, db: Session = Depends(get_db), _=Depends(require_admin)):
    task = db.query(models.OnboardingTask).filter(models.OnboardingTask.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(task)
    db.commit()


@router.delete("/{checklist_id}", status_code=204)
def delete_checklist(checklist_id: int, db: Session = Depends(get_db), _=Depends(require_admin)):
    checklist = db.query(models.OnboardingChecklist).filter(models.OnboardingChecklist.id == checklist_id).first()
    if not checklist:
        raise HTTPException(status_code=404, detail="Checklist not found")
    db.delete(checklist)
    db.commit()
