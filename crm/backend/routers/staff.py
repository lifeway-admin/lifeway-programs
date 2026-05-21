from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import models, schemas
from database import get_db
from auth import get_current_user

router = APIRouter(prefix="/staff", tags=["staff"])


@router.get("/", response_model=List[schemas.StaffOut])
def list_staff(
    role: Optional[str] = None,
    volunteers_only: bool = False,
    active_only: bool = True,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    q = db.query(models.Staff)
    if active_only:
        q = q.filter(models.Staff.is_active == True)
    if role:
        q = q.filter(models.Staff.role == role)
    if volunteers_only:
        q = q.filter(models.Staff.is_volunteer == True)
    return q.all()


@router.post("/", response_model=schemas.StaffOut, status_code=201)
def create_staff(staff: schemas.StaffCreate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    db_staff = models.Staff(**staff.model_dump())
    db.add(db_staff)
    db.commit()
    db.refresh(db_staff)
    return db_staff


@router.get("/{staff_id}", response_model=schemas.StaffOut)
def get_staff(staff_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    staff = db.query(models.Staff).filter(models.Staff.id == staff_id).first()
    if not staff:
        raise HTTPException(status_code=404, detail="Staff member not found")
    return staff


@router.patch("/{staff_id}", response_model=schemas.StaffOut)
def update_staff(staff_id: int, updates: schemas.StaffUpdate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    staff = db.query(models.Staff).filter(models.Staff.id == staff_id).first()
    if not staff:
        raise HTTPException(status_code=404, detail="Staff member not found")
    for field, value in updates.model_dump(exclude_unset=True).items():
        setattr(staff, field, value)
    db.commit()
    db.refresh(staff)
    return staff


@router.delete("/{staff_id}", status_code=204)
def delete_staff(staff_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    staff = db.query(models.Staff).filter(models.Staff.id == staff_id).first()
    if not staff:
        raise HTTPException(status_code=404, detail="Staff member not found")
    db.delete(staff)
    db.commit()
