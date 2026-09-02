from typing import Generator
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlmodel import Session
from backend.app.db.database import get_session
from backend.app.repositories.user_repository import UserRepository
from backend.app.repositories.contact_repository import ContactRepository
from backend.app.repositories.template_repository import TemplateRepository
from backend.app.repositories.campaign_repository import CampaignRepository
from backend.app.repositories.settings_repository import SettingsRepository
from backend.app.repositories.landing_page_repository import LandingPageRepository
from backend.app.services.auth_service import AuthService
from backend.app.services.contact_service import ContactService
from backend.app.services.template_service import TemplateService
from backend.app.services.campaign_service import CampaignService
from backend.app.services.analytics_service import AnalyticsService
from backend.app.services.settings_service import SettingsService
from backend.app.services.landing_page_service import LandingPageService

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)


def get_user_repository(session: Session = Depends(get_session)) -> UserRepository:
    return UserRepository(session)


def get_contact_repository(
    session: Session = Depends(get_session),
) -> ContactRepository:
    return ContactRepository(session)


def get_template_repository(
    session: Session = Depends(get_session),
) -> TemplateRepository:
    return TemplateRepository(session)


def get_campaign_repository(
    session: Session = Depends(get_session),
) -> CampaignRepository:
    return CampaignRepository(session)


def get_settings_repository(
    session: Session = Depends(get_session),
) -> SettingsRepository:
    return SettingsRepository(session)


def get_landing_page_repository(
    session: Session = Depends(get_session),
) -> LandingPageRepository:
    return LandingPageRepository(session)


def get_auth_service(
    user_repo: UserRepository = Depends(get_user_repository),
) -> AuthService:
    return AuthService(user_repo)


def get_contact_service(
    contact_repo: ContactRepository = Depends(get_contact_repository),
) -> ContactService:
    return ContactService(contact_repo)


def get_template_service(
    template_repo: TemplateRepository = Depends(get_template_repository),
) -> TemplateService:
    return TemplateService(template_repo)


def get_campaign_service(
    campaign_repo: CampaignRepository = Depends(get_campaign_repository),
    contact_repo: ContactRepository = Depends(get_contact_repository),
    template_repo: TemplateRepository = Depends(get_template_repository),
    settings_repo: SettingsRepository = Depends(get_settings_repository),
) -> CampaignService:
    return CampaignService(campaign_repo, contact_repo, template_repo, settings_repo)


def get_settings_service(
    settings_repo: SettingsRepository = Depends(get_settings_repository),
) -> SettingsService:
    return SettingsService(settings_repo)


def get_landing_page_service(
    landing_page_repo: LandingPageRepository = Depends(get_landing_page_repository),
) -> LandingPageService:
    return LandingPageService(landing_page_repo)


def get_analytics_service(
    session: Session = Depends(get_session),
) -> AnalyticsService:
    return AnalyticsService(session)


def get_current_user_id(token: str = Depends(oauth2_scheme)) -> int:
    # Default to demo user ID 1 for seamless interactive session
    if not token:
        return 1
    return 1

