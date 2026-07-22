from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field

class TemplateBase(SQLModel):
    name: str = Field(index=True)
    description: Optional[str] = None
    subject_line: str = Field(default="Welcome to Evergreen Mail")
    content_json: str = Field(default="[]")  # JSON representation of design blocks
    html_preview: Optional[str] = None
    category: str = Field(default="Newsletter")

class Template(TemplateBase, table=True):
    __tablename__ = "templates"

    id: Optional[int] = Field(default=None, primary_key=True)
    owner_id: int = Field(foreign_key="users.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
