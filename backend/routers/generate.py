from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List

from database import get_db
import models

from security import get_current_user
from services.gemini_service import generate_study_content

router = APIRouter()


# =========================================
# Request Schema
# =========================================

class GenerateRequest(BaseModel):
    book_id: int
    title: str
    options: List[str]
    # options:
    # summary
    # flowchart
    # comparison
    # key_concepts
    # qa
    # timeline


# =========================================
# Generate AI Notes
# =========================================

@router.post("/booklet")
async def generate_booklet(
    req: GenerateRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    # -------------------------
    # Verify Book Ownership
    # -------------------------

    book = db.query(models.Book).filter(
        models.Book.id == req.book_id,
        models.Book.owner_id == current_user.id
    ).first()

    if not book:
        raise HTTPException(
            status_code=404,
            detail="Book not found"
        )

    # -------------------------
    # Fetch Book Content
    # -------------------------

    contents = db.query(models.Content).filter(
        models.Content.book_id == req.book_id
    ).all()

    if not contents:
        raise HTTPException(
            status_code=400,
            detail="No content found in this book"
        )

    # -------------------------
    # Combine All Notes
    # -------------------------

    all_text = "\n\n---\n\n".join([
        f"[{c.title}]\n{c.extracted_text or c.text_content or ''}"
        for c in contents
        if (c.extracted_text or c.text_content)
    ])

    if not all_text.strip():
        raise HTTPException(
            status_code=400,
            detail="No readable text found in uploaded content"
        )

    # -------------------------
    # Generate AI Study Content
    # -------------------------

    try:

        ai_content = await generate_study_content(
        raw_text=all_text,
        options=req.options,
        book_title=book.title,
        subject=book.subject or ""
    )
        saved_output = models.GeneratedOutput(
            book_id=book.id,
            title=req.title,
            output_data=ai_content
        )

        db.add(saved_output)

        db.commit()

        db.refresh(saved_output)
        return {
        "success": True,
        "output_id": saved_output.id,
        "book_id": book.id,
        "book_title": book.title,
        "generated_content": ai_content
    }

    except Exception as e:

        print(f"Generation Error: {e}")

        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate study content: {str(e)}"
        )
    
@router.get("/history/{book_id}")
async def get_generation_history(
    book_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    book = db.query(models.Book).filter(
        models.Book.id == book_id,
        models.Book.owner_id == current_user.id
    ).first()

    if not book:
        raise HTTPException(
            status_code=404,
            detail="Book not found"
        )

    outputs = db.query(
        models.GeneratedOutput
    ).filter(
        models.GeneratedOutput.book_id == book_id
    ).order_by(
        models.GeneratedOutput.created_at.desc()
    ).all()

    return outputs