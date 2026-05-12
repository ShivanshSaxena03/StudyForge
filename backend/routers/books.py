from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from database import get_db
import models
from security import get_current_user

router = APIRouter()


class BookCreate(BaseModel):
    title: str
    description: str = ""
    subject: str = ""
    color: str = "#6C63FF"


class BookOut(BaseModel):
    id: int
    title: str
    description: str = ""
    subject: str = ""
    color: str
    created_at: datetime
    content_count: int = 0
    booklet_count: int = 0

    class Config:
        from_attributes = True


@router.get("", response_model=List[BookOut])
async def list_books(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    books = db.query(models.Book).filter(models.Book.owner_id == current_user.id).all()
    result = []
    for book in books:
        content_count = db.query(models.Content).filter(models.Content.book_id == book.id).count()
        booklet_count = db.query(models.GeneratedBooklet).filter(models.GeneratedBooklet.book_id == book.id).count()
        result.append(BookOut(
            id=book.id,
            title=book.title,
            description=book.description or "",
            subject=book.subject or "",
            color=book.color,
            created_at=book.created_at,
            content_count=content_count,
            booklet_count=booklet_count
        ))
    return result


@router.post("", response_model=BookOut)
async def create_book(
    book_data: BookCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    book = models.Book(
        title=book_data.title,
        description=book_data.description,
        subject=book_data.subject,
        color=book_data.color,
        owner_id=current_user.id,
    )
    db.add(book)
    db.commit()
    db.refresh(book)
    return BookOut(
        id=book.id, title=book.title, description=book.description or "",
        subject=book.subject or "", color=book.color,
        created_at=book.created_at, content_count=0, booklet_count=0
    )


@router.get("/{book_id}", response_model=BookOut)
async def get_book(
    book_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    book = db.query(models.Book).filter(
        models.Book.id == book_id,
        models.Book.owner_id == current_user.id
    ).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    content_count = db.query(models.Content).filter(models.Content.book_id == book.id).count()
    booklet_count = db.query(models.GeneratedBooklet).filter(models.GeneratedBooklet.book_id == book.id).count()
    return BookOut(
        id=book.id, title=book.title, description=book.description or "",
        subject=book.subject or "", color=book.color,
        created_at=book.created_at, content_count=content_count, booklet_count=booklet_count
    )


@router.put("/{book_id}", response_model=BookOut)
async def update_book(
    book_id: int,
    book_data: BookCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    book = db.query(models.Book).filter(
        models.Book.id == book_id,
        models.Book.owner_id == current_user.id
    ).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    for k, v in book_data.dict().items():
        setattr(book, k, v)
    db.commit()
    db.refresh(book)
    content_count = db.query(models.Content).filter(models.Content.book_id == book.id).count()
    booklet_count = db.query(models.GeneratedBooklet).filter(models.GeneratedBooklet.book_id == book.id).count()
    return BookOut(
        id=book.id, title=book.title, description=book.description or "",
        subject=book.subject or "", color=book.color,
        created_at=book.created_at, content_count=content_count, booklet_count=booklet_count
    )


@router.delete("/{book_id}")
async def delete_book(
    book_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    book = db.query(models.Book).filter(
        models.Book.id == book_id,
        models.Book.owner_id == current_user.id
    ).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    db.delete(book)
    db.commit()
    return {"message": "Book deleted"}
