from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field

class UserBase(SQLModel):
    full_name: str = Field(index=True)
    email: str = Field(unique=True, index=True)
    company: Optional[str] = Field(default="Evergreen Mail Org")
    is_active: bool = Field(default=True)
    is_superuser: bool = Field(default=False)

class User(UserBase, table=True):
    __tablename__ = "users"

    id: Optional[int] = Field(default=None, primary_key=True)
    hashed_password: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
