from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field

class CampaignLogBase(SQLModel):
    campaign_id: int = Field(foreign_key="campaigns.id")
    event_type: str = Field(index=True) # e.g., "opened", "clicked", "bounced", "delivered"
    recipient_email: str = Field(index=True)
    device_type: Optional[str] = Field(default="Desktop") # Mobile, Desktop, Tablet
    location: Optional[str] = Field(default="New York, US")
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class CampaignLog(CampaignLogBase, table=True):
    __tablename__ = "campaign_logs"

    id: Optional[int] = Field(default=None, primary_key=True)
