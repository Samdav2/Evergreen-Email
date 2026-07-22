from datetime import datetime
from typing import List, Optional
from backend.app.models.campaign import Campaign, CampaignStatus
from backend.app.repositories.campaign_repository import CampaignRepository
from backend.app.schemas.campaign import CampaignCreate, CampaignRead, CampaignUpdate

class CampaignService:
    """Service handling Email Campaign creation, execution, and history logs."""

    def __init__(self, campaign_repo: CampaignRepository) -> None:
        self.campaign_repo = campaign_repo

    def create_campaign(self, dto: CampaignCreate, owner_id: int) -> CampaignRead:
        campaign = Campaign(
            subject=dto.subject,
            category_label=dto.category_label,
            template_id=dto.template_id,
            status=CampaignStatus.DRAFT,
            scheduled_time=dto.scheduled_time,
            owner_id=owner_id
        )
        saved = self.campaign_repo.create(campaign)
        return CampaignRead.model_validate(saved)

    def launch_campaign(self, campaign_id: int, is_immediate: bool = True) -> CampaignRead:
        campaign = self.campaign_repo.get_by_id(campaign_id)
        if not campaign:
            raise ValueError("Campaign not found")

        campaign.status = CampaignStatus.SENT if is_immediate else CampaignStatus.SCHEDULED
        campaign.sent_date = datetime.utcnow().strftime("%b %d, %Y • %I:%M %p")
        campaign.recipients_count = 12450  # Simulated target audience count
        campaign.open_rate = 32.4
        campaign.click_rate = 8.42
        campaign.bounce_rate = 0.42

        updated = self.campaign_repo.update(campaign)
        return CampaignRead.model_validate(updated)

    def get_user_campaigns(self, owner_id: int) -> List[CampaignRead]:
        campaigns = self.campaign_repo.get_by_owner(owner_id)
        return [CampaignRead.model_validate(c) for c in campaigns]
