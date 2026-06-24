from typing import List, Optional

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

import models
import schemas
from auth import get_current_user, require_admin
from database import get_db

router = APIRouter(prefix="/activity", tags=["activity"])


@router.get("/", response_model=List[schemas.ActivityLogOut])
def list_activity(
    entity_type: Optional[str] = None,
    entity_id: Optional[int] = None,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    q = db.query(models.ActivityLog)
    if entity_type:
        q = q.filter(models.ActivityLog.entity_type == entity_type)
    if entity_id is not None:
        q = q.filter(models.ActivityLog.entity_id == entity_id)
    return q.order_by(models.ActivityLog.created_at.desc()).limit(100).all()


@router.post("/", response_model=schemas.ActivityLogOut, status_code=201)
def log_activity(
    entry: schemas.ActivityLogCreate,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    db_entry = models.ActivityLog(**entry.model_dump())
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    return db_entry
