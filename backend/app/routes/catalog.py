from pathlib import Path
from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_admin
from app.database.session import get_db
from app.models.admin import AdminUser
from app.models.catalog import Home, HomeCollection
from app.schemas.catalog import (
    CatalogCollectionCreate,
    CatalogCollectionRead,
    CatalogCollectionUpdate,
    CatalogHomeCreate,
    CatalogHomeRead,
    CatalogHomeUpdate,
)
from app.services.catalog import (
    create_collection,
    create_home,
    delete_collection,
    delete_home,
    get_catalog_counts,
    get_collection,
    get_home,
    list_collections,
    list_homes,
    update_collection,
    update_home,
)
from app.services.media import upload_file

public_router = APIRouter(prefix="/catalog", tags=["Catalog"])
admin_router = APIRouter(prefix="/admin/catalog", tags=["Catalog Admin"])
UPLOADS_ROOT = Path(__file__).resolve().parents[1] / "static" / "uploads"


def _save_catalog_image(file: UploadFile) -> str:
    # leverage media.upload_file which will save locally and optionally to S3
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Please upload an image file")

    try:
        return upload_file(file)
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc))


@public_router.get("/collections", response_model=list[CatalogCollectionRead])
def read_public_collections(db: Session = Depends(get_db)) -> list[HomeCollection]:
    return list_collections(db)


@public_router.get("/homes", response_model=list[CatalogHomeRead])
def read_public_homes(db: Session = Depends(get_db)) -> list[Home]:
    return list_homes(db)


@admin_router.get("/summary")
def read_catalog_summary(
    _: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> dict[str, int]:
    return get_catalog_counts(db)


@admin_router.post("/uploads/image")
def upload_catalog_image(
    file: UploadFile = File(...),
    _: AdminUser = Depends(get_current_admin),
) -> dict[str, str]:
    return {"src": _save_catalog_image(file)}


@admin_router.get("/collections", response_model=list[CatalogCollectionRead])
def read_admin_collections(
    include_inactive: bool = Query(default=True),
    _: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> list[HomeCollection]:
    return list_collections(db, include_inactive=include_inactive)


@admin_router.post("/collections", response_model=CatalogCollectionRead, status_code=status.HTTP_201_CREATED)
def add_collection(
    payload: CatalogCollectionCreate,
    _: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> HomeCollection:
    return create_collection(db, payload)


@admin_router.get("/collections/{collection_id}", response_model=CatalogCollectionRead)
def read_collection(
    collection_id: int,
    _: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> HomeCollection:
    collection = get_collection(db, collection_id)
    if collection is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Collection not found")
    return collection


@admin_router.patch("/collections/{collection_id}", response_model=CatalogCollectionRead)
def edit_collection(
    collection_id: int,
    payload: CatalogCollectionUpdate,
    _: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> HomeCollection:
    collection = get_collection(db, collection_id)
    if collection is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Collection not found")
    return update_collection(db, collection, payload)


@admin_router.delete("/collections/{collection_id}")
def remove_collection(
    collection_id: int,
    _: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> dict[str, str]:
    collection = get_collection(db, collection_id)
    if collection is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Collection not found")
    delete_collection(db, collection)
    return {"message": "Collection deleted"}


@admin_router.get("/homes", response_model=list[CatalogHomeRead])
def read_admin_homes(
    include_inactive: bool = Query(default=True),
    _: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> list[Home]:
    return list_homes(db, include_inactive=include_inactive)


@admin_router.post("/homes", response_model=CatalogHomeRead, status_code=status.HTTP_201_CREATED)
def add_home(
    payload: CatalogHomeCreate,
    _: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> Home:
    return create_home(db, payload)


@admin_router.get("/homes/{home_id}", response_model=CatalogHomeRead)
def read_home(
    home_id: int,
    _: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> Home:
    home = get_home(db, home_id)
    if home is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Home not found")
    return home


@admin_router.patch("/homes/{home_id}", response_model=CatalogHomeRead)
def edit_home(
    home_id: int,
    payload: CatalogHomeUpdate,
    _: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> Home:
    home = get_home(db, home_id)
    if home is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Home not found")
    return update_home(db, home, payload)


@admin_router.delete("/homes/{home_id}")
def remove_home(
    home_id: int,
    _: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> dict[str, str]:
    home = get_home(db, home_id)
    if home is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Home not found")
    delete_home(db, home)
    return {"message": "Home deleted"}