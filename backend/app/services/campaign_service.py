from datetime import datetime
from typing import List, Optional
from backend.app.models.campaign import Campaign, CampaignStatus
from backend.app.models.contact import ContactStatus
from backend.app.models.template import Template
from backend.app.repositories.campaign_repository import CampaignRepository
from backend.app.repositories.contact_repository import ContactRepository
from backend.app.repositories.template_repository import TemplateRepository
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
    ) -> None:
        self.campaign_repo = campaign_repo
        self.contact_repo = contact_repo
        self.template_repo = template_repo

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
        self, campaign: Campaign, contact_email: str
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

        html = render_content_blocks(content_json, unsubscribe_url)
        plain = render_plain_text(content_json)
        return html, plain

    def _dispatch_emails(self, campaign: Campaign) -> None:
        if not self.contact_repo:
            return
        contacts = self.contact_repo.get_by_owner(campaign.owner_id, limit=1000000)
        valid_contacts = [c for c in contacts if c.status == ContactStatus.VALID]

        sent_count = 0
        for contact in valid_contacts:
            html_body, plain_text = self._render_template(campaign, contact.email)
            encoded = contact.email.replace("@", "%40")
            unsubscribe_url = f"{APP_URL}/api/v1/unsubscribe?email={encoded}"
            send_campaign_email(
                to_email=contact.email,
                subject=campaign.subject,
                html_body=html_body,
                plain_text=plain_text,
                unsubscribe_url=unsubscribe_url,
            )
            sent_count += 1

        campaign.recipients_count = sent_count

    def launch_campaign(
        self, campaign_id: int, is_immediate: bool = True
    ) -> CampaignRead:
        campaign = self.campaign_repo.get_by_id(campaign_id)
        if not campaign:
            raise ValueError("Campaign not found")

        campaign.status = (
            CampaignStatus.SENT if is_immediate else CampaignStatus.SCHEDULED
        )
        campaign.sent_date = datetime.utcnow().strftime("%b %d, %Y • %I:%M %p")

        updated = self.campaign_repo.update(campaign)

        if is_immediate:
            self._dispatch_emails(campaign)
            updated = self.campaign_repo.update(campaign)

        return CampaignRead.model_validate(updated)

    def get_user_campaigns(self, owner_id: int) -> List[CampaignRead]:
        campaigns = self.campaign_repo.get_by_owner(owner_id)
        return [CampaignRead.model_validate(c) for c in campaigns]
