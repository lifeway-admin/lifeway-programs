import csv
import io
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime
import models, schemas
from database import get_db
from auth import get_current_user

router = APIRouter(prefix="/donations", tags=["donations"])


@router.get("/", response_model=List[schemas.DonationOut])
def list_donations(
    skip: int = 0,
    limit: int = 100,
    campaign: Optional[str] = None,
    donation_type: Optional[str] = None,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    q = db.query(models.Donation)
    if campaign:
        q = q.filter(models.Donation.campaign == campaign)
    if donation_type:
        q = q.filter(models.Donation.donation_type == donation_type)
    return q.order_by(models.Donation.donation_date.desc()).offset(skip).limit(limit).all()


@router.get("/summary")
def donation_summary(db: Session = Depends(get_db), _=Depends(get_current_user)):
    total = db.query(func.sum(models.Donation.amount)).scalar() or 0
    count = db.query(func.count(models.Donation.id)).scalar() or 0
    now = datetime.now()
    month_total = (
        db.query(func.sum(models.Donation.amount))
        .filter(
            func.strftime("%Y-%m", models.Donation.donation_date)
            == now.strftime("%Y-%m")
        )
        .scalar() or 0
    )
    by_campaign = (
        db.query(models.Donation.campaign, func.sum(models.Donation.amount).label("total"))
        .group_by(models.Donation.campaign)
        .all()
    )
    return {
        "total_raised": round(total, 2),
        "total_donations": count,
        "this_month": round(month_total, 2),
        "by_campaign": [{"campaign": r[0] or "General", "total": round(r[1], 2)} for r in by_campaign],
    }


@router.get("/export/csv")
def export_donations_csv(db: Session = Depends(get_db), _=Depends(get_current_user)):
    donations = db.query(models.Donation).order_by(models.Donation.donation_date.desc()).all()

    def generate():
        buf = io.StringIO()
        writer = csv.writer(buf)
        writer.writerow([
            "id", "donor_name", "donor_email", "donor_phone", "donor_organization",
            "amount", "donation_date", "donation_type", "campaign", "payment_method",
            "is_anonymous", "tax_receipt_sent", "notes", "created_at",
        ])
        for d in donations:
            writer.writerow([
                d.id, d.donor_name, d.donor_email, d.donor_phone, d.donor_organization,
                d.amount, d.donation_date, d.donation_type, d.campaign, d.payment_method,
                d.is_anonymous, d.tax_receipt_sent, d.notes, d.created_at,
            ])
        yield buf.getvalue()

    return StreamingResponse(
        generate(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=donations.csv"},
    )


@router.post("/", response_model=schemas.DonationOut, status_code=201)
def create_donation(donation: schemas.DonationCreate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    db_donation = models.Donation(**donation.model_dump())
    db.add(db_donation)
    db.commit()
    db.refresh(db_donation)
    return db_donation


@router.get("/{donation_id}", response_model=schemas.DonationOut)
def get_donation(donation_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    donation = db.query(models.Donation).filter(models.Donation.id == donation_id).first()
    if not donation:
        raise HTTPException(status_code=404, detail="Donation not found")
    return donation


@router.patch("/{donation_id}", response_model=schemas.DonationOut)
def update_donation(donation_id: int, updates: schemas.DonationUpdate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    donation = db.query(models.Donation).filter(models.Donation.id == donation_id).first()
    if not donation:
        raise HTTPException(status_code=404, detail="Donation not found")
    for field, value in updates.model_dump(exclude_unset=True).items():
        setattr(donation, field, value)
    db.commit()
    db.refresh(donation)
    return donation
