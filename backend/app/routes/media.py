from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, status
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_admin
from app.database.session import get_db
from app.services.media import resolve_path, upload_file

router = APIRouter(prefix="/media", tags=["Media"])


@router.post("/uploads/image")
def upload_image(file: UploadFile = UploadFile(...), _: object = Depends(get_current_admin)) -> dict:
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Please upload an image file")
    src = upload_file(file)
    return {"src": src}


@router.get("/resolve")
def resolve(src: str = Query(...)) -> dict:
    url = resolve_path(src)
    if url is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Path not found")
    return {"url": url}
