from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel
from backend.app.models.campaign import CampaignStatus

class CampaignCreate(BaseModel):
    subject: str
    category_label: str = "PRODUCT NEWSLETTER"
    template_id: Optional[int] = None
    scheduled_time: Optional[str] = "Send Immediately"

class CampaignUpdate(BaseModel):
    subject: Optional[str] = None
    status: Optional[CampaignStatus] = None
    scheduled_time: Optional[str] = None

class CampaignRead(BaseModel):
    id: int
    subject: str
    category_label: str
    template_id: Optional[int] = None
    status: CampaignStatus
    recipients_count: int
    open_rate: float
    click_rate: float
    bounce_rate: float
    scheduled_time: Optional[str] = None
    sent_date: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class CampaignLaunchRequest(BaseModel):
    campaign_id: int
    schedule_option: str  # "immediate" or "scheduled"
