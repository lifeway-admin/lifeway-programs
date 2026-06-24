import os
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from sqlalchemy.orm import Session
import models
import schemas
from database import get_db

# Must be set in .env — generate with: python3 -c "import secrets; print(secrets.token_hex(32))"
SECRET_KEY = os.environ["JWT_SECRET_KEY"]
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30  # HIPAA: short-lived tokens

CLINICAL_ROLES = {"admin", "staff"}

# bcrypt — industry standard for password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode["exp"] = expire
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def authenticate_user(db: Session, username: str, password: str):
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user or not verify_password(password, user.hashed_password):
        return None
    return user


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(models.User).filter(models.User.username == username).first()
    if user is None or not user.is_active:
        raise credentials_exception
    return user


def require_admin(current_user: models.User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user


def require_staff(current_user: models.User = Depends(get_current_user)):
    """Requires admin or staff role — blocks readonly accounts from mutating data."""
    if current_user.role not in CLINICAL_ROLES:
        raise HTTPException(status_code=403, detail="Write access required")
    return current_user


def password_strength_check(password: str) -> None:
    errors = []
    if len(password) < 12:
        errors.append("at least 12 characters")
    if not any(c.isupper() for c in password):
        errors.append("one uppercase letter")
    if not any(c.islower() for c in password):
        errors.append("one lowercase letter")
    if not any(c.isdigit() for c in password):
        errors.append("one number")
    if not any(c in "!@#$%^&*()_+-=[]{}|;':\",./<>?" for c in password):
        errors.append("one special character (!@#$%^&* etc.)")
    if errors:
        raise HTTPException(
            status_code=400,
            detail=f"Password must contain: {', '.join(errors)}",
        )


# ── Auth router ───────────────────────────────────────────────────────────────

auth_router = APIRouter(prefix="/auth", tags=["auth"])


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


@auth_router.post("/change-password")
def change_password(req: ChangePasswordRequest, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if not pwd_context.verify(req.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    if req.new_password == req.current_password:
        raise HTTPException(status_code=400, detail="New password must differ from current password")
    password_strength_check(req.new_password)
    current_user.hashed_password = pwd_context.hash(req.new_password)
    db.commit()
    return {"message": "Password updated successfully"}
