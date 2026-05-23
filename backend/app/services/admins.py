from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth.security import hash_password, verify_password
from app.models.admin import AdminUser


def authenticate_admin(db: Session, email: str, password: str) -> AdminUser | None:
    admin = db.scalar(select(AdminUser).where(AdminUser.email == email))
    if admin is None or not admin.is_active or not verify_password(password, admin.password_hash):
        return None
    return admin


def create_admin_user(db: Session, email: str, full_name: str, password: str) -> AdminUser:
    admin = AdminUser(email=email, full_name=full_name, password_hash=hash_password(password))
    db.add(admin)
    db.commit()
    db.refresh(admin)
    return admin
