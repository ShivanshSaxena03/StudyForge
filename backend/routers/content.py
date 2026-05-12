from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import os, uuid, aiofiles
from database import get_db
import models
from security import get_current_user
from services.text_extractor import extract_text

router = APIRouter()

UPLOAD_DIR = "uploads"


class ContentOut(BaseModel):
    id: int
    book_id: int
    content_type: str
    title: str
    file_path: Optional[str] = None
    text_content: Optional[str] = None
    extracted_text: Optional[str] = None
    file_size: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True


def verify_book_access(book_id: int, user_id: int, db: Session) -> models.Book:
    book = db.query(models.Book).filter(
        models.Book.id == book_id,
        models.Book.owner_id == user_id
    ).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    return book


@router.get("/{book_id}/items", response_model=List[ContentOut])
async def list_content(
    book_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    verify_book_access(book_id, current_user.id, db)
    contents = db.query(models.Content).filter(models.Content.book_id == book_id).all()
    return contents


@router.post("/{book_id}/upload")
async def upload_file(
    book_id: int,
    file: UploadFile = File(...),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    verify_book_access(book_id, current_user.id, db)

    ext = os.path.splitext(file.filename)[1].lower()
    allowed = {".pdf": "pdf", ".docx": "docx", ".mp3": "audio", ".wav": "audio", ".m4a": "audio", ".ogg": "audio"}
    if ext not in allowed:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {ext}")

    content_type = allowed[ext]
    unique_name = f"{uuid.uuid4()}{ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_name)

    async with aiofiles.open(file_path, "wb") as f:
        content_bytes = await file.read()
        await f.write(content_bytes)

    extracted = await extract_text(file_path, content_type)

    content = models.Content(
        book_id=book_id,
        content_type=content_type,
        title=file.filename,
        file_path=file_path,
        extracted_text=extracted,
        file_size=len(content_bytes),
    )
    db.add(content)
    db.commit()
    db.refresh(content)
    return ContentOut.model_validate(content)


@router.post("/{book_id}/text")
async def add_text_note(
    book_id: int,
    title: str = Form(...),
    text_content: str = Form(...),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    verify_book_access(book_id, current_user.id, db)
    content = models.Content(
        book_id=book_id,
        content_type="text",
        title=title,
        text_content=text_content,
        extracted_text=text_content,
    )
    db.add(content)
    db.commit()
    db.refresh(content)
    return ContentOut.model_validate(content)


@router.delete("/{book_id}/items/{content_id}")
async def delete_content(
    book_id: int,
    content_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    verify_book_access(book_id, current_user.id, db)
    content = db.query(models.Content).filter(
        models.Content.id == content_id,
        models.Content.book_id == book_id
    ).first()
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    if content.file_path and os.path.exists(content.file_path):
        os.remove(content.file_path)
    db.delete(content)
    db.commit()
    return {"message": "Content deleted"}
