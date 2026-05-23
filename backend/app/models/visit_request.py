from datetime import date, datetime

from sqlalchemy import Date, DateTime, Enum, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database.session import Base
from app.models.enums import PreferredHome, VisitStatus, VisitTimeSlot


class VisitRequest(Base):
    __tablename__ = "visit_requests"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(160), nullable=False)
    phone: Mapped[str] = mapped_column(String(20), index=True, nullable=False)
    email: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    home: Mapped[PreferredHome] = mapped_column(
        Enum(
            PreferredHome,
            name="preferred_home",
            values_callable=lambda enum: [item.value for item in enum],
        ),
        nullable=False,
    )
    preferred_date: Mapped[date | None] = mapped_column(Date)
    preferred_time: Mapped[VisitTimeSlot] = mapped_column(
        Enum(
            VisitTimeSlot,
            name="visit_time_slot",
            values_callable=lambda enum: [item.value for item in enum],
        ),
        nullable=False,
    )
    message: Mapped[str | None] = mapped_column(Text)
    status: Mapped[VisitStatus] = mapped_column(
        Enum(
            VisitStatus,
            name="visit_status",
            values_callable=lambda enum: [item.value for item in enum],
        ),
        default=VisitStatus.NEW,
        index=True,
        nullable=False,
    )
    admin_notes: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
