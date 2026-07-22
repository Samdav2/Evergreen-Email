from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel

class TemplateBlock(BaseModel):
    id: str
    type: str  # text, image, button, spacer, divider, columns
    content: Optional[str] = None
    styles: Optional[Dict[str, Any]] = None

class TemplateCreate(BaseModel):
    name: str
    description: Optional[str] = None
    subject_line: str
    content_json: str
    category: str = "Newsletter"

class TemplateUpdate(BaseModel):
    name: Optional[str] = None
    subject_line: Optional[str] = None
    content_json: Optional[str] = None

class TemplateRead(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    subject_line: str
    content_json: str
    category: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
