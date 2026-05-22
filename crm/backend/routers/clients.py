import csv
import io
import os
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
import models, schemas
from database import get_db
from auth import get_current_user, require_staff, require_admin
from limiter import limiter

router = APIRouter(prefix="/clients", tags=["clients"])


@router.get("/", response_model=List[schemas.ClientOut])
def list_clients(
    skip: int = 0,
    limit: int = Query(default=100, le=500),
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
@limiter.limit("5/minute")
def export_clients_csv(request: Request, db: Session = Depends(get_db), _=Depends(get_current_user)):
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
def create_client(client: schemas.ClientCreate, db: Session = Depends(get_db), _=Depends(require_staff)):
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
def get_client(client_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    client = db.query(models.Client).filter(models.Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    # HIPAA: log every individual PHI record access
    db.add(models.ActivityLog(
        entity_type="client",
        entity_id=client_id,
        action="viewed",
        actor=current_user.username,
        detail=f"Record accessed by {current_user.role}",
    ))
    db.commit()
    return client


@router.patch("/{client_id}", response_model=schemas.ClientOut)
def update_client(client_id: int, updates: schemas.ClientUpdate, db: Session = Depends(get_db), _=Depends(require_staff)):
    client = db.query(models.Client).filter(models.Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    for field, value in updates.model_dump(exclude_unset=True).items():
        setattr(client, field, value)
    db.commit()
    db.refresh(client)
    return client


@router.delete("/{client_id}", status_code=204)
def delete_client(client_id: int, db: Session = Depends(get_db), _=Depends(require_admin)):
    client = db.query(models.Client).filter(models.Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    db.delete(client)
    db.commit()


# ── Payment Request ───────────────────────────────────────────────────────────

class PaymentRequestBody(BaseModel):
    amount_cents: int
    description: str = "Service Fee"
    send_email: bool = True
    send_sms: bool = False


@router.post("/{client_id}/payment-request")
@limiter.limit("20/hour")
def send_payment_request(
    request: Request,
    client_id: int,
    body: PaymentRequestBody,
    db: Session = Depends(get_db),
    current_user=Depends(require_staff),
):
    """Create a Stripe Checkout session and send the payment link to the client."""
    client = db.query(models.Client).filter(models.Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    stripe_key = os.getenv("STRIPE_SECRET_KEY", "")
    if not stripe_key:
        raise HTTPException(status_code=503, detail="Stripe is not configured. Add STRIPE_SECRET_KEY to your environment.")

    if body.amount_cents < 100:
        raise HTTPException(status_code=400, detail="Minimum amount is $1.00")

    try:
        import stripe
        stripe.api_key = stripe_key

        success_url = os.getenv("STRIPE_SUCCESS_URL", "http://localhost:5173") + "/payment-complete"
        cancel_url = os.getenv("STRIPE_CANCEL_URL", "http://localhost:5173")
        client_name = f"{client.first_name} {client.last_name}"

        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[{
                "price_data": {
                    "currency": "usd",
                    "product_data": {
                        "name": body.description,
                        "description": f"Service fee for {client_name} — Lifeway Programs",
                    },
                    "unit_amount": body.amount_cents,
                },
                "quantity": 1,
            }],
            mode="payment",
            success_url=success_url + "?session_id={CHECKOUT_SESSION_ID}",
            cancel_url=cancel_url,
            customer_email=client.email or None,
            metadata={
                "client_id": str(client_id),
                "client_name": client_name,
                "payment_type": "service_fee",
                "description": body.description,
                "sent_by": current_user.username,
            },
        )
        checkout_url = session.url
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Stripe error: {e}")

    amount_str = f"${body.amount_cents / 100:.2f}"

    # Send email
    if body.send_email and client.email:
        try:
            from email_service import send_payment_request_email
            send_payment_request_email(
                to_email=client.email,
                client_name=client_name,
                amount_str=amount_str,
                description=body.description,
                checkout_url=checkout_url,
            )
        except Exception as e:
            print(f"[payment] Email failed: {e}")

    # Send SMS
    if body.send_sms and client.phone:
        try:
            from sms_service import send_payment_request_sms
            send_payment_request_sms(
                to_phone=client.phone,
                client_name=client_name,
                amount_str=amount_str,
                description=body.description,
                checkout_url=checkout_url,
            )
        except Exception as e:
            print(f"[payment] SMS failed: {e}")

    return {"success": True, "checkout_url": checkout_url, "amount": amount_str}
