import os
from uuid import uuid4
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from botocore.exceptions import ClientError

import models
import schemas
import r2_storage
from auth import get_current_user, require_admin
from database import get_db
from limiter import limiter

router = APIRouter(prefix="/hr-documents", tags=["hr-documents"])

ALLOWED_EXTENSIONS = {".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".png", ".jpg", ".jpeg", ".txt", ".md"}
MAX_FILE_SIZE_BYTES = 1024 * 1024 * 1024  # 1 GB — enforced by R2 via the presigned POST policy


@router.get("/", response_model=List[schemas.HRDocumentOut])
def list_documents(
    category: Optional[str] = None,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    q = db.query(models.HRDocument)
    if category:
        q = q.filter(models.HRDocument.category == category)
    return q.order_by(models.HRDocument.category, models.HRDocument.title).all()


@router.post("/presign-upload", response_model=schemas.HRDocumentPresignOut)
@limiter.limit("20/hour")
def presign_upload(
    request: Request,
    body: schemas.HRDocumentPresignRequest,
    _=Depends(require_admin),
):
    ext = os.path.splitext(body.filename or "")[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"File type '{ext}' not allowed")

    stored_filename = f"{uuid4().hex}{ext}"
    try:
        presigned = r2_storage.generate_presigned_post(
            key=stored_filename,
            content_type=body.content_type or "application/octet-stream",
            max_size_bytes=MAX_FILE_SIZE_BYTES,
        )
    except Exception:
        raise HTTPException(status_code=503, detail="File storage is not available right now")

    return schemas.HRDocumentPresignOut(
        upload_url=presigned["url"],
        upload_fields=presigned["fields"],
        stored_filename=stored_filename,
    )


@router.post("/confirm", response_model=schemas.HRDocumentOut, status_code=201)
def confirm_upload(
    body: schemas.HRDocumentConfirm,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin),
):
    try:
        head = r2_storage.head_object(body.stored_filename)
    except ClientError:
        raise HTTPException(status_code=400, detail="Upload not found — it may not have completed")
    except Exception:
        raise HTTPException(status_code=503, detail="File storage is not available right now")

    doc = models.HRDocument(
        title=body.title,
        description=body.description,
        category=body.category,
        original_filename=body.original_filename,
        stored_filename=body.stored_filename,
        content_type=head.get("ContentType"),
        file_size_bytes=head.get("ContentLength", 0),
        uploaded_by=current_user.full_name or current_user.username,
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return doc


@router.get("/{doc_id}/download")
def download_document(doc_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    doc = db.query(models.HRDocument).filter(models.HRDocument.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    try:
        url = r2_storage.generate_presigned_download_url(doc.stored_filename, doc.original_filename)
    except Exception:
        raise HTTPException(status_code=503, detail="File storage is not available right now")
    return {"download_url": url}


@router.patch("/{doc_id}", response_model=schemas.HRDocumentOut)
def update_document(
    doc_id: int,
    updates: schemas.HRDocumentUpdate,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    doc = db.query(models.HRDocument).filter(models.HRDocument.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    for field, value in updates.model_dump(exclude_unset=True).items():
        setattr(doc, field, value)
    db.commit()
    db.refresh(doc)
    return doc


@router.delete("/{doc_id}", status_code=204)
def delete_document(doc_id: int, db: Session = Depends(get_db), _=Depends(require_admin)):
    doc = db.query(models.HRDocument).filter(models.HRDocument.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    try:
        r2_storage.delete_object(doc.stored_filename)
    except Exception:
        pass  # DB row is the source of truth for the UI; don't block delete on a storage hiccup
    db.delete(doc)
    db.commit()
