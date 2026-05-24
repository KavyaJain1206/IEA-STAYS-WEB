from pathlib import Path
import shutil
import uuid
from typing import Optional

import boto3
from botocore.exceptions import BotoCoreError, ClientError
from fastapi import UploadFile

from app.core.config import get_settings

settings = get_settings()

UPLOADS_ROOT = Path(__file__).resolve().parents[1] / "static" / "uploads"


def _ensure_uploads_dir() -> None:
    UPLOADS_ROOT.mkdir(parents=True, exist_ok=True)


def _local_save(file: UploadFile) -> str:
    _ensure_uploads_dir()
    suffix = Path(file.filename or "").suffix.lower() or ".jpg"
    filename = f"media-{uuid.uuid4().hex}{suffix}"
    destination = UPLOADS_ROOT / filename
    with destination.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return f"/uploads/{filename}"


def _s3_upload(file: UploadFile, key: str) -> str:
    # initialize client with optional endpoint
    client_kwargs = {}
    if settings.s3_region:
        client_kwargs["region_name"] = settings.s3_region
    if settings.s3_endpoint:
        client_kwargs["endpoint_url"] = settings.s3_endpoint

    if settings.s3_access_key and settings.s3_secret_key:
        client = boto3.client(
            "s3",
            aws_access_key_id=settings.s3_access_key,
            aws_secret_access_key=settings.s3_secret_key,
            **client_kwargs,
        )
    else:
        client = boto3.client("s3", **client_kwargs)

    try:
        # upload file.file which is a SpooledTemporaryFile-like object
        client.upload_fileobj(file.file, settings.s3_bucket, key)
    except (BotoCoreError, ClientError) as exc:
        raise

    # build URL
    if settings.cdn_base_url:
        return f"{settings.cdn_base_url.rstrip('/')}/{key}"
    if settings.s3_endpoint:
        return f"{settings.s3_endpoint.rstrip('/')}/{settings.s3_bucket}/{key}"
    # default to AWS S3 public URL
    region = settings.s3_region
    if region:
        return f"https://{settings.s3_bucket}.s3.{region}.amazonaws.com/{key}"
    return f"https://{settings.s3_bucket}.s3.amazonaws.com/{key}"


def upload_file(file: UploadFile) -> str:
    # Always save a local copy for backward compatibility
    local_path = _local_save(file)

    # If S3 configured, also upload and return S3 URL
    if settings.media_backend and settings.media_backend.lower() == "s3":
        # need to reopen file; UploadFile's file was consumed by local save, so reopen source
        # To support this, consumers should pass a fresh UploadFile or we should read from local copy
        # We'll upload from the local copy path to S3.
        key = local_path.lstrip("/")
        # upload local file to s3
        with (Path(UPLOADS_ROOT) / Path(key).name).open("rb") as fh:
            client_kwargs = {}
            if settings.s3_region:
                client_kwargs["region_name"] = settings.s3_region
            if settings.s3_endpoint:
                client_kwargs["endpoint_url"] = settings.s3_endpoint

            if settings.s3_access_key and settings.s3_secret_key:
                s3 = boto3.client(
                    "s3",
                    aws_access_key_id=settings.s3_access_key,
                    aws_secret_access_key=settings.s3_secret_key,
                    **client_kwargs,
                )
            else:
                s3 = boto3.client("s3", **client_kwargs)

            s3.upload_fileobj(fh, settings.s3_bucket, key)

        if settings.cdn_base_url:
            return f"{settings.cdn_base_url.rstrip('/')}/{key}"
        if settings.s3_endpoint:
            return f"{settings.s3_endpoint.rstrip('/')}/{settings.s3_bucket}/{key}"
        region = settings.s3_region
        if region:
            return f"https://{settings.s3_bucket}.s3.{region}.amazonaws.com/{key}"
        return f"https://{settings.s3_bucket}.s3.amazonaws.com/{key}"

    return local_path


def resolve_path(path: str) -> Optional[str]:
    # If absolute http URL, return as-is
    if path is None:
        return None
    if path.startswith("http://") or path.startswith("https://"):
        return path

    # If local uploads and file exists, return local path
    if path.startswith("/uploads/"):
        candidate = UPLOADS_ROOT / Path(path).name
        if candidate.exists():
            return path
        # else if s3 configured, map to s3
        if settings.media_backend and settings.media_backend.lower() == "s3" and settings.s3_bucket:
            key = path.lstrip("/")
            if settings.cdn_base_url:
                return f"{settings.cdn_base_url.rstrip('/')}/{key}"
            if settings.s3_endpoint:
                return f"{settings.s3_endpoint.rstrip('/')}/{settings.s3_bucket}/{key}"
            region = settings.s3_region
            if region:
                return f"https://{settings.s3_bucket}.s3.{region}.amazonaws.com/{key}"
            return f"https://{settings.s3_bucket}.s3.amazonaws.com/{key}"

    # unknown: return as-is
    return path
