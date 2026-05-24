import json

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_admin
from app.database.session import get_db
from app.schemas.homepage import HomepageRead, HomepageUpdate
from app.services.homepage import get_homepage, update_homepage

public_router = APIRouter(prefix="/homepage", tags=["Homepage"])
admin_router = APIRouter(prefix="/admin/homepage", tags=["Homepage Admin"])


# keep existing endpoints unchanged; sections are managed separately via /api/v1/homepage/sections


@public_router.get("", response_model=HomepageRead)
def read_homepage(db: Session = Depends(get_db)) -> dict:
    return get_homepage(db)


@admin_router.get("", response_model=HomepageRead)
def admin_read_homepage(_: object = Depends(get_current_admin), db: Session = Depends(get_db)) -> dict:
    return get_homepage(db)


@admin_router.post("", response_model=HomepageRead)
def admin_update_homepage(
    payload: HomepageUpdate,
    _: object = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> dict:
    try:
        return update_homepage(db, payload)
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc))
