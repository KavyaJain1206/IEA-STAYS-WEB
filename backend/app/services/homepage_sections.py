from typing import List

from sqlalchemy.orm import Session

from app.models.homepage_section import HomepageSection
from app.schemas.homepage_section import HomepageSectionCreate, HomepageSectionRead, HomepageSectionUpdate


def list_sections(db: Session, include_inactive: bool = False) -> List[HomepageSection]:
    q = db.query(HomepageSection)
    if not include_inactive:
        q = q.filter(HomepageSection.is_active.is_(True))
    return q.order_by(HomepageSection.sort_order.asc(), HomepageSection.id.asc()).all()


def get_section(db: Session, section_id: int) -> HomepageSection | None:
    return db.query(HomepageSection).filter(HomepageSection.id == section_id).one_or_none()


def get_section_by_key(db: Session, key: str) -> HomepageSection | None:
    return db.query(HomepageSection).filter(HomepageSection.key == key).one_or_none()


def create_section(db: Session, payload: HomepageSectionCreate) -> HomepageSection:
    section = HomepageSection(**payload.model_dump())
    db.add(section)
    db.commit()
    db.refresh(section)
    return section


def update_section(db: Session, section: HomepageSection, payload: HomepageSectionUpdate) -> HomepageSection:
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(section, k, v)
    db.add(section)
    db.commit()
    db.refresh(section)
    return section


def delete_section(db: Session, section: HomepageSection) -> None:
    db.delete(section)
    db.commit()
