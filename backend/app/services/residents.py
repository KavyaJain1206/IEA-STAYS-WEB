from fastapi import HTTPException, status
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.auth.security import hash_password, verify_password
from app.models.enums import ResidentStatus
from app.models.resident import Resident
from app.schemas.resident import ResidentSignup


def create_resident(db: Session, payload: ResidentSignup) -> Resident:
    existing = db.scalar(
        select(Resident).where(
            or_(
                Resident.email == payload.email,
                Resident.aadhaar_number == payload.aadhaar_number,
                Resident.pan_number == payload.pan_number,
            )
        )
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Resident with matching email, Aadhaar, or PAN already exists",
        )

    resident = Resident(
        **payload.model_dump(exclude={"password"}),
        password_hash=hash_password(payload.password),
    )
    db.add(resident)
    db.commit()
    db.refresh(resident)
    return resident


def authenticate_resident(db: Session, email: str, password: str) -> Resident | None:
    resident = db.scalar(select(Resident).where(Resident.email == email))
    if resident is None or not verify_password(password, resident.password_hash):
        return None
    return resident


def update_resident_status(db: Session, resident: Resident, status_value: ResidentStatus) -> Resident:
    resident.status = status_value
    db.add(resident)
    db.commit()
    db.refresh(resident)
    return resident
