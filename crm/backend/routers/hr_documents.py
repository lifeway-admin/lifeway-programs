import os
from uuid import uuid4
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Request, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

import models
import schemas
from auth import get_current_user, require_admin
from database import get_db
from limiter import limiter
from security_utils import safe_join

router = APIRouter(prefix="/hr-documents", tags=["hr-documents"])

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "uploads", "hr_documents")
UPLOAD_DIR = os.path.normpath(UPLOAD_DIR)
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_EXTENSIONS = {".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".png", ".jpg", ".jpeg", ".txt", ".md"}
MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024  # 25 MB


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


@router.post("/", response_model=schemas.HRDocumentOut, status_code=201)
@limiter.limit("20/hour")
async def upload_document(
    request: Request,
    title: str = Form(...),
    category: str = Form(...),
    description: Optional[str] = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(require_admin),
):
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"File type '{ext}' not allowed")

    stored_filename = f"{uuid4().hex}{ext}"
    dest_path = os.path.join(UPLOAD_DIR, stored_filename)

    size = 0
    try:
        with open(dest_path, "wb") as out:
            while chunk := await file.read(1024 * 1024):
                size += len(chunk)
                if size > MAX_FILE_SIZE_BYTES:
                    out.close()
                    os.remove(dest_path)
                    raise HTTPException(status_code=413, detail="File exceeds 25 MB limit")
                out.write(chunk)
    except HTTPException:
        raise
    except Exception:
        if os.path.exists(dest_path):
            os.remove(dest_path)
        raise HTTPException(status_code=500, detail="Failed to save file")

    doc = models.HRDocument(
        title=title,
        description=description,
        category=category,
        original_filename=os.path.basename(file.filename or stored_filename),
        stored_filename=stored_filename,
        content_type=file.content_type,
        file_size_bytes=size,
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
        path = safe_join(UPLOAD_DIR, doc.stored_filename)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid file reference")
    if not os.path.isfile(path):
        raise HTTPException(status_code=404, detail="File missing on disk")
    return FileResponse(path, media_type=doc.content_type, filename=doc.original_filename)


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
        path = safe_join(UPLOAD_DIR, doc.stored_filename)
        if os.path.isfile(path):
            os.remove(path)
    except (ValueError, OSError):
        pass
    db.delete(doc)
    db.commit()
