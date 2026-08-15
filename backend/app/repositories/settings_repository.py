from typing import Optional
from sqlmodel import Session, select
from datetime import datetime
from backend.app.models.settings import SystemSettings
from backend.app.repositories.base_repository import BaseRepository

class SettingsRepository(BaseRepository[SystemSettings]):
    """Repository handling System Settings persistence."""

    def __init__(self, session: Session) -> None:
        super().__init__(SystemSettings, session)

    def get_or_create(self, owner_id: int = 1) -> SystemSettings:
        statement = select(SystemSettings).where(SystemSettings.owner_id == owner_id)
        settings = self.session.exec(statement).first()
        if not settings:
            settings = SystemSettings(owner_id=owner_id)
            self.session.add(settings)
            self.session.commit()
            self.session.refresh(settings)
        return settings

    def update_settings(self, owner_id: int, update_data: dict) -> SystemSettings:
        settings = self.get_or_create(owner_id)
        for key, val in update_data.items():
            if val is not None and hasattr(settings, key):
                setattr(settings, key, val)
        settings.updated_at = datetime.utcnow()
        self.session.add(settings)
        self.session.commit()
        self.session.refresh(settings)
        return settings
