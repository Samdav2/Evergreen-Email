from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field

class LandingPageBase(SQLModel):
    title: str = Field(index=True)
    slug: str = Field(index=True, unique=True)
    headline: str = Field(default="Welcome to Our Exclusive Offer")
    subheadline: Optional[str] = Field(default="Please fill out the form below to get started.")
    body_text: Optional[str] = Field(default=None)
    banner_url: Optional[str] = Field(default=None)
    cta_button_text: str = Field(default="Submit & Continue")
    cta_redirect_url: Optional[str] = Field(default=None)
    form_fields_json: str = Field(default="[]")  # JSON string of field definitions
    views_count: int = Field(default=0)
    cta_clicks_count: int = Field(default=0)
    submissions_count: int = Field(default=0)
    status: str = Field(default="Active")  # Active, Draft, Archived

class LandingPage(LandingPageBase, table=True):
    __tablename__ = "landing_pages"

    id: Optional[int] = Field(default=None, primary_key=True)
    owner_id: int = Field(foreign_key="users.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class FormSubmissionBase(SQLModel):
    landing_page_id: int = Field(foreign_key="landing_pages.id", index=True)
    campaign_id: Optional[int] = Field(default=None, foreign_key="campaigns.id")
    recipient_email: Optional[str] = Field(default=None, index=True)
    submitted_data_json: str = Field(default="{}")  # JSON representation of submitted inputs
    ip_address: Optional[str] = Field(default=None)

class FormSubmission(FormSubmissionBase, table=True):
    __tablename__ = "form_submissions"

    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class LandingPageClickLogBase(SQLModel):
    landing_page_id: int = Field(foreign_key="landing_pages.id", index=True)
    campaign_id: Optional[int] = Field(default=None)
    recipient_email: Optional[str] = Field(default=None)
    source: str = Field(default="landing_page")  # email, landing_page, external
    target_url: Optional[str] = Field(default=None)

class LandingPageClickLog(LandingPageClickLogBase, table=True):
    __tablename__ = "landing_page_click_logs"

    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
