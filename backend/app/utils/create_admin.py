import getpass

from sqlalchemy import select

from app.database.session import SessionLocal
from app.models.admin import AdminUser
from app.services.admins import create_admin_user


def main() -> None:
    email = input("Admin email: ").strip().lower()
    full_name = input("Admin full name: ").strip()
    password = getpass.getpass("Admin password: ")
    confirm_password = getpass.getpass("Confirm password: ")

    if password != confirm_password:
        raise SystemExit("Passwords do not match")
    if len(password) < 8:
        raise SystemExit("Password must be at least 8 characters")

    with SessionLocal() as db:
        existing = db.scalar(select(AdminUser).where(AdminUser.email == email))
        if existing:
            raise SystemExit("Admin user already exists")
        admin = create_admin_user(db, email=email, full_name=full_name, password=password)
        print(f"Created admin user #{admin.id}: {admin.email}")


if __name__ == "__main__":
    main()
