from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from database import engine, Base
from routers import auth, books, content, generate

Base.metadata.create_all(bind=engine)

app = FastAPI(title="StudyForge API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https://.*\.vercel\.app",
    
    # allow_origins=[
    #     "http://localhost:5173",
    #     "https://study-forge-phi.vercel.app",
    #     "https://study-forge-git-main-saxena03.vercel.app"
    #     "https://study-forge-7zlze95o7-saxena03.vercel.app"
    #     "https://studyforge-1r8l.onrender.com/api/auth/signup"
    # ],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)

os.makedirs("uploads", exist_ok=True)
os.makedirs("generated", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
app.mount("/generated", StaticFiles(directory="generated"), name="generated")

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(books.router, prefix="/api/books", tags=["books"])
app.include_router(content.router, prefix="/api/content", tags=["content"])
app.include_router(generate.router, prefix="/api/generate", tags=["generate"])

@app.get("/")
async def root():
    return {"message": "StudyForge API Running"}
