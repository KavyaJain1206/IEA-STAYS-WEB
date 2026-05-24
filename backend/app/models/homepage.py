from datetime import datetime

from sqlalchemy import DateTime, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database.session import Base


class HomepageContent(Base):
    __tablename__ = "homepage"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    hero_title: Mapped[str | None] = mapped_column(String(500))
    hero_subtitle: Mapped[str | None] = mapped_column(Text)

    stats_json: Mapped[str | None] = mapped_column(Text)
    promises_json: Mapped[str | None] = mapped_column(Text)
    coming_json: Mapped[str | None] = mapped_column(Text)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
