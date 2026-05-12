from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

import os

from database import engine, Base

from routers import auth, books, content, generate


# =========================================
# Create Tables
# =========================================

Base.metadata.create_all(bind=engine)


# =========================================
# FastAPI App
# =========================================

app = FastAPI(
    title="StudyForge API",
    version="1.0.0"
)


# =========================================
# CORS
# =========================================

app.add_middleware(
    CORSMiddleware,

    allow_origin_regex=r"https://.*\.vercel\.app",

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)


# =========================================
# Static Folders
# =========================================

os.makedirs("uploads", exist_ok=True)
os.makedirs("generated", exist_ok=True)

app.mount(
    "/uploads",
    StaticFiles(directory="uploads"),
    name="uploads"
)

app.mount(
    "/generated",
    StaticFiles(directory="generated"),
    name="generated"
)


# =========================================
# Routers
# =========================================

app.include_router(
    auth.router,
    prefix="/api/auth",
    tags=["auth"]
)

app.include_router(
    books.router,
    prefix="/api/books",
    tags=["books"]
)

app.include_router(
    content.router,
    prefix="/api/content",
    tags=["content"]
)

app.include_router(
    generate.router,
    prefix="/api/generate",
    tags=["generate"]
)


# =========================================
# Root Route
# =========================================

@app.get("/")
async def root():

    return {
        "message": "StudyForge API Running"
    }