from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from app.core.config import get_settings
from app.database.session import SessionLocal
from app.routes import admin, catalog, residents, visits, homepage, media, homepage_sections
from app.services.catalog_seed import ensure_zodiac_starter_collections

settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    debug=settings.debug,
    docs_url="/docs" if settings.environment != "production" else None,
    redoc_url="/redoc" if settings.environment != "production" else None,
)

uploads_root = Path(__file__).resolve().parent / "static" / "uploads"
uploads_root.mkdir(parents=True, exist_ok=True)

app.mount("/uploads", StaticFiles(directory=uploads_root), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[str(origin).rstrip("/") for origin in settings.cors_origins],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "PUT", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

app.include_router(visits.router, prefix=settings.api_v1_prefix)
app.include_router(residents.router, prefix=settings.api_v1_prefix)
app.include_router(admin.router, prefix=settings.api_v1_prefix)
app.include_router(catalog.public_router, prefix=settings.api_v1_prefix)
app.include_router(catalog.admin_router, prefix=settings.api_v1_prefix)
app.include_router(homepage.public_router, prefix=settings.api_v1_prefix)
app.include_router(homepage.admin_router, prefix=settings.api_v1_prefix)
app.include_router(media.router, prefix=settings.api_v1_prefix)
app.include_router(homepage_sections.router, prefix=settings.api_v1_prefix)
app.include_router(admin_exports.router, prefix=settings.api_v1_prefix)


@app.on_event("startup")
def seed_catalog_starters() -> None:
    db = SessionLocal()
    try:
        ensure_zodiac_starter_collections(db)
    except Exception:
        db.rollback()
    finally:
        db.close()


@app.get("/health", tags=["Health"])
def health() -> dict[str, str]:
    return {"status": "ok"}
