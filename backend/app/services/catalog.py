import re

from fastapi import HTTPException, status
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session, joinedload

from app.models.catalog import Home, HomeCollection
from app.schemas.catalog import (
    CatalogCollectionCreate,
    CatalogCollectionUpdate,
    CatalogHomeCreate,
    CatalogHomeUpdate,
)


def slugify(value: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", value.strip().lower()).strip("-")
    return slug or "item"


def _make_unique_slug(db: Session, model: type[HomeCollection] | type[Home], name: str, exclude_id: int | None = None) -> str:
    base_slug = slugify(name)
    slug = base_slug
    suffix = 2

    while True:
        query = select(model).where(model.slug == slug)
        if exclude_id is not None:
            query = query.where(model.id != exclude_id)
        existing = db.scalar(query)
        if existing is None:
            return slug
        slug = f"{base_slug}-{suffix}"
        suffix += 1


def create_collection(db: Session, payload: CatalogCollectionCreate) -> HomeCollection:
    existing = db.scalar(select(HomeCollection).where(HomeCollection.name == payload.name))
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Collection name already exists")

    slug = _make_unique_slug(db, HomeCollection, payload.name)
    collection = HomeCollection(slug=slug, **payload.model_dump())
    db.add(collection)
    db.commit()
    db.refresh(collection)
    return collection


def update_collection(db: Session, collection: HomeCollection, payload: CatalogCollectionUpdate) -> HomeCollection:
    data = payload.model_dump(exclude_unset=True)
    if name := data.get("name"):
        duplicate = db.scalar(
            select(HomeCollection).where(HomeCollection.name == name, HomeCollection.id != collection.id)
        )
        if duplicate:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Collection name already exists")
        collection.name = name
        collection.slug = _make_unique_slug(db, HomeCollection, name, exclude_id=collection.id)

    for field_name, value in data.items():
        if field_name == "name":
            continue
        setattr(collection, field_name, value)

    db.add(collection)
    db.commit()
    db.refresh(collection)
    return collection


def delete_collection(db: Session, collection: HomeCollection) -> None:
    db.delete(collection)
    db.commit()


def list_collections(db: Session, include_inactive: bool = False) -> list[HomeCollection]:
    query = select(HomeCollection).order_by(HomeCollection.sort_order.asc(), HomeCollection.created_at.asc())
    if not include_inactive:
        query = query.where(HomeCollection.is_active.is_(True))
    return list(db.scalars(query))


def get_collection(db: Session, collection_id: int) -> HomeCollection | None:
    return db.get(HomeCollection, collection_id)


def create_home(db: Session, payload: CatalogHomeCreate) -> Home:
    collection = db.get(HomeCollection, payload.collection_id)
    if collection is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Collection not found")

    existing = db.scalar(select(Home).where(Home.name == payload.name))
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Home name already exists")

    slug = _make_unique_slug(db, Home, payload.name)
    home = Home(slug=slug, **payload.model_dump())
    db.add(home)
    db.commit()
    db.refresh(home)
    return home


def update_home(db: Session, home: Home, payload: CatalogHomeUpdate) -> Home:
    data = payload.model_dump(exclude_unset=True)
    if collection_id := data.get("collection_id"):
        collection = db.get(HomeCollection, collection_id)
        if collection is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Collection not found")

    if name := data.get("name"):
        duplicate = db.scalar(select(Home).where(Home.name == name, Home.id != home.id))
        if duplicate:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Home name already exists")
        home.name = name
        home.slug = _make_unique_slug(db, Home, name, exclude_id=home.id)

    for field_name, value in data.items():
        if field_name == "name":
            continue
        setattr(home, field_name, value)

    db.add(home)
    db.commit()
    db.refresh(home)
    return home


def delete_home(db: Session, home: Home) -> None:
    db.delete(home)
    db.commit()


def list_homes(db: Session, include_inactive: bool = False) -> list[Home]:
    query = select(Home).options(joinedload(Home.collection)).order_by(Home.sort_order.asc(), Home.created_at.asc())
    if not include_inactive:
        query = query.where(Home.is_active.is_(True)).where(Home.collection.has(is_active=True))
    return list(db.scalars(query))


def get_home(db: Session, home_id: int) -> Home | None:
    query = select(Home).options(joinedload(Home.collection)).where(Home.id == home_id)
    return db.scalar(query)


def get_catalog_counts(db: Session) -> dict[str, int]:
    collection_count = db.scalar(select(func.count()).select_from(HomeCollection)) or 0
    home_count = db.scalar(select(func.count()).select_from(Home)) or 0
    return {"collections": int(collection_count), "homes": int(home_count)}