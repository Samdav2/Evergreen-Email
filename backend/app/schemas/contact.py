from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr
from backend.app.models.contact import ContactStatus

class ContactCreate(BaseModel):
    email: EmailStr
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    company: Optional[str] = None

class ContactManualImport(BaseModel):
    raw_text: str  # Comma or newline separated contacts

class ContactRead(BaseModel):
    id: int
    email: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    company: Optional[str] = None
    status: ContactStatus
    engagement_score: int
    last_activity: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class ContactImportSummary(BaseModel):
    total_detected: int
    valid_count: int
    duplicate_count: int
    invalid_count: int
    contacts: List[ContactRead]
