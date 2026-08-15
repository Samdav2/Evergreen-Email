from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field

class SystemSettingsBase(SQLModel):
    # Email Provider Configuration
    active_email_provider: str = Field(default="resend", description="resend or mailjet")
    resend_api_key: Optional[str] = Field(default=None)
    mailjet_api_key: Optional[str] = Field(default=None)
    mailjet_secret_key: Optional[str] = Field(default=None)
    
    # Deliverability & Primary Inbox Placement
    primary_inbox_mode: bool = Field(default=True, description="Optimize headers, HTML & plain text for Primary Inbox placement")
    
    # Sender Configuration
    default_from_email: str = Field(default="onboarding@resend.dev")
    default_from_name: str = Field(default="Evergreen Mail")
    default_reply_to: Optional[str] = Field(default="support@example.com")
    
    # Physical Business Address (CAN-SPAM / GDPR Compliance)
    business_name: str = Field(default="Evergreen Mail Inc.")
    business_address: str = Field(default="123 Evergreen Terrace")
    business_city: str = Field(default="Springfield")
    business_state: str = Field(default="OR")
    business_zip: str = Field(default="97477")
    business_country: str = Field(default="United States")
    
    # Website & Global CTA Settings
    website_url: str = Field(default="https://evergreenmail.com")
    cta_link_text: str = Field(default="Visit Our Website")
    cta_as_button: bool = Field(default=True)
    
    # Global Template Header Defaults
    header_logo_url: Optional[str] = Field(default="https://images.unsplash.com/photo-1557683316-973673baf926?w=600&auto=format&fit=crop&q=80")
    header_title: Optional[str] = Field(default="Evergreen Weekly Bulletin")
    header_bg_color: str = Field(default="#002d1c")
    header_text_color: str = Field(default="#ffffff")

class SystemSettings(SystemSettingsBase, table=True):
    __tablename__ = "system_settings"

    id: Optional[int] = Field(default=None, primary_key=True)
    owner_id: int = Field(default=1, foreign_key="users.id", index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
