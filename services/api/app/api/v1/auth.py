from datetime import timedelta
from uuid import uuid4
from fastapi import APIRouter, Depends, HTTPException, status
from app.core.security import create_access_token, verify_password, get_password_hash
from app.schemas.user import UserLogin, TokenResponse, UserResponse

router = APIRouter(prefix="/auth", tags=["Autenticación"])

# Demo user mock for initial scaffold
DEMO_USER = {
    "id": uuid4(),
    "email": "engineer@neurolab.enterprise",
    "password_hash": get_password_hash("Admin123!"),
    "display_name": "Ingeniero IA Senior",
    "role": "AI_ENGINEER",
    "status": "ACTIVE"
}

@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    if credentials.email != DEMO_USER["email"] or not verify_password(credentials.password, DEMO_USER["password_hash"]):
        # For ease of first demo access, accept default credentials or return 401
        if credentials.password != "Admin123!":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Correo o contraseña incorrectos"
            )

    token = create_access_token(
        data={"sub": str(DEMO_USER["id"]), "email": credentials.email, "role": DEMO_USER["role"]}
    )

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        expires_in=28800,
        user=UserResponse(
            id=DEMO_USER["id"],
            email=credentials.email,
            display_name=DEMO_USER["display_name"],
            role=DEMO_USER["role"],
            status="ACTIVE",
            created_at=datetime.now()
        )
    )

from datetime import datetime
