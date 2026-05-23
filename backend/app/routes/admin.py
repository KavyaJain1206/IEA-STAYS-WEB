from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_admin
from app.auth.security import create_access_token
from app.database.session import get_db
from app.models.admin import AdminUser
from app.models.enums import ResidentStatus, VisitStatus
from app.models.resident import Resident
from app.models.visit_request import VisitRequest
from app.schemas.admin import AdminRead
from app.schemas.auth import LoginRequest, TokenResponse
from app.schemas.resident import ResidentAdminRead, ResidentStatusUpdate
from app.schemas.visit import VisitRequestRead, VisitStatusUpdate
from app.services.admins import authenticate_admin
from app.services.residents import update_resident_status

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.post("/login", response_model=TokenResponse)
def admin_login(payload: LoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    admin = authenticate_admin(db, payload.email, payload.password)
    if admin is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid admin email or password",
        )
    token = create_access_token(subject=str(admin.id), role="admin")
    return TokenResponse(access_token=token, role="admin")


@router.get("/me", response_model=AdminRead)
def admin_me(current_admin: AdminUser = Depends(get_current_admin)) -> AdminUser:
    return current_admin


@router.get("/visits", response_model=list[VisitRequestRead])
def list_visit_requests(
    status_filter: VisitStatus | None = Query(default=None, alias="status"),
    search: str | None = None,
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    _: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> list[VisitRequest]:
    query = select(VisitRequest)
    if status_filter:
        query = query.where(VisitRequest.status == status_filter)
    if search:
        term = f"%{search.strip()}%"
        query = query.where(
            or_(
                VisitRequest.name.ilike(term),
                VisitRequest.email.ilike(term),
                VisitRequest.phone.ilike(term),
            )
        )
    query = query.order_by(VisitRequest.created_at.desc()).limit(limit).offset(offset)
    return list(db.scalars(query))


@router.get("/visits/{visit_id}", response_model=VisitRequestRead)
def get_visit_request(
    visit_id: int,
    _: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> VisitRequest:
    visit = db.get(VisitRequest, visit_id)
    if visit is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Visit request not found")
    return visit


@router.patch("/visits/{visit_id}/status", response_model=VisitRequestRead)
def update_visit_status(
    visit_id: int,
    payload: VisitStatusUpdate,
    _: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> VisitRequest:
    visit = db.get(VisitRequest, visit_id)
    if visit is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Visit request not found")
    visit.status = payload.status
    visit.admin_notes = payload.admin_notes
    db.add(visit)
    db.commit()
    db.refresh(visit)
    return visit


@router.get("/residents", response_model=list[ResidentAdminRead])
def list_residents(
    status_filter: ResidentStatus | None = Query(default=None, alias="status"),
    search: str | None = None,
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    _: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> list[Resident]:
    query = select(Resident)
    if status_filter:
        query = query.where(Resident.status == status_filter)
    if search:
        term = f"%{search.strip()}%"
        query = query.where(
            or_(
                Resident.full_name.ilike(term),
                Resident.email.ilike(term),
                Resident.mobile.ilike(term),
                Resident.pan_number.ilike(term),
            )
        )
    query = query.order_by(Resident.created_at.desc()).limit(limit).offset(offset)
    return list(db.scalars(query))


@router.get("/residents/{resident_id}", response_model=ResidentAdminRead)
def get_resident(
    resident_id: int,
    _: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> Resident:
    resident = db.get(Resident, resident_id)
    if resident is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resident not found")
    return resident


@router.patch("/residents/{resident_id}/status", response_model=ResidentAdminRead)
def set_resident_status(
    resident_id: int,
    payload: ResidentStatusUpdate,
    _: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> Resident:
    resident = db.get(Resident, resident_id)
    if resident is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resident not found")
    return update_resident_status(db, resident, payload.status)
