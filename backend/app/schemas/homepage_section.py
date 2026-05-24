from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class HomepageSectionBase(BaseModel):
    key: str = Field(..., description="Unique key for the section, e.g. 'hero'")
    type: str = Field(..., description="Section type: hero, stats, promises, coming, custom")
    title: str | None = None
    content_json: str | None = None
    is_active: bool = True
    sort_order: int = 0


class HomepageSectionCreate(HomepageSectionBase):
    pass


class HomepageSectionUpdate(BaseModel):
    title: str | None = None
    content_json: str | None = None
    is_active: bool | None = None
    sort_order: int | None = None


class HomepageSectionRead(HomepageSectionBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True
