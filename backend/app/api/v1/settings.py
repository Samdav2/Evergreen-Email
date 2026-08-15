from typing import Dict, Any
from fastapi import APIRouter, Depends
from backend.app.schemas.settings import SystemSettingsRead, SystemSettingsUpdate, TestEmailRequest
from backend.app.services.settings_service import SettingsService
from backend.app.dependencies import get_settings_service, get_current_user_id

router = APIRouter(prefix="/settings", tags=["Settings"])

@router.get("", response_model=SystemSettingsRead)
def get_settings(
    current_user_id: int = Depends(get_current_user_id),
    settings_service: SettingsService = Depends(get_settings_service)
) -> SystemSettingsRead:
    return settings_service.get_settings(current_user_id)

@router.put("", response_model=SystemSettingsRead)
def update_settings(
    dto: SystemSettingsUpdate,
    current_user_id: int = Depends(get_current_user_id),
    settings_service: SettingsService = Depends(get_settings_service)
) -> SystemSettingsRead:
    return settings_service.update_settings(dto, current_user_id)

@router.post("/test-email")
def test_email(
    dto: TestEmailRequest,
    current_user_id: int = Depends(get_current_user_id),
    settings_service: SettingsService = Depends(get_settings_service)
) -> Dict[str, Any]:
    return settings_service.send_test_email(dto, current_user_id)
