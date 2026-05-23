from datetime import datetime

from pydantic import BaseModel, Field

from app.schemas.common import ORMModel


class CatalogCollectionBase(BaseModel):
    name: str = Field(min_length=2, max_length=160)
    symbol: str = Field(min_length=1, max_length=16)
    tone: str = Field(min_length=2, max_length=160)
    description: str | None = Field(default=None, max_length=3000)
    cover_image_src: str | None = Field(default=None, max_length=500)
    is_active: bool = True
    sort_order: int = Field(default=0, ge=0, le=10000)


class CatalogCollectionCreate(CatalogCollectionBase):
    pass


class CatalogCollectionUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=160)
    symbol: str | None = Field(default=None, min_length=1, max_length=16)
    tone: str | None = Field(default=None, min_length=2, max_length=160)
    description: str | None = Field(default=None, max_length=3000)
    cover_image_src: str | None = Field(default=None, max_length=500)
    is_active: bool | None = None
    sort_order: int | None = Field(default=None, ge=0, le=10000)


class CatalogCollectionRead(ORMModel):
    id: int
    name: str
    slug: str
    symbol: str
    tone: str
    description: str | None
    cover_image_src: str | None
    is_active: bool
    sort_order: int
    created_at: datetime
    updated_at: datetime


class CatalogHomeBase(BaseModel):
    collection_id: int
    name: str = Field(min_length=2, max_length=160)
    location: str = Field(min_length=2, max_length=180)
    description: str | None = Field(default=None, max_length=3000)
    image_src: str = Field(min_length=3, max_length=500)
    photo_class_name: str | None = Field(default=None, max_length=80)
    is_active: bool = True
    sort_order: int = Field(default=0, ge=0, le=10000)


class CatalogHomeCreate(CatalogHomeBase):
    pass


class CatalogHomeUpdate(BaseModel):
    collection_id: int | None = None
    name: str | None = Field(default=None, min_length=2, max_length=160)
    location: str | None = Field(default=None, min_length=2, max_length=180)
    description: str | None = Field(default=None, max_length=3000)
    image_src: str | None = Field(default=None, max_length=500)
    photo_class_name: str | None = Field(default=None, max_length=80)
    is_active: bool | None = None
    sort_order: int | None = Field(default=None, ge=0, le=10000)


class CatalogHomeCollectionSummary(ORMModel):
    id: int
    name: str
    slug: str
    symbol: str
    tone: str
    cover_image_src: str | None
    is_active: bool


class CatalogHomeRead(ORMModel):
    id: int
    collection_id: int
    name: str
    slug: str
    location: str
    description: str | None
    image_src: str
    photo_class_name: str | None
    is_active: bool
    sort_order: int
    collection: CatalogHomeCollectionSummary
    created_at: datetime
    updated_at: datetime