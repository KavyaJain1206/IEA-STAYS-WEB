from datetime import datetime

from pydantic import BaseModel, EmailStr, Field, field_validator

from app.models.enums import ResidentStatus
from app.schemas.common import ORMModel


def mask_identifier(value: str, visible_digits: int = 4) -> str:
    if len(value) <= visible_digits:
        return "*" * len(value)
    return f"{'*' * (len(value) - visible_digits)}{value[-visible_digits:]}"


class ResidentSignup(BaseModel):
    full_name: str = Field(min_length=2, max_length=160)
    mobile: str = Field(min_length=7, max_length=20)
    alternate_mobile: str | None = Field(default=None, max_length=20)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)

    aadhaar_number: str = Field(min_length=12, max_length=12)
    pan_number: str = Field(min_length=10, max_length=10)

    permanent_address: str = Field(min_length=8, max_length=3000)
    residence_address: str = Field(min_length=8, max_length=3000)

    occupation: str = Field(min_length=2, max_length=120)
    firm_name: str | None = Field(default=None, max_length=180)
    firm_address: str | None = Field(default=None, max_length=3000)

    next_of_kin: str = Field(min_length=2, max_length=160)
    relationship: str = Field(min_length=2, max_length=80)
    kin_mobile: str = Field(min_length=7, max_length=20)
    kin_alternate_mobile: str | None = Field(default=None, max_length=20)

    food_from_iea: bool
    food_delivery_provider: str | None = Field(default=None, max_length=160)

    @field_validator("mobile", "alternate_mobile", "kin_mobile", "kin_alternate_mobile")
    @classmethod
    def clean_phone(cls, value: str | None) -> str | None:
        if value is None or value == "":
            return None
        cleaned = value.strip()
        allowed = set("0123456789+ -()")
        if any(char not in allowed for char in cleaned):
            raise ValueError("Phone number contains invalid characters")
        return cleaned

    @field_validator("aadhaar_number")
    @classmethod
    def validate_aadhaar(cls, value: str) -> str:
        if not value.isdigit():
            raise ValueError("Aadhaar number must contain 12 digits")
        return value

    @field_validator("pan_number")
    @classmethod
    def validate_pan(cls, value: str) -> str:
        normalized = value.upper()
        if not normalized.isalnum():
            raise ValueError("PAN number must contain only letters and digits")
        return normalized


class ResidentProfile(ORMModel):
    id: int
    full_name: str
    mobile: str
    alternate_mobile: str | None
    email: EmailStr
    aadhaar_number: str
    pan_number: str
    permanent_address: str
    residence_address: str
    occupation: str
    firm_name: str | None
    firm_address: str | None
    next_of_kin: str
    relationship: str
    kin_mobile: str
    kin_alternate_mobile: str | None
    food_from_iea: bool
    food_delivery_provider: str | None
    status: ResidentStatus
    created_at: datetime
    updated_at: datetime

    @field_validator("aadhaar_number")
    @classmethod
    def mask_aadhaar(cls, value: str) -> str:
        return mask_identifier(value)

    @field_validator("pan_number")
    @classmethod
    def mask_pan(cls, value: str) -> str:
        return mask_identifier(value)


class ResidentAdminRead(ORMModel):
    id: int
    full_name: str
    mobile: str
    alternate_mobile: str | None
    email: EmailStr
    aadhaar_number: str
    pan_number: str
    permanent_address: str
    residence_address: str
    occupation: str
    firm_name: str | None
    firm_address: str | None
    next_of_kin: str
    relationship: str
    kin_mobile: str
    kin_alternate_mobile: str | None
    food_from_iea: bool
    food_delivery_provider: str | None
    status: ResidentStatus
    created_at: datetime
    updated_at: datetime


class ResidentStatusUpdate(BaseModel):
    status: ResidentStatus
