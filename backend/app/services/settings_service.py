from typing import Optional, Dict, Any
from backend.app.repositories.settings_repository import SettingsRepository
from backend.app.schemas.settings import SystemSettingsRead, SystemSettingsUpdate, TestEmailRequest
from backend.app.services.email_service import send_email_with_provider

class SettingsService:
    """Service handling System Settings business logic."""

    def __init__(self, settings_repo: SettingsRepository) -> None:
        self.settings_repo = settings_repo

    def get_settings(self, owner_id: int = 1) -> SystemSettingsRead:
        settings = self.settings_repo.get_or_create(owner_id)
        return SystemSettingsRead.model_validate(settings)

    def update_settings(self, dto: SystemSettingsUpdate, owner_id: int = 1) -> SystemSettingsRead:
        update_data = dto.model_dump(exclude_unset=True)
        updated = self.settings_repo.update_settings(owner_id, update_data)
        return SystemSettingsRead.model_validate(updated)

    def send_test_email(self, dto: TestEmailRequest, owner_id: int = 1) -> Dict[str, Any]:
        settings = self.settings_repo.get_or_create(owner_id)
        
        provider = dto.provider or settings.active_email_provider
        subject = f"Evergreen Mail - Provider Test ({provider.upper()})"
        html_content = f"""
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #002d1c; margin-top: 0;">Evergreen Mail Provider Connection Successful!</h2>
          <p>This email confirms that your connection with <strong>{provider.upper()}</strong> is working properly.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 12px; color: #64748b;">
            Sender: {settings.default_from_name} ({settings.default_from_email})<br/>
            Address: {settings.business_address}, {settings.business_city}, {settings.business_state} {settings.business_zip}, {settings.business_country}
          </p>
        </div>
        """
        
        result = send_email_with_provider(
            provider=provider,
            to_email=dto.to_email,
            subject=subject,
            html_content=html_content,
            settings=settings
        )
        return result
