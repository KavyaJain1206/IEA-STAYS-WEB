from datetime import datetime

from pydantic import EmailStr

from app.schemas.common import ORMModel


class AdminRead(ORMModel):
    id: int
    email: EmailStr
    full_name: str
    is_active: bool
    created_at: datetime
