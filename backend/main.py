from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import auth, books, content, generate

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Routers
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


@app.get("/")
async def root():
    return {"message": "Backend running"}