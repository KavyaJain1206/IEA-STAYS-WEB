from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_resident
from app.auth.security import create_access_token
from app.database.session import get_db
from app.models.resident import Resident
from app.schemas.auth import LoginRequest, TokenResponse
from app.schemas.resident import ResidentProfile, ResidentSignup
from app.services.residents import authenticate_resident, create_resident

router = APIRouter(prefix="/residents", tags=["Residents"])


@router.post("/signup", response_model=ResidentProfile, status_code=status.HTTP_201_CREATED)
def signup(payload: ResidentSignup, db: Session = Depends(get_db)) -> Resident:
    return create_resident(db, payload)


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    resident = authenticate_resident(db, payload.email, payload.password)
    if resident is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    token = create_access_token(subject=str(resident.id), role="resident")
    return TokenResponse(access_token=token, role="resident")


@router.get("/me", response_model=ResidentProfile)
def me(current_resident: Resident = Depends(get_current_resident)) -> Resident:
    return current_resident
