from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    is_active = Column(Boolean, default=True)

    books = relationship("Book", back_populates="owner", cascade="all, delete-orphan")


class Book(Base):
    __tablename__ = "books"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    subject = Column(String)
    color = Column(String, default="#6C63FF")
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    owner = relationship("User", back_populates="books")
    contents = relationship("Content", back_populates="book", cascade="all, delete-orphan")
    booklets = relationship("GeneratedBooklet", back_populates="book", cascade="all, delete-orphan")


class Content(Base):
    __tablename__ = "contents"

    id = Column(Integer, primary_key=True, index=True)
    book_id = Column(Integer, ForeignKey("books.id"), nullable=False)
    content_type = Column(String, nullable=False)  # pdf, docx, text, audio
    title = Column(String, nullable=False)
    file_path = Column(String)
    text_content = Column(Text)
    extracted_text = Column(Text)
    file_size = Column(Integer)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    book = relationship("Book", back_populates="contents")


class GeneratedBooklet(Base):
    __tablename__ = "generated_booklets"

    id = Column(Integer, primary_key=True, index=True)
    book_id = Column(Integer, ForeignKey("books.id"), nullable=False)
    title = Column(String, nullable=False)
    pdf_path = Column(String)
    generation_options = Column(JSON)
    status = Column(String, default="pending")  # pending, processing, done, failed
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    book = relationship("Book", back_populates="booklets")
