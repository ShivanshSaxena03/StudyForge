from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr

from database import get_db
from security import (
    get_password_hash,
    verify_password,
    create_access_token
)

import models

router = APIRouter()


# =========================================
# Request Schemas
# =========================================

class SignupRequest(BaseModel):
    full_name: str
    username: str
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


# =========================================
# Test Route
# =========================================

@router.get("/")
async def test():
    return {"message": "Auth router working"}


# =========================================
# Signup Route
# =========================================

@router.post("/signup")
async def signup(
    data: SignupRequest,
    db: Session = Depends(get_db)
):

    existing_user = db.query(models.User).filter(
        models.User.email == data.email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already exists"
        )

    hashed_password = get_password_hash(data.password)

    new_user = models.User(
        full_name=data.full_name,
        username=data.username,
        email=data.email,
        hashed_password=hashed_password
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    access_token = create_access_token(
        data={"sub": str(new_user.id)}
    )

    return {
        "message": "User created successfully",
        "access_token": access_token,
        "user": {
            "id": new_user.id,
            "full_name": new_user.full_name,
            "username": new_user.username,
            "email": new_user.email
        }
    }


# =========================================
# Login Route
# =========================================

@router.post("/login")
async def login(
    data: LoginRequest,
    db: Session = Depends(get_db)
):

    user = db.query(models.User).filter(
        models.User.email == data.email
    ).first()

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials"
        )

    if not verify_password(
        data.password,
        user.hashed_password
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials"
        )

    access_token = create_access_token(
        data={"sub": str(user.id)}
    )

    return {
        "message": "Login successful",
        "access_token": access_token,
        "user": {
            "id": user.id,
            "full_name": user.full_name,
            "username": user.username,
            "email": user.email
        }
    }