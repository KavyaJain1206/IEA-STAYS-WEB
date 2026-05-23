from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.auth.security import decode_access_token
from app.database.session import get_db
from app.models.admin import AdminUser
from app.models.resident import Resident

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/residents/login")


def get_current_resident(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> Resident:
    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = decode_access_token(token)
    except ValueError as exc:
        raise credentials_error from exc

    if payload.get("role") != "resident":
        raise credentials_error

    resident_id = payload.get("sub")
    resident = db.get(Resident, int(resident_id)) if resident_id else None
    if resident is None:
        raise credentials_error
    return resident


def get_current_admin(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> AdminUser:
    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Admin authentication required",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = decode_access_token(token)
    except ValueError as exc:
        raise credentials_error from exc

    if payload.get("role") != "admin":
        raise credentials_error

    admin_id = payload.get("sub")
    admin = db.get(AdminUser, int(admin_id)) if admin_id else None
    if admin is None or not admin.is_active:
        raise credentials_error
    return admin
