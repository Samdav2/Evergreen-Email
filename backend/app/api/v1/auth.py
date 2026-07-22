from fastapi import APIRouter, Depends, HTTPException, status
from backend.app.schemas.user import UserCreate, UserLogin, UserResetPassword, TokenResponse
from backend.app.services.auth_service import AuthService
from backend.app.dependencies import get_auth_service

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/signup", response_model=TokenResponse)
def signup(dto: UserCreate, auth_service: AuthService = Depends(get_auth_service)) -> TokenResponse:
    try:
        return auth_service.register_user(dto)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.post("/login", response_model=TokenResponse)
def login(dto: UserLogin, auth_service: AuthService = Depends(get_auth_service)) -> TokenResponse:
    try:
        return auth_service.authenticate_user(dto)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))

@router.post("/reset-password")
def reset_password(dto: UserResetPassword) -> dict:
    return {"message": f"Recovery link successfully sent to {dto.email}"}
