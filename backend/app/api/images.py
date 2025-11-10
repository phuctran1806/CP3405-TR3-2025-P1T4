from pathlib import Path
import shutil
import uuid

from fastapi import APIRouter, File, HTTPException, Response, UploadFile

from app.config import settings

router = APIRouter()

_configured_path = Path(settings.IMAGE_UPLOAD_DIR).expanduser()
try:
    UPLOAD_DIR = _configured_path.resolve()
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
except PermissionError:
    fallback = Path.cwd() / "uploads"
    UPLOAD_DIR = fallback
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


@router.post("/upload")
async def upload_image(file: UploadFile = File(...)):
    """Upload an image to the server."""
    # Check file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400, detail="Only image uploads allowed")

    # Create a safe, unique filename
    ext = Path(file.filename).suffix
    filename = f"{uuid.uuid4().hex}{ext}"
    file_path = UPLOAD_DIR / filename

    # Save file to disk
    with file_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Return URL path to access the image
    return {"url": f"/api/images/{filename}"}


@router.get("/{filename}")
async def get_image(filename: str):
    """Tell Nginx to serve the file (X-Accel-Redirect)."""
    file_path = UPLOAD_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")

    response = Response()
    response.headers["X-Accel-Redirect"] = f"/_internal_images/{filename}"
    return response
