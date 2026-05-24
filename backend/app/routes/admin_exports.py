import os
import json
import subprocess
from datetime import datetime, timezone
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import FileResponse, StreamingResponse
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_admin
from app.database.session import get_db
from app.models.admin import AdminUser
from app.models.catalog import Home, HomeCollection
from app.models.resident import Resident
from app.models.visit_request import VisitRequest
from app.services.homepage import get_homepage
from app.utils.filters import apply_date_filter
from app.utils.exports import generate_csv_response

router = APIRouter(prefix="/admin", tags=["Admin Exports & Backups"])
BACKUPS_DIR = Path("/var/www/IEA-STAYS-WEB/backups")
BACKUPS_DIR.mkdir(parents=True, exist_ok=True)

@router.get("/exports/collections")
def export_collections(
    format: str = Query("json", enum=["json", "csv"]),
    filter_type: str | None = Query(None),
    start_date: str | None = Query(None),
    end_date: str | None = Query(None),
    _: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    query = select(HomeCollection)
    query = apply_date_filter(query, HomeCollection, filter_type, start_date, end_date)
    collections = list(db.scalars(query))

    if format == "csv":
        headers = ["id", "name", "slug", "symbol", "tone", "description", "is_active", "sort_order", "created_at"]
        rows = [
            [c.id, c.name, c.slug, c.symbol, c.tone, c.description, c.is_active, c.sort_order, c.created_at.isoformat() if c.created_at else ""]
            for c in collections
        ]
        return generate_csv_response(headers, rows, "collections_export")

    return [
        {
            "id": c.id,
            "name": c.name,
            "slug": c.slug,
            "symbol": c.symbol,
            "tone": c.tone,
            "description": c.description,
            "is_active": c.is_active,
            "sort_order": c.sort_order,
            "created_at": c.created_at.isoformat() if c.created_at else None,
        }
        for c in collections
    ]

@router.get("/exports/homes")
def export_homes(
    format: str = Query("json", enum=["json", "csv"]),
    filter_type: str | None = Query(None),
    start_date: str | None = Query(None),
    end_date: str | None = Query(None),
    _: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    query = select(Home)
    query = apply_date_filter(query, Home, filter_type, start_date, end_date)
    homes = list(db.scalars(query))

    if format == "csv":
        headers = ["id", "collection_id", "name", "slug", "location", "description", "image_src", "is_active", "sort_order", "created_at"]
        rows = [
            [h.id, h.collection_id, h.name, h.slug, h.location, h.description, h.image_src, h.is_active, h.sort_order, h.created_at.isoformat() if h.created_at else ""]
            for h in homes
        ]
        return generate_csv_response(headers, rows, "homes_export")

    return [
        {
            "id": h.id,
            "collection_id": h.collection_id,
            "name": h.name,
            "slug": h.slug,
            "location": h.location,
            "description": h.description,
            "image_src": h.image_src,
            "is_active": h.is_active,
            "sort_order": h.sort_order,
            "created_at": h.created_at.isoformat() if h.created_at else None,
        }
        for h in homes
    ]

@router.get("/exports/residents")
def export_residents(
    format: str = Query("json", enum=["json", "csv"]),
    filter_type: str | None = Query(None),
    start_date: str | None = Query(None),
    end_date: str | None = Query(None),
    _: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    query = select(Resident)
    query = apply_date_filter(query, Resident, filter_type, start_date, end_date)
    residents = list(db.scalars(query))

    if format == "csv":
        headers = ["id", "full_name", "mobile", "email", "aadhaar_number", "pan_number", "occupation", "next_of_kin", "relationship", "kin_mobile", "status", "created_at"]
        rows = [
            [r.id, r.full_name, r.mobile, r.email, r.aadhaar_number, r.pan_number, r.occupation, r.next_of_kin, r.relationship, r.kin_mobile, r.status.value if r.status else "", r.created_at.isoformat() if r.created_at else ""]
            for r in residents
        ]
        return generate_csv_response(headers, rows, "residents_export")

    return [
        {
            "id": r.id,
            "full_name": r.full_name,
            "mobile": r.mobile,
            "email": r.email,
            "aadhaar_number": r.aadhaar_number,
            "pan_number": r.pan_number,
            "occupation": r.occupation,
            "next_of_kin": r.next_of_kin,
            "relationship": r.relationship,
            "kin_mobile": r.kin_mobile,
            "status": r.status.value if r.status else None,
            "created_at": r.created_at.isoformat() if r.created_at else None,
        }
        for r in residents
    ]

@router.get("/exports/visit-requests")
def export_visit_requests(
    format: str = Query("json", enum=["json", "csv"]),
    filter_type: str | None = Query(None),
    start_date: str | None = Query(None),
    end_date: str | None = Query(None),
    _: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    query = select(VisitRequest)
    query = apply_date_filter(query, VisitRequest, filter_type, start_date, end_date)
    visits = list(db.scalars(query))

    if format == "csv":
        headers = ["id", "name", "phone", "email", "home", "preferred_date", "preferred_time", "message", "status", "created_at"]
        rows = [
            [v.id, v.name, v.phone, v.email, v.home.value if v.home else "", v.preferred_date.isoformat() if v.preferred_date else "", v.preferred_time.value if v.preferred_time else "", v.message or "", v.status.value if v.status else "", v.created_at.isoformat() if v.created_at else ""]
            for v in visits
        ]
        return generate_csv_response(headers, rows, "visit_requests_export")

    return [
        {
            "id": v.id,
            "name": v.name,
            "phone": v.phone,
            "email": v.email,
            "home": v.home.value if v.home else None,
            "preferred_date": v.preferred_date.isoformat() if v.preferred_date else None,
            "preferred_time": v.preferred_time.value if v.preferred_time else None,
            "message": v.message,
            "status": v.status.value if v.status else None,
            "created_at": v.created_at.isoformat() if v.created_at else None,
        }
        for v in visits
    ]

@router.get("/exports/homepage")
def export_homepage(
    _: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    return get_homepage(db)

@router.get("/exports/media")
def export_media(
    _: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    homes_with_images = db.scalars(select(Home).where(Home.image_src != None)).all()
    media_metadata = [
        {
            "home_id": h.id,
            "home_name": h.name,
            "image_src": h.image_src,
            "photo_class_name": h.photo_class_name,
        }
        for h in homes_with_images
    ]
    return media_metadata

@router.get("/backups/list")
def list_backups(_: AdminUser = Depends(get_current_admin)):
    files = []
    if BACKUPS_DIR.exists():
        for filename in os.listdir(BACKUPS_DIR):
            file_path = BACKUPS_DIR / filename
            if file_path.is_file() and (filename.endswith(".sql.gz") or filename.endswith(".tar.gz")):
                stat = file_path.stat()
                files.append({
                    "filename": filename,
                    "size_bytes": stat.st_size,
                    "created_at": datetime.fromtimestamp(stat.st_mtime, tz=timezone.utc).isoformat(),
                    "type": "database" if filename.endswith(".sql.gz") else "media",
                })
    files.sort(key=lambda x: x["created_at"], reverse=True)
    return files

@router.post("/backups/trigger")
def trigger_backup(_: AdminUser = Depends(get_current_admin)):
    script_path = Path("/var/www/IEA-STAYS-WEB/backend/scripts/run_backups.sh")
    if not script_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Backup runner script not found"
        )
    
    try:
        result = subprocess.run(
            ["bash", str(script_path)],
            capture_output=True,
            text=True,
            check=True
        )
        return {
            "status": "success",
            "message": "Backup executed successfully",
            "stdout": result.stdout,
        }
    except subprocess.CalledProcessError as err:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Backup execution failed: {err.stderr}"
        )

@router.get("/backups/download")
def download_backup(
    file: str = Query(...),
    _: AdminUser = Depends(get_current_admin),
):
    safe_path = BACKUPS_DIR / os.path.basename(file)
    if not safe_path.exists() or not safe_path.is_file():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Backup file not found"
        )
    return FileResponse(
        path=safe_path,
        media_type="application/octet-stream",
        filename=os.path.basename(file)
    )
