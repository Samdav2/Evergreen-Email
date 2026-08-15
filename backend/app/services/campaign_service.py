from datetime import datetime
from typing import Any, List, Optional
from backend.app.models.campaign import Campaign, CampaignStatus
from backend.app.models.contact import ContactStatus
from backend.app.models.template import Template
from backend.app.repositories.campaign_repository import CampaignRepository
from backend.app.repositories.contact_repository import ContactRepository
from backend.app.repositories.template_repository import TemplateRepository
from backend.app.repositories.settings_repository import SettingsRepository
from backend.app.services.email_service import send_campaign_email
from backend.app.services.template_renderer import (
    render_content_blocks,
    render_plain_text,
)
from backend.app.schemas.campaign import CampaignCreate, CampaignRead
from backend.app.core.settings import APP_URL


class CampaignService:
    def __init__(
        self,
        campaign_repo: CampaignRepository,
        contact_repo: Optional[ContactRepository] = None,
        template_repo: Optional[TemplateRepository] = None,
        settings_repo: Optional[SettingsRepository] = None,
    ) -> None:
        self.campaign_repo = campaign_repo
        self.contact_repo = contact_repo
        self.template_repo = template_repo
        self.settings_repo = settings_repo

    def create_campaign(self, dto: CampaignCreate, owner_id: int) -> CampaignRead:
        campaign = Campaign(
            subject=dto.subject,
            category_label=dto.category_label,
            template_id=dto.template_id,
            status=CampaignStatus.DRAFT,
            scheduled_time=dto.scheduled_time,
            owner_id=owner_id,
        )
        saved = self.campaign_repo.create(campaign)
        return CampaignRead.model_validate(saved)

    def _render_template(
        self, campaign: Campaign, contact_email: str, settings: Optional[object] = None
    ) -> tuple[str, str]:
        content_json = "[]"
        if campaign.template_id and self.template_repo:
            template = self.template_repo.get_by_id(campaign.template_id)
            if template:
                content_json = template.content_json or "[]"
            else:
                content_json = "[]"
        else:
            fallback = [
                {
                    "type": "text",
                    "content": campaign.subject,
                    "styles": {
                        "fontSize": "24px",
                        "fontWeight": "bold",
                        "padding": "24px 24px 8px",
                        "color": "#002d1c",
                    },
                },
                {
                    "type": "text",
                    "content": "This campaign was sent via Evergreen Mail.",
                    "styles": {"padding": "8px 24px 24px", "color": "#475569"},
                },
            ]
            import json

            content_json = json.dumps(fallback)

        encoded_email = contact_email.replace("@", "%40")
        unsubscribe_url = f"{APP_URL}/api/v1/unsubscribe?email={encoded_email}"

        html = render_content_blocks(content_json, unsubscribe_url, settings=settings)
        plain = render_plain_text(content_json, settings=settings)
        return html, plain

    def launch_campaign(
        self, campaign_id: int, is_immediate: bool = True, background_tasks: Optional[Any] = None
    ) -> CampaignRead:
        campaign = self.campaign_repo.get_by_id(campaign_id)
        if not campaign:
            raise ValueError("Campaign not found")

        campaign.status = (
            CampaignStatus.ACTIVE if is_immediate else CampaignStatus.SCHEDULED
        )
        campaign.sent_date = datetime.utcnow().strftime("%b %d, %Y • %I:%M %p")

        updated = self.campaign_repo.update(campaign)

        if is_immediate:
            if background_tasks:
                background_tasks.add_task(dispatch_campaign_background_task, campaign_id)
            else:
                dispatch_campaign_background_task(campaign_id)

        return CampaignRead.model_validate(updated)

    def get_user_campaigns(self, owner_id: int) -> List[CampaignRead]:
        campaigns = self.campaign_repo.get_by_owner(owner_id)
        return [CampaignRead.model_validate(c) for c in campaigns]

def dispatch_campaign_background_task(campaign_id: int) -> None:
    """
    Standalone background task worker to dispatch campaign emails asynchronously
    and log delivery/failure events to database in background.
    """
    from sqlmodel import Session, select
    from backend.app.db.database import engine
    from backend.app.models.campaign import Campaign, CampaignStatus
    from backend.app.models.contact import Contact, ContactStatus
    from backend.app.models.analytics import CampaignLog
    from backend.app.models.settings import SystemSettings
    from backend.app.models.template import Template
    from backend.app.services.email_service import send_campaign_email
    from backend.app.services.template_renderer import render_content_blocks, render_plain_text

    with Session(engine) as session:
        campaign = session.get(Campaign, campaign_id)
        if not campaign:
            return

        campaign.status = CampaignStatus.ACTIVE
        session.add(campaign)
        session.commit()
        session.refresh(campaign)

        settings_statement = select(SystemSettings).where(SystemSettings.owner_id == campaign.owner_id)
        settings = session.exec(settings_statement).first()

        contacts_statement = select(Contact).where(
            Contact.owner_id == campaign.owner_id,
            Contact.status == ContactStatus.VALID
        )
        contacts = session.exec(contacts_statement).all()

        content_json = "[]"
        if campaign.template_id:
            template = session.get(Template, campaign.template_id)
            if template:
                content_json = template.content_json or "[]"
        else:
            fallback = [
                {
                    "type": "text",
                    "content": campaign.subject,
                    "styles": {
                        "fontSize": "24px",
                        "fontWeight": "bold",
                        "padding": "24px 24px 8px",
                        "color": "#002d1c",
                    },
                },
                {
                    "type": "text",
                    "content": "This campaign was sent via Evergreen Mail.",
                    "styles": {"padding": "8px 24px 24px", "color": "#475569"},
                },
            ]
            import json
            content_json = json.dumps(fallback)

        sent_count = 0
        failed_count = 0

        for contact in contacts:
            try:
                encoded = contact.email.replace("@", "%40")
                unsubscribe_url = f"{APP_URL}/api/v1/unsubscribe?email={encoded}"
                html_body = render_content_blocks(content_json, unsubscribe_url, settings=settings)
                plain_text = render_plain_text(content_json, settings=settings)

                res = send_campaign_email(
                    to_email=contact.email,
                    subject=campaign.subject,
                    html_body=html_body,
                    plain_text=plain_text,
                    unsubscribe_url=unsubscribe_url,
                    settings=settings,
                )

                if isinstance(res, dict) and res.get("status") == "error":
                    failed_count += 1
                    log = CampaignLog(
                        campaign_id=campaign.id,
                        event_type="failed",
                        recipient_email=contact.email,
                        device_type="Desktop",
                        location="US"
                    )
                else:
                    sent_count += 1
                    log = CampaignLog(
                        campaign_id=campaign.id,
                        event_type="delivered",
                        recipient_email=contact.email,
                        device_type="Desktop",
                        location="US"
                    )

                session.add(log)
            except Exception as exc:
                print(f"[Background Dispatch Error] Failed for {contact.email}: {exc}")
                failed_count += 1
                log = CampaignLog(
                    campaign_id=campaign.id,
                    event_type="failed",
                    recipient_email=contact.email,
                    device_type="Desktop",
                    location="US"
                )
                session.add(log)

            if (sent_count + failed_count) % 100 == 0:
                campaign.recipients_count = sent_count
                session.add(campaign)
                session.commit()

        if sent_count > 0 or failed_count == 0:
            campaign.status = CampaignStatus.SENT
        else:
            campaign.status = CampaignStatus.FAILED

        campaign.recipients_count = sent_count
        session.add(campaign)
        session.commit()

