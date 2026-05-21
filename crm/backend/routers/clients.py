import csv
import io
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List, Optional
import models, schemas
from database import get_db
from auth import get_current_user

router = APIRouter(prefix="/clients", tags=["clients"])


@router.get("/", response_model=List[schemas.ClientOut])
def list_clients(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    service: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    q = db.query(models.Client)
    if status:
        q = q.filter(models.Client.case_status == status)
    if service:
        q = q.filter(models.Client.primary_service == service)
    if search:
        term = f"%{search}%"
        q = q.filter(
            models.Client.first_name.ilike(term)
            | models.Client.last_name.ilike(term)
            | models.Client.email.ilike(term)
        )
    return q.offset(skip).limit(limit).all()


@router.get("/count")
def count_clients(
    status: Optional[str] = None,
    service: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    q = db.query(models.Client)
    if status:
        q = q.filter(models.Client.case_status == status)
    if service:
        q = q.filter(models.Client.primary_service == service)
    if search:
        term = f"%{search}%"
        q = q.filter(
            models.Client.first_name.ilike(term)
            | models.Client.last_name.ilike(term)
            | models.Client.email.ilike(term)
        )
    return {"count": q.count()}


@router.get("/export/csv")
def export_clients_csv(db: Session = Depends(get_db), _=Depends(get_current_user)):
    clients = db.query(models.Client).order_by(models.Client.last_name).all()

    def generate():
        buf = io.StringIO()
        writer = csv.writer(buf)
        writer.writerow([
            "id", "first_name", "last_name", "email", "phone", "address",
            "date_of_birth", "intake_date", "case_status", "primary_service",
            "services_needed", "assigned_staff_id", "emergency_contact_name",
            "emergency_contact_phone", "insurance", "notes", "created_at",
        ])
        for c in clients:
            writer.writerow([
                c.id, c.first_name, c.last_name, c.email, c.phone, c.address,
                c.date_of_birth, c.intake_date, c.case_status, c.primary_service,
                c.services_needed, c.assigned_staff_id, c.emergency_contact_name,
                c.emergency_contact_phone, c.insurance, c.notes, c.created_at,
            ])
        yield buf.getvalue()

    return StreamingResponse(
        generate(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=clients.csv"},
    )


@router.post("/", response_model=schemas.ClientOut, status_code=201)
def create_client(client: schemas.ClientCreate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    db_client = models.Client(**client.model_dump())
    db.add(db_client)
    db.commit()
    db.refresh(db_client)
    return db_client


@router.get("/duplicates", response_model=List[schemas.ClientOut])
def check_duplicates(name: str = "", email: str = "", db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    results = []
    seen_ids = set()
    if email:
        matches = db.query(models.Client).filter(models.Client.email == email).limit(3).all()
        for m in matches:
            if m.id not in seen_ids:
                results.append(m)
                seen_ids.add(m.id)
    if name:
        words = [w for w in name.strip().split() if len(w) >= 2]
        for word in words[:3]:
            matches = db.query(models.Client).filter(
                (models.Client.first_name.ilike(f"%{word}%")) | (models.Client.last_name.ilike(f"%{word}%"))
            ).limit(5).all()
            for m in matches:
                if m.id not in seen_ids and len(results) < 5:
                    results.append(m)
                    seen_ids.add(m.id)
    return results[:5]


@router.get("/{client_id}", response_model=schemas.ClientOut)
def get_client(client_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    client = db.query(models.Client).filter(models.Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    return client


@router.patch("/{client_id}", response_model=schemas.ClientOut)
def update_client(client_id: int, updates: schemas.ClientUpdate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    client = db.query(models.Client).filter(models.Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    for field, value in updates.model_dump(exclude_unset=True).items():
        setattr(client, field, value)
    db.commit()
    db.refresh(client)
    return client


@router.delete("/{client_id}", status_code=204)
def delete_client(client_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    client = db.query(models.Client).filter(models.Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    db.delete(client)
    db.commit()
