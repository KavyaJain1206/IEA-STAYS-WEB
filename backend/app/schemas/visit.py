from datetime import date, datetime

from pydantic import BaseModel, EmailStr, Field, field_validator

from app.models.enums import PreferredHome, VisitStatus, VisitTimeSlot
from app.schemas.common import ORMModel


class VisitRequestCreate(BaseModel):
    name: str = Field(min_length=2, max_length=160)
    phone: str = Field(min_length=7, max_length=20)
    email: EmailStr
    home: PreferredHome
    preferred_date: date | None = None
    preferred_time: VisitTimeSlot
    message: str | None = Field(default=None, max_length=2000)

    @field_validator("phone")
    @classmethod
    def clean_phone(cls, value: str) -> str:
        cleaned = value.strip()
        allowed = set("0123456789+ -()")
        if not cleaned or any(char not in allowed for char in cleaned):
            raise ValueError("Phone number contains invalid characters")
        return cleaned


class VisitRequestRead(ORMModel):
    id: int
    name: str
    phone: str
    email: EmailStr
    home: PreferredHome
    preferred_date: date | None
    preferred_time: VisitTimeSlot
    message: str | None
    status: VisitStatus
    admin_notes: str | None
    created_at: datetime
    updated_at: datetime


class VisitStatusUpdate(BaseModel):
    status: VisitStatus
    admin_notes: str | None = Field(default=None, max_length=2000)
