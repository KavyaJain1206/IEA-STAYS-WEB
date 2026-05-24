from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_admin
from app.database.session import get_db
from app.models.homepage_section import HomepageSection
from app.schemas.homepage_section import (
    HomepageSectionCreate,
    HomepageSectionRead,
    HomepageSectionUpdate,
)
from app.services.homepage_sections import (
    create_section,
    delete_section,
    get_section,
    get_section_by_key,
    list_sections,
    update_section,
)

router = APIRouter(prefix="/homepage/sections", tags=["Homepage Sections"])


@router.get("/", response_model=list[HomepageSectionRead])
def read_sections(include_inactive: bool = Query(default=False), db: Session = Depends(get_db)) -> list[HomepageSection]:
    return list_sections(db, include_inactive=include_inactive)


@router.post("/", response_model=HomepageSectionRead, status_code=status.HTTP_201_CREATED)
def add_section(payload: HomepageSectionCreate, _=Depends(get_current_admin), db: Session = Depends(get_db)) -> HomepageSection:
    existing = get_section_by_key(db, payload.key)
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Section with this key already exists")
    return create_section(db, payload)


@router.get("/{section_id}", response_model=HomepageSectionRead)
def read_section(section_id: int, _=Depends(get_current_admin), db: Session = Depends(get_db)) -> HomepageSection:
    section = get_section(db, section_id)
    if section is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Section not found")
    return section


@router.patch("/{section_id}", response_model=HomepageSectionRead)
def edit_section(section_id: int, payload: HomepageSectionUpdate, _=Depends(get_current_admin), db: Session = Depends(get_db)) -> HomepageSection:
    section = get_section(db, section_id)
    if section is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Section not found")
    return update_section(db, section, payload)


@router.delete("/{section_id}")
def remove_section(section_id: int, _=Depends(get_current_admin), db: Session = Depends(get_db)) -> dict[str, str]:
    section = get_section(db, section_id)
    if section is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Section not found")
    delete_section(db, section)
    return {"message": "Section deleted"}
