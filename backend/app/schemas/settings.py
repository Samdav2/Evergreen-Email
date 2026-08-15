from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr

class SystemSettingsRead(BaseModel):
    id: int
    active_email_provider: str
    resend_api_key: Optional[str] = None
    mailjet_api_key: Optional[str] = None
    mailjet_secret_key: Optional[str] = None
    
    default_from_email: str
    default_from_name: str
    default_reply_to: Optional[str] = None
    
    business_name: str
    business_address: str
    business_city: str
    business_state: str
    business_zip: str
    business_country: str
    
    website_url: str
    cta_link_text: str
    cta_as_button: bool
    
    header_logo_url: Optional[str] = None
    header_title: Optional[str] = None
    header_bg_color: str
    header_text_color: str
    
    updated_at: datetime

    class Config:
        from_attributes = True

class SystemSettingsUpdate(BaseModel):
    active_email_provider: Optional[str] = None
    resend_api_key: Optional[str] = None
    mailjet_api_key: Optional[str] = None
    mailjet_secret_key: Optional[str] = None
    
    default_from_email: Optional[str] = None
    default_from_name: Optional[str] = None
    default_reply_to: Optional[str] = None
    
    business_name: Optional[str] = None
    business_address: Optional[str] = None
    business_city: Optional[str] = None
    business_state: Optional[str] = None
    business_zip: Optional[str] = None
    business_country: Optional[str] = None
    
    website_url: Optional[str] = None
    cta_link_text: Optional[str] = None
    cta_as_button: Optional[bool] = None
    
    header_logo_url: Optional[str] = None
    header_title: Optional[str] = None
    header_bg_color: Optional[str] = None
    header_text_color: Optional[str] = None

class TestEmailRequest(BaseModel):
    to_email: EmailStr
    provider: str = "resend"  # "resend" or "mailjet"
