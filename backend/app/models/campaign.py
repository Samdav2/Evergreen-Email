from datetime import datetime
from typing import Optional
from enum import Enum
from sqlmodel import SQLModel, Field

class CampaignStatus(str, Enum):
    DRAFT = "Draft"
    SCHEDULED = "Scheduled"
    ACTIVE = "Active"
    SENT = "Sent"
    FAILED = "Failed"

class CampaignBase(SQLModel):
    subject: str = Field(index=True)
    category_label: str = Field(default="PRODUCT NEWSLETTER")
    template_id: Optional[int] = Field(default=None, foreign_key="templates.id")
    status: CampaignStatus = Field(default=CampaignStatus.DRAFT)
    recipients_count: int = Field(default=0)
    open_rate: float = Field(default=0.0) # Percentage e.g. 32.4
    click_rate: float = Field(default=0.0) # Percentage
    bounce_rate: float = Field(default=0.0) # Percentage
    scheduled_time: Optional[str] = Field(default="Send Immediately")
    sent_date: Optional[str] = None

class Campaign(CampaignBase, table=True):
    __tablename__ = "campaigns"

    id: Optional[int] = Field(default=None, primary_key=True)
    owner_id: int = Field(foreign_key="users.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
