from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.visit_request import VisitRequest
from app.schemas.visit import VisitRequestCreate, VisitRequestRead

router = APIRouter(prefix="/visits", tags=["Visit Requests"])


@router.post("", response_model=VisitRequestRead, status_code=status.HTTP_201_CREATED)
def create_visit_request(payload: VisitRequestCreate, db: Session = Depends(get_db)) -> VisitRequest:
    visit = VisitRequest(**payload.model_dump())
    db.add(visit)
    db.commit()
    db.refresh(visit)
    return visit
