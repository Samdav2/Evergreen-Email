from datetime import datetime
from typing import Optional
from enum import Enum
from sqlmodel import SQLModel, Field

class ContactStatus(str, Enum):
    VALID = "Valid"
    DUPLICATE = "Duplicate"
    INVALID = "Invalid"
    UNSUBSCRIBED = "Unsubscribed"
    BOUNCED = "Bounced"

class ContactBase(SQLModel):
    email: str = Field(index=True)
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    company: Optional[str] = None
    status: ContactStatus = Field(default=ContactStatus.VALID)
    engagement_score: int = Field(default=5, ge=0, le=5) # 0 to 5 stars
    last_activity: Optional[str] = Field(default="Joined recently")

class Contact(ContactBase, table=True):
    __tablename__ = "contacts"

    id: Optional[int] = Field(default=None, primary_key=True)
    owner_id: int = Field(foreign_key="users.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
