from datetime import datetime

from sqlalchemy import Boolean, DateTime, Enum, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database.session import Base
from app.models.enums import ResidentStatus


class Resident(Base):
    __tablename__ = "residents"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    full_name: Mapped[str] = mapped_column(String(160), nullable=False)
    mobile: Mapped[str] = mapped_column(String(20), index=True, nullable=False)
    alternate_mobile: Mapped[str | None] = mapped_column(String(20))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)

    aadhaar_number: Mapped[str] = mapped_column(String(12), unique=True, index=True, nullable=False)
    pan_number: Mapped[str] = mapped_column(String(10), unique=True, index=True, nullable=False)

    permanent_address: Mapped[str] = mapped_column(Text, nullable=False)
    residence_address: Mapped[str] = mapped_column(Text, nullable=False)

    occupation: Mapped[str] = mapped_column(String(120), nullable=False)
    firm_name: Mapped[str | None] = mapped_column(String(180))
    firm_address: Mapped[str | None] = mapped_column(Text)

    next_of_kin: Mapped[str] = mapped_column(String(160), nullable=False)
    relationship: Mapped[str] = mapped_column(String(80), nullable=False)
    kin_mobile: Mapped[str] = mapped_column(String(20), nullable=False)
    kin_alternate_mobile: Mapped[str | None] = mapped_column(String(20))

    food_from_iea: Mapped[bool] = mapped_column(Boolean, nullable=False)
    food_delivery_provider: Mapped[str | None] = mapped_column(String(160))

    status: Mapped[ResidentStatus] = mapped_column(
        Enum(
            ResidentStatus,
            name="resident_status",
            values_callable=lambda enum: [item.value for item in enum],
        ),
        default=ResidentStatus.PENDING,
        index=True,
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
